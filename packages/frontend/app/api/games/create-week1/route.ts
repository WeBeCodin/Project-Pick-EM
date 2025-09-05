import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    // For demo mode, we'll create mock NFL games directly
    // In production, this would call the backend admin API
    
    const mockGames = [
      {
        id: 'game_1',
        homeTeam: 'Kansas City Chiefs',
        awayTeam: 'Baltimore Ravens',
        gameTime: '2025-09-05T20:20:00Z',
        week: 1,
        network: 'NBC',
        status: 'SCHEDULED'
      },
      {
        id: 'game_2', 
        homeTeam: 'Buffalo Bills',
        awayTeam: 'New York Jets',
        gameTime: '2025-09-08T17:00:00Z',
        week: 1,
        network: 'CBS',
        status: 'SCHEDULED'
      },
      {
        id: 'game_3',
        homeTeam: 'Cincinnati Bengals', 
        awayTeam: 'Cleveland Browns',
        gameTime: '2025-09-08T17:00:00Z',
        week: 1,
        network: 'CBS',
        status: 'SCHEDULED'
      }
    ];

    // Store in localStorage for demo mode
    return NextResponse.json({
      success: true,
      data: {
        games: mockGames,
        count: mockGames.length,
        week: 1
      },
      message: 'Week 1 games created successfully (Demo Mode)'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating games:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create games',
      message: 'Demo mode: Game creation simulation failed'
    }, { status: 500 });
  }
}
