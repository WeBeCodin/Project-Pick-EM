import axios from 'axios';
import { prisma } from '../../database';
import { logger } from '../../utils/logger';

/**
 * Spread data from RSS feed
 */
interface SpreadData {
  gameId: string;
  spread: number;
  source: string;
}

/**
 * RSS Spread Fetcher Service
 * Fetches point spreads from RSS feeds and persists them
 */
export class SpreadFetcherService {
  private readonly feedUrl: string;
  private readonly enabled: boolean;

  constructor() {
    this.feedUrl = process.env.RSS_SPREAD_FEED_URL || '';
    this.enabled = process.env.ENABLE_SPREAD_FETCHING === 'true' && this.feedUrl.length > 0;

    if (!this.enabled) {
      logger.info('Spread fetching disabled (set ENABLE_SPREAD_FETCHING=true and RSS_SPREAD_FEED_URL)');
    }
  }

  /**
   * Fetch spreads from RSS feed and persist to database
   */
  async fetchAndPersistSpreads(): Promise<{
    success: boolean;
    spreadsUpdated: number;
    error?: string;
  }> {
    if (!this.enabled) {
      return {
        success: false,
        spreadsUpdated: 0,
        error: 'Spread fetching is disabled',
      };
    }

    const startTime = Date.now();
    logger.info('Starting spread fetch', { feedUrl: this.feedUrl });

    try {
      // Fetch RSS feed
      const response = await axios.get(this.feedUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'NFL-PickEm-Challenge/1.0',
        },
      });

      // Parse spreads from feed (this is a stub - actual parsing depends on feed format)
      const spreads = await this.parseSpreadsFeed(response.data);

      // Persist spreads to database
      let spreadsUpdated = 0;
      for (const spread of spreads) {
        try {
          await this.persistSpread(spread);
          spreadsUpdated++;
        } catch (error) {
          logger.error('Failed to persist spread', { spread, error });
        }
      }

      const duration = Date.now() - startTime;
      logger.info('Spread fetch complete', {
        spreadsUpdated,
        duration,
      });

      return {
        success: true,
        spreadsUpdated,
      };
    } catch (error: any) {
      logger.error('Failed to fetch spreads', error);
      return {
        success: false,
        spreadsUpdated: 0,
        error: error.message,
      };
    }
  }

  /**
   * Parse spreads from RSS feed
   * This is a stub implementation - actual parsing depends on feed format
   */
  private async parseSpreadsFeed(_feedData: string): Promise<SpreadData[]> {
    // TODO: Implement actual RSS parsing based on feed format
    // This is a placeholder that returns an empty array
    // Real implementation would use xml2js or similar to parse XML/RSS

    logger.warn('parseSpreadsFeed is a stub - implement based on actual RSS feed format');

    // Example structure (to be replaced with actual parsing):
    // const parser = new XMLParser();
    // const parsed = parser.parse(feedData);
    // return parsed.rss.channel.item.map(item => ({
    //   gameId: mapExternalIdToGameId(item.gameId),
    //   spread: parseFloat(item.spread),
    //   source: 'ESPN'
    // }));

    return [];
  }

  /**
   * Persist a spread to the database
   */
  private async persistSpread(spread: SpreadData): Promise<void> {
    try {
      // Verify game exists
      const game = await prisma.game.findUnique({
        where: { id: spread.gameId },
      });

      if (!game) {
        logger.warn('Game not found for spread', { gameId: spread.gameId });
        return;
      }

      // Upsert spread (update if exists, create if doesn't)
      await prisma.gameSpread.upsert({
        where: {
          gameId_source: {
            gameId: spread.gameId,
            source: spread.source,
          },
        },
        update: {
          spread: spread.spread,
          fetchedAt: new Date(),
        },
        create: {
          gameId: spread.gameId,
          spread: spread.spread,
          source: spread.source,
        },
      });

      logger.debug('Spread persisted', spread);
    } catch (error) {
      logger.error('Failed to persist spread', { spread, error });
      throw error;
    }
  }

  /**
   * Get latest spread for a game
   */
  async getLatestSpread(gameId: string): Promise<number | null> {
    try {
      const spread = await prisma.gameSpread.findFirst({
        where: { gameId },
        orderBy: {
          fetchedAt: 'desc',
        },
      });

      return spread?.spread ?? null;
    } catch (error) {
      logger.error('Failed to get latest spread', { gameId, error });
      return null;
    }
  }

  /**
   * Get spreads for all games in a week
   */
  async getSpreadsForWeek(weekId: string): Promise<Map<string, number>> {
    try {
      const games = await prisma.game.findMany({
        where: { weekId },
        select: { id: true },
      });

      const gameIds = games.map((g) => g.id);

      const spreads = await prisma.gameSpread.findMany({
        where: {
          gameId: {
            in: gameIds,
          },
        },
        orderBy: {
          fetchedAt: 'desc',
        },
        distinct: ['gameId'],
      });

      const spreadMap = new Map<string, number>();
      for (const spread of spreads) {
        spreadMap.set(spread.gameId, spread.spread);
      }

      return spreadMap;
    } catch (error) {
      logger.error('Failed to get spreads for week', { weekId, error });
      return new Map();
    }
  }
}

// Export singleton instance
export const spreadFetcherService = new SpreadFetcherService();
