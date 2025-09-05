import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock dependencies
jest.mock('../../../database', () => ({
  prisma: {
    pick: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn()
    },
    game: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn()
    },
    team: {
      findUnique: jest.fn()
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn()
    },
    week: {
      findFirst: jest.fn()
    },
    $transaction: jest.fn()
  }
}));

jest.mock('../../cache/cache.service', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    delPattern: jest.fn()
  }
}));

describe('Pick Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be able to import the service', () => {
    expect(() => {
      const { pickService } = require('../pick.service');
      expect(pickService).toBeDefined();
    }).not.toThrow();
  });

  it('should have all required methods', () => {
    const { pickService } = require('../pick.service');
    
    expect(typeof pickService.submitPick).toBe('function');
    expect(typeof pickService.submitBulkPicks).toBe('function');
    expect(typeof pickService.getUserPicks).toBe('function');
    expect(typeof pickService.getWeeklyGames).toBe('function');
    expect(typeof pickService.getLeaderboard).toBe('function');
    expect(typeof pickService.calculateWeeklyScores).toBe('function');
  });

  it('should handle pick submission validation', async () => {
    const { pickService } = require('../pick.service');
    
    // Test should validate game exists and teams match
    const mockGame = { 
      id: 'game1', 
      weekId: 'week1',
      kickoffTime: new Date(Date.now() + 3600000), // 1 hour from now
      homeTeamId: 'team1',
      awayTeamId: 'team2'
    };
    require('../../../database').prisma.game.findUnique.mockResolvedValue(mockGame);
    require('../../../database').prisma.user.findUnique.mockResolvedValue({ id: 'user1' });
    require('../../../database').prisma.pick.upsert.mockResolvedValue({ 
      id: 'pick1', 
      userId: 'user1', 
      gameId: 'game1',
      selectedTeamId: 'team1'
    });
    
    const result = await pickService.submitPick('user1', 'game1', 'team1');
    expect(typeof result).toBe('object');
  });

  it('should prevent picks after game start', async () => {
    const { pickService } = require('../pick.service');
    
    // Test with game that already started
    const pastGame = { 
      id: 'game1', 
      weekId: 'week1',
      kickoffTime: new Date(Date.now() - 3600000), // 1 hour ago
      homeTeamId: 'team1',
      awayTeamId: 'team2'
    };
    require('../../../database').prisma.game.findUnique.mockResolvedValue(pastGame);
    
    await expect(pickService.submitPick('user1', 'game1', 'team1'))
      .rejects.toThrow('Cannot submit pick after game has started');
  });

  it('should handle bulk pick submissions', async () => {
    const { pickService } = require('../pick.service');
    
    const picks = [
      { gameId: 'game1', selectedTeamId: 'team1' },
      { gameId: 'game2', selectedTeamId: 'team2' }
    ];
    
    // Mock games for bulk submission
    const mockGames = [
      { 
        id: 'game1', 
        weekId: 'week1',
        kickoffTime: new Date(Date.now() + 3600000),
        homeTeamId: 'team1',
        awayTeamId: 'team3'
      },
      { 
        id: 'game2', 
        weekId: 'week1',
        kickoffTime: new Date(Date.now() + 3600000),
        homeTeamId: 'team2',
        awayTeamId: 'team4'
      }
    ];
    
    require('../../../database').prisma.game.findMany.mockResolvedValue(mockGames);
    require('../../../database').prisma.user.findUnique.mockResolvedValue({ id: 'user1' });
    require('../../../database').prisma.$transaction.mockResolvedValue([]);
    
    const result = await pickService.submitBulkPicks('user1', picks);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should get user picks for a week', async () => {
    const { pickService } = require('../pick.service');
    
    require('../../../database').prisma.pick.findMany.mockResolvedValue([]);
    
    const result = await pickService.getUserPicks('user1', 1);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should get weekly games with pick status', async () => {
    const { pickService } = require('../pick.service');
    
    require('../../../database').prisma.game.findMany.mockResolvedValue([]);
    
    const result = await pickService.getWeeklyGames(1, 'user1');
    expect(Array.isArray(result)).toBe(true);
  });

  it('should generate leaderboard', async () => {
    const { pickService } = require('../pick.service');
    
    require('../../../database').prisma.user.findMany.mockResolvedValue([]);
    
    const result = await pickService.getLeaderboard();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should calculate weekly scores', async () => {
    const { pickService } = require('../pick.service');
    
    require('../../../database').prisma.pick.findMany.mockResolvedValue([]);
    require('../../../database').prisma.$transaction.mockResolvedValue([]);
    
    const result = await pickService.calculateWeeklyScores(1);
    expect(typeof result).toBe('object');
    expect(typeof result.processed).toBe('number');
    expect(typeof result.updated).toBe('number');
  });
});
