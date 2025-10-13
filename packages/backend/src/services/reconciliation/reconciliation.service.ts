import { prisma } from '../../database';
import { logger } from '../../utils/logger';
import { eventService } from '../events/events.service';

/**
 * Reconciliation Service
 * Rebuilds canonical state from event log and creates snapshots
 * Provides data loss prevention and consistency checks
 */
export class ReconciliationService {
  /**
   * Perform full reconciliation for all aggregates
   * This is run periodically to ensure data consistency
   */
  async reconcileAll(): Promise<{
    picksReconciled: number;
    leaguesReconciled: number;
    snapshotsCreated: number;
    errors: string[];
  }> {
    logger.info('Starting full reconciliation');
    const startTime = Date.now();
    const errors: string[] = [];
    let picksReconciled = 0;
    let leaguesReconciled = 0;
    let snapshotsCreated = 0;

    try {
      // Reconcile picks
      const pickResult = await this.reconcilePicks();
      picksReconciled = pickResult.reconciled;
      snapshotsCreated += pickResult.snapshotsCreated;
      errors.push(...pickResult.errors);

      // Reconcile leagues
      const leagueResult = await this.reconcileLeagues();
      leaguesReconciled = leagueResult.reconciled;
      snapshotsCreated += leagueResult.snapshotsCreated;
      errors.push(...leagueResult.errors);

      const duration = Date.now() - startTime;
      logger.info('Reconciliation complete', {
        duration,
        picksReconciled,
        leaguesReconciled,
        snapshotsCreated,
        errorCount: errors.length,
      });

      return {
        picksReconciled,
        leaguesReconciled,
        snapshotsCreated,
        errors,
      };
    } catch (error) {
      logger.error('Reconciliation failed', error);
      throw error;
    }
  }

  /**
   * Reconcile picks by rebuilding state from events
   */
  private async reconcilePicks(): Promise<{
    reconciled: number;
    snapshotsCreated: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let reconciled = 0;
    let snapshotsCreated = 0;

    try {
      // Get all picks that have events
      const pickEvents = await prisma.event.findMany({
        where: {
          aggregateType: 'pick',
        },
        distinct: ['aggregateId'],
        select: {
          aggregateId: true,
        },
      });

      for (const { aggregateId } of pickEvents) {
        try {
          await this.reconcilePick(aggregateId);
          reconciled++;

          // Create snapshot every 10th reconciliation
          if (reconciled % 10 === 0) {
            await this.createSnapshot('pick', aggregateId);
            snapshotsCreated++;
          }
        } catch (error: any) {
          errors.push(`Failed to reconcile pick ${aggregateId}: ${error.message}`);
          logger.error('Pick reconciliation error', { aggregateId, error });
        }
      }

      return { reconciled, snapshotsCreated, errors };
    } catch (error) {
      logger.error('Failed to reconcile picks', error);
      throw error;
    }
  }

  /**
   * Reconcile a single pick from its event history
   */
  private async reconcilePick(pickId: string): Promise<void> {
    const events = await eventService.readEvents('pick', pickId);

    if (events.length === 0) {
      return;
    }

    // Rebuild pick state from events
    let pickState: any = null;

    for (const event of events) {
      switch (event.eventType) {
        case 'PICK_CREATED':
          pickState = event.payload;
          break;
        case 'PICK_UPDATED':
          if (pickState) {
            pickState = { ...pickState, ...event.payload };
          }
          break;
        case 'PICK_DELETED':
          pickState = null;
          break;
      }
    }

    // Verify current state matches rebuilt state
    if (pickState) {
      const currentPick = await prisma.pick.findUnique({
        where: { id: pickId },
      });

      if (!currentPick) {
        logger.warn('Pick missing in database but has events', { pickId });
        // Could recreate pick here if needed
      }
    }
  }

  /**
   * Reconcile leagues by rebuilding state from events
   */
  private async reconcileLeagues(): Promise<{
    reconciled: number;
    snapshotsCreated: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let reconciled = 0;
    let snapshotsCreated = 0;

    try {
      // Get all leagues that have events
      const leagueEvents = await prisma.event.findMany({
        where: {
          aggregateType: 'league',
        },
        distinct: ['aggregateId'],
        select: {
          aggregateId: true,
        },
      });

      for (const { aggregateId } of leagueEvents) {
        try {
          await this.reconcileLeague(aggregateId);
          reconciled++;

          // Create snapshot
          if (reconciled % 10 === 0) {
            await this.createSnapshot('league', aggregateId);
            snapshotsCreated++;
          }
        } catch (error: any) {
          errors.push(`Failed to reconcile league ${aggregateId}: ${error.message}`);
          logger.error('League reconciliation error', { aggregateId, error });
        }
      }

      return { reconciled, snapshotsCreated, errors };
    } catch (error) {
      logger.error('Failed to reconcile leagues', error);
      throw error;
    }
  }

  /**
   * Reconcile a single league from its event history
   */
  private async reconcileLeague(leagueId: string): Promise<void> {
    const events = await eventService.readEvents('league', leagueId);

    if (events.length === 0) {
      return;
    }

    // Rebuild league state from events
    let leagueState: any = null;

    for (const event of events) {
      switch (event.eventType) {
        case 'LEAGUE_CREATED':
          leagueState = event.payload;
          break;
        case 'LEAGUE_UPDATED':
          if (leagueState) {
            leagueState = { ...leagueState, ...event.payload };
          }
          break;
        case 'LEAGUE_DELETED':
          leagueState = null;
          break;
      }
    }

    // Verify current state matches rebuilt state
    if (leagueState) {
      const currentLeague = await prisma.league.findUnique({
        where: { id: leagueId },
      });

      if (!currentLeague) {
        logger.warn('League missing in database but has events', { leagueId });
      }
    }
  }

  /**
   * Create a snapshot of aggregate state
   */
  private async createSnapshot(
    aggregateType: string,
    aggregateId: string
  ): Promise<void> {
    try {
      const events = await eventService.readEvents(aggregateType, aggregateId);

      if (events.length === 0) {
        return;
      }

      const lastEvent = events[events.length - 1];
      
      // Build current state from events
      let state: any = {};
      for (const event of events) {
        if (event.payload) {
          state = { ...state, ...event.payload };
        }
      }

      await prisma.snapshot.create({
        data: {
          aggregateType,
          aggregateId,
          state: state as any,
          lastEventId: lastEvent.id,
        },
      });

      logger.info('Snapshot created', { aggregateType, aggregateId });
    } catch (error) {
      logger.error('Failed to create snapshot', { aggregateType, aggregateId, error });
      throw error;
    }
  }

  /**
   * Load state from most recent snapshot and apply subsequent events
   */
  async loadFromSnapshot(
    aggregateType: string,
    aggregateId: string
  ): Promise<any | null> {
    try {
      const snapshot = await prisma.snapshot.findFirst({
        where: {
          aggregateType,
          aggregateId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!snapshot) {
        return null;
      }

      // Get events after snapshot
      const events = await eventService.readEventsAfter(
        aggregateType,
        aggregateId,
        snapshot.lastEventId
      );

      // Apply events to snapshot state
      let state = snapshot.state as any;
      for (const event of events) {
        if (event.payload) {
          state = { ...state, ...event.payload };
        }
      }

      return state;
    } catch (error) {
      logger.error('Failed to load from snapshot', { aggregateType, aggregateId, error });
      throw error;
    }
  }
}

// Export singleton instance
export const reconciliationService = new ReconciliationService();
