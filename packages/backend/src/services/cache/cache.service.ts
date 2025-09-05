import Redis from 'ioredis';
import { logger } from '../../utils/logger';

/**
 * Production-ready Redis cache service
 * Provides caching functionality with error handling and fallback
 */
class CacheService {
  private redis: Redis | null = null;
  private fallbackCache: Map<string, { value: any; expires: number }> = new Map();
  private isConnected = false;

  constructor() {
    this.connect();
  }

  /**
   * Connect to Redis
   * @private
   */
  private async connect(): Promise<void> {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        enableReadyCheck: true,
        lazyConnect: true,
        maxRetriesPerRequest: 3,
        reconnectOnError: (err) => {
          logger.warn('Redis reconnecting on error:', err.message);
          return err.message.includes('READONLY');
        }
      });

      this.redis.on('connect', () => {
        logger.info('Redis connection established');
        this.isConnected = true;
      });

      this.redis.on('error', (error) => {
        logger.error('Redis connection error:', error);
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        logger.warn('Redis connection closed');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });

      await this.redis.connect();
      
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      this.isConnected = false;
    }
  }

  /**
   * Set a value in cache with TTL
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlSeconds - Time to live in seconds
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      
      if (this.redis && this.isConnected) {
        await this.redis.setex(key, ttlSeconds, serialized);
        logger.debug(`Cached key: ${key} (TTL: ${ttlSeconds}s)`);
      } else {
        // Fallback to in-memory cache
        this.fallbackCache.set(key, {
          value: serialized,
          expires: Date.now() + (ttlSeconds * 1000)
        });
        logger.debug(`Cached key in fallback: ${key} (TTL: ${ttlSeconds}s)`);
      }
    } catch (error) {
      logger.error(`Error setting cache key ${key}:`, error);
      // Fallback to in-memory cache
      try {
        const serialized = JSON.stringify(value);
        this.fallbackCache.set(key, {
          value: serialized,
          expires: Date.now() + (ttlSeconds * 1000)
        });
      } catch (fallbackError) {
        logger.error(`Error setting fallback cache key ${key}:`, fallbackError);
      }
    }
  }

  /**
   * Get a value from cache
   * @param key - Cache key
   * @returns Cached value or null if not found/expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      let serialized: string | null = null;

      if (this.redis && this.isConnected) {
        serialized = await this.redis.get(key);
        if (serialized) {
          logger.debug(`Cache hit (Redis): ${key}`);
          return JSON.parse(serialized);
        }
      }

      // Try fallback cache
      const fallbackEntry = this.fallbackCache.get(key);
      if (fallbackEntry) {
        if (Date.now() < fallbackEntry.expires) {
          logger.debug(`Cache hit (fallback): ${key}`);
          return JSON.parse(fallbackEntry.value);
        } else {
          // Expired, remove it
          this.fallbackCache.delete(key);
        }
      }

      logger.debug(`Cache miss: ${key}`);
      return null;
      
    } catch (error) {
      logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a key from cache
   * @param key - Cache key to delete
   */
  async del(key: string): Promise<void> {
    try {
      if (this.redis && this.isConnected) {
        await this.redis.del(key);
      }
      this.fallbackCache.delete(key);
      logger.debug(`Deleted cache key: ${key}`);
    } catch (error) {
      logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  /**
   * Delete all keys matching a pattern
   * @param pattern - Pattern to match keys (e.g., "user:*")
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      if (this.redis && this.isConnected) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          logger.debug(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
        }
      }

      // Handle fallback cache
      const keysToDelete: string[] = [];
      for (const key of this.fallbackCache.keys()) {
        if (this.matchesPattern(key, pattern)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.fallbackCache.delete(key));
      
    } catch (error) {
      logger.error(`Error deleting cache pattern ${pattern}:`, error);
    }
  }

  /**
   * Check if cache is available
   * @returns True if Redis is connected or fallback cache is available
   */
  isAvailable(): boolean {
    return this.isConnected || true; // Fallback cache is always available
  }

  /**
   * Get cache statistics
   * @returns Cache statistics object
   */
  async getStats(): Promise<{
    redisConnected: boolean;
    fallbackSize: number;
    redisInfo?: string;
  }> {
    const stats = {
      redisConnected: this.isConnected,
      fallbackSize: this.fallbackCache.size
    };

    try {
      if (this.redis && this.isConnected) {
        const info = await this.redis.info('memory');
        return { ...stats, redisInfo: info };
      }
    } catch (error) {
      logger.error('Error getting Redis stats:', error);
    }

    return stats;
  }

  /**
   * Flush all cache data
   */
  async flush(): Promise<void> {
    try {
      if (this.redis && this.isConnected) {
        await this.redis.flushdb();
      }
      this.fallbackCache.clear();
      logger.info('Cache flushed');
    } catch (error) {
      logger.error('Error flushing cache:', error);
    }
  }

  /**
   * Gracefully disconnect from Redis
   */
  async disconnect(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.quit();
        logger.info('Redis connection closed');
      }
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
  }

  /**
   * Check if a key matches a pattern (simple glob matching)
   * @private
   */
  private matchesPattern(key: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(key);
  }

  /**
   * Clean up expired entries from fallback cache
   * Called periodically by the interval timer
   */
  public cleanupFallbackCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.fallbackCache.entries()) {
      if (now >= entry.expires) {
        this.fallbackCache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Clean up fallback cache every 5 minutes
setInterval(() => {
  cacheService.cleanupFallbackCache();
}, 5 * 60 * 1000);
