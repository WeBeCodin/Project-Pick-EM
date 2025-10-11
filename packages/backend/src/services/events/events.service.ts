import { prisma } from '../../database';
import { logger } from '../../utils/logger';

/**
 * Event structure for event sourcing
 */
export interface EventData {
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: Record<string, any>;
}

/**
 * Event Sourcing Service
 * Provides append-only event log for data protection and audit trail
 */
export class EventService {
  /**
   * Append a new event to the event log
   * Events are immutable and provide a complete audit trail
   */
  async appendEvent(event: EventData): Promise<void> {
    try {
      await prisma.event.create({
        data: {
          aggregateType: event.aggregateType,
          aggregateId: event.aggregateId,
          eventType: event.eventType,
          payload: event.payload as any,
        },
      });

      logger.info('Event appended', {
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
      });
    } catch (error) {
      logger.error('Failed to append event', { event, error });
      throw error;
    }
  }

  /**
   * Read all events for a specific aggregate
   * Used for rebuilding state during reconciliation
   */
  async readEvents(aggregateType: string, aggregateId: string): Promise<any[]> {
    try {
      const events = await prisma.event.findMany({
        where: {
          aggregateType,
          aggregateId,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return events;
    } catch (error) {
      logger.error('Failed to read events', { aggregateType, aggregateId, error });
      throw error;
    }
  }

  /**
   * Read events after a specific event ID (for incremental processing)
   */
  async readEventsAfter(
    aggregateType: string,
    aggregateId: string,
    afterEventId: string
  ): Promise<any[]> {
    try {
      const afterEvent = await prisma.event.findUnique({
        where: { id: afterEventId },
      });

      if (!afterEvent) {
        throw new Error(`Event not found: ${afterEventId}`);
      }

      const events = await prisma.event.findMany({
        where: {
          aggregateType,
          aggregateId,
          createdAt: {
            gt: afterEvent.createdAt,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return events;
    } catch (error) {
      logger.error('Failed to read events after', { aggregateType, aggregateId, afterEventId, error });
      throw error;
    }
  }

  /**
   * Get all events of a specific type (for system-wide processing)
   */
  async getEventsByType(eventType: string, limit: number = 100): Promise<any[]> {
    try {
      const events = await prisma.event.findMany({
        where: { eventType },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });

      return events;
    } catch (error) {
      logger.error('Failed to get events by type', { eventType, error });
      throw error;
    }
  }

  /**
   * Count events for monitoring
   */
  async getEventCount(aggregateType?: string): Promise<number> {
    try {
      const count = await prisma.event.count({
        where: aggregateType ? { aggregateType } : undefined,
      });

      return count;
    } catch (error) {
      logger.error('Failed to get event count', { aggregateType, error });
      throw error;
    }
  }
}

// Export singleton instance
export const eventService = new EventService();
