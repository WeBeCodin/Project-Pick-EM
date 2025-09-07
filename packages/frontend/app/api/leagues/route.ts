import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const action = searchParams.get('action');

    // Get or create demo user
    const user = await DatabaseService.getOrCreateUser({
      username: userId,
      displayName: userId
    });

    if (action === 'my-leagues') {
      // Get leagues where user is a member OR creator
      const leagues = await DatabaseService.getLeagues();
      const userLeagues = leagues.filter((league: any) =>
        league.members.some((member: any) => member.user.username === userId) ||
        league.creator?.username === userId
      );
      
      return NextResponse.json({
        success: true,
        data: userLeagues,
      });
    }

    if (action === 'public') {
      // Get public leagues that user can join (exclude leagues user owns or is member of)
      const allLeagues = await DatabaseService.getLeagues();
      const publicLeagues = allLeagues.filter((league: any) =>
        !league.isPrivate &&
        !league.members.some((member: any) => member.user.username === userId) &&
        league.creator?.username !== userId &&
        (!league.maxMembers || league.members.length < league.maxMembers)
      );
      
      return NextResponse.json({
        success: true,
        data: publicLeagues,
      });
    }

    if (action === 'single') {
      // Get specific league by ID
      const leagueId = searchParams.get('leagueId');
      if (!leagueId) {
        return NextResponse.json({
          success: false,
          error: 'League ID is required',
        }, { status: 400 });
      }

      const league = await DatabaseService.getLeagueById(leagueId);
      if (!league) {
        return NextResponse.json({
          success: false,
          error: 'League not found',
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: league,
      });
    }

    // Get specific league by ID
    const leagueId = searchParams.get('id');
    if (leagueId) {
      const league = await DatabaseService.getLeagueById(leagueId);
      if (!league) {
        return NextResponse.json({
          success: false,
          error: 'League not found',
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: league,
      });
    }

    // Default: return all leagues
    const allLeagues = await DatabaseService.getLeagues();
    return NextResponse.json({
      success: true,
      data: allLeagues,
    });

  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch leagues',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, settings, ownerData } = body;

    // Validate required fields
    if (!name || !description || !ownerData) {
      return NextResponse.json({
        success: false,
        error: 'Name, description, and user data are required',
      }, { status: 400 });
    }

    // Get or create the user
    const user = await DatabaseService.getOrCreateUser({
      username: ownerData.username || ownerData.userId,
      displayName: ownerData.username || ownerData.userId,
      email: ownerData.email
    });

    // Get current season
    const season = await DatabaseService.getCurrentSeason();

    // Create new league in database
    const newLeague = await DatabaseService.createLeague({
      name,
      description,
      isPrivate: settings?.isPrivate || false,
      maxMembers: settings?.maxMembers || 20,
      scoringSystem: settings?.scoringSystem || 'STANDARD',
      createdById: user.id,
      seasonId: season.id
    });

    // Add creator as first member
    await DatabaseService.joinLeague(newLeague.id, user.id);

    // Fetch the complete league with members
    const completeLeague = await DatabaseService.getLeagueById(newLeague.id);

    console.log('✅ League created successfully in database:', newLeague.name);

    return NextResponse.json({
      success: true,
      data: {
        league: completeLeague,
        inviteCode: newLeague.code
      },
      message: 'League created successfully',
    });

  } catch (error) {
    console.error('Error creating league:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create league',
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { leagueId, action, ...data } = body;

    // Get league from database
    const league = await DatabaseService.getLeagueById(leagueId);
    if (!league) {
      return NextResponse.json({
        success: false,
        error: 'League not found',
      }, { status: 404 });
    }

    switch (action) {
      case 'join':
        const { userData } = data;
        
        if (!userData || !userData.userId || !userData.username) {
          return NextResponse.json({
            success: false,
            error: 'User data is required',
          }, { status: 400 });
        }

        // Get or create the user
        const user = await DatabaseService.getOrCreateUser({
          username: userData.username || userData.userId,
          displayName: userData.username || userData.userId,
          email: userData.email
        });

        // Check if already a member
        const existingMember = league.members.find((m: any) => m.userId === user.id);
        if (existingMember) {
          return NextResponse.json({
            success: false,
            error: 'Already a member of this league',
          }, { status: 400 });
        }

        // Check capacity
        if (league.maxMembers && league.members.length >= league.maxMembers) {
          return NextResponse.json({
            success: false,
            error: 'League is at maximum capacity',
          }, { status: 400 });
        }

        // Join league in database
        await DatabaseService.joinLeague(leagueId, user.id);

        // Get updated league
        const updatedLeague = await DatabaseService.getLeagueById(leagueId);

        return NextResponse.json({
          success: true,
          data: updatedLeague,
          message: 'Successfully joined league',
        });

      case 'leave':
        const { userData: leavingUserData } = data;
        
        if (!leavingUserData || !leavingUserData.userId) {
          return NextResponse.json({
            success: false,
            error: 'User data is required',
          }, { status: 400 });
        }

        // Get user
        const leavingUser = await DatabaseService.getOrCreateUser({
          username: leavingUserData.username || leavingUserData.userId,
          displayName: leavingUserData.username || leavingUserData.userId
        });
        
        // Don't allow owner to leave
        if (league.createdById === leavingUser.id) {
          return NextResponse.json({
            success: false,
            error: 'League owner cannot leave. Transfer ownership first.',
          }, { status: 400 });
        }

        // Remove from league in database
        await DatabaseService.leaveLeague(leagueId, leavingUser.id);

        // Get updated league
        const leagueAfterLeave = await DatabaseService.getLeagueById(leagueId);

        return NextResponse.json({
          success: true,
          data: leagueAfterLeave,
          message: 'Successfully left league',
        });

      case 'update-settings':
        // Update league settings in database
        const updatedSettings = await DatabaseService.updateLeagueSettings(leagueId, data.settings);

        return NextResponse.json({
          success: true,
          data: updatedSettings,
          message: 'League settings updated',
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error updating league:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update league',
    }, { status: 500 });
  }
}
