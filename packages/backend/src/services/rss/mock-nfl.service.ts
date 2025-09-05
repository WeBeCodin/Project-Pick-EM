import { logger } from '../../utils/logger';
import { prisma } from '../../database';
import { GameStatus, Conference, Division } from '@prisma/client';

/**
 * Service to create mock NFL games for testing and demo based on real 2025 schedule
 */
export class MockNFLService {
  
  /**
   * Create Week 1 games with real 2025 NFL schedule from ESPN
   */
  static async createWeek1Games(): Promise<void> {
    try {
      logger.info('Creating Week 1 2025 NFL games with real schedule...');

      // First, create all NFL teams
      await this.createAllNFLTeams();
      
      // Then create a basic week and season
      await this.createSeasonAndWeek();
      
      // Finally create the real Week 1 games
      await this.createRealWeek1Games();

      logger.info('Successfully created Week 1 games with real schedule');
    } catch (error) {
      logger.error('Error creating Week 1 games:', error);
      throw error;
    }
  }

  /**
   * Create all 32 NFL teams for the 2025 season
   */
  private static async createAllNFLTeams(): Promise<void> {
    const teams = [
      // AFC Teams
      { abbr: 'KC', city: 'Kansas City', name: 'Chiefs', conference: 'AFC', division: 'WEST' },
      { abbr: 'LAC', city: 'Los Angeles', name: 'Chargers', conference: 'AFC', division: 'WEST' },
      { abbr: 'DEN', city: 'Denver', name: 'Broncos', conference: 'AFC', division: 'WEST' },
      { abbr: 'LV', city: 'Las Vegas', name: 'Raiders', conference: 'AFC', division: 'WEST' },
      { abbr: 'BAL', city: 'Baltimore', name: 'Ravens', conference: 'AFC', division: 'NORTH' },
      { abbr: 'CIN', city: 'Cincinnati', name: 'Bengals', conference: 'AFC', division: 'NORTH' },
      { abbr: 'CLE', city: 'Cleveland', name: 'Browns', conference: 'AFC', division: 'NORTH' },
      { abbr: 'PIT', city: 'Pittsburgh', name: 'Steelers', conference: 'AFC', division: 'NORTH' },
      { abbr: 'BUF', city: 'Buffalo', name: 'Bills', conference: 'AFC', division: 'EAST' },
      { abbr: 'MIA', city: 'Miami', name: 'Dolphins', conference: 'AFC', division: 'EAST' },
      { abbr: 'NE', city: 'New England', name: 'Patriots', conference: 'AFC', division: 'EAST' },
      { abbr: 'NYJ', city: 'New York', name: 'Jets', conference: 'AFC', division: 'EAST' },
      { abbr: 'HOU', city: 'Houston', name: 'Texans', conference: 'AFC', division: 'SOUTH' },
      { abbr: 'IND', city: 'Indianapolis', name: 'Colts', conference: 'AFC', division: 'SOUTH' },
      { abbr: 'JAX', city: 'Jacksonville', name: 'Jaguars', conference: 'AFC', division: 'SOUTH' },
      { abbr: 'TEN', city: 'Tennessee', name: 'Titans', conference: 'AFC', division: 'SOUTH' },
      
      // NFC Teams
      { abbr: 'SF', city: 'San Francisco', name: '49ers', conference: 'NFC', division: 'WEST' },
      { abbr: 'LAR', city: 'Los Angeles', name: 'Rams', conference: 'NFC', division: 'WEST' },
      { abbr: 'SEA', city: 'Seattle', name: 'Seahawks', conference: 'NFC', division: 'WEST' },
      { abbr: 'ARI', city: 'Arizona', name: 'Cardinals', conference: 'NFC', division: 'WEST' },
      { abbr: 'GB', city: 'Green Bay', name: 'Packers', conference: 'NFC', division: 'NORTH' },
      { abbr: 'MIN', city: 'Minnesota', name: 'Vikings', conference: 'NFC', division: 'NORTH' },
      { abbr: 'CHI', city: 'Chicago', name: 'Bears', conference: 'NFC', division: 'NORTH' },
      { abbr: 'DET', city: 'Detroit', name: 'Lions', conference: 'NFC', division: 'NORTH' },
      { abbr: 'PHI', city: 'Philadelphia', name: 'Eagles', conference: 'NFC', division: 'EAST' },
      { abbr: 'DAL', city: 'Dallas', name: 'Cowboys', conference: 'NFC', division: 'EAST' },
      { abbr: 'NYG', city: 'New York', name: 'Giants', conference: 'NFC', division: 'EAST' },
      { abbr: 'WSH', city: 'Washington', name: 'Commanders', conference: 'NFC', division: 'EAST' },
      { abbr: 'NO', city: 'New Orleans', name: 'Saints', conference: 'NFC', division: 'SOUTH' },
      { abbr: 'TB', city: 'Tampa Bay', name: 'Buccaneers', conference: 'NFC', division: 'SOUTH' },
      { abbr: 'ATL', city: 'Atlanta', name: 'Falcons', conference: 'NFC', division: 'SOUTH' },
      { abbr: 'CAR', city: 'Carolina', name: 'Panthers', conference: 'NFC', division: 'SOUTH' }
    ];

    for (const team of teams) {
      await prisma.team.upsert({
        where: { abbreviation: team.abbr },
        update: {},
        create: {
          abbreviation: team.abbr,
          city: team.city,
          name: team.name,
          fullName: `${team.city} ${team.name}`,
          conference: team.conference as Conference,
          division: team.division as Division
        }
      });
    }

    logger.info(`Created/updated ${teams.length} NFL teams`);
  }

  /**
   * Create season and week
   */
  private static async createSeasonAndWeek(): Promise<void> {
    // Create 2025 season
    const season = await prisma.season.upsert({
      where: { year: 2025 },
      update: {},
      create: {
        year: 2025,
        startDate: new Date('2025-09-05'),
        endDate: new Date('2026-01-20'),
        isActive: true,
        isCurrent: true
      }
    });

    // Create Week 1
    await prisma.week.upsert({
      where: { 
        seasonId_weekNumber: {
          seasonId: season.id,
          weekNumber: 1
        }
      },
      update: {},
      create: {
        seasonId: season.id,
        weekNumber: 1,
        name: 'Week 1',
        startDate: new Date('2025-09-05'),
        endDate: new Date('2025-09-09'),
        pickDeadline: new Date('2025-09-05T20:00:00Z'),
        isActive: true
      }
    });

    logger.info('Created season and Week 1');
  }

  /**
   * Create real Week 1 2025 NFL games from ESPN schedule
   */
  private static async createRealWeek1Games(): Promise<void> {
    // Get the week
    const week = await prisma.week.findFirst({
      where: { 
        season: { year: 2025 },
        weekNumber: 1
      }
    });

    if (!week) {
      throw new Error('Week 1 not found');
    }

    // Real Week 1 2025 NFL schedule from ESPN API
    const realWeek1Games = [
      {
        homeTeam: 'PHI',
        awayTeam: 'DAL',
        kickoffTime: new Date('2025-09-05T00:20:00Z'), // Thursday Night Football
        tvNetwork: 'NBC'
      },
      {
        homeTeam: 'LAC',
        awayTeam: 'KC', 
        kickoffTime: new Date('2025-09-06T00:00:00Z'), // Friday Night
        tvNetwork: 'YouTube'
      },
      {
        homeTeam: 'NYJ',
        awayTeam: 'PIT',
        kickoffTime: new Date('2025-09-07T17:00:00Z'), // Sunday 1:00 PM EDT
        tvNetwork: 'CBS'
      },
      {
        homeTeam: 'DEN',
        awayTeam: 'TEN',
        kickoffTime: new Date('2025-09-07T20:05:00Z'), // Sunday 4:05 PM EDT
        tvNetwork: 'CBS'
      },
      {
        homeTeam: 'SEA',
        awayTeam: 'SF',
        kickoffTime: new Date('2025-09-07T20:05:00Z'), // Sunday 4:05 PM EDT
        tvNetwork: 'FOX'
      },
      {
        homeTeam: 'GB', 
        awayTeam: 'DET',
        kickoffTime: new Date('2025-09-07T20:25:00Z'), // Sunday 4:25 PM EDT
        tvNetwork: 'CBS'
      },
      {
        homeTeam: 'LAR',
        awayTeam: 'HOU',
        kickoffTime: new Date('2025-09-07T20:25:00Z'), // Sunday 4:25 PM EDT
        tvNetwork: 'CBS'
      },
      {
        homeTeam: 'BUF',
        awayTeam: 'BAL',
        kickoffTime: new Date('2025-09-08T00:20:00Z'), // Sunday Night Football 8:20 PM EDT
        tvNetwork: 'NBC'
      },
      {
        homeTeam: 'CHI',
        awayTeam: 'MIN',
        kickoffTime: new Date('2025-09-09T00:15:00Z'), // Monday Night Football
        tvNetwork: 'ABC/ESPN'
      },
    ];

    let createdCount = 0;

    for (const gameData of realWeek1Games) {
      // Get teams
      const homeTeam = await prisma.team.findUnique({ where: { abbreviation: gameData.homeTeam } });
      const awayTeam = await prisma.team.findUnique({ where: { abbreviation: gameData.awayTeam } });

      if (!homeTeam || !awayTeam) {
        logger.warn(`Teams not found for game: ${gameData.awayTeam} @ ${gameData.homeTeam}`);
        continue;
      }

      // Check if game already exists
      const existingGame = await prisma.game.findFirst({
        where: {
          weekId: week.id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id
        }
      });

      if (existingGame) {
        continue; // Skip if already exists
      }

      await prisma.game.create({
        data: {
          weekId: week.id,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          kickoffTime: gameData.kickoffTime,
          tvNetwork: gameData.tvNetwork,
          status: GameStatus.SCHEDULED
        }
      });

      createdCount++;
    }

    logger.info(`Created ${createdCount} real NFL Week 1 games`);
  }
}
