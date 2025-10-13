import { prisma } from '../../database';
import { logger } from '../../utils/logger';
import { eventService } from '../events/events.service';
import { ValidationError, NotFoundError } from '../../utils/errors';

/**
 * Prediction submission data
 */
export interface PredictionSubmission {
  userId: string;
  leagueId: string;
  gameId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  useSpread?: boolean;
  locked?: boolean;
}

/**
 * Predictions Service
 * Handles prediction CRUD operations with event sourcing
 */
export class PredictionsService {
  /**
   * Create or update a prediction
   */
  async createOrUpdatePrediction(data: PredictionSubmission): Promise<any> {
    try {
      // Validate inputs
      this.validatePredictionData(data);

      // Check if game exists and hasn't started
      const game = await prisma.game.findUnique({
        where: { id: data.gameId },
        include: {
          week: true,
        },
      });

      if (!game) {
        throw new NotFoundError(`Game not found: ${data.gameId}`);
      }

      // Check if game has already started (past kickoff)
      if (new Date() > game.kickoffTime) {
        throw new ValidationError('Cannot submit prediction after game kickoff');
      }

      // Check if league exists and user is a member
      const league = await prisma.league.findUnique({
        where: { id: data.leagueId },
        include: {
          members: {
            where: {
              userId: data.userId,
            },
          },
        },
      });

      if (!league) {
        throw new NotFoundError(`League not found: ${data.leagueId}`);
      }

      if (league.members.length === 0) {
        throw new ValidationError('User is not a member of this league');
      }

      // Check lock constraints if prediction is locked
      if (data.locked) {
        await this.validateLockConstraints(data.userId, data.leagueId, data.gameId, game.week.id);
      }

      // Check for existing prediction
      const existingPrediction = await prisma.prediction.findUnique({
        where: {
          userId_gameId_leagueId: {
            userId: data.userId,
            gameId: data.gameId,
            leagueId: data.leagueId,
          },
        },
      });

      let prediction;
      if (existingPrediction) {
        // Update existing prediction
        prediction = await prisma.prediction.update({
          where: { id: existingPrediction.id },
          data: {
            predictedHomeScore: data.predictedHomeScore,
            predictedAwayScore: data.predictedAwayScore,
            useSpread: data.useSpread ?? false,
            locked: data.locked ?? false,
          },
        });

        // Append update event
        await eventService.appendEvent({
          aggregateType: 'prediction',
          aggregateId: prediction.id,
          eventType: 'PREDICTION_UPDATED',
          payload: {
            userId: data.userId,
            leagueId: data.leagueId,
            gameId: data.gameId,
            predictedHomeScore: data.predictedHomeScore,
            predictedAwayScore: data.predictedAwayScore,
            useSpread: data.useSpread,
            locked: data.locked,
            updatedAt: new Date().toISOString(),
          },
        });
      } else {
        // Create new prediction
        prediction = await prisma.prediction.create({
          data: {
            userId: data.userId,
            leagueId: data.leagueId,
            gameId: data.gameId,
            predictedHomeScore: data.predictedHomeScore,
            predictedAwayScore: data.predictedAwayScore,
            useSpread: data.useSpread ?? false,
            locked: data.locked ?? false,
          },
        });

        // Append creation event
        await eventService.appendEvent({
          aggregateType: 'prediction',
          aggregateId: prediction.id,
          eventType: 'PREDICTION_CREATED',
          payload: {
            userId: data.userId,
            leagueId: data.leagueId,
            gameId: data.gameId,
            predictedHomeScore: data.predictedHomeScore,
            predictedAwayScore: data.predictedAwayScore,
            useSpread: data.useSpread,
            locked: data.locked,
            createdAt: new Date().toISOString(),
          },
        });
      }

      logger.info('Prediction saved', { predictionId: prediction.id, userId: data.userId });

      return prediction;
    } catch (error) {
      logger.error('Failed to save prediction', { data, error });
      throw error;
    }
  }

  /**
   * Get predictions for a user in a league
   */
  async getUserPredictions(
    userId: string,
    leagueId?: string,
    weekId?: string
  ): Promise<any[]> {
    try {
      const where: any = { userId };

      if (leagueId) {
        where.leagueId = leagueId;
      }

      if (weekId) {
        where.game = {
          weekId,
        };
      }

      const predictions = await prisma.prediction.findMany({
        where,
        include: {
          game: {
            include: {
              homeTeam: true,
              awayTeam: true,
              week: true,
            },
          },
          league: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return predictions;
    } catch (error) {
      logger.error('Failed to get user predictions', { userId, leagueId, weekId, error });
      throw error;
    }
  }

  /**
   * Get a single prediction
   */
  async getPrediction(predictionId: string): Promise<any> {
    try {
      const prediction = await prisma.prediction.findUnique({
        where: { id: predictionId },
        include: {
          game: {
            include: {
              homeTeam: true,
              awayTeam: true,
              week: true,
            },
          },
          league: true,
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      });

      if (!prediction) {
        throw new NotFoundError(`Prediction not found: ${predictionId}`);
      }

      return prediction;
    } catch (error) {
      logger.error('Failed to get prediction', { predictionId, error });
      throw error;
    }
  }

  /**
   * Delete a prediction (before game starts)
   */
  async deletePrediction(predictionId: string, userId: string): Promise<void> {
    try {
      const prediction = await prisma.prediction.findUnique({
        where: { id: predictionId },
        include: {
          game: true,
        },
      });

      if (!prediction) {
        throw new NotFoundError(`Prediction not found: ${predictionId}`);
      }

      if (prediction.userId !== userId) {
        throw new ValidationError('Cannot delete another user\'s prediction');
      }

      if (new Date() > prediction.game.kickoffTime) {
        throw new ValidationError('Cannot delete prediction after game kickoff');
      }

      await prisma.prediction.delete({
        where: { id: predictionId },
      });

      // Append deletion event
      await eventService.appendEvent({
        aggregateType: 'prediction',
        aggregateId: predictionId,
        eventType: 'PREDICTION_DELETED',
        payload: {
          userId,
          deletedAt: new Date().toISOString(),
        },
      });

      logger.info('Prediction deleted', { predictionId, userId });
    } catch (error) {
      logger.error('Failed to delete prediction', { predictionId, userId, error });
      throw error;
    }
  }

  /**
   * Validate prediction data
   */
  private validatePredictionData(data: PredictionSubmission): void {
    if (data.predictedHomeScore < 0 || data.predictedAwayScore < 0) {
      throw new ValidationError('Predicted scores cannot be negative');
    }

    if (!Number.isInteger(data.predictedHomeScore) || !Number.isInteger(data.predictedAwayScore)) {
      throw new ValidationError('Predicted scores must be integers');
    }

    if (data.predictedHomeScore > 100 || data.predictedAwayScore > 100) {
      throw new ValidationError('Predicted scores seem unrealistic (max 100)');
    }
  }

  /**
   * Validate lock constraints
   * - Only one lock per user per week per league
   * - Locks enabled for league
   * - No other user has locked this game in this league this week
   */
  private async validateLockConstraints(
    userId: string,
    leagueId: string,
    gameId: string,
    weekId: string
  ): Promise<void> {
    // Check if league has locks enabled
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      select: {
        enableLocks: true,
        maxMembers: true,
      },
    });

    if (!league?.enableLocks) {
      throw new ValidationError('Locks are not enabled for this league');
    }

    // Check if user already has a lock this week in this league
    const userLockedPredictions = await prisma.prediction.findMany({
      where: {
        userId,
        leagueId,
        locked: true,
        game: {
          weekId,
        },
        gameId: {
          not: gameId, // Exclude current game (allow updating lock to same game)
        },
      },
    });

    if (userLockedPredictions.length > 0) {
      throw new ValidationError('You already have a locked pick this week in this league');
    }

    // Check if another user has locked this game in this league this week
    const gameLockedByOthers = await prisma.prediction.findFirst({
      where: {
        gameId,
        leagueId,
        locked: true,
        userId: {
          not: userId,
        },
      },
    });

    if (gameLockedByOthers) {
      throw new ValidationError('This game is already locked by another user in this league');
    }
  }

  /**
   * Get lock availability for a week
   */
  async getLockAvailability(
    leagueId: string,
    weekId: string
  ): Promise<{
    locksEnabled: boolean;
    gamesWithLocks: { gameId: string; userId: string; username: string }[];
  }> {
    try {
      const league = await prisma.league.findUnique({
        where: { id: leagueId },
        select: {
          enableLocks: true,
        },
      });

      if (!league?.enableLocks) {
        return {
          locksEnabled: false,
          gamesWithLocks: [],
        };
      }

      const lockedPredictions = await prisma.prediction.findMany({
        where: {
          leagueId,
          locked: true,
          game: {
            weekId,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      return {
        locksEnabled: true,
        gamesWithLocks: lockedPredictions.map((p) => ({
          gameId: p.gameId,
          userId: p.userId,
          username: p.user.username,
        })),
      };
    } catch (error) {
      logger.error('Failed to get lock availability', { leagueId, weekId, error });
      throw error;
    }
  }
}

// Export singleton instance
export const predictionsService = new PredictionsService();
