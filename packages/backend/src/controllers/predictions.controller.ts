import { Request, Response, NextFunction } from 'express';
import { predictionsService } from '../services/predictions/predictions.service';
import { logger } from '../utils/logger';

/**
 * Predictions Controller
 * Handles HTTP requests for prediction operations
 */
export class PredictionsController {
  /**
   * POST /api/v1/predictions
   * Create or update a prediction
   */
  async createOrUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, leagueId, gameId, predictedHomeScore, predictedAwayScore, useSpread, locked } =
        req.body;

      // Validate required fields
      if (!userId || !leagueId || !gameId) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, leagueId, gameId',
        });
        return;
      }

      if (
        predictedHomeScore === undefined ||
        predictedHomeScore === null ||
        predictedAwayScore === undefined ||
        predictedAwayScore === null
      ) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: predictedHomeScore, predictedAwayScore',
        });
        return;
      }

      const prediction = await predictionsService.createOrUpdatePrediction({
        userId,
        leagueId,
        gameId,
        predictedHomeScore,
        predictedAwayScore,
        useSpread,
        locked,
      });

      res.status(200).json({
        success: true,
        data: prediction,
      });
    } catch (error: any) {
      logger.error('Failed to create/update prediction', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/predictions
   * Get predictions for a user (optionally filtered by league and week)
   */
  async getUserPredictions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, leagueId, weekId } = req.query;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'Missing required query parameter: userId',
        });
        return;
      }

      const predictions = await predictionsService.getUserPredictions(
        userId as string,
        leagueId as string | undefined,
        weekId as string | undefined
      );

      res.status(200).json({
        success: true,
        data: predictions,
      });
    } catch (error: any) {
      logger.error('Failed to get user predictions', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/predictions/:id
   * Get a single prediction by ID
   */
  async getPrediction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const prediction = await predictionsService.getPrediction(id);

      res.status(200).json({
        success: true,
        data: prediction,
      });
    } catch (error: any) {
      logger.error('Failed to get prediction', error);
      next(error);
    }
  }

  /**
   * DELETE /api/v1/predictions/:id
   * Delete a prediction (before game starts)
   */
  async deletePrediction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'Missing required field: userId',
        });
        return;
      }

      await predictionsService.deletePrediction(id, userId);

      res.status(200).json({
        success: true,
        message: 'Prediction deleted successfully',
      });
    } catch (error: any) {
      logger.error('Failed to delete prediction', error);
      next(error);
    }
  }

  /**
   * GET /api/v1/predictions/locks/availability
   * Get lock availability for a league/week
   */
  async getLockAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { leagueId, weekId } = req.query;

      if (!leagueId || !weekId) {
        res.status(400).json({
          success: false,
          error: 'Missing required query parameters: leagueId, weekId',
        });
        return;
      }

      const availability = await predictionsService.getLockAvailability(
        leagueId as string,
        weekId as string
      );

      res.status(200).json({
        success: true,
        data: availability,
      });
    } catch (error: any) {
      logger.error('Failed to get lock availability', error);
      next(error);
    }
  }
}

// Export singleton instance
export const predictionsController = new PredictionsController();
