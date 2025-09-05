import { Router } from 'express';
import { rssParserService } from '../services/rss/rss-parser.service';
import { manualRSSSync, getRSSStatus } from '../services/rss/cron';
import { MockNFLService } from '../services/rss/mock-nfl.service';
import { logger } from '../utils/logger';

const router = Router();

// Helper function to validate week number
const validateWeek = (week: string) => {
  const weekNumber = parseInt(week);
  return !isNaN(weekNumber) && weekNumber >= 1 && weekNumber <= 18 ? weekNumber : null;
};

router.get('/rss/schedule/:week', async (req, res) => {
  try {
    const weekNumber = validateWeek(req.params.week);
    if (!weekNumber) {
      res.status(400).json({
        success: false,
        error: 'Invalid week number. Must be between 1 and 18.'
      });
      return;
    }

    logger.info(`Admin request: Fetching schedule for week ${weekNumber}`);
    const schedule = await rssParserService.fetchScheduleForWeek(weekNumber);
    
    res.json({
      success: true,
      data: { week: weekNumber, games: schedule, count: schedule.length }
    });
  } catch (error) {
    logger.error('Error fetching schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch schedule',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/rss/scores/:week', async (req, res) => {
  try {
    const weekNumber = validateWeek(req.params.week);
    if (!weekNumber) {
      res.status(400).json({
        success: false,
        error: 'Invalid week number. Must be between 1 and 18.'
      });
      return;
    }

    logger.info(`Admin request: Fetching scores for week ${weekNumber}`);
    const scores = await rssParserService.fetchLiveScores(weekNumber);
    
    res.json({
      success: true,
      data: { week: weekNumber, games: scores, count: scores.length }
    });
  } catch (error) {
    logger.error('Error fetching scores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scores',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/rss/sync/:week', async (req, res) => {
  try {
    const weekNumber = validateWeek(req.params.week);
    if (!weekNumber) {
      res.status(400).json({
        success: false,
        error: 'Invalid week number. Must be between 1 and 18.'
      });
      return;
    }

    logger.info(`Admin request: Syncing games for week ${weekNumber} to database`);
    const result = await rssParserService.syncGamesToDatabase(weekNumber);
    
    res.json({
      success: true,
      data: {
        week: weekNumber,
        synced: result.synced,
        errors: result.errors,
        details: result.details
      }
    });
  } catch (error) {
    logger.error('Error syncing games:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync games',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/rss/update-scores/:week', async (req, res) => {
  try {
    const weekNumber = validateWeek(req.params.week);
    if (!weekNumber) {
      res.status(400).json({
        success: false,
        error: 'Invalid week number. Must be between 1 and 18.'
      });
      return;
    }

    logger.info(`Admin request: Updating scores for week ${weekNumber}`);
    const result = await rssParserService.updateGameScores(weekNumber);
    
    res.json({
      success: true,
      data: {
        week: weekNumber,
        updated: result.updated || 0,
        errors: result.errors,
        details: result.details
      }
    });
  } catch (error) {
    logger.error('Error updating scores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update scores',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/rss/manual-sync/:week', async (req, res) => {
  try {
    const weekNumber = validateWeek(req.params.week);
    if (!weekNumber) {
      res.status(400).json({
        success: false,
        error: 'Invalid week number. Must be between 1 and 18.'
      });
      return;
    }

    logger.info(`Admin request: Manual complete sync for week ${weekNumber}`);
    const results = await manualRSSSync(weekNumber);
    
    res.json({
      success: true,
      data: {
        week: weekNumber,
        schedule: results.scheduleResult,
        scores: results.scoresResult
      }
    });
  } catch (error) {
    logger.error('Error in manual sync:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform manual sync',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/rss/status', async (_req, res) => {
  try {
    logger.info('Admin request: RSS status check');
    const status = await getRSSStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    logger.error('Error getting RSS status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get RSS status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/cache/flush', async (_req, res) => {
  try {
    logger.info('Admin request: Cache flush');
    const { cacheService } = await import('../services/cache/cache.service');
    await cacheService.flush();
    res.json({ success: true, data: { message: 'Cache flushed successfully' } });
  } catch (error) {
    logger.error('Error flushing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to flush cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/cache/stats', async (_req, res) => {
  try {
    logger.info('Admin request: Cache stats');
    const { cacheService } = await import('../services/cache/cache.service');
    const stats = await cacheService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create mock NFL Week 1 games for demo
router.post('/nfl/create-week1', async (_req, res) => {
  try {
    logger.info('Admin request: Creating Week 1 NFL games');
    await MockNFLService.createWeek1Games();
    res.json({ 
      success: true, 
      message: 'Week 1 NFL games created successfully' 
    });
  } catch (error) {
    logger.error('Error creating Week 1 games:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create Week 1 games',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
