import cron from 'node-cron';
import { spreadFetcherService } from './spread-fetcher.service';
import { logger } from '../../utils/logger';

let spreadFetchTask: cron.ScheduledTask | null = null;

/**
 * Start spread fetcher cron job
 * Runs hourly to update game spreads
 */
export function startSpreadFetcherJob(): void {
  if (spreadFetchTask) {
    logger.warn('Spread fetcher job already running');
    return;
  }

  // Run every hour
  spreadFetchTask = cron.schedule('0 * * * *', async () => {
    logger.info('Starting scheduled spread fetch');
    try {
      const result = await spreadFetcherService.fetchAndPersistSpreads();
      logger.info('Scheduled spread fetch complete', result);
    } catch (error) {
      logger.error('Scheduled spread fetch failed', error);
    }
  });

  logger.info('Spread fetcher cron job started (hourly)');
}

/**
 * Stop spread fetcher cron job
 */
export function stopSpreadFetcherJob(): void {
  if (spreadFetchTask) {
    spreadFetchTask.stop();
    spreadFetchTask = null;
    logger.info('Spread fetcher cron job stopped');
  }
}

/**
 * Run spread fetch immediately (for manual triggers)
 */
export async function runSpreadFetchNow(): Promise<any> {
  logger.info('Running manual spread fetch');
  try {
    const result = await spreadFetcherService.fetchAndPersistSpreads();
    logger.info('Manual spread fetch complete', result);
    return result;
  } catch (error) {
    logger.error('Manual spread fetch failed', error);
    throw error;
  }
}
