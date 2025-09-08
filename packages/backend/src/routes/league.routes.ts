import { Router } from 'express';
import { leagueService } from '../services/league/league.service';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/v1/leagues
 * @desc    Create a new league
 * @access  Private
 */
router.post('/', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'] || 'demo-user';
    const league = await leagueService.createLeague(userId, req.body);

    res.status(201).json({
      success: true,
      data: league,
      message: 'League created successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/leagues/join
 * @desc    Join a league by code
 * @access  Private
 */
router.post('/join', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'] || 'demo-user';
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'League code is required'
      });
    }

    const league = await leagueService.joinLeague({
      code: code.toUpperCase(),
      userId
    });

    res.json({
      success: true,
      data: league,
      message: 'Successfully joined league'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/leagues/my-leagues
 * @desc    Get user's leagues
 * @access  Private
 */
router.get('/my-leagues', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'] || 'demo-user';
    const leagues = await leagueService.getUserLeagues(userId);

    res.json({
      success: true,
      data: leagues,
      count: leagues.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/leagues/public
 * @desc    Get public leagues
 * @access  Public
 */
router.get('/public', async (req: any, res: any, next: any) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const leagues = await leagueService.getPublicLeagues(Math.min(limit, 50));

    res.json({
      success: true,
      data: leagues,
      count: leagues.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/leagues/:id
 * @desc    Get league by ID
 * @access  Public/Private based on league privacy
 */
router.get('/:id', async (req: any, res: any, next: any) => {
  try {
    const { id } = req.params;
    const league = await leagueService.getLeagueById(id);

    // If league is private, check if user is a member
    if (league.isPrivate) {
      const userId = req.user?.id || req.headers['x-user-id'];
      if (!userId) {
        return res.status(403).json({
          success: false,
          error: 'This is a private league'
        });
      }

      const isMember = await leagueService.isUserMember(userId, id);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to private league'
        });
      }
    }

    res.json({
      success: true,
      data: league
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/leagues/:id/leave
 * @desc    Leave a league
 * @access  Private
 */
router.delete('/:id/leave', authenticateToken, async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'] || 'demo-user';
    const { id } = req.params;
    
    await leagueService.leaveLeague(userId, id);

    res.json({
      success: true,
      message: 'Successfully left the league'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
