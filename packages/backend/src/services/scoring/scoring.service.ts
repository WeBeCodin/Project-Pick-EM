import { prisma } from '../../database';
import { logger } from '../../utils/logger';

/**
 * Scoring configuration (can be overridden by environment variables)
 */
export const SCORING_CONFIG = {
  WINNER_POINTS: parseInt(process.env.WINNER_POINTS || '10', 10),
  MAX_ACCURACY_POINTS: parseInt(process.env.MAX_ACCURACY_POINTS || '20', 10),
  MARGIN_NORMALIZATION: parseInt(process.env.MARGIN_NORMALIZATION || '20', 10),
};

/**
 * Prediction with scores
 */
export interface PredictionScore {
  predictionId: string;
  winnerPoints: number;
  accuracyScore: number;
  lockBonus: number;
  totalScore: number;
  isCorrect: boolean;
}

/**
 * Game result for scoring
 */
export interface GameResult {
  homeScore: number;
  awayScore: number;
  spread?: number; // Optional spread value
}

/**
 * Prediction data for scoring
 */
export interface PredictionData {
  id: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  useSpread: boolean;
  locked: boolean;
  league: {
    lockBonus: number;
    lockPenalty: number;
  };
}

/**
 * Scoring Service
 * Implements accuracy-weighted scoring algorithm with spread support
 */
export class ScoringService {
  /**
   * Compute score for a single prediction
   * 
   * Algorithm:
   * 1. Winner points: 10 points for correct winner
   * 2. Accuracy bonus: Based on margin difference (max 20 points)
   *    Formula: max(0, round(20 * max(0, 1 - |predicted_margin - actual_margin| / 20)))
   * 3. Spread-aware: If useSpread, apply spread to actual margin before scoring
   * 4. Lock bonus/penalty: If locked, add bonus for correct or subtract penalty for incorrect
   */
  computeScore(
    prediction: PredictionData,
    actualResult: GameResult
  ): PredictionScore {
    const { predictedHomeScore, predictedAwayScore, useSpread, locked, league } = prediction;
    const { homeScore, awayScore, spread } = actualResult;

    // Calculate predicted margin (positive = home team favored)
    const predictedMargin = predictedHomeScore - predictedAwayScore;

    // Calculate actual margin
    let actualMargin = homeScore - awayScore;

    // Apply spread if requested
    if (useSpread && spread !== undefined) {
      actualMargin = actualMargin - spread;
    }

    // Determine predicted and actual winners
    const predictedWinner = predictedMargin > 0 ? 'home' : predictedMargin < 0 ? 'away' : 'tie';
    const actualWinner = actualMargin > 0 ? 'home' : actualMargin < 0 ? 'away' : 'tie';

    // Winner points (10 for correct winner)
    const isCorrect = predictedWinner === actualWinner;
    const winnerPoints = isCorrect ? SCORING_CONFIG.WINNER_POINTS : 0;

    // Accuracy bonus (margin-based)
    const marginDifference = Math.abs(predictedMargin - actualMargin);
    const accuracyScore = Math.max(
      0,
      Math.round(
        SCORING_CONFIG.MAX_ACCURACY_POINTS *
          Math.max(0, 1 - marginDifference / SCORING_CONFIG.MARGIN_NORMALIZATION)
      )
    );

    // Lock bonus/penalty
    let lockBonus = 0;
    if (locked) {
      if (isCorrect) {
        lockBonus = league.lockBonus;
      } else {
        lockBonus = -league.lockPenalty;
      }
    }

    // Total score
    const totalScore = winnerPoints + accuracyScore + lockBonus;

    return {
      predictionId: prediction.id,
      winnerPoints,
      accuracyScore,
      lockBonus,
      totalScore,
      isCorrect,
    };
  }

  /**
   * Compute scores for all predictions for a completed game
   */
  async computeScoresForGame(gameId: string): Promise<PredictionScore[]> {
    try {
      // Get game result
      const game = await prisma.game.findUnique({
        where: { id: gameId },
        select: {
          homeScore: true,
          awayScore: true,
          status: true,
          predictions: {
            include: {
              league: {
                select: {
                  lockBonus: true,
                  lockPenalty: true,
                },
              },
            },
          },
          spreads: {
            orderBy: {
              fetchedAt: 'desc',
            },
            take: 1,
          },
        },
      });

      if (!game) {
        throw new Error(`Game not found: ${gameId}`);
      }

      if (game.status !== 'FINAL' && game.status !== 'FINAL_OT') {
        throw new Error(`Game not completed: ${gameId}`);
      }

      if (game.homeScore === null || game.awayScore === null) {
        throw new Error(`Game scores not available: ${gameId}`);
      }

      const actualResult: GameResult = {
        homeScore: game.homeScore,
        awayScore: game.awayScore,
        spread: game.spreads[0]?.spread,
      };

      // Compute scores for all predictions
      const scores: PredictionScore[] = [];

      for (const prediction of game.predictions) {
        const score = this.computeScore(prediction, actualResult);
        scores.push(score);

        // Update prediction with computed scores
        await prisma.prediction.update({
          where: { id: prediction.id },
          data: {
            winnerPoints: score.winnerPoints,
            accuracyScore: score.accuracyScore,
            lockBonus: score.lockBonus,
            totalScore: score.totalScore,
            scoredAt: new Date(),
          },
        });
      }

      logger.info('Scores computed for game', { gameId, predictionCount: scores.length });

      return scores;
    } catch (error) {
      logger.error('Failed to compute scores for game', { gameId, error });
      throw error;
    }
  }

  /**
   * Compute scores for all completed games in a week
   */
  async computeScoresForWeek(weekId: string): Promise<{
    gamesScored: number;
    predictionsScored: number;
  }> {
    try {
      const week = await prisma.week.findUnique({
        where: { id: weekId },
        include: {
          games: {
            where: {
              status: {
                in: ['FINAL', 'FINAL_OT'],
              },
            },
          },
        },
      });

      if (!week) {
        throw new Error(`Week not found: ${weekId}`);
      }

      let predictionsScored = 0;

      for (const game of week.games) {
        const scores = await this.computeScoresForGame(game.id);
        predictionsScored += scores.length;
      }

      logger.info('Scores computed for week', {
        weekId,
        gamesScored: week.games.length,
        predictionsScored,
      });

      return {
        gamesScored: week.games.length,
        predictionsScored,
      };
    } catch (error) {
      logger.error('Failed to compute scores for week', { weekId, error });
      throw error;
    }
  }

  /**
   * Get scoring preview for a prediction (what would the score be if game ended now)
   */
  getScorePreview(
    prediction: PredictionData,
    currentResult: GameResult
  ): PredictionScore {
    return this.computeScore(prediction, currentResult);
  }
}

// Export singleton instance
export const scoringService = new ScoringService();
