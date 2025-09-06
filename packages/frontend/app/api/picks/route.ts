import { NextResponse, NextRequest } from 'next/server';
import { DatabaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const weekId = searchParams.get('weekId') || undefined;

    console.log('📖 Loading picks from database for user:', userId);

    // Get or create user
    const user = await DatabaseService.getOrCreateUser({
      username: userId,
      displayName: userId
    });

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

    // Create or update pick in database
    const pick = await DatabaseService.createOrUpdatePick({
      userId: user.id,
      weekId: weekId || 'week-1', // Default week
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
    return NextResponse.json({
      success: false,
      error: 'Failed to save pick',
    }, { status: 500 });
  }
}
