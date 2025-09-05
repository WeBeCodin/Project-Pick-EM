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

// Mock standings data
const generateMockStandings = (_leagueId: string): LeagueStanding[] => {
  const baseStandings: LeagueStanding[] = [
    {
      userId: 'user-1',
      username: 'johnsmith',
      totalScore: 0,
      weeklyScores: [],
      stats: {
        averageScore: 0,
        bestWeek: 0,
        worstWeek: 0,
        consistency: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
      rank: 1,
      trend: 'same',
    },
    {
      userId: 'user-2',
      username: 'sarahjones',
      totalScore: 0,
      weeklyScores: [],
      stats: {
        averageScore: 0,
        bestWeek: 0,
        worstWeek: 0,
        consistency: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
      rank: 2,
      trend: 'same',
    },
    {
      userId: 'user-3',
      username: 'mikebrown',
      totalScore: 0,
      weeklyScores: [],
      stats: {
        averageScore: 0,
        bestWeek: 0,
        worstWeek: 0,
        consistency: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
      rank: 3,
      trend: 'same',
    },
  ];

  return baseStandings;
};

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

    const standings = generateMockStandings(leagueId);

    if (week) {
      // Return standings for specific week
      const weekNum = parseInt(week);
      const weeklyStandings = standings.map(standing => ({
        ...standing,
        score: standing.weeklyScores.find(w => w.week === weekNum)?.score || 0,
        correctPicks: standing.weeklyScores.find(w => w.week === weekNum)?.correctPicks || 0,
        totalPicks: standing.weeklyScores.find(w => w.week === weekNum)?.totalPicks || 0,
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
