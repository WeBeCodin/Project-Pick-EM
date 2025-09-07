import { NextResponse, NextRequest } from 'next/server';
import { DatabaseService } from '@/lib/database';

// In-memory storage for picks (primary)
let picks: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const weekId = searchParams.get('weekId') || undefined;

    console.log('📖 Loading picks for user:', userId);

    // Load from database on first request if picks array is empty
    if (picks.length === 0) {
      try {
        const user = await DatabaseService.getOrCreateUser({
          username: userId,
          displayName: userId
        });
        const dbPicks = await DatabaseService.getUserPicks(user.id, weekId);
        if (dbPicks.length > 0) {
          picks = dbPicks.map((pick: any) => ({
            id: pick.id,
            userId: userId,
            gameId: pick.gameId,
            selectedTeam: pick.isHomeTeamPick ? 'home' : 'away',
            selectedTeamId: pick.selectedTeamId,
            confidence: pick.confidence || 1,
            weekId: pick.weekId
          }));
          console.log(`📦 Loaded ${picks.length} picks from database`);
        }
      } catch (error) {
        console.warn('⚠️ Could not load picks from database, using in-memory only:', error);
      }
    }

    // Filter picks for the requested user
    const userPicks = picks.filter(pick => pick.userId === userId);

    return NextResponse.json({
      success: true,
      data: userPicks,
      message: `Found ${userPicks.length} picks`,
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
    const { userId = 'demo-user', gameId, selectedTeam, selectedTeamId, confidence } = body;

    if (!gameId) {
      return NextResponse.json({
        success: false,
        error: 'Game ID is required',
      }, { status: 400 });
    }

    console.log('💾 Creating/updating pick:', { userId, gameId, selectedTeam, selectedTeamId, confidence });

    // Create or update pick in memory
    const existingPickIndex = picks.findIndex(pick => 
      pick.userId === userId && pick.gameId === gameId
    );

    const pickData = {
      id: existingPickIndex >= 0 ? picks[existingPickIndex].id : `pick_${Date.now()}`,
      userId,
      gameId,
      selectedTeam,
      selectedTeamId,
      confidence: confidence || 1,
      weekId: 'week-1', // Default week
      updatedAt: new Date().toISOString()
    };

    if (existingPickIndex >= 0) {
      picks[existingPickIndex] = { ...picks[existingPickIndex], ...pickData };
    } else {
      picks.push(pickData);
    }

    // Try to save to database for persistence (don't fail if it doesn't work)
    try {
      const user = await DatabaseService.getOrCreateUser({
        username: userId,
        displayName: userId
      });

      // Ensure games exist for picks
      await DatabaseService.getOrCreateDefaultGames();

      await DatabaseService.createOrUpdatePick({
        userId: user.id,
        weekId: pickData.weekId,
        gameId,
        selectedTeamId: selectedTeamId,
        isHomeTeamPick: selectedTeam === 'home'
      });

      console.log('✅ Pick saved to database for persistence');
    } catch (error) {
      console.warn('⚠️ Failed to save pick to database, but saved in-memory:', error);
    }

    console.log('✅ Pick saved successfully');

    return NextResponse.json({
      success: true,
      data: pickData,
      message: 'Pick saved successfully',
    });

  } catch (error) {
    console.error('Error saving pick:', error);
    return NextResponse.json({
      success: false,
      error: `Failed to save pick: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }, { status: 500 });
  }
}
