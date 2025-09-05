import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Global Prisma client instance
 * Provides database connectivity throughout the application
 */
const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Set up Prisma logging
prisma.$on('warn', (e) => {
  logger.warn('Prisma warning:', e);
});

prisma.$on('info', (e) => {
  logger.info('Prisma info:', e);
});

prisma.$on('error', (e) => {
  logger.error('Prisma error:', e);
});

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Gracefully disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
}

export { prisma };
