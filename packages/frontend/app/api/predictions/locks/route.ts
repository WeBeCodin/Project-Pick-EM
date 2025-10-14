import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Lock Availability API
 * Check which games are locked and if user can lock more games
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const weekId = searchParams.get('weekId');
    const userId = searchParams.get('userId');

    if (!leagueId || !weekId) {
      return NextResponse.json({
        success: false,
        error: 'leagueId and weekId are required',
      }, { status: 400 });
    }

    const backendUrl = new URL(`${BACKEND_URL}/api/v1/predictions/locks/availability`);
    backendUrl.searchParams.set('leagueId', leagueId);
    backendUrl.searchParams.set('weekId', weekId);
    if (userId) backendUrl.searchParams.set('userId', userId);

    const response = await fetch(backendUrl.toString());
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching lock availability:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch lock availability',
    }, { status: 500 });
  }
}
