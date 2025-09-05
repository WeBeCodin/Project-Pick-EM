import cron from 'node-cron';
import { rssParserService } from './rss-parser.service';
import { logger } from '../../utils/logger';
import { prisma } from '../../database';

/**
 * Start RSS cron jobs for automatic data updates
 * Schedules periodic fetching of NFL schedules and scores
 */
export function startRSSCronJobs(): void {
  logger.info('Starting RSS cron jobs...');

  // Update schedules every day at 6 AM
  cron.schedule('0 6 * * *', async () => {
    logger.info('Running scheduled RSS schedule sync...');
    try {
      const currentWeek = await getCurrentNFLWeek();
      if (currentWeek) {
        const result = await rssParserService.syncGamesToDatabase(currentWeek);
        logger.info(`Schedule sync completed: ${result.synced} synced, ${result.errors} errors`);
      }
    } catch (error) {
      logger.error('Error in scheduled RSS schedule sync:', error);
    }
  });

  // Update scores every 15 minutes during game days (Sundays, Mondays, Thursdays)
  cron.schedule('*/15 * * * 0,1,4', async () => {
    logger.info('Running scheduled RSS score update...');
    try {
      const currentWeek = await getCurrentNFLWeek();
      if (currentWeek) {
        const result = await rssParserService.updateGameScores(currentWeek);
        logger.info(`Score update completed: ${result.updated} updated, ${result.errors} errors`);
      }
    } catch (error) {
      logger.error('Error in scheduled RSS score update:', error);
    }
  });

  // Update scores every 2 minutes during peak game time (1 PM to 11 PM ET on game days)
  cron.schedule('*/2 13-23 * * 0,1,4', async () => {
    logger.info('Running frequent RSS score update...');
    try {
      const currentWeek = await getCurrentNFLWeek();
      if (currentWeek) {
        const result = await rssParserService.updateGameScores(currentWeek);
        logger.info(`Frequent score update completed: ${result.updated} updated, ${result.errors} errors`);
      }
    } catch (error) {
      logger.error('Error in frequent RSS score update:', error);
    }
  });

  // Weekly cleanup of old cache entries (Wednesdays at 3 AM)
  cron.schedule('0 3 * * 3', async () => {
    logger.info('Running weekly cache cleanup...');
    try {
      // Clean up old cached data
      const { cacheService } = await import('../cache/cache.service');
      await cacheService.delPattern('schedule:week:*');
      await cacheService.delPattern('scores:week:*');
      logger.info('Weekly cache cleanup completed');
    } catch (error) {
      logger.error('Error in weekly cache cleanup:', error);
    }
  });

  logger.info('RSS cron jobs started successfully');
}

/**
 * Stop all RSS cron jobs
 */
export function stopRSSCronJobs(): void {
  logger.info('Stopping RSS cron jobs...');
  cron.getTasks().forEach((task, name) => {
    if (name.includes('rss') || name.includes('schedule') || name.includes('score')) {
      task.stop();
      logger.info(`Stopped cron job: ${name}`);
    }
  });
  logger.info('RSS cron jobs stopped');
}

/**
 * Get the current NFL week number based on the current date
 * @returns Promise<number | null> - Current NFL week or null if off-season
 */
async function getCurrentNFLWeek(): Promise<number | null> {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Find the current season
    const season = await prisma.season.findFirst({
      where: {
        year: currentYear,
        startDate: { lte: currentDate },
        endDate: { gte: currentDate }
      },
      include: {
        weeks: {
          where: {
            startDate: { lte: currentDate },
            endDate: { gte: currentDate }
          },
          orderBy: {
            weekNumber: 'asc'
          },
          take: 1
        }
      }
    });

    if (season && season.weeks.length > 0) {
      const currentWeek = season.weeks[0].weekNumber;
      logger.debug(`Current NFL week: ${currentWeek}`);
      return currentWeek;
    }

    // Fallback: try to determine week based on date logic
    const september1 = new Date(currentYear, 8, 1); // September 1st
    const daysSinceSeptember1 = Math.floor((currentDate.getTime() - september1.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceSeptember1 >= 0 && daysSinceSeptember1 < 126) { // ~18 weeks
      const estimatedWeek = Math.floor(daysSinceSeptember1 / 7) + 1;
      if (estimatedWeek <= 18) {
        logger.debug(`Estimated NFL week: ${estimatedWeek}`);
        return estimatedWeek;
      }
    }

    logger.debug('Not currently in NFL season');
    return null;
    
  } catch (error) {
    logger.error('Error determining current NFL week:', error);
    return null;
  }
}

/**
 * Manually trigger RSS data sync for a specific week
 * @param weekNumber - NFL week number to sync
 * @returns Promise with sync results
 */
export async function manualRSSSync(weekNumber: number): Promise<{
  scheduleResult: any;
  scoresResult: any;
}> {
  logger.info(`Manual RSS sync triggered for week ${weekNumber}`);
  
  try {
    const scheduleResult = await rssParserService.syncGamesToDatabase(weekNumber);
    const scoresResult = await rssParserService.updateGameScores(weekNumber);
    
    logger.info(`Manual sync completed for week ${weekNumber}`);
    return { scheduleResult, scoresResult };
    
  } catch (error) {
    logger.error(`Error in manual RSS sync for week ${weekNumber}:`, error);
    throw error;
  }
}

/**
 * Get RSS sync status and statistics
 * @returns Promise with RSS status information
 */
export async function getRSSStatus(): Promise<{
  cronJobs: any[];
  currentWeek: number | null;
  cacheStats: any;
}> {
  try {
    const currentWeek = await getCurrentNFLWeek();
    const { cacheService } = await import('../cache/cache.service');
    const cacheStats = await cacheService.getStats();
    
    const cronJobs = Array.from(cron.getTasks().entries()).map(([name]) => ({
      name,
      status: 'scheduled'
    }));

    return {
      cronJobs,
      currentWeek,
      cacheStats
    };
    
  } catch (error) {
    logger.error('Error getting RSS status:', error);
    throw error;
  }
}
