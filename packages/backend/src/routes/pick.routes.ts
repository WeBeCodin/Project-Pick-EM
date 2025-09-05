import { Router, Response } from 'express';
import { pickService } from '../services/pick/pick.service';
import { AuthenticatedRequest, authenticateToken } from '../middleware/auth';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

const router = Router();

// Apply authentication to all pick routes
router.use(authenticateToken);

/**
 * @route POST /api/v1/picks
 * @desc Submit a single pick for a game
 * @access Private
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { gameId, selectedTeamId, tiebreakerScore } = req.body;
    const userId = req.user!.id;

    if (!gameId || !selectedTeamId) {
      throw new ValidationError('gameId and selectedTeamId are required');
    }

    const pick = await pickService.submitPick(
      userId,
      gameId,
      selectedTeamId,
      tiebreakerScore
    );

    logger.info('Pick submitted via API', {
      userId,
      gameId,
      selectedTeamId,
      pickId: pick.id
    });

    res.status(201).json({
      success: true,
      data: {
        pick: {
          id: pick.id,
          gameId: pick.gameId,
          selectedTeamId: pick.selectedTeamId,
          tiebreakerScore: pick.tiebreakerScore,
          submittedAt: pick.submittedAt
        }
      },
      message: 'Pick submitted successfully'
    });
  } catch (error) {
    logger.error('Error submitting pick via API', { 
      error: error instanceof Error ? error.message : error,
      userId: req.user?.id,
      body: req.body
    });
    throw error;
  }
});

/**
 * @route POST /api/v1/picks/bulk
 * @desc Submit multiple picks at once
 * @access Private
 */
router.post('/bulk', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { picks } = req.body;
    const userId = req.user!.id;

    if (!Array.isArray(picks) || picks.length === 0) {
      throw new ValidationError('picks array is required and cannot be empty');
    }

    // Validate each pick has required fields
    for (const pick of picks) {
      if (!pick.gameId || !pick.selectedTeamId) {
        throw new ValidationError('Each pick must have gameId and selectedTeamId');
      }
    }

    const submittedPicks = await pickService.submitBulkPicks(userId, picks);

    logger.info('Bulk picks submitted via API', {
      userId,
      picksCount: submittedPicks.length,
      gameIds: picks.map(p => p.gameId)
    });

    res.status(201).json({
      success: true,
      data: {
        picks: submittedPicks.map(pick => ({
          id: pick.id,
          gameId: pick.gameId,
          selectedTeamId: pick.selectedTeamId,
          tiebreakerScore: pick.tiebreakerScore,
          submittedAt: pick.submittedAt
        })),
        count: submittedPicks.length
      },
      message: `${submittedPicks.length} picks submitted successfully`
    });
  } catch (error) {
    logger.error('Error submitting bulk picks via API', { 
      error: error instanceof Error ? error.message : error,
      userId: req.user?.id,
      body: req.body
    });
    throw error;
  }
});

/**
 * @route GET /api/v1/picks/week/:weekNumber
 * @desc Get user's picks for a specific week
 * @access Private
 */
router.get('/week/:weekNumber', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { weekNumber } = req.params;
    const userId = req.user!.id;

    if (!weekNumber) {
      throw new ValidationError('weekNumber is required');
    }

    const userPicks = await pickService.getUserPicks(userId, parseInt(weekNumber));

    res.json({
      success: true,
      data: {
        picks: userPicks.map(pick => ({
          id: pick.id,
          gameId: pick.gameId,
          selectedTeamId: pick.selectedTeamId,
          tiebreakerScore: pick.tiebreakerScore,
          pointsAwarded: pick.pointsAwarded,
          isCorrect: pick.isCorrect,
          submittedAt: pick.submittedAt
        })),
        weekNumber: parseInt(weekNumber),
        userId,
        summary: {
          totalPicks: userPicks.length,
          correctPicks: userPicks.filter(p => p.isCorrect === true).length,
          totalPoints: userPicks.reduce((sum, p) => sum + p.pointsAwarded, 0)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching user picks via API', { 
      error: error instanceof Error ? error.message : error,
      userId: req.user?.id,
      weekNumber: req.params.weekNumber
    });
    throw error;
  }
});

/**
 * @route GET /api/v1/picks/games/week/:weekNumber
 * @desc Get weekly games with user's pick status
 * @access Private
 */
router.get('/games/week/:weekNumber', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { weekNumber } = req.params;
    const userId = req.user!.id;

    if (!weekNumber) {
      throw new ValidationError('weekNumber is required');
    }

    const gamesWithPicks = await pickService.getWeeklyGames(parseInt(weekNumber), userId);

    res.json({
      success: true,
      data: {
        games: gamesWithPicks.map(game => ({
          id: game.id,
          weekId: game.weekId,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          kickoffTime: game.kickoffTime,
          homeScore: game.homeScore,
          awayScore: game.awayScore,
          userPick: game.userPick ? {
            id: game.userPick.id,
            selectedTeamId: game.userPick.selectedTeamId,
            tiebreakerScore: game.userPick.tiebreakerScore,
            pointsAwarded: game.userPick.pointsAwarded,
            isCorrect: game.userPick.isCorrect,
            submittedAt: game.userPick.submittedAt
          } : null,
          canSubmitPick: game.isPickable
        })),
        weekNumber: parseInt(weekNumber),
        userId,
        summary: {
          totalGames: gamesWithPicks.length,
          picksSubmitted: gamesWithPicks.filter(g => g.userPick).length
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching weekly games via API', { 
      error: error instanceof Error ? error.message : error,
      userId: req.user?.id,
      weekNumber: req.params.weekNumber
    });
    throw error;
  }
});

/**
 * @route GET /api/v1/picks/leaderboard/week/:weekNumber
 * @desc Get leaderboard for a specific week
 * @access Private
 */
router.get('/leaderboard/week/:weekNumber', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { weekNumber } = req.params;

    if (!weekNumber) {
      throw new ValidationError('weekNumber is required');
    }

    const leaderboard = await pickService.getLeaderboard(parseInt(weekNumber));

    res.json({
      success: true,
      data: {
        leaderboard: leaderboard.map((entry, index) => ({
          rank: index + 1,
          userId: entry.userId,
          username: entry.username,
          totalScore: entry.totalScore,
          weeklyScores: entry.weeklyScores
        })),
        weekNumber: parseInt(weekNumber),
        totalEntries: leaderboard.length,
        requestedBy: req.user!.id
      }
    });
  } catch (error) {
    logger.error('Error fetching leaderboard via API', { 
      error: error instanceof Error ? error.message : error,
      weekNumber: req.params.weekNumber,
      userId: req.user?.id
    });
    throw error;
  }
});

/**
 * @route POST /api/v1/picks/scores/week/:weekNumber
 * @desc Calculate scores for a specific week (admin only)
 * @access Private (Admin)
 */
router.post('/scores/week/:weekNumber', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { weekNumber } = req.params;

    if (!weekNumber) {
      throw new ValidationError('weekNumber is required');
    }

    // Note: In production, this should have admin authorization
    // For now, any authenticated user can trigger scoring
    await pickService.calculateWeeklyScores(parseInt(weekNumber));

    logger.info('Weekly scores calculated via API', {
      weekNumber: parseInt(weekNumber),
      triggeredBy: req.user!.id
    });

    res.json({
      success: true,
      message: `Scores calculated for week ${weekNumber}`,
      weekNumber: parseInt(weekNumber)
    });
  } catch (error) {
    logger.error('Error calculating weekly scores via API', { 
      error: error instanceof Error ? error.message : error,
      weekNumber: req.params.weekNumber,
      userId: req.user?.id
    });
    throw error;
  }
});

export { router as pickRoutes };
