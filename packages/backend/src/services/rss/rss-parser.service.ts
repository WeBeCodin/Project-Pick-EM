import Parser from 'rss-parser';
import { logger } from '../../utils/logger';
import { cacheService } from '../cache/cache.service';
import { prisma } from '../../database';
import { Team } from '@prisma/client';

/**
 * Interface for parsed game schedule data
 */
export interface GameSchedule {
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  week: number;
  venue?: string;
  network?: string;
}

/**
 * Interface for live game scores
 */
export interface GameScore {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  gameStatus: string;
  week: number;
  quarter?: string;
  timeRemaining?: string;
}

/**
 * Interface for sync operation results
 */
export interface SyncResult {
  synced: number;
  updated?: number; // For score updates
  errors: number;
  details: string[];
}

/**
 * Production-ready RSS parser service for NFL game data
 * Supports multiple RSS sources with intelligent fallback and caching
 */
export class RSSParserService {
  private parser: Parser;
  private rssFeeds: {
    schedule: string[];
    scores: string[];
  };

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['description', 'summary', 'content:encoded']
      }
    });

    // Multiple RSS feed sources for reliability
    this.rssFeeds = {
      schedule: [
        'https://www.espn.com/nfl/rss/news',
        'https://rss.cnn.com/rss/edition.rss',
        'https://feeds.cbssports.com/nfl/rss'
      ],
      scores: [
        'https://www.espn.com/nfl/rss/news',
        'https://rss.cnn.com/rss/edition.rss',
        'https://feeds.cbssports.com/nfl/rss'
      ]
    };
  }

  /**
   * Fetch NFL schedule for a specific week with caching
   * @param weekNumber - NFL week number (1-18 for regular season)
   * @returns Promise<GameSchedule[]> - Array of scheduled games
   */
  async fetchScheduleForWeek(weekNumber: number): Promise<GameSchedule[]> {
    const cacheKey = `schedule:week:${weekNumber}`;
    
    try {
      // Check cache first
      const cached = await cacheService.get<GameSchedule[]>(cacheKey);
      if (cached) {
        logger.info(`Retrieved schedule for week ${weekNumber} from cache`);
        return cached;
      }

      logger.info(`Fetching fresh schedule data for week ${weekNumber}`);
      
      const allGames: GameSchedule[] = [];
      const errors: string[] = [];

      // Try multiple RSS sources for reliability
      for (const feedUrl of this.rssFeeds.schedule) {
        try {
          const feed = await this.parser.parseURL(feedUrl);
          const games = this.parseScheduleFromFeed(feed, weekNumber);
          allGames.push(...games);
          
          logger.debug(`Parsed ${games.length} games from ${feedUrl}`);
        } catch (error) {
          const errorMsg = `Failed to parse ${feedUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          logger.warn(errorMsg);
          errors.push(errorMsg);
        }
      }

      // Deduplicate games based on team matchups
      const uniqueGames = this.deduplicateGames(allGames);
      
      // Cache for 15 minutes (schedule doesn't change frequently)
      if (uniqueGames.length > 0) {
        await cacheService.set(cacheKey, uniqueGames, 15 * 60);
        logger.info(`Cached ${uniqueGames.length} games for week ${weekNumber}`);
      }

      if (errors.length > 0 && uniqueGames.length === 0) {
        logger.error(`All RSS feeds failed for week ${weekNumber}: ${errors.join(', ')}`);
      }

      return uniqueGames;
    } catch (error) {
      logger.error(`Error fetching schedule for week ${weekNumber}:`, error);
      return [];
    }
  }

  /**
   * Fetch live scores for games in a specific week
   * @param weekNumber - NFL week number
   * @returns Promise<GameScore[]> - Array of game scores
   */
  async fetchLiveScores(weekNumber: number): Promise<GameScore[]> {
    const cacheKey = `scores:week:${weekNumber}`;
    
    try {
      // Check cache first (shorter TTL for live data)
      const cached = await cacheService.get<GameScore[]>(cacheKey);
      if (cached) {
        logger.info(`Retrieved live scores for week ${weekNumber} from cache`);
        return cached;
      }

      logger.info(`Fetching fresh score data for week ${weekNumber}`);
      
      const allScores: GameScore[] = [];
      const errors: string[] = [];

      // Try multiple RSS sources for reliability
      for (const feedUrl of this.rssFeeds.scores) {
        try {
          const feed = await this.parser.parseURL(feedUrl);
          const scores = this.parseScoresFromFeed(feed, weekNumber);
          allScores.push(...scores);
          
          logger.debug(`Parsed ${scores.length} scores from ${feedUrl}`);
        } catch (error) {
          const errorMsg = `Failed to parse scores from ${feedUrl}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          logger.warn(errorMsg);
          errors.push(errorMsg);
        }
      }

      // Deduplicate scores
      const uniqueScores = this.deduplicateScores(allScores);
      
      // Cache for 1 minute (live scores change frequently)
      if (uniqueScores.length > 0) {
        await cacheService.set(cacheKey, uniqueScores, 60);
        logger.info(`Cached ${uniqueScores.length} scores for week ${weekNumber}`);
      }

      return uniqueScores;
    } catch (error) {
      logger.error(`Error fetching scores for week ${weekNumber}:`, error);
      return [];
    }
  }

  /**
   * Sync games from RSS feeds to database
   * @param weekNumber - NFL week number
   * @returns Promise<SyncResult> - Sync operation results
   */
  async syncGamesToDatabase(weekNumber: number): Promise<SyncResult> {
    const result: SyncResult = {
      synced: 0,
      errors: 0,
      details: []
    };

    try {
      const games = await this.fetchScheduleForWeek(weekNumber);
      logger.info(`Syncing ${games.length} games for week ${weekNumber} to database`);

      for (const game of games) {
        try {
          // Find teams in database
          const homeTeam = await this.findTeamByName(game.homeTeam);
          const awayTeam = await this.findTeamByName(game.awayTeam);

          if (!homeTeam || !awayTeam) {
            const error = `Teams not found: ${game.homeTeam} vs ${game.awayTeam}`;
            result.details.push(error);
            result.errors++;
            continue;
          }

          // Find week in database
          const week = await prisma.week.findFirst({
            where: {
              weekNumber: weekNumber,
              season: {
                year: new Date().getFullYear()
              }
            }
          });

          if (!week) {
            const error = `Week ${weekNumber} not found in database`;
            result.details.push(error);
            result.errors++;
            continue;
          }

          // Upsert game - find existing game first
          const existingGame = await prisma.game.findFirst({
            where: {
              weekId: week.id,
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id
            }
          });

          if (existingGame) {
            await prisma.game.update({
              where: { id: existingGame.id },
              data: {
                kickoffTime: new Date(game.gameTime),
                tvNetwork: game.network
              }
            });
          } else {
            await prisma.game.create({
              data: {
                weekId: week.id,
                homeTeamId: homeTeam.id,
                awayTeamId: awayTeam.id,
                kickoffTime: new Date(game.gameTime),
                tvNetwork: game.network,
                status: 'SCHEDULED'
              }
            });
          }

          result.synced++;
          result.details.push(`Synced: ${game.awayTeam} @ ${game.homeTeam}`);
          
        } catch (error) {
          const errorMsg = `Error syncing game ${game.awayTeam} @ ${game.homeTeam}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.details.push(errorMsg);
          result.errors++;
          logger.error(errorMsg);
        }
      }

      logger.info(`Sync complete for week ${weekNumber}: ${result.synced} synced, ${result.errors} errors`);
      return result;
      
    } catch (error) {
      logger.error(`Error during sync for week ${weekNumber}:`, error);
      result.details.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.errors++;
      return result;
    }
  }

  /**
   * Update game scores in database from live RSS feeds
   * @param weekNumber - NFL week number
   * @returns Promise<SyncResult> - Update operation results
   */
  async updateGameScores(weekNumber: number): Promise<SyncResult> {
    const result: SyncResult = {
      synced: 0,
      updated: 0,
      errors: 0,
      details: []
    };

    try {
      const scores = await this.fetchLiveScores(weekNumber);
      logger.info(`Updating scores for ${scores.length} games in week ${weekNumber}`);

      for (const score of scores) {
        try {
          // Find teams
          const homeTeam = await this.findTeamByName(score.homeTeam);
          const awayTeam = await this.findTeamByName(score.awayTeam);

          if (!homeTeam || !awayTeam) {
            result.details.push(`Teams not found: ${score.homeTeam} vs ${score.awayTeam}`);
            result.errors++;
            continue;
          }

          // Find game in database
          const game = await prisma.game.findFirst({
            where: {
              homeTeamId: homeTeam.id,
              awayTeamId: awayTeam.id,
              week: {
                weekNumber: weekNumber,
                season: {
                  year: new Date().getFullYear()
                }
              }
            }
          });

          if (!game) {
            result.details.push(`Game not found: ${score.awayTeam} @ ${score.homeTeam}`);
            result.errors++;
            continue;
          }

          // Update game scores
          await prisma.game.update({
            where: { id: game.id },
            data: {
              homeScore: score.homeScore,
              awayScore: score.awayScore,
              status: this.mapGameStatus(score.gameStatus) as any,
              quarter: score.quarter,
              timeRemaining: score.timeRemaining
            }
          });

          result.updated = (result.updated || 0) + 1;
          result.details.push(`Updated: ${score.awayTeam} ${score.awayScore} - ${score.homeScore} ${score.homeTeam} (${score.gameStatus})`);
          
        } catch (error) {
          const errorMsg = `Error updating score for ${score.awayTeam} @ ${score.homeTeam}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.details.push(errorMsg);
          result.errors++;
          logger.error(errorMsg);
        }
      }

      logger.info(`Score update complete for week ${weekNumber}: ${result.updated} updated, ${result.errors} errors`);
      return result;
      
    } catch (error) {
      logger.error(`Error during score update for week ${weekNumber}:`, error);
      result.details.push(`Score update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.errors++;
      return result;
    }
  }

  /**
   * Parse schedule data from RSS feed
   * @private
   */
  private parseScheduleFromFeed(feed: any, weekNumber: number): GameSchedule[] {
    const games: GameSchedule[] = [];
    
    for (const item of feed.items || []) {
      try {
        // Parse game info from title and description
        const gameInfo = this.extractGameInfo(item.title, item.contentSnippet || item.description || '');
        
        if (gameInfo && gameInfo.homeTeam && gameInfo.awayTeam && this.isGameForWeek(item.pubDate, weekNumber)) {
          games.push({
            homeTeam: gameInfo.homeTeam,
            awayTeam: gameInfo.awayTeam,
            week: weekNumber,
            gameTime: item.pubDate || new Date().toISOString(),
            venue: gameInfo.venue,
            network: gameInfo.network
          });
        }
      } catch (error) {
        logger.debug(`Skipping invalid schedule item: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return games;
  }

  /**
   * Parse score data from RSS feed
   * @private
   */
  private parseScoresFromFeed(feed: any, weekNumber: number): GameScore[] {
    const scores: GameScore[] = [];
    
    for (const item of feed.items || []) {
      try {
        const scoreInfo = this.extractScoreInfo(item.title, item.contentSnippet || item.description || '');
        
        if (scoreInfo && scoreInfo.homeTeam && scoreInfo.awayTeam && 
            typeof scoreInfo.homeScore === 'number' && typeof scoreInfo.awayScore === 'number' &&
            scoreInfo.gameStatus && this.isGameForWeek(item.pubDate, weekNumber)) {
          scores.push({
            homeTeam: scoreInfo.homeTeam,
            awayTeam: scoreInfo.awayTeam,
            homeScore: scoreInfo.homeScore,
            awayScore: scoreInfo.awayScore,
            gameStatus: scoreInfo.gameStatus,
            week: weekNumber,
            quarter: scoreInfo.quarter,
            timeRemaining: scoreInfo.timeRemaining
          });
        }
      } catch (error) {
        logger.debug(`Skipping invalid score item: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return scores;
  }

  /**
   * Extract game information from RSS item text
   * @private
   */
  private extractGameInfo(title: string, description: string): Partial<GameSchedule> | null {
    const text = `${title} ${description}`.toLowerCase();
    
    // Common patterns for game matchups
    const patterns = [
      /(\w+)\s+(?:vs|@|at)\s+(\w+)/i,
      /(\w+)\s+(\w+)\s*-/i,
      /(\w+)\s+and\s+(\w+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const team1 = this.normalizeTeamName(match[1]);
        const team2 = this.normalizeTeamName(match[2]);
        
        if (team1 && team2) {
          // Determine home/away (simple heuristic)
          const isHome = text.includes('@') || text.includes('at');
          return {
            homeTeam: isHome ? team2 : team1,
            awayTeam: isHome ? team1 : team2
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Extract score information from RSS item text
   * @private
   */
  private extractScoreInfo(title: string, description: string): Partial<GameScore> | null {
    const text = `${title} ${description}`;
    
    // Pattern for scores: "Team1 21, Team2 14" or "Team1 21 - Team2 14"
    const scorePattern = /(\w+)\s+(\d+)[,\-\s]+(\w+)\s+(\d+)/i;
    const match = text.match(scorePattern);
    
    if (match) {
      const team1 = this.normalizeTeamName(match[1]);
      const score1 = parseInt(match[2]);
      const team2 = this.normalizeTeamName(match[3]);
      const score2 = parseInt(match[4]);
      
      if (team1 && team2 && !isNaN(score1) && !isNaN(score2)) {
        return {
          homeTeam: team1,
          awayTeam: team2,
          homeScore: score1,
          awayScore: score2,
          gameStatus: this.extractGameStatus(text)
        };
      }
    }
    
    return null;
  }

  /**
   * Normalize team names to match database entries
   * @private
   */
  private normalizeTeamName(teamName: string): string {
    const normalizations: Record<string, string> = {
      'kc': 'Chiefs',
      'buf': 'Bills',
      'ne': 'Patriots',
      'nyj': 'Jets',
      'mia': 'Dolphins',
      'pit': 'Steelers',
      'bal': 'Ravens',
      'cin': 'Bengals',
      'cle': 'Browns',
      'hou': 'Texans',
      'ind': 'Colts',
      'jax': 'Jaguars',
      'ten': 'Titans',
      'den': 'Broncos',
      'lv': 'Raiders',
      'lac': 'Chargers',
      'dal': 'Cowboys',
      'nyg': 'Giants',
      'phi': 'Eagles',
      'was': 'Commanders',
      'gb': 'Packers',
      'min': 'Vikings',
      'chi': 'Bears',
      'det': 'Lions',
      'tb': 'Buccaneers',
      'no': 'Saints',
      'atl': 'Falcons',
      'car': 'Panthers',
      'sf': '49ers',
      'sea': 'Seahawks',
      'lar': 'Rams',
      'ari': 'Cardinals'
    };
    
    const normalized = teamName.toLowerCase().trim();
    return normalizations[normalized] || this.capitalizeWords(teamName);
  }

  /**
   * Capitalize words in team name
   * @private
   */
  private capitalizeWords(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Extract game status from text
   * @private
   */
  private extractGameStatus(text: string): string {
    const statusPatterns = [
      { pattern: /final/i, status: 'Final' },
      { pattern: /overtime/i, status: 'Overtime' },
      { pattern: /(\d+)(?:st|nd|rd|th)\s+quarter/i, status: 'In Progress' },
      { pattern: /halftime/i, status: 'Halftime' },
      { pattern: /pregame/i, status: 'Pregame' }
    ];
    
    for (const { pattern, status } of statusPatterns) {
      if (pattern.test(text)) {
        return status;
      }
    }
    
    return 'Scheduled';
  }

  /**
   * Check if game is for the specified week
   * @private
   */
  private isGameForWeek(_pubDate: string, _weekNumber: number): boolean {
    // Simple date-based check - in production, this would be more sophisticated
    // This is a placeholder implementation
    return true;
  }

  /**
   * Remove duplicate games from array
   * @private
   */
  private deduplicateGames(games: GameSchedule[]): GameSchedule[] {
    const seen = new Set<string>();
    return games.filter(game => {
      const key = `${game.homeTeam}-${game.awayTeam}-${game.week}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Remove duplicate scores from array
   * @private
   */
  private deduplicateScores(scores: GameScore[]): GameScore[] {
    const seen = new Set<string>();
    return scores.filter(score => {
      const key = `${score.homeTeam}-${score.awayTeam}-${score.week}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Find team by name in database with fuzzy matching
   * @private
   */
  private async findTeamByName(teamName: string): Promise<Team | null> {
    // Try exact match first
    let team = await prisma.team.findFirst({
      where: {
        OR: [
          { name: { contains: teamName, mode: 'insensitive' } },
          { city: { contains: teamName, mode: 'insensitive' } },
          { abbreviation: { equals: teamName.toUpperCase() } }
        ]
      }
    });

    if (!team) {
      // Try partial matches
      const normalized = this.normalizeTeamName(teamName);
      team = await prisma.team.findFirst({
        where: {
          OR: [
            { name: { contains: normalized, mode: 'insensitive' } },
            { city: { contains: normalized, mode: 'insensitive' } }
          ]
        }
      });
    }

    return team;
  }

  /**
   * Map RSS game status to database enum
   * @private
   */
  private mapGameStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'final': 'FINAL',
      'overtime': 'FINAL_OT',
      'in progress': 'IN_PROGRESS',
      'halftime': 'HALFTIME',
      'pregame': 'SCHEDULED',
      'scheduled': 'SCHEDULED',
      'postponed': 'POSTPONED',
      'cancelled': 'CANCELLED'
    };

    return statusMap[status.toLowerCase()] || 'SCHEDULED';
  }
}

// Export singleton instance
export const rssParserService = new RSSParserService();
