import { prisma } from '../../database';
import { ValidationError, NotFoundError, ForbiddenError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { cacheService } from '../cache/cache.service';
import { Pick, Game, Team } from '@prisma/client';

/**
 * Interface for pick submission
 */
export interface PickSubmission {
  gameId: string;
  selectedTeamId: string;
  tiebreakerScore?: number;
}

/**
 * Interface for bulk pick submission
 */
export interface BulkPickSubmission {
  picks: PickSubmission[];
}

/**
 * Interface for weekly games with pick status
 */
export interface WeeklyGameWithPick extends Game {
  homeTeam: Team;
  awayTeam: Team;
  userPick?: Pick | null;
  isPickable: boolean;
}

/**
 * Interface for leaderboard entry
 */
export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalScore: number;
  weeklyScores: Array<{
    weekNumber: number;
    score: number;
    correctPicks: number;
    totalPicks: number;
  }>;
  correctPicks: number;
  totalPicks: number;
  winPercentage: number;
}

/**
 * Pick Service
 * Handles all pick-related operations including submission, validation, and scoring
 */
export class PickService {
  
  /**
   * Submit a single pick for a user
   */
  async submitPick(
    userId: string, 
    gameId: string, 
    selectedTeamId: string, 
    tiebreakerScore?: number
  ): Promise<Pick> {
    try {
      // Validate game exists and is pickable
      const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
          homeTeam: true,
          awayTeam: true,
          week: true
        }
      });

      if (!game) {
        throw new NotFoundError('Game not found');
      }

      // Check if game has already started
      if (new Date() >= new Date(game.kickoffTime)) {
        throw new ForbiddenError('Cannot submit pick after game has started');
      }

      // Validate selected team is participating in the game
      if (selectedTeamId !== game.homeTeamId && selectedTeamId !== game.awayTeamId) {
        throw new ValidationError('Selected team is not participating in this game');
      }

      // Check if user exists (create if not exists for testing)
      let user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@test.com`,
            username: `user_${userId}`,
            password: 'temp_password' // Temporary for testing
          }
        });
        logger.info(`Created test user: ${userId}`);
      }

      // Upsert the pick (update if exists, create if doesn't)
      const pick = await prisma.pick.upsert({
        where: {
          userId_gameId: {
            userId,
            gameId
          }
        },
        update: {
          selectedTeamId,
          tiebreakerScore,
          submittedAt: new Date()
        },
        create: {
          userId,
          gameId,
          weekId: game.weekId,
          selectedTeamId,
          tiebreakerScore,
          submittedAt: new Date()
        },
        include: {
          game: {
            include: {
              homeTeam: true,
              awayTeam: true
            }
          },
          selectedTeam: true
        }
      });

      // Clear cache for user's picks
      await cacheService.delPattern(`user_picks_${userId}_*`);
      await cacheService.delPattern(`weekly_games_*`);

      logger.info(`Pick submitted: User ${userId} picked ${selectedTeamId} for game ${gameId}`);
      
      return pick;

    } catch (error) {
      logger.error('Error submitting pick:', error);
      throw error;
    }
  }

  /**
   * Submit multiple picks at once
   */
  async submitBulkPicks(userId: string, submissions: PickSubmission[]): Promise<Pick[]> {
    try {
      if (!submissions || submissions.length === 0) {
        throw new ValidationError('No picks provided');
      }

      if (submissions.length > 20) {
        throw new ValidationError('Maximum 20 picks allowed per bulk submission');
      }

      // Validate all games exist and are pickable
      const gameIds = submissions.map(s => s.gameId);
      const games = await prisma.game.findMany({
        where: { id: { in: gameIds } },
        include: {
          homeTeam: true,
          awayTeam: true
        }
      });

      if (games.length !== gameIds.length) {
        throw new NotFoundError('One or more games not found');
      }

      // Check if any games have started
      const now = new Date();
      const startedGames = games.filter(game => now >= new Date(game.kickoffTime));
      if (startedGames.length > 0) {
        throw new ForbiddenError(`Cannot submit picks for games that have started: ${startedGames.map(g => g.id).join(', ')}`);
      }

      // Validate team selections
      for (const submission of submissions) {
        const game = games.find(g => g.id === submission.gameId);
        if (!game) continue;

        if (submission.selectedTeamId !== game.homeTeamId && submission.selectedTeamId !== game.awayTeamId) {
          throw new ValidationError(`Selected team ${submission.selectedTeamId} is not participating in game ${submission.gameId}`);
        }
      }

      // Ensure user exists
      let user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@test.com`,
            username: `user_${userId}`,
            password: 'temp_password' // Temporary for testing
          }
        });
      }

      // Create a map for quick game lookup
      const gameMap = new Map(games.map(game => [game.id, game]));

      // Submit all picks in a transaction
      const picks = await prisma.$transaction(
        submissions.map(submission =>
          prisma.pick.upsert({
            where: {
              userId_gameId: {
                userId,
                gameId: submission.gameId
              }
            },
            update: {
              selectedTeamId: submission.selectedTeamId,
              tiebreakerScore: submission.tiebreakerScore,
              submittedAt: new Date()
            },
            create: {
              userId,
              gameId: submission.gameId,
              weekId: gameMap.get(submission.gameId)!.weekId,
              selectedTeamId: submission.selectedTeamId,
              tiebreakerScore: submission.tiebreakerScore,
              submittedAt: new Date()
            },
            include: {
              game: {
                include: {
                  homeTeam: true,
                  awayTeam: true
                }
              },
              selectedTeam: true
            }
          })
        )
      );

      // Clear relevant caches
      await cacheService.delPattern(`user_picks_${userId}_*`);
      await cacheService.delPattern(`weekly_games_*`);

      logger.info(`Bulk picks submitted: User ${userId} submitted ${picks.length} picks`);
      
      return picks;

    } catch (error) {
      logger.error('Error submitting bulk picks:', error);
      throw error;
    }
  }

  /**
   * Get user's picks for a specific week
   */
  async getUserPicks(userId: string, weekNumber: number): Promise<Pick[]> {
    try {
      const cacheKey = `user_picks_${userId}_week_${weekNumber}`;
      const cached = await cacheService.get<Pick[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const picks = await prisma.pick.findMany({
        where: {
          userId,
          game: {
            week: {
              weekNumber
            }
          }
        },
        include: {
          game: {
            include: {
              homeTeam: true,
              awayTeam: true,
              week: true
            }
          },
          selectedTeam: true
        },
        orderBy: {
          game: {
            kickoffTime: 'asc'
          }
        }
      });

      await cacheService.set(cacheKey, picks, 300); // Cache for 5 minutes
      return picks;

    } catch (error) {
      logger.error('Error getting user picks:', error);
      throw error;
    }
  }

  /**
   * Get all games for a week with user's pick status
   */
  async getWeeklyGames(weekNumber: number, userId?: string): Promise<WeeklyGameWithPick[]> {
    try {
      const cacheKey = `weekly_games_${weekNumber}_${userId || 'anonymous'}`;
      const cached = await cacheService.get<WeeklyGameWithPick[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const games = await prisma.game.findMany({
        where: {
          week: {
            weekNumber
          }
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          week: true,
          ...(userId && {
            picks: {
              where: {
                userId
              }
            }
          })
        },
        orderBy: {
          kickoffTime: 'asc'
        }
      });

      const gamesWithPickStatus = games.map(game => ({
        ...game,
        userPick: userId && game.picks ? game.picks[0] || null : null,
        isPickable: new Date() < new Date(game.kickoffTime),
        picks: undefined // Remove picks array from response
      }));

      await cacheService.set(cacheKey, gamesWithPickStatus, 300); // Cache for 5 minutes
      return gamesWithPickStatus;

    } catch (error) {
      logger.error('Error getting weekly games:', error);
      throw error;
    }
  }

  /**
   * Get current week number
   */
  async getCurrentWeek(): Promise<number> {
    try {
      const currentWeek = await prisma.week.findFirst({
        where: {
          startDate: {
            lte: new Date()
          },
          endDate: {
            gte: new Date()
          }
        }
      });

      return currentWeek?.weekNumber || 1;
    } catch (error) {
      logger.error('Error getting current week:', error);
      return 1; // Default to week 1
    }
  }

  /**
   * Get leaderboard (overall or for specific week)
   */
  async getLeaderboard(weekNumber?: number): Promise<LeaderboardEntry[]> {
    try {
      const cacheKey = `leaderboard_${weekNumber || 'overall'}`;
      const cached = await cacheService.get<LeaderboardEntry[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // Get all users with their picks
      const users = await prisma.user.findMany({
        include: {
          picks: {
            where: weekNumber ? {
              game: {
                week: {
                  weekNumber
                }
              }
            } : undefined,
            include: {
              game: {
                include: {
                  week: true
                }
              }
            }
          }
        }
      });

      const leaderboard: LeaderboardEntry[] = users.map(user => {
        const userPicks = user.picks;
        const correctPicks = userPicks.filter(pick => pick.pointsAwarded > 0).length;
        const totalPicks = userPicks.length;
        const totalScore = userPicks.reduce((sum, pick) => sum + pick.pointsAwarded, 0);

        // Calculate weekly scores
        const weeklyScoresMap = new Map<number, { score: number; correct: number; total: number }>();
        
        userPicks.forEach(pick => {
          const week = pick.game.week.weekNumber;
          const current = weeklyScoresMap.get(week) || { score: 0, correct: 0, total: 0 };
          current.score += pick.pointsAwarded;
          current.total += 1;
          if (pick.pointsAwarded > 0) current.correct += 1;
          weeklyScoresMap.set(week, current);
        });

        const weeklyScores = Array.from(weeklyScoresMap.entries()).map(([weekNum, data]) => ({
          weekNumber: weekNum,
          score: data.score,
          correctPicks: data.correct,
          totalPicks: data.total
        }));

        return {
          userId: user.id,
          username: user.username || `User ${user.id}`,
          totalScore,
          weeklyScores,
          correctPicks,
          totalPicks,
          winPercentage: totalPicks > 0 ? (correctPicks / totalPicks) * 100 : 0
        };
      });

      // Sort by total score (descending), then by win percentage
      leaderboard.sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        return b.winPercentage - a.winPercentage;
      });

      await cacheService.set(cacheKey, leaderboard, 600); // Cache for 10 minutes
      return leaderboard;

    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  /**
   * Calculate weekly scores after games complete
   */
  async calculateWeeklyScores(weekNumber: number): Promise<{ processed: number; updated: number }> {
    try {
      logger.info(`Calculating scores for week ${weekNumber}`);

      // Get all completed games for the week
      const completedGames = await prisma.game.findMany({
        where: {
          week: {
            weekNumber
          },
          status: 'FINAL'
        },
        include: {
          picks: true
        }
      });

      if (completedGames.length === 0) {
        logger.info(`No completed games found for week ${weekNumber}`);
        return { processed: 0, updated: 0 };
      }

      let processed = 0;
      let updated = 0;

      // Calculate scores for each completed game
      for (const game of completedGames) {
        const winningTeamId = this.determineWinningTeam(game);
        
        if (!winningTeamId) {
          logger.warn(`Could not determine winner for game ${game.id}`);
          continue;
        }

        // Update all picks for this game
        for (const pick of game.picks) {
          const isCorrect = pick.selectedTeamId === winningTeamId;
          const points = isCorrect ? 1 : 0;

          if (pick.pointsAwarded !== points) {
            await prisma.pick.update({
              where: { id: pick.id },
              data: { pointsAwarded: points }
            });
            updated++;
          }

          processed++;
        }
      }

      // Clear leaderboard cache
      await cacheService.delPattern('leaderboard_*');
      await cacheService.delPattern('user_picks_*');

      logger.info(`Score calculation complete: ${processed} picks processed, ${updated} updated`);
      
      return { processed, updated };

    } catch (error) {
      logger.error('Error calculating weekly scores:', error);
      throw error;
    }
  }

  /**
   * Determine the winning team for a game
   */
  private determineWinningTeam(game: Game): string | null {
    if (game.status !== 'FINAL') {
      return null;
    }

    const homeScore = game.homeScore || 0;
    const awayScore = game.awayScore || 0;

    if (homeScore > awayScore) {
      return game.homeTeamId;
    } else if (awayScore > homeScore) {
      return game.awayTeamId;
    }

    // Handle ties (rare in NFL)
    return null;
  }
}

// Export singleton instance
export const pickService = new PickService();
