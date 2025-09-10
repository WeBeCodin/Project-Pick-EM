import { NextRequest, NextResponse } from 'next/server';

// Enhanced in-memory storage with proper user session tracking
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

// Enhanced persistent storage with user session tracking
let persistentLeagues: League[] = [
  {
    id: 'league_1',
    name: 'Demo League',
    description: 'A sample league for testing user persistence',
    code: 'DEMO2024',
    creator: 'demo-user',
    members: [
      {
        userId: 'demo-user',
        username: 'demo-user',
        joinedAt: new Date().toISOString(),
        role: 'owner',
        status: 'ACTIVE',
        isActive: true
      }
    ],
    maxMembers: 20,
    isPrivate: false,
    scoringType: 'STANDARD',
    scoringSystem: 'STANDARD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    memberCount: 1
  }
];

let leagueIdCounter = 2;

// User session tracking for persistence across logout/login
const userSessions: Record<string, { leagues: string[], lastActive: string }> = {
  'demo-user': { leagues: ['league_1'], lastActive: new Date().toISOString() },
  'user_tfcdesigns': { leagues: [], lastActive: new Date().toISOString() }
};

// Generate unique league code
function generateLeagueCode(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// Update member counts and user sessions for persistence
function updateLeagueMetadata(league: League) {
  league.memberCount = league.members.filter(m => m.isActive).length;
  league.updatedAt = new Date().toISOString();
  
  // Update user sessions for continuity
  league.members.forEach(member => {
    if (member.isActive) {
      if (!userSessions[member.userId]) {
        userSessions[member.userId] = { leagues: [], lastActive: new Date().toISOString() };
      }
      if (!userSessions[member.userId].leagues.includes(league.id)) {
        userSessions[member.userId].leagues.push(league.id);
      }
      userSessions[member.userId].lastActive = new Date().toISOString();
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId') || 'demo-user';
    const action = searchParams.get('action');

    console.log('📖 Enhanced leagues API - Loading leagues, action:', action, 'userId:', userId);
    console.log('📊 Current persistent leagues count:', persistentLeagues.length);
    console.log('👥 User sessions tracked:', Object.keys(userSessions).length);

    // Update user session activity for continuity
    if (!userSessions[userId]) {
      userSessions[userId] = { leagues: [], lastActive: new Date().toISOString() };
    }
    userSessions[userId].lastActive = new Date().toISOString();

    if (action === 'my-leagues') {
      // Get leagues where user is ACTIVE member or creator
      const userLeagues = persistentLeagues.filter(league => {
        const isMember = league.members.some(member => 
          (member.username === userId || member.userId === userId) && 
          member.isActive && 
          member.status === 'ACTIVE'
        );
        const isCreator = league.creator === userId;
        return isMember || isCreator;
      });
      
      // Ensure member counts are accurate
      userLeagues.forEach(updateLeagueMetadata);
      
      console.log('🔍 Found', userLeagues.length, 'active leagues for user:', userId);
      userLeagues.forEach(league => {
        console.log(`   - ${league.name}: ${league.memberCount} members, Status: ACTIVE`);
      });
      
      return NextResponse.json({
        success: true,
        data: { leagues: userLeagues },
      });
    }

    if (action === 'public') {
      // Get public leagues excluding those where user is already a member
      const publicLeagues = persistentLeagues.filter(league => {
        const isUserMember = league.members.some(member => 
          (member.username === userId || member.userId === userId) && 
          member.isActive
        );
        return !league.isPrivate && !isUserMember && league.memberCount < league.maxMembers;
      });
      
      publicLeagues.forEach(updateLeagueMetadata);
      
      console.log('🌐 Found', publicLeagues.length, 'public leagues available to user:', userId);
      
      return NextResponse.json({
        success: true,
        data: { leagues: publicLeagues },
      });
    }

    // Return all leagues with updated metadata
    persistentLeagues.forEach(updateLeagueMetadata);
    
    return NextResponse.json({
      success: true,
      data: persistentLeagues,
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

    const userId = ownerData.userId || ownerData.username;
    const username = ownerData.username || userId;

    // Create new league with proper session tracking
    const newLeague: League = {
      id: `league_${leagueIdCounter++}`,
      name,
      description,
      code: generateLeagueCode(),
      creator: userId,
      members: [
        {
          userId: userId,
          username: username,
          joinedAt: new Date().toISOString(),
          role: 'owner',
          status: 'ACTIVE',
          isActive: true
        }
      ],
      maxMembers: settings?.maxMembers || 10,
      isPrivate: settings?.isPrivate || false,
      scoringType: (settings?.scoringType || settings?.scoringSystem || 'STANDARD') as 'STANDARD' | 'CONFIDENCE',
      scoringSystem: (settings?.scoringType || settings?.scoringSystem || 'STANDARD') as 'STANDARD' | 'CONFIDENCE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      memberCount: 1
    };

    // Add to persistent storage
    persistentLeagues.push(newLeague);
    
    // Update user session tracking for continuity
    updateLeagueMetadata(newLeague);

    console.log('✅ League created successfully:', newLeague.name, 'by', username);
    console.log('📊 Updated league count:', persistentLeagues.length);
    console.log('👥 Creator session updated:', userSessions[userId]);

    return NextResponse.json({
      success: true,
      data: {
        league: newLeague,
        message: 'League created successfully with persistent session tracking'
      },
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
    const { leagueId, action, userData } = body;

    if (action === 'join') {
      const league = persistentLeagues.find(l => l.id === leagueId);
      if (!league) {
        return NextResponse.json({
          success: false,
          error: 'League not found',
        }, { status: 404 });
      }

      const userId = userData?.userId || userData?.username || 'anonymous';
      const username = userData?.username || userId;

      // Check if already a member
      const existingMember = league.members.find(member => 
        member.username === username || member.userId === userId
      );

      if (existingMember) {
        if (existingMember.isActive) {
          return NextResponse.json({
            success: false,
            error: 'Already an active member of this league',
          }, { status: 400 });
        } else {
          // Reactivate inactive member (handles rejoin capability)
          existingMember.isActive = true;
          existingMember.status = 'ACTIVE';
          existingMember.joinedAt = new Date().toISOString();
          console.log('🔄 Reactivated member:', username, 'in league:', league.name);
        }
      } else {
        // Add new member
        league.members.push({
          userId: userId,
          username: username,
          joinedAt: new Date().toISOString(),
          role: 'member',
          status: 'ACTIVE',
          isActive: true
        });
        console.log('➕ Added new member:', username, 'to league:', league.name);
      }

      // Update league metadata and user session for persistence
      updateLeagueMetadata(league);

      console.log('✅ League join successful');
      console.log('👥 Updated member count:', league.memberCount);
      console.log('📊 User session updated:', userSessions[userId]);

      return NextResponse.json({
        success: true,
        data: league,
        message: 'Successfully joined league with session persistence',
      });
    }

    if (action === 'leave') {
      const league = persistentLeagues.find(l => l.id === leagueId);
      if (!league) {
        return NextResponse.json({
          success: false,
          error: 'League not found',
        }, { status: 404 });
      }

      const userId = userData?.userId || userData?.username || 'anonymous';
      const member = league.members.find(m => 
        (m.username === userId || m.userId === userId) && m.isActive
      );

      if (!member) {
        return NextResponse.json({
          success: false,
          error: 'Not a member of this league',
        }, { status: 400 });
      }

      if (member.role === 'owner') {
        return NextResponse.json({
          success: false,
          error: 'League owner cannot leave. Transfer ownership or delete the league.',
        }, { status: 400 });
      }

      // Mark member as inactive instead of removing (preserves history)
      member.isActive = false;
      member.status = 'INACTIVE';
      
      // Remove from user session
      if (userSessions[userId]) {
        userSessions[userId].leagues = userSessions[userId].leagues.filter(id => id !== leagueId);
      }

      updateLeagueMetadata(league);

      console.log('👋 Member left league:', userId, 'from', league.name);

      return NextResponse.json({
        success: true,
        data: league,
        message: 'Successfully left league',
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
