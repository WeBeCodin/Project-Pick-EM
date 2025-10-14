import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Predictions API Proxy
 * Proxies requests to backend predictions service with locks and score predictions
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const leagueId = searchParams.get('leagueId');
    const weekId = searchParams.get('weekId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required',
      }, { status: 400 });
    }

    const backendUrl = new URL(`${BACKEND_URL}/api/v1/predictions`);
    backendUrl.searchParams.set('userId', userId);
    if (leagueId) backendUrl.searchParams.set('leagueId', leagueId);
    if (weekId) backendUrl.searchParams.set('weekId', weekId);

    const response = await fetch(backendUrl.toString());
    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch predictions',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.leagueId || !body.gameId) {
      return NextResponse.json({
        success: false,
        error: 'userId, leagueId, and gameId are required',
      }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/predictions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating/updating prediction:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create/update prediction',
    }, { status: 500 });
  }
}
