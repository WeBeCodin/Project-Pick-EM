import { NextResponse, NextRequest } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    let weekId = searchParams.get('weekId') || undefined;

    console.log('📖 Loading picks from database for user:', userId);

    // Get or create user
    const user = await DatabaseService.getOrCreateUser({
      username: userId,
      displayName: userId
    });

    // If no weekId provided, get current week
    if (!weekId) {
      const currentWeek = await DatabaseService.getCurrentWeek();
      if (currentWeek) {
        weekId = currentWeek.id;
      }
    }

    // Get user picks
    const picks = await DatabaseService.getUserPicks(user.id, weekId);

    return NextResponse.json({
      success: true,
      data: picks,
      message: `Found ${picks.length} picks`,
    });

  } catch (error) {
    console.error('Error fetching picks:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch picks',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'demo-user', gameId, selectedTeam, weekId, selectedTeamId } = body;

    if (!gameId) {
      return NextResponse.json({
        success: false,
        error: 'Game ID is required',
      }, { status: 400 });
    }

    console.log('💾 Creating/updating pick in database:', { userId, gameId, selectedTeam, selectedTeamId });

    // Get or create user
    const user = await DatabaseService.getOrCreateUser({
      username: userId,
      displayName: userId
    });

    // Get or create the current week if no weekId provided
    let currentWeekId = weekId;
    if (!currentWeekId) {
      const currentWeek = await DatabaseService.getOrCreateCurrentWeek();
      if (!currentWeek) {
        return NextResponse.json({
          success: false,
          error: 'No active week available',
        }, { status: 400 });
      }
      currentWeekId = currentWeek.id;
    }

    // Create or update pick in database
    const pick = await DatabaseService.createOrUpdatePick({
      userId: user.id,
      weekId: currentWeekId,
      gameId,
      selectedTeamId: selectedTeamId,
      isHomeTeamPick: selectedTeam === 'home'
    });

    console.log('✅ Pick saved successfully to database');

    return NextResponse.json({
      success: true,
      data: pick,
      message: 'Pick saved successfully',
    });

  } catch (error) {
    console.error('Error saving pick:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({
      success: false,
      error: `Failed to save pick: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }, { status: 500 });
  }
}
