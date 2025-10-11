import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('../../../database', () => ({
  prisma: {
    prediction: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    game: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    league: {
      findUnique: jest.fn(),
    },
    week: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../events/events.service', () => ({
  eventService: {
    appendEvent: jest.fn(),
  },
}));

import { predictionsService } from '../predictions.service';
import { prisma } from '../../../database';
import { eventService } from '../../events/events.service';

describe('Predictions Service - Lock System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Lock Constraint Validation', () => {
    it('should allow locking a game when locks are enabled', async () => {
      const mockGame = {
        id: 'game-1',
        kickoffTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        week: { id: 'week-1' },
      };

      const mockLeague = {
        id: 'league-1',
        enableLocks: true,
        maxMembers: 10,
        members: [{ userId: 'user-1' }],
      };

      (prisma.game.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.league.findUnique as jest.Mock).mockResolvedValue(mockLeague);
      (prisma.prediction.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.prediction.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.prediction.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.prediction.create as jest.Mock).mockResolvedValue({
        id: 'pred-1',
        userId: 'user-1',
        gameId: 'game-1',
        leagueId: 'league-1',
        locked: true,
      });

      const result = await predictionsService.createOrUpdatePrediction({
        userId: 'user-1',
        leagueId: 'league-1',
        gameId: 'game-1',
        predictedHomeScore: 24,
        predictedAwayScore: 20,
        locked: true,
      });

      expect(result.locked).toBe(true);
      expect(eventService.appendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateType: 'prediction',
          eventType: 'PREDICTION_CREATED',
        })
      );
    });

    it('should reject lock when locks are disabled for league', async () => {
      const mockGame = {
        id: 'game-1',
        kickoffTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        week: { id: 'week-1' },
      };

      const mockLeague = {
        id: 'league-1',
        enableLocks: false, // Locks disabled
        members: [{ userId: 'user-1' }],
      };

      (prisma.game.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.league.findUnique as jest.Mock).mockResolvedValue(mockLeague);
      (prisma.prediction.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        predictionsService.createOrUpdatePrediction({
          userId: 'user-1',
          leagueId: 'league-1',
          gameId: 'game-1',
          predictedHomeScore: 24,
          predictedAwayScore: 20,
          locked: true,
        })
      ).rejects.toThrow('Locks are not enabled for this league');
    });

    it('should reject lock when user already has a locked pick this week', async () => {
      const mockGame = {
        id: 'game-2',
        kickoffTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        week: { id: 'week-1' },
      };

      const mockLeague = {
        id: 'league-1',
        enableLocks: true,
        maxMembers: 10,
        members: [{ userId: 'user-1' }],
      };

      const existingLockedPrediction = {
        id: 'pred-1',
        userId: 'user-1',
        gameId: 'game-1', // Different game
        locked: true,
      };

      (prisma.game.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.league.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockLeague)
        .mockResolvedValueOnce({ enableLocks: true, maxMembers: 10 });
      (prisma.prediction.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.prediction.findMany as jest.Mock).mockResolvedValue([existingLockedPrediction]);

      await expect(
        predictionsService.createOrUpdatePrediction({
          userId: 'user-1',
          leagueId: 'league-1',
          gameId: 'game-2',
          predictedHomeScore: 24,
          predictedAwayScore: 20,
          locked: true,
        })
      ).rejects.toThrow('You already have a locked pick this week in this league');
    });

    it('should reject lock when another user has locked this game', async () => {
      const mockGame = {
        id: 'game-1',
        kickoffTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        week: { id: 'week-1' },
      };

      const mockLeague = {
        id: 'league-1',
        enableLocks: true,
        maxMembers: 10,
        members: [{ userId: 'user-1' }],
      };

      const otherUserLock = {
        id: 'pred-other',
        userId: 'user-2',
        gameId: 'game-1',
        locked: true,
      };

      (prisma.game.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.league.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockLeague)
        .mockResolvedValueOnce({ enableLocks: true, maxMembers: 10 });
      (prisma.prediction.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.prediction.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.prediction.findFirst as jest.Mock).mockResolvedValue(otherUserLock);

      await expect(
        predictionsService.createOrUpdatePrediction({
          userId: 'user-1',
          leagueId: 'league-1',
          gameId: 'game-1',
          predictedHomeScore: 24,
          predictedAwayScore: 20,
          locked: true,
        })
      ).rejects.toThrow('This game is already locked by another user in this league');
    });

    it('should allow user to update their own locked pick', async () => {
      const mockGame = {
        id: 'game-1',
        kickoffTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        week: { id: 'week-1' },
      };

      const mockLeague = {
        id: 'league-1',
        enableLocks: true,
        members: [{ userId: 'user-1' }],
      };

      const existingPrediction = {
        id: 'pred-1',
        userId: 'user-1',
        gameId: 'game-1',
        leagueId: 'league-1',
        locked: true,
        predictedHomeScore: 20,
        predictedAwayScore: 17,
      };

      (prisma.game.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.league.findUnique as jest.Mock).mockResolvedValue(mockLeague);
      (prisma.prediction.findUnique as jest.Mock).mockResolvedValue(existingPrediction);
      (prisma.prediction.update as jest.Mock).mockResolvedValue({
        ...existingPrediction,
        predictedHomeScore: 24,
        predictedAwayScore: 20,
      });

      const result = await predictionsService.createOrUpdatePrediction({
        userId: 'user-1',
        leagueId: 'league-1',
        gameId: 'game-1',
        predictedHomeScore: 24,
        predictedAwayScore: 20,
        locked: true,
      });

      expect(result.predictedHomeScore).toBe(24);
      expect(eventService.appendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'PREDICTION_UPDATED',
        })
      );
    });
  });

  describe('Prediction Validation', () => {
    it('should reject negative scores', async () => {
      await expect(
        predictionsService.createOrUpdatePrediction({
          userId: 'user-1',
          leagueId: 'league-1',
          gameId: 'game-1',
          predictedHomeScore: -5,
          predictedAwayScore: 20,
        })
      ).rejects.toThrow('Predicted scores cannot be negative');
    });

    it('should reject non-integer scores', async () => {
      await expect(
        predictionsService.createOrUpdatePrediction({
          userId: 'user-1',
          leagueId: 'league-1',
          gameId: 'game-1',
          predictedHomeScore: 24.5,
          predictedAwayScore: 20,
        })
      ).rejects.toThrow('Predicted scores must be integers');
    });

    it('should reject unrealistic scores', async () => {
      await expect(
        predictionsService.createOrUpdatePrediction({
          userId: 'user-1',
          leagueId: 'league-1',
          gameId: 'game-1',
          predictedHomeScore: 150,
          predictedAwayScore: 20,
        })
      ).rejects.toThrow('Predicted scores seem unrealistic');
    });

    it('should reject predictions after game kickoff', async () => {
      const mockGame = {
        id: 'game-1',
        kickoffTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        week: { id: 'week-1' },
      };

      (prisma.game.findUnique as jest.Mock).mockResolvedValue(mockGame);

      await expect(
        predictionsService.createOrUpdatePrediction({
          userId: 'user-1',
          leagueId: 'league-1',
          gameId: 'game-1',
          predictedHomeScore: 24,
          predictedAwayScore: 20,
        })
      ).rejects.toThrow('Cannot submit prediction after game kickoff');
    });
  });

  describe('Lock Availability', () => {
    it('should return lock availability when locks are enabled', async () => {
      const mockLeague = {
        enableLocks: true,
      };

      const mockLockedPredictions = [
        {
          gameId: 'game-1',
          userId: 'user-1',
          user: { id: 'user-1', username: 'player1' },
        },
        {
          gameId: 'game-2',
          userId: 'user-2',
          user: { id: 'user-2', username: 'player2' },
        },
      ];

      (prisma.league.findUnique as jest.Mock).mockResolvedValue(mockLeague);
      (prisma.prediction.findMany as jest.Mock).mockResolvedValue(mockLockedPredictions);

      const result = await predictionsService.getLockAvailability('league-1', 'week-1');

      expect(result.locksEnabled).toBe(true);
      expect(result.gamesWithLocks).toHaveLength(2);
      expect(result.gamesWithLocks[0]).toEqual({
        gameId: 'game-1',
        userId: 'user-1',
        username: 'player1',
      });
    });

    it('should return empty locks when locks are disabled', async () => {
      const mockLeague = {
        enableLocks: false,
      };

      (prisma.league.findUnique as jest.Mock).mockResolvedValue(mockLeague);

      const result = await predictionsService.getLockAvailability('league-1', 'week-1');

      expect(result.locksEnabled).toBe(false);
      expect(result.gamesWithLocks).toHaveLength(0);
    });
  });

  describe('Event Sourcing', () => {
    it('should append PREDICTION_CREATED event on create', async () => {
      const mockGame = {
        id: 'game-1',
        kickoffTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        week: { id: 'week-1' },
      };

      const mockLeague = {
        id: 'league-1',
        members: [{ userId: 'user-1' }],
      };

      (prisma.game.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.league.findUnique as jest.Mock).mockResolvedValue(mockLeague);
      (prisma.prediction.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.prediction.create as jest.Mock).mockResolvedValue({
        id: 'pred-1',
        userId: 'user-1',
      });

      await predictionsService.createOrUpdatePrediction({
        userId: 'user-1',
        leagueId: 'league-1',
        gameId: 'game-1',
        predictedHomeScore: 24,
        predictedAwayScore: 20,
      });

      expect(eventService.appendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateType: 'prediction',
          eventType: 'PREDICTION_CREATED',
          payload: expect.objectContaining({
            userId: 'user-1',
            predictedHomeScore: 24,
            predictedAwayScore: 20,
          }),
        })
      );
    });

    it('should append PREDICTION_UPDATED event on update', async () => {
      const mockGame = {
        id: 'game-1',
        kickoffTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        week: { id: 'week-1' },
      };

      const mockLeague = {
        id: 'league-1',
        members: [{ userId: 'user-1' }],
      };

      const existingPrediction = {
        id: 'pred-1',
        userId: 'user-1',
        gameId: 'game-1',
      };

      (prisma.game.findUnique as jest.Mock).mockResolvedValue(mockGame);
      (prisma.league.findUnique as jest.Mock).mockResolvedValue(mockLeague);
      (prisma.prediction.findUnique as jest.Mock).mockResolvedValue(existingPrediction);
      (prisma.prediction.update as jest.Mock).mockResolvedValue({
        ...existingPrediction,
        predictedHomeScore: 27,
      });

      await predictionsService.createOrUpdatePrediction({
        userId: 'user-1',
        leagueId: 'league-1',
        gameId: 'game-1',
        predictedHomeScore: 27,
        predictedAwayScore: 20,
      });

      expect(eventService.appendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'PREDICTION_UPDATED',
        })
      );
    });

    it('should append PREDICTION_DELETED event on delete', async () => {
      const existingPrediction = {
        id: 'pred-1',
        userId: 'user-1',
        game: {
          kickoffTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      };

      (prisma.prediction.findUnique as jest.Mock).mockResolvedValue(existingPrediction);
      (prisma.prediction.delete as jest.Mock).mockResolvedValue(existingPrediction);

      await predictionsService.deletePrediction('pred-1', 'user-1');

      expect(eventService.appendEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'PREDICTION_DELETED',
          aggregateId: 'pred-1',
        })
      );
    });
  });
});
