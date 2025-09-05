import { NextResponse } from 'next/server';

/**
 * ESPN NFL Scoreboard API proxy
 * Fetches live NFL scores, game status, and real-time updates
 */
export async function GET() {
  try {
    // ESPN's public NFL scoreboard API
    const espnResponse = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard', {
      headers: {
        'User-Agent': 'NFL-PickEm-App/1.0',
      },
      // Cache for 30 seconds to avoid rate limiting
      next: { revalidate: 30 }
    });

    if (!espnResponse.ok) {
      throw new Error(`ESPN API error: ${espnResponse.status}`);
    }

    const data = await espnResponse.json();
    
    // Transform ESPN data to our app format
    const games = data.events?.map((event: any) => {
      const competition = event.competitions[0];
      const homeTeam = competition.competitors.find((team: any) => team.homeAway === 'home');
      const awayTeam = competition.competitors.find((team: any) => team.homeAway === 'away');
      
      return {
        id: event.id,
        name: event.name,
        shortName: event.shortName,
        date: event.date,
        week: event.week?.number || 1,
        season: event.season?.year || 2025,
        
        // Game status and timing
        status: {
          state: competition.status.type.state, // 'pre', 'in', 'post'
          completed: competition.status.type.completed,
          description: competition.status.type.description,
          detail: competition.status.type.detail,
          shortDetail: competition.status.type.shortDetail,
          clock: competition.status.displayClock,
          period: competition.status.period,
        },
        
        // Teams and scores
        homeTeam: {
          id: homeTeam.team.id,
          name: homeTeam.team.name,
          displayName: homeTeam.team.displayName,
          abbreviation: homeTeam.team.abbreviation,
          color: homeTeam.team.color,
          logo: homeTeam.team.logo,
          score: parseInt(homeTeam.score || '0'),
          records: homeTeam.records?.[0]?.summary || '0-0',
        },
        
        awayTeam: {
          id: awayTeam.team.id,
          name: awayTeam.team.name,
          displayName: awayTeam.team.displayName,
          abbreviation: awayTeam.team.abbreviation,
          color: awayTeam.team.color,
          logo: awayTeam.team.logo,
          score: parseInt(awayTeam.score || '0'),
          records: awayTeam.records?.[0]?.summary || '0-0',
        },
        
        // Broadcasting info
        broadcast: competition.broadcasts?.[0]?.names?.[0] || '',
        venue: {
          name: competition.venue?.fullName || '',
          city: competition.venue?.address?.city || '',
          state: competition.venue?.address?.state || '',
        },
        
        // Weather (if available)
        weather: event.weather ? {
          temperature: event.weather.temperature,
          condition: event.weather.displayValue,
        } : null,
        
        // Betting odds (if available)
        odds: competition.odds?.[0] ? {
          spread: competition.odds[0].spread,
          overUnder: competition.odds[0].overUnder,
          homeMoneyline: competition.odds[0].homeTeamOdds?.moneyLine,
          awayMoneyline: competition.odds[0].awayTeamOdds?.moneyLine,
        } : null,
      };
    }) || [];

    return NextResponse.json({
      games,
      lastUpdated: new Date().toISOString(),
      week: data.week?.number || 1,
      season: data.season?.year || 2025,
    });

  } catch (error) {
    console.error('Error fetching ESPN scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live scores' },
      { status: 500 }
    );
  }
}
