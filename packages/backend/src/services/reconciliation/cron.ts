import cron from 'node-cron';
import { reconciliationService } from './reconciliation.service';
import { logger } from '../../utils/logger';

let reconciliationTask: cron.ScheduledTask | null = null;

/**
 * Start reconciliation cron job
 * Runs every 5 minutes to ensure data consistency
 */
export function startReconciliationJob(): void {
  if (reconciliationTask) {
    logger.warn('Reconciliation job already running');
    return;
  }

  // Run every 5 minutes
  reconciliationTask = cron.schedule('*/5 * * * *', async () => {
    logger.info('Starting scheduled reconciliation');
    try {
      const result = await reconciliationService.reconcileAll();
      logger.info('Scheduled reconciliation complete', result);
    } catch (error) {
      logger.error('Scheduled reconciliation failed', error);
    }
  });

  logger.info('Reconciliation cron job started (every 5 minutes)');
}

/**
 * Stop reconciliation cron job
 */
export function stopReconciliationJob(): void {
  if (reconciliationTask) {
    reconciliationTask.stop();
    reconciliationTask = null;
    logger.info('Reconciliation cron job stopped');
  }
}

/**
 * Run reconciliation immediately (for manual triggers)
 */
export async function runReconciliationNow(): Promise<any> {
  logger.info('Running manual reconciliation');
  try {
    const result = await reconciliationService.reconcileAll();
    logger.info('Manual reconciliation complete', result);
    return result;
  } catch (error) {
    logger.error('Manual reconciliation failed', error);
    throw error;
  }
}
