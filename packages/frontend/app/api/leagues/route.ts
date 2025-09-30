import { NextRequest, NextResponse } from 'next/server';
import { getSession, getPersistentUserId } from '@/lib/session-store';
import { StorageAdapter } from '@/lib/storage-adapter';
import { sanitizeForLogging } from '@/lib/log-utils';

// Database-first approach with file storage fallback for reliability
interface LeagueMember {
  userId: string;
  username: string;
  joinedAt: string;
  role: 'owner' | 'member';
  status: 'ACTIVE' | 'INACTIVE';
  isActive: boolean;
}

interface League {
  id: string;
  name: string;
  description: string;
  code: string;
  creator: string;
  members: LeagueMember[];
  maxMembers: number;
  isPrivate: boolean;
  scoringType: 'STANDARD' | 'CONFIDENCE';
  scoringSystem: 'STANDARD' | 'CONFIDENCE';
  createdAt: string;
  updatedAt: string;
  memberCount: number;
}

// Helper to get user from request with Clerk and session support
async function getUserFromRequest(request: NextRequest, bodyData?: any) {
  // Prioritize x-user-id header for test scripts and consistent auth
  const headerUserId = request.headers.get('x-user-id');
  if (headerUserId) {
    return {
      userId: headerUserId,
      username: `User-${headerUserId.substring(0, 8)}`,
      email: `${headerUserId}@test.com`,
    };
  }

  // Try session first (legacy support)
  const session = await getSession();
  if (session) {
    return {
      userId: session.persistentId,
      username: session.username,
      email: session.email
    };
  }
  
  // Handle user data from body (for POST/PUT requests)
  if (bodyData?.ownerData) {
    return {
      userId: bodyData.ownerData.userId,
      username: bodyData.ownerData.username,
      email: bodyData.ownerData.email || ''
    };
  }
  
  // Handle user data for join/leave operations
  if (bodyData?.userData) {
    return {
      userId: bodyData.userData.userId,
      username: bodyData.userData.username,
      email: bodyData.userData.email || ''
    };
  }
  
  // Fallback to query params
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const email = url.searchParams.get('email');
  const username = url.searchParams.get('username') || 'User';
  
  if (userId) {
    return {
      userId,
      username,
      email: email || ''
    };
  }
  
  if (email) {
    return {
      userId: getPersistentUserId(email),
      username: username,
      email
    };
  }
  
  // Default fallback
  return {
    userId: 'demo-user',
    username: 'Demo User',
    email: ''
  };
}


export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    console.log('📖 Persistent storage leagues API - Loading leagues, action:', sanitizeForLogging(action), 'user:', sanitizeForLogging(user.userId));

    if (action === 'my-leagues') {
      console.log('🔍 Loading user leagues from persistent storage for:', user.userId);
      
      const allLeagues = await StorageAdapter.getLeagues();
      const userLeagues = allLeagues.filter((league: League) => {
        const isMember = league.members.some((member: LeagueMember) => 
          member.userId === user.userId && member.isActive
        );
        const isCreator = league.creator === user.userId;
        return isMember || isCreator;
      });

      console.log('✅ Found', userLeagues.length, 'leagues for user from persistent storage');
      userLeagues.forEach((league: League) => {
        console.log(`   - ${league.name}: ${league.memberCount} members, ID: ${league.id}`);
      });

      return NextResponse.json({
        success: true,
        data: userLeagues,
      });
    }

    if (action === 'public') {
      console.log('🌐 Loading public leagues from persistent storage');
      
      const allLeagues = await StorageAdapter.getLeagues();
      const publicLeagues = allLeagues.filter((league: League) => {
        const isUserMember = league.members.some((member: LeagueMember) => 
          member.userId === user.userId && member.isActive
        );
        return !league.isPrivate && !isUserMember && league.memberCount < league.maxMembers;
      });

      console.log('✅ Found', publicLeagues.length, 'public leagues from persistent storage');

      return NextResponse.json({
        success: true,
        data: { leagues: publicLeagues },
      });
    }

    // Return all leagues
    const allLeagues = await StorageAdapter.getLeagues();
    console.log('📊 Retrieved', allLeagues.length, 'leagues from persistent storage');
    
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
    const user = await getUserFromRequest(request, body);
    const { name, description, settings } = body;

    if (!name || !description || !settings) {
      return NextResponse.json({
        success: false,
        error: 'Name, description, and settings object are required',
      }, { status: 400 });
    }

    console.log('✨ Creating league in persistent storage:', sanitizeForLogging(name), 'for user:', sanitizeForLogging(user.username));

    try {
      const newLeague = await StorageAdapter.createLeague({
        name,
        description,
        isPrivate: settings.isPrivate ?? false,
        maxMembers: settings.maxMembers ?? 20,
        scoringSystem: (settings.scoringSystem || 'STANDARD').toUpperCase(),
        createdById: user.userId,
        username: user.username
      });

      console.log('✅ League created in persistent storage successfully:', sanitizeForLogging(newLeague.name));
      console.log('📊 League ID:', sanitizeForLogging(newLeague.id));
      console.log('👥 Initial member count:', newLeague.memberCount);

      return NextResponse.json({
        success: true,
        data: newLeague,
      });

    } catch (storageError: any) {
      console.error('❌ Storage error creating league:', storageError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create league',
        details: storageError?.message || 'Unknown storage error'
      }, { status: 500 });
    }

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
    const user = await getUserFromRequest(request, body);
    const { leagueId, action } = body;

    if (action === 'join') {
      console.log('🤝 User joining league via persistent storage:', sanitizeForLogging(user.username), 'to league:', sanitizeForLogging(leagueId));
      
      try {
        const updatedLeague = await StorageAdapter.joinLeague(leagueId, user.userId, user.username);
        
        if (!updatedLeague) {
          return NextResponse.json({
            success: false,
            error: 'League not found',
          }, { status: 404 });
        }

        console.log('✅ Successfully joined league via persistent storage');
        console.log('👥 Updated member count:', updatedLeague.memberCount);

        return NextResponse.json({
          success: true,
          data: updatedLeague,
          message: 'Successfully joined league with persistent storage',
        });

      } catch (storageError: any) {
        console.error('❌ Storage error joining league:', storageError);
        return NextResponse.json({
          success: false,
          error: storageError?.message || 'Failed to join league',
          details: storageError?.message || 'Unknown storage error'
        }, { status: 500 });
      }
    }

    if (action === 'leave') {
      console.log('👋 User leaving league via persistent storage:', sanitizeForLogging(user.username), 'from league:', sanitizeForLogging(leagueId));
      
      try {
        const success = await StorageAdapter.leaveLeague(leagueId, user.userId);
        
        if (!success) {
          return NextResponse.json({
            success: false,
            error: 'League not found or not a member',
          }, { status: 404 });
        }

        console.log('✅ Successfully left league via persistent storage');

        return NextResponse.json({
          success: true,
          message: 'Successfully left league',
        });

      } catch (storageError: any) {
        console.error('❌ Storage error leaving league:', storageError);
        return NextResponse.json({
          success: false,
          error: 'Failed to leave league',
          details: storageError?.message || 'Unknown storage error'
        }, { status: 500 });
      }
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