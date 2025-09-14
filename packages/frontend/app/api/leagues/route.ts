import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { leagueStorage } from '../../../lib/league-storage';

// Types for our league system - matching league-storage.ts
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

interface LeagueMember {
  userId: string;
  username: string;
  joinedAt: string;
  role: 'owner' | 'member';
  status: 'ACTIVE' | 'INACTIVE';
  isActive: boolean;
}

interface Pick {
  gameId: string;
  teamId: string;
  week: number;
  season: number;
  pickedAt: string;
  confidence?: number;
}

/**
 * Helper function to get user from Clerk authentication
 */
async function getUserFromRequest() {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ No userId found in auth');
      return null;
    }
    
    console.log('✅ User authenticated:', userId);
    return { userId, email: `${userId}@temp.com`, name: `User_${userId.slice(-4)}` };
  } catch (error) {
    console.error('❌ Error getting user from request:', error);
    return null;
  }
}

/**
 * Generate a unique invite code for leagues
 */
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * GET /api/leagues - Retrieve leagues for the authenticated user
 * Supports both Clerk authentication and legacy query parameters for backward compatibility
 */
export async function GET(request: NextRequest) {
  console.error('🚨🚨🚨 GET /api/leagues CALLED - DEBUG VERSION 3.0 🚨🚨🚨');
  console.log('� GET /api/leagues - Starting request');
  
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const queryUserId = searchParams.get('userId');
    
    // Try Clerk authentication first, then fall back to query parameter for compatibility
    let user = await getUserFromRequest();
    
    // If no Clerk auth but we have query userId, create a compatible user object
    if (!user && queryUserId) {
      user = { 
        userId: queryUserId, 
        email: `${queryUserId}@temp.com`, 
        name: `User_${queryUserId.slice(-4)}` 
      };
      console.log('📝 Using query parameter userId:', queryUserId);
    }
    
    if (!user) {
      console.log('❌ Unauthorized request - no auth or userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User identified:', user.userId, 'Action:', action);

    // Load all leagues from storage
    console.error('🚨🚨🚨 ABOUT TO CALL leagueStorage.loadData() 🚨🚨🚨');
    const storageData = await leagueStorage.loadData();
    console.error('🚨🚨🚨 leagueStorage.loadData() COMPLETED 🚨🚨🚨');
    const allLeagues = storageData.leagues;
    console.log(`📊 Loaded ${allLeagues.length} total leagues from storage`);

    // Handle different actions
    if (action === 'my-leagues') {
      // Filter leagues where user is a member
      const userLeagues = allLeagues.filter(league => 
        league.members.some(member => member.userId === user.userId)
      );
      
      console.log(`👤 User ${user.userId} is member of ${userLeagues.length} leagues`);

      const leaguesWithMemberCount = userLeagues.map(league => ({
        ...league,
        memberCount: league.members.length
      }));

      return NextResponse.json({ 
        success: true,
        data: { leagues: leaguesWithMemberCount }
      });
    }
    
    if (action === 'single') {
      // Get a single league by ID
      const leagueId = searchParams.get('leagueId');
      if (!leagueId) {
        console.log('❌ Missing league ID for single league request');
        return NextResponse.json(
          { error: 'League ID is required for single league requests' }, 
          { status: 400 }
        );
      }

      const league = allLeagues.find(l => l.id === leagueId);
      if (!league) {
        console.log('❌ League not found:', leagueId);
        return NextResponse.json(
          { error: 'League not found' }, 
          { status: 404 }
        );
      }

      console.log('🔍 Found single league:', league.id, league.name);

      return NextResponse.json({ 
        success: true,
        data: { ...league, memberCount: league.members.length }
      });
    }
    
    if (action === 'public') {
      // Filter public leagues where user is not already a member and not full
      const publicLeagues = allLeagues.filter(league => 
        !league.isPrivate && 
        !league.members.some(member => member.userId === user.userId) &&
        league.members.length < league.maxMembers
      );
      
      console.log(`🌐 Found ${publicLeagues.length} available public leagues`);

      const leaguesWithMemberCount = publicLeagues.map(league => ({
        ...league,
        memberCount: league.members.length
      }));

      return NextResponse.json({ 
        success: true,
        data: { leagues: leaguesWithMemberCount }
      });
    }

    // Default: return user's leagues
    const userLeagues = allLeagues.filter(league => 
      league.members.some(member => member.userId === user.userId)
    );
    
    console.log(`👤 User ${user.userId} is member of ${userLeagues.length} leagues`);

    const leaguesWithMemberCount = userLeagues.map(league => ({
      ...league,
      memberCount: league.members.length
    }));

    console.log('✅ GET /api/leagues completed successfully');
    return NextResponse.json({ leagues: leaguesWithMemberCount });

  } catch (error) {
    console.error('❌ Error in GET /api/leagues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leagues', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/leagues - Create a new league
 * Supports both Clerk authentication and legacy request format for backward compatibility
 */
export async function POST(request: NextRequest) {
  console.error('🚨🚨🚨 POST /api/leagues CALLED - DEBUG VERSION 3.0 🚨🚨🚨');
  console.log('� POST /api/leagues - League creation request');
  
  try {
    const body = await request.json();
    console.log('📋 Request body:', body);

    // Try Clerk authentication first, then fall back to request body data
    let user = await getUserFromRequest();
    
    // If no Clerk auth but we have ownerData in body, use that
    if (!user && body.ownerData) {
      user = {
        userId: body.ownerData.userId,
        email: body.ownerData.email || `${body.ownerData.userId}@temp.com`,
        name: body.ownerData.username || `User_${body.ownerData.userId.slice(-4)}`
      };
      console.log('📝 Using request body user data:', user.userId);
    }
    
    if (!user) {
      console.log('❌ Unauthorized request - no auth or user data');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract league data from body (supports both formats)
    const name = body.name;
    const description = body.description;
    const maxMembers = body.settings?.maxMembers || body.maxMembers || 10;
    const isPrivate = body.settings?.isPrivate || body.isPrivate || false;
    const scoringSystem = body.settings?.scoringSystem || body.scoringSystem || 'STANDARD';

    if (!name || !description) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Name and description are required' }, 
        { status: 400 }
      );
    }

    // Create new league
    const newLeague: League = {
      id: `league_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name,
      description,
      code: generateInviteCode(),
      creator: user.userId,
      maxMembers,
      isPrivate: !isPrivate, // Note: isPrivate in storage vs isPublic in input
      members: [{
        userId: user.userId,
        username: user.name,
        joinedAt: new Date().toISOString(),
        role: 'owner',
        status: 'ACTIVE',
        isActive: true
      }],
      scoringType: scoringSystem,
      scoringSystem: scoringSystem,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      memberCount: 1
    };

    console.log('🆕 Created new league:', newLeague.id);

    // Load existing leagues, add new one, and save back
    const storageData = await leagueStorage.loadData();
    storageData.leagues.push(newLeague);
    await leagueStorage.saveData(storageData);

    console.log('💾 League saved to persistent storage');
    console.log('✅ POST /api/leagues completed successfully');

    return NextResponse.json({ 
      success: true,
      data: { ...newLeague, memberCount: newLeague.members.length },
      message: 'League created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error in POST /api/leagues:', error);
    return NextResponse.json(
      { error: 'Failed to create league', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}

/**
 * PUT /api/leagues - Join a league via invite code
 * Supports both Clerk authentication and legacy request format for backward compatibility
 */
export async function PUT(request: NextRequest) {
  console.log('📥 PUT /api/leagues - Starting request');
  
  try {
    const body = await request.json();
    console.log('📋 Request body:', body);

    // Try Clerk authentication first, then fall back to request body data
    let user = await getUserFromRequest();
    
    // If no Clerk auth but we have userData in body, use that
    if (!user && body.userData) {
      user = {
        userId: body.userData.userId,
        email: `${body.userData.userId}@temp.com`,
        name: body.userData.username || `User_${body.userData.userId.slice(-4)}`
      };
      console.log('📝 Using request body user data:', user.userId);
    }
    
    if (!user) {
      console.log('❌ Unauthorized request - no auth or user data');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Support both inviteCode and leagueId formats
    const inviteCode = body.inviteCode || body.code;
    const leagueId = body.leagueId;

    if (!inviteCode && !leagueId) {
      console.log('❌ Missing invite code or league ID');
      return NextResponse.json(
        { error: 'Invite code or league ID is required' }, 
        { status: 400 }
      );
    }

    // Load all leagues
    const storageData = await leagueStorage.loadData();
    const allLeagues = storageData.leagues;
    console.log(`📊 Loaded ${allLeagues.length} leagues to search`);

    // Find league by invite code or league ID
    let league;
    if (inviteCode) {
      league = allLeagues.find(l => l.code === inviteCode);
      console.log(`🔍 Searching by invite code: ${inviteCode}`);
    } else if (leagueId) {
      league = allLeagues.find(l => l.id === leagueId);
      console.log(`🔍 Searching by league ID: ${leagueId}`);
    }

    if (!league) {
      console.log('❌ League not found');
      return NextResponse.json(
        { error: 'League not found' }, 
        { status: 404 }
      );
    }

    console.log('🔍 Found league:', league.id, league.name);

    // Check if user is already a member
    const isAlreadyMember = league.members.some(member => member.userId === user.userId);
    if (isAlreadyMember) {
      console.log('⚠️ User already a member of league:', league.id);
      return NextResponse.json(
        { error: 'Already a member of this league' }, 
        { status: 409 }
      );
    }

    // Check if league is full
    if (league.members.length >= league.maxMembers) {
      console.log('❌ League is full:', league.id);
      return NextResponse.json(
        { error: 'League is full' }, 
        { status: 409 }
      );
    }

    // Add user to league
    const newMember: LeagueMember = {
      userId: user.userId,
      username: user.name,
      joinedAt: new Date().toISOString(),
      role: 'member',
      status: 'ACTIVE',
      isActive: true
    };

    league.members.push(newMember);
    league.memberCount = league.members.length;
    league.updatedAt = new Date().toISOString();
    console.log('👥 Added user to league. New member count:', league.members.length);

    // Save updated leagues back to storage
    await leagueStorage.saveData(storageData);
    console.log('💾 Updated league saved to persistent storage');

    console.log('✅ PUT /api/leagues completed successfully');

    return NextResponse.json({ 
      success: true,
      data: { ...league, memberCount: league.members.length },
      message: 'Successfully joined league'
    });

  } catch (error) {
    console.error('❌ Error in PUT /api/leagues:', error);
    return NextResponse.json(
      { error: 'Failed to join league', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/leagues - Delete a league (creator only)
 */
export async function DELETE(request: NextRequest) {
  console.log('🗑️ DELETE /api/leagues called');

  try {
    // Get user authentication
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { leagueId } = body;

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }

    console.log(`🗑️ Attempting to delete league ${leagueId} by user ${user.userId}`);

    // Delete the league using the storage manager
    const deleted = await leagueStorage.deleteLeague(leagueId, user.userId);

    if (!deleted) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    console.log('✅ DELETE /api/leagues completed successfully');

    return NextResponse.json({ 
      success: true,
      message: 'League deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error in DELETE /api/leagues:', error);
    
    if (error instanceof Error && error.message.includes('Only the league creator')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    
    return NextResponse.json(
      { error: 'Failed to delete league', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}
