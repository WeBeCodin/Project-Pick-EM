import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// In-memory storage for leagues (primary)
let inMemoryLeagues: any[] = [
  {
    id: 'league_1',
    name: 'Demo League',
    description: 'A sample league for testing',
    creator: 'demo-user',
    members: [
      {
        username: 'demo-user',
        joinedAt: new Date().toISOString(),
        role: 'creator'
      }
    ],
    maxMembers: 20,
    isPrivate: false,
    scoringType: 'Standard',
    createdAt: new Date().toISOString()
  }
];
let leagueIdCounter = 2;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');
    const action = searchParams.get('action');

    // If no userId provided, try to find any user that has leagues
    if (!userId || userId === 'demo-user') {
      // Check if demo-user has leagues, if not, find the first user with leagues
      const demoUserLeagues = inMemoryLeagues.filter(league => 
        league.creator === 'demo-user' || 
        league.members.some((member: any) => 
          member.username === 'demo-user' || member.userId === 'demo-user'
        )
      );
      
      if (demoUserLeagues.length === 0 && inMemoryLeagues.length > 0) {
        // Find the first user who has leagues
        const firstLeague = inMemoryLeagues[0];
        userId = firstLeague.creator || firstLeague.members[0]?.userId || firstLeague.members[0]?.username || 'demo-user';
        console.log('🔄 No demo-user leagues found, using first available user:', userId);
      } else {
        userId = 'demo-user';
      }
    }

    console.log('📖 Loading leagues, action:', action, 'userId:', userId);

    if (action === 'my-leagues') {
      const userLeagues = inMemoryLeagues.filter(league => 
        league.creator === userId || 
        league.members.some((member: any) => 
          member.username === userId || member.userId === userId
        )
      );
      
      console.log('🔍 Found', userLeagues.length, 'leagues for user:', userId);
      
      return NextResponse.json({
        success: true,
        data: { leagues: userLeagues },
      });
    }

    if (action === 'public') {
      const publicLeagues = inMemoryLeagues.filter(league => 
        !league.isPrivate && 
        league.creator !== userId &&
        !league.members.some((member: any) => 
          member.username === userId || member.userId === userId
        ) &&
        league.members.length < league.maxMembers
      );
      
      return NextResponse.json({
        success: true,
        data: { leagues: publicLeagues },
      });
    }

    if (action === 'view') {
      const leagueId = searchParams.get('leagueId');
      if (!leagueId) {
        return NextResponse.json({
          success: false,
          error: 'League ID is required',
        }, { status: 400 });
      }

      const league = inMemoryLeagues.find(l => l.id === leagueId);
      if (!league) {
        return NextResponse.json({
          success: false,
          error: 'League not found',
        }, { status: 404 });
      }

      // Check if user is a member or creator
      const isMember = league.creator === userId || 
        league.members.some((member: any) => member.username === userId);

      if (!isMember) {
        return NextResponse.json({
          success: false,
          error: 'Not authorized to view this league',
        }, { status: 403 });
      }

      return NextResponse.json({
        success: true,
        data: league,
      });
    }

    return NextResponse.json({
      success: true,
      data: inMemoryLeagues,
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

    if (!name || !description || !ownerData) {
      return NextResponse.json({
        success: false,
        error: 'Name, description, and user data are required',
      }, { status: 400 });
    }

    const newLeague = {
      id: `league_${leagueIdCounter++}`,
      name,
      description,
      creator: ownerData.userId || ownerData.username || 'demo-user',
      creatorUsername: ownerData.username || 'demo-user',
      members: [
        {
          userId: ownerData.userId || ownerData.username || 'demo-user',
          username: ownerData.username || 'demo-user',
          joinedAt: new Date().toISOString(),
          role: 'creator'
        }
      ],
      maxMembers: settings?.maxMembers || 20,
      isPrivate: settings?.isPrivate || false,
      scoringType: settings?.scoringSystem || 'Standard',
      createdAt: new Date().toISOString()
    };

    inMemoryLeagues.push(newLeague);

    return NextResponse.json({
      success: true,
      data: {
        league: newLeague,
        inviteCode: newLeague.id
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
    const { leagueId, action, userId } = body;

    if (action === 'join') {
      const league = inMemoryLeagues.find(l => l.id === leagueId);
      if (!league) {
        return NextResponse.json({
          success: false,
          error: 'League not found',
        }, { status: 404 });
      }

      const isAlreadyMember = league.members.some((member: any) => 
        member.username === userId
      );

      if (isAlreadyMember) {
        return NextResponse.json({
          success: false,
          error: 'Already a member of this league',
        }, { status: 400 });
      }

      league.members.push({
        username: userId,
        joinedAt: new Date().toISOString(),
        role: 'member'
      });

      return NextResponse.json({
        success: true,
        data: league,
        message: 'Successfully joined league',
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action',
    }, { status: 400 });

  } catch (error) {
    console.error('Error updating league:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update league',
    }, { status: 500 });
  }
}
