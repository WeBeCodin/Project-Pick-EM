import { NextRequest, NextResponse } from 'next/server';

// Configuration for backend API
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001/api/v1';

// Helper function to make backend requests
async function backendRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Backend request failed:', error);
    // Fallback to mock data for now
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Temporary fallback data while backend is being connected
const fallbackLeagues: any[] = [
  {
    id: 'league_1',
    name: 'Demo League',
    description: 'A sample league for testing',
    creator: 'demo-user',
    members: [
      {
        userId: 'demo-user',
        username: 'demo-user',
        joinedAt: new Date().toISOString(),
        role: 'creator'
      }
    ],
    maxMembers: 20,
    isPrivate: false,
    scoringType: 'STANDARD',
    scoringSystem: 'STANDARD',
    createdAt: new Date().toISOString()
  }
];

let tempLeagueCounter = 2;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId') || 'demo-user';

    console.log('📖 Loading leagues, action:', action, 'userId:', userId);

    // Try backend first, fallback to in-memory
    try {
      if (action === 'my-leagues') {
        const result = await backendRequest(`/leagues/user/${userId}`, {
          headers: { 'x-user-id': userId },
        });
        
        if (result.success) {
          return NextResponse.json({
            success: true,
            data: { leagues: result.data || [] },
          });
        }
      }

      if (action === 'public') {
        const result = await backendRequest('/leagues/public', {
          headers: { 'x-user-id': userId },
        });
        
        if (result.success) {
          return NextResponse.json({
            success: true,
            data: { leagues: result.data || [] },
          });
        }
      }
    } catch (backendError) {
      console.log('Backend unavailable, using fallback data');
    }

    // Fallback to in-memory storage
    if (action === 'my-leagues') {
      const userLeagues = fallbackLeagues.filter(league => 
        league.creator === userId || 
        league.members.some((member: any) => 
          member.username === userId || member.userId === userId
        )
      );
      
      return NextResponse.json({
        success: true,
        data: { leagues: userLeagues },
      });
    }

    if (action === 'public') {
      const publicLeagues = fallbackLeagues.filter(league => 
        !league.isPrivate && 
        league.creator !== userId &&
        !league.members.some((member: any) => 
          member.username === userId || member.userId === userId
        )
      );
      
      return NextResponse.json({
        success: true,
        data: { leagues: publicLeagues },
      });
    }

    return NextResponse.json({
      success: true,
      data: fallbackLeagues,
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

    // Try backend first
    try {
      const result = await backendRequest('/leagues', {
        method: 'POST',
        headers: { 'x-user-id': userId },
        body: JSON.stringify({
          name,
          description,
          isPrivate: settings?.isPrivate || false,
          maxMembers: settings?.maxMembers || 10,
          scoringSystem: settings?.scoringType || settings?.scoringSystem || 'STANDARD',
          allowLateJoin: true,
        }),
      });

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: { league: result.data, message: 'League created successfully' },
        });
      }
    } catch (backendError) {
      console.log('Backend unavailable, using fallback storage');
    }

    // Fallback to in-memory storage
    const newLeague = {
      id: `league_${tempLeagueCounter++}`,
      name,
      description,
      creator: userId,
      members: [
        {
          userId: userId,
          username: ownerData.username || userId,
          joinedAt: new Date().toISOString(),
          role: 'owner'
        }
      ],
      settings: {
        scoringType: settings?.scoringType || settings?.scoringSystem || 'STANDARD',
        scoringSystem: settings?.scoringType || settings?.scoringSystem || 'STANDARD',
        maxMembers: settings?.maxMembers || 10,
        isPrivate: settings?.isPrivate || false,
      },
      scoringType: settings?.scoringType || settings?.scoringSystem || 'STANDARD',
      scoringSystem: settings?.scoringType || settings?.scoringSystem || 'STANDARD',
      maxMembers: settings?.maxMembers || 10,
      isPrivate: settings?.isPrivate || false,
      createdAt: new Date().toISOString()
    };

    fallbackLeagues.push(newLeague);

    return NextResponse.json({
      success: true,
      data: { league: newLeague, message: 'League created successfully' },
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
      const userId = userData?.userId || userData?.username || 'anonymous';

      // Try backend first
      try {
        const result = await backendRequest('/leagues/join', {
          method: 'POST',
          headers: { 'x-user-id': userId },
          body: JSON.stringify({ code: leagueId }),
        });

        if (result.success) {
          return NextResponse.json({
            success: true,
            data: result.data,
            message: 'Successfully joined league',
          });
        }
      } catch (backendError) {
        console.log('Backend unavailable, using fallback storage');
      }

      // Fallback to in-memory storage
      const league = fallbackLeagues.find(l => l.id === leagueId);
      if (!league) {
        return NextResponse.json({
          success: false,
          error: 'League not found',
        }, { status: 404 });
      }

      const username = userData?.username || userId;
      const isAlreadyMember = league.members.some((member: any) => 
        member.username === username || member.userId === userId
      );

      if (isAlreadyMember) {
        return NextResponse.json({
          success: false,
          error: 'Already a member of this league',
        }, { status: 400 });
      }

      league.members.push({
        userId: userId,
        username: username,
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
