/**
 * Jest Setup File
 * Configuration and global setup for all tests
 */

import 'reflect-metadata';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global test timeout
jest.setTimeout(30000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test setup
beforeAll(async () => {
  // Setup test database connection
  // This will be implemented when we create the database service
});

// Global test teardown
afterAll(async () => {
  // Close database connections
  // Clean up resources
});

// Reset all mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Export test utilities
export const createMockUser = () => ({
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  role: 'USER',
  status: 'ACTIVE',
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createMockGame = () => ({
  id: 'test-game-id',
  externalId: 'nfl-game-123',
  scheduledAt: new Date(),
  status: 'SCHEDULED',
  homeTeamId: 'home-team-id',
  awayTeamId: 'away-team-id',
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createMockLeague = () => ({
  id: 'test-league-id',
  name: 'Test League',
  ownerId: 'test-owner-id',
  seasonId: 'test-season-id',
  type: 'PUBLIC',
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
});
