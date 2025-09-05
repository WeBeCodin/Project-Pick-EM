import { NextResponse } from 'next/server';

interface PickRequest {
  gameId: string;
  selectedTeam: 'home' | 'away';
  confidence?: number;
}

/**
 * Create or update a user's pick for a game
 */
export async function POST(request: Request) {
  try {
    const body: PickRequest = await request.json();
    const { gameId, selectedTeam, confidence = 1 } = body;

    // In a real app, you'd get this from authentication
    const userId = 'demo-user';

    if (!gameId || !selectedTeam) {
      return NextResponse.json(
        { success: false, error: 'Game ID and selected team are required' },
        { status: 400 }
      );
    }

    if (!['home', 'away'].includes(selectedTeam)) {
      return NextResponse.json(
        { success: false, error: 'Selected team must be "home" or "away"' },
        { status: 400 }
      );
    }

    // Simulate saving the pick
    const pick = {
      id: `pick-${gameId}-${userId}`,
      gameId,
      userId,
      selectedTeam,
      confidence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In production, you would:
    // 1. Validate the user is authenticated
    // 2. Check if the game hasn't started yet
    // 3. Save to database
    // 4. Update any league standings
    // 5. Send real-time updates via WebSocket

    console.log('Pick saved:', pick);

    return NextResponse.json({
      success: true,
      data: {
        pick,
        message: `Pick saved: ${selectedTeam === 'home' ? 'Home' : 'Away'} team selected with confidence ${confidence}`
      }
    });

  } catch (error) {
    console.error('Error saving pick:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save pick' },
      { status: 500 }
    );
  }
}

/**
 * Get user's picks for the current week
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week') || '1';
    const userId = 'demo-user'; // In real app, get from auth

    // Mock user picks data
    const picks = [
      {
        id: 'pick-1',
        gameId: '1',
        userId,
        selectedTeam: 'home',
        confidence: 5,
        createdAt: '2025-09-05T12:00:00Z',
        updatedAt: '2025-09-05T12:00:00Z',
      },
      {
        id: 'pick-2',
        gameId: '2', 
        userId,
        selectedTeam: 'away',
        confidence: 3,
        createdAt: '2025-09-05T12:00:00Z',
        updatedAt: '2025-09-05T12:00:00Z',
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        picks,
        week: parseInt(week),
        totalPicks: picks.length
      }
    });

  } catch (error) {
    console.error('Error fetching picks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch picks' },
      { status: 500 }
    );
  }
}
