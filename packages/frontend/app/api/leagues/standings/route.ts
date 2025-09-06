import { NextRequest, NextResponse } from 'next/server';

interface LeagueStanding {
  userId: string;
  username: string;
  totalScore: number;
  weeklyScores: Array<{
    week: number;
    score: number;
    correctPicks: number;
    totalPicks: number;
    rank: number;
  }>;
  stats: {
    averageScore: number;
    bestWeek: number;
    worstWeek: number;
    consistency: number;
    currentStreak: number;
    longestStreak: number;
  };
  rank: number;
  trend: 'up' | 'down' | 'same';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leagueId = searchParams.get('leagueId');
    const week = searchParams.get('week');

    if (!leagueId) {
      return NextResponse.json({
        success: false,
        error: 'League ID is required',
      }, { status: 400 });
    }

    // Get league members first
    const leagueResponse = await fetch(`${request.nextUrl.origin}/api/leagues?id=${leagueId}`);
    const leagueData = await leagueResponse.json();
    
    if (!leagueData.success) {
      return NextResponse.json({
        success: false,
        error: 'League not found',
      }, { status: 404 });
    }

    const league = leagueData.data;
    const activeMembers = league.members.filter((member: any) => member.status === 'active');

    // Generate standings only for actual league members
    const standings = activeMembers.map((member: any, index: number): LeagueStanding => ({
      userId: member.userId,
      username: member.username,
      totalScore: 0, // Will be calculated from actual picks in real implementation
      weeklyScores: [],
      stats: {
        averageScore: 0,
        bestWeek: 0,
        worstWeek: 0,
        consistency: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
      rank: index + 1,
      trend: 'same' as const,
    }));

    if (week) {
      // Return standings for specific week
      const weekNum = parseInt(week);
      const weeklyStandings = standings.map((standing: LeagueStanding) => ({
        ...standing,
        score: standing.weeklyScores.find((w: any) => w.week === weekNum)?.score || 0,
        correctPicks: standing.weeklyScores.find((w: any) => w.week === weekNum)?.correctPicks || 0,
        totalPicks: standing.weeklyScores.find((w: any) => w.week === weekNum)?.totalPicks || 0,
      }));

      return NextResponse.json({
        success: true,
        data: {
          week: weekNum,
          standings: weeklyStandings,
        },
      });
    }

    // Return overall season standings
    return NextResponse.json({
      success: true,
      data: {
        leagueId,
        standings,
        lastUpdated: new Date().toISOString(),
        totalWeeks: 18,
        currentWeek: 1,
      },
    });

  } catch (error) {
    console.error('Error fetching standings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch standings',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leagueId, week, userScores } = body;

    if (!leagueId || !week || !userScores) {
      return NextResponse.json({
        success: false,
        error: 'League ID, week, and user scores are required',
      }, { status: 400 });
    }

    // In a real app, this would update the database with new scores
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: `Standings updated for week ${week}`,
      data: {
        leagueId,
        week,
        updatedUsers: userScores.length,
      },
    });

  } catch (error) {
    console.error('Error updating standings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update standings',
    }, { status: 500 });
  }
}
