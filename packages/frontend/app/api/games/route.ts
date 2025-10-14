import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // NFL Week 7 schedule - set to next week (Oct 19-21, 2025) for testing
    const week = '7';

    const realNFLGames = [
      {
        id: 'game_1',
        homeTeam: { name: 'Kansas City Chiefs', abbreviation: 'KC' },
        awayTeam: { name: 'San Francisco 49ers', abbreviation: 'SF' },
        gameTime: '2025-10-17T00:20:00Z', // Thursday Night Football - Oct 16 8:20 PM ET
        week: 7,
        network: 'Amazon',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_2',
        homeTeam: { name: 'Tampa Bay Buccaneers', abbreviation: 'TB' },
        awayTeam: { name: 'Baltimore Ravens', abbreviation: 'BAL' },
        gameTime: '2025-10-19T17:00:00Z', // Sunday 1:00 PM ET
        week: 7,
        network: 'CBS',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_3',
        homeTeam: { name: 'Miami Dolphins', abbreviation: 'MIA' },
        awayTeam: { name: 'Indianapolis Colts', abbreviation: 'IND' },
        gameTime: '2025-10-19T17:00:00Z', // Sunday 1:00 PM ET
        week: 7,
        network: 'FOX',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_4',
        homeTeam: { name: 'Cincinnati Bengals', abbreviation: 'CIN' },
        awayTeam: { name: 'Cleveland Browns', abbreviation: 'CLE' },
        gameTime: '2025-10-19T17:00:00Z', // Sunday 1:00 PM ET
        week: 7,
        network: 'CBS',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_5',
        homeTeam: { name: 'Detroit Lions', abbreviation: 'DET' },
        awayTeam: { name: 'Minnesota Vikings', abbreviation: 'MIN' },
        gameTime: '2025-10-19T17:00:00Z', // Sunday 1:00 PM ET
        week: 7,
        network: 'FOX',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_6',
        homeTeam: { name: 'Houston Texans', abbreviation: 'HOU' },
        awayTeam: { name: 'Green Bay Packers', abbreviation: 'GB' },
        gameTime: '2025-10-19T17:00:00Z', // Sunday 1:00 PM ET
        week: 7,
        network: 'CBS',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_7',
        homeTeam: { name: 'New England Patriots', abbreviation: 'NE' },
        awayTeam: { name: 'Jacksonville Jaguars', abbreviation: 'JAX' },
        gameTime: '2025-10-20T13:30:00Z', // Sunday 9:30 AM ET (London game)
        week: 7,
        network: 'NFL Network',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_8',
        homeTeam: { name: 'Seattle Seahawks', abbreviation: 'SEA' },
        awayTeam: { name: 'Atlanta Falcons', abbreviation: 'ATL' },
        gameTime: '2025-10-19T20:05:00Z', // Sunday 4:05 PM ET
        week: 7,
        network: 'FOX',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_9',
        homeTeam: { name: 'Las Vegas Raiders', abbreviation: 'LV' },
        awayTeam: { name: 'Los Angeles Rams', abbreviation: 'LAR' },
        gameTime: '2025-10-19T20:25:00Z', // Sunday 4:25 PM ET
        week: 7,
        network: 'CBS',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_10',
        homeTeam: { name: 'Philadelphia Eagles', abbreviation: 'PHI' },
        awayTeam: { name: 'New York Giants', abbreviation: 'NYG' },
        gameTime: '2025-10-20T00:20:00Z', // Sunday Night Football - 8:20 PM ET
        week: 7,
        network: 'NBC',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_11',
        homeTeam: { name: 'Los Angeles Chargers', abbreviation: 'LAC' },
        awayTeam: { name: 'Arizona Cardinals', abbreviation: 'ARI' },
        gameTime: '2025-10-21T01:15:00Z', // Monday Night Football - 9:15 PM ET
        week: 7,
        network: 'ESPN',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      },
      {
        id: 'game_12',
        homeTeam: { name: 'New Orleans Saints', abbreviation: 'NO' },
        awayTeam: { name: 'Denver Broncos', abbreviation: 'DEN' },
        gameTime: '2025-10-17T20:15:00Z', // Thursday Night Football - 8:15 PM ET
        week: 7,
        network: 'Amazon',
        status: 'SCHEDULED',
        homeScore: null,
        awayScore: null
      }
    ];

    return NextResponse.json({
      success: true,
      data: realNFLGames,
      totalGames: realNFLGames.length,
      week: parseInt(week),
    });

  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch games',
    }, { status: 500 });
  }
}
