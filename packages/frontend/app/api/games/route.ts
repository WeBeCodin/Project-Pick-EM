import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Make this route static by defaulting to week 1
    const week = '1';

    // Real 2025 NFL Week 1 schedule (from official NFL/ESPN data)
    const realNFLGames = [
      {
        id: 'game_1',
        homeTeam: { name: 'Philadelphia Eagles', abbreviation: 'PHI' },
        awayTeam: { name: 'Dallas Cowboys', abbreviation: 'DAL' },
        gameTime: '2025-09-05T00:20:00Z', // Thursday Night Football
        week: 1,
        network: 'NBC',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_2',
        homeTeam: { name: 'Los Angeles Chargers', abbreviation: 'LAC' },
        awayTeam: { name: 'Kansas City Chiefs', abbreviation: 'KC' },
        gameTime: '2025-09-06T01:15:00Z', // Friday Night Football
        week: 1,
        network: 'YouTube',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_3',
        homeTeam: { name: 'New York Jets', abbreviation: 'NYJ' },
        awayTeam: { name: 'Pittsburgh Steelers', abbreviation: 'PIT' },
        gameTime: '2025-09-07T17:00:00Z', // Sunday 1:00 PM
        week: 1,
        network: 'CBS',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_4',
        homeTeam: { name: 'Denver Broncos', abbreviation: 'DEN' },
        awayTeam: { name: 'Tennessee Titans', abbreviation: 'TEN' },
        gameTime: '2025-09-07T17:00:00Z', // Sunday 1:00 PM
        week: 1,
        network: 'CBS',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_5',
        homeTeam: { name: 'Seattle Seahawks', abbreviation: 'SEA' },
        awayTeam: { name: 'San Francisco 49ers', abbreviation: 'SF' },
        gameTime: '2025-09-07T20:05:00Z', // Sunday 4:05 PM
        week: 1,
        network: 'FOX',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_6',
        homeTeam: { name: 'Green Bay Packers', abbreviation: 'GB' },
        awayTeam: { name: 'Detroit Lions', abbreviation: 'DET' },
        gameTime: '2025-09-07T20:25:00Z', // Sunday 4:25 PM
        week: 1,
        network: 'CBS',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_7',
        homeTeam: { name: 'Los Angeles Rams', abbreviation: 'LAR' },
        awayTeam: { name: 'Houston Texans', abbreviation: 'HOU' },
        gameTime: '2025-09-07T20:25:00Z', // Sunday 4:25 PM
        week: 1,
        network: 'CBS',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_8',
        homeTeam: { name: 'Buffalo Bills', abbreviation: 'BUF' },
        awayTeam: { name: 'Baltimore Ravens', abbreviation: 'BAL' },
        gameTime: '2025-09-08T00:20:00Z', // Sunday Night Football
        week: 1,
        network: 'NBC',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_9',
        homeTeam: { name: 'Chicago Bears', abbreviation: 'CHI' },
        awayTeam: { name: 'Minnesota Vikings', abbreviation: 'MIN' },
        gameTime: '2025-09-09T00:15:00Z', // Monday Night Football
        week: 1,
        network: 'ABC/ESPN',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        games: realNFLGames,
        count: realNFLGames.length,
        week: parseInt(week)
      }
    });

  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch games'
    }, { status: 500 });
  }
}
