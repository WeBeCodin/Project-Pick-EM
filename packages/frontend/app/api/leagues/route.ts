import { NextRequest, NextResponse } from 'next/server';

interface League {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  settings: {
    maxMembers: number;
    isPrivate: boolean;
    requireApproval: boolean;
    scoringSystem: 'standard' | 'confidence' | 'spread';
    weeklyPayout: boolean;
    seasonPayout: boolean;
  };
  members: Array<{
    userId: string;
    username: string;
    joinedAt: string;
    role: 'owner' | 'admin' | 'member';
    status: 'active' | 'pending' | 'removed';
  }>;
  stats: {
    totalMembers: number;
    weeklyWinners: Array<{
      week: number;
      winnerId: string;
      winnerName: string;
      score: number;
    }>;
    seasonLeader: {
      userId: string;
      username: string;
      totalScore: number;
    };
  };
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data for demo - replace with database calls
let mockLeagues: League[] = [
  {
    id: 'league-1',
    name: 'Friends & Family League',
    description: 'Our annual family pick em challenge',
    ownerId: 'user-1',
    ownerName: 'John Smith',
    settings: {
      maxMembers: 20,
      isPrivate: false,
      requireApproval: false,
      scoringSystem: 'confidence',
      weeklyPayout: true,
      seasonPayout: true,
    },
    members: [
      {
        userId: 'user-1',
        username: 'johnsmith',
        joinedAt: '2025-08-15T00:00:00Z',
        role: 'owner',
        status: 'active',
      },
      {
        userId: 'user-2',
        username: 'sarahjones',
        joinedAt: '2025-08-16T00:00:00Z',
        role: 'member',
        status: 'active',
      },
      {
        userId: 'user-3',
        username: 'mikebrown',
        joinedAt: '2025-08-17T00:00:00Z',
        role: 'member',
        status: 'active',
      },
    ],
    stats: {
      totalMembers: 3,
      weeklyWinners: [],
      seasonLeader: {
        userId: 'user-1',
        username: 'johnsmith',
        totalScore: 0,
      },
    },
    inviteCode: 'FAMILY2025',
    createdAt: '2025-08-15T00:00:00Z',
    updatedAt: '2025-08-17T00:00:00Z',
  },
  {
    id: 'league-2',
    name: 'Office Championship',
    description: 'Workplace competition - winner takes all!',
    ownerId: 'user-4',
    ownerName: 'Alex Johnson',
    settings: {
      maxMembers: 50,
      isPrivate: true,
      requireApproval: false,
      scoringSystem: 'standard',
      weeklyPayout: false,
      seasonPayout: true,
    },
    members: [
      {
        userId: 'user-4',
        username: 'alexjohnson',
        joinedAt: '2025-08-10T00:00:00Z',
        role: 'owner',
        status: 'active',
      },
    ],
    stats: {
      totalMembers: 1,
      weeklyWinners: [],
      seasonLeader: {
        userId: 'user-4',
        username: 'alexjohnson',
        totalScore: 0,
      },
    },
    inviteCode: 'OFFICE2025',
    createdAt: '2025-08-10T00:00:00Z',
    updatedAt: '2025-08-10T00:00:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-1'; // Mock user
    const action = searchParams.get('action');

    if (action === 'my-leagues') {
      // Get leagues where user is a member
      const userLeagues = mockLeagues.filter(league =>
        league.members.some(member => member.userId === userId)
      );
      
      return NextResponse.json({
        success: true,
        data: userLeagues,
      });
    }

    if (action === 'public') {
      // Get public leagues that user can join
      const publicLeagues = mockLeagues.filter(league =>
        !league.settings.isPrivate &&
        !league.members.some(member => member.userId === userId) &&
        league.members.length < league.settings.maxMembers
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

      const league = mockLeagues.find(l => l.id === leagueId);
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
      const league = mockLeagues.find(l => l.id === leagueId);
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

    // Default: return all leagues (for admin)
    return NextResponse.json({
      success: true,
      data: mockLeagues,
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

    // Generate invite code
    const inviteCode = generateInviteCode();

    // Create new league
    const newLeague: League = {
      id: `league-${Date.now()}`,
      name,
      description,
      ownerId: ownerData.userId,
      ownerName: ownerData.username,
      settings: {
        maxMembers: settings?.maxMembers || 20,
        isPrivate: settings?.isPrivate || false,
        requireApproval: settings?.requireApproval || false,
        scoringSystem: settings?.scoringSystem || 'confidence',
        weeklyPayout: settings?.weeklyPayout || false,
        seasonPayout: settings?.seasonPayout || true,
      },
      members: [
        {
          userId: ownerData.userId,
          username: ownerData.username,
          joinedAt: new Date().toISOString(),
          role: 'owner',
          status: 'active',
        },
      ],
      stats: {
        totalMembers: 1,
        weeklyWinners: [],
        seasonLeader: {
          userId: ownerData.userId,
          username: ownerData.username,
          totalScore: 0,
        },
      },
      inviteCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockLeagues.push(newLeague);

    return NextResponse.json({
      success: true,
      data: newLeague,
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

    const leagueIndex = mockLeagues.findIndex(l => l.id === leagueId);
    if (leagueIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'League not found',
      }, { status: 404 });
    }

    const league = mockLeagues[leagueIndex];

    switch (action) {
      case 'join':
        const { userData } = data;
        
        if (!userData || !userData.userId || !userData.username) {
          return NextResponse.json({
            success: false,
            error: 'User data is required',
          }, { status: 400 });
        }
        
        // Check if already a member
        if (league.members.some(m => m.userId === userData.userId)) {
          return NextResponse.json({
            success: false,
            error: 'Already a member of this league',
          }, { status: 400 });
        }

        // Check capacity
        if (league.members.length >= league.settings.maxMembers) {
          return NextResponse.json({
            success: false,
            error: 'League is at maximum capacity',
          }, { status: 400 });
        }

        // Add member
        league.members.push({
          userId: userData.userId,
          username: userData.username,
          joinedAt: new Date().toISOString(),
          role: 'member',
          status: league.settings.requireApproval ? 'pending' : 'active',
        });

        league.stats.totalMembers = league.members.filter(m => m.status === 'active').length;
        league.updatedAt = new Date().toISOString();

        return NextResponse.json({
          success: true,
          data: league,
          message: league.settings.requireApproval ? 
            'Join request sent for approval' : 
            'Successfully joined league',
        });

      case 'leave':
        const { userData: leavingUserData } = data;
        
        if (!leavingUserData || !leavingUserData.userId) {
          return NextResponse.json({
            success: false,
            error: 'User data is required',
          }, { status: 400 });
        }
        
        // Don't allow owner to leave
        if (league.ownerId === leavingUserData.userId) {
          return NextResponse.json({
            success: false,
            error: 'League owner cannot leave. Transfer ownership first.',
          }, { status: 400 });
        }

        league.members = league.members.filter(m => m.userId !== leavingUserData.userId);
        league.stats.totalMembers = league.members.filter(m => m.status === 'active').length;
        league.updatedAt = new Date().toISOString();

        return NextResponse.json({
          success: true,
          data: league,
          message: 'Successfully left league',
        });

      case 'update-settings':
        league.settings = { ...league.settings, ...data.settings };
        league.updatedAt = new Date().toISOString();

        return NextResponse.json({
          success: true,
          data: league,
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

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
