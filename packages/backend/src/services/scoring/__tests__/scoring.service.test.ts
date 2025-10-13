import { describe, it, expect } from '@jest/globals';
import { scoringService, SCORING_CONFIG } from '../scoring.service';

describe('Scoring Service', () => {
  const mockLeague = {
    lockBonus: 20,
    lockPenalty: 15,
  };

  describe('computeScore - Basic Winner Detection', () => {
    it('should award winner points for correct pick', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 24,
        predictedAwayScore: 20,
        useSpread: false,
        locked: false,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 27,
        awayScore: 17,
      };

      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.isCorrect).toBe(true);
      expect(score.winnerPoints).toBe(SCORING_CONFIG.WINNER_POINTS);
      expect(score.totalScore).toBeGreaterThan(0);
    });

    it('should not award winner points for incorrect pick', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 24,
        predictedAwayScore: 20,
        useSpread: false,
        locked: false,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 17,
        awayScore: 27,
      };

      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.isCorrect).toBe(false);
      expect(score.winnerPoints).toBe(0);
    });

    it('should handle tie scenarios', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 20,
        predictedAwayScore: 20,
        useSpread: false,
        locked: false,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 24,
        awayScore: 24,
      };

      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.isCorrect).toBe(true);
      expect(score.winnerPoints).toBe(SCORING_CONFIG.WINNER_POINTS);
    });
  });

  describe('computeScore - Accuracy Bonus', () => {
    it('should award maximum accuracy points for perfect margin match', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 27,
        predictedAwayScore: 24,
        useSpread: false,
        locked: false,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 27,
        awayScore: 24,
      };

      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.accuracyScore).toBe(SCORING_CONFIG.MAX_ACCURACY_POINTS);
      expect(score.totalScore).toBe(
        SCORING_CONFIG.WINNER_POINTS + SCORING_CONFIG.MAX_ACCURACY_POINTS
      );
    });

    it('should award partial accuracy points for close margin', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 24,
        predictedAwayScore: 20, // Margin: +4
        useSpread: false,
        locked: false,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 27,
        awayScore: 20, // Margin: +7 (difference of 3)
      };

      const score = scoringService.computeScore(prediction, actualResult);

      // With difference of 3 and normalization of 20:
      // accuracyScore = max(0, round(20 * max(0, 1 - 3/20)))
      // = max(0, round(20 * 0.85))
      // = 17
      expect(score.accuracyScore).toBe(17);
      expect(score.isCorrect).toBe(true);
    });

    it('should award zero accuracy points for large margin error', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 30,
        predictedAwayScore: 10, // Margin: +20
        useSpread: false,
        locked: false,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 24,
        awayScore: 24, // Margin: 0 (difference of 20)
      };

      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.accuracyScore).toBe(0);
      expect(score.isCorrect).toBe(false);
    });

    it('should handle negative margins correctly', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 17,
        predictedAwayScore: 24, // Margin: -7
        useSpread: false,
        locked: false,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 20,
        awayScore: 27, // Margin: -7 (perfect match)
      };

      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.isCorrect).toBe(true);
      expect(score.accuracyScore).toBe(SCORING_CONFIG.MAX_ACCURACY_POINTS);
    });
  });

  describe('computeScore - Spread Aware Scoring', () => {
    it('should apply spread to actual margin when useSpread is true', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 24,
        predictedAwayScore: 27, // Predicting away team wins by 3
        useSpread: true,
        locked: false,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 27,
        awayScore: 24, // Home team wins by 3
        spread: 7, // Home team favored by 7
      };

      // With spread: actual margin = 3 - 7 = -4
      // Predicted margin = -3
      // Difference = |-3 - (-4)| = 1
      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.isCorrect).toBe(true); // Both predict away team covers
      expect(score.accuracyScore).toBeGreaterThan(15); // Close margin
    });

    it('should not apply spread when useSpread is false', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 27,
        predictedAwayScore: 24,
        useSpread: false,
        locked: false,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 27,
        awayScore: 24,
        spread: 10, // Spread should be ignored
      };

      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.isCorrect).toBe(true);
      expect(score.accuracyScore).toBe(SCORING_CONFIG.MAX_ACCURACY_POINTS);
    });

    it('should handle spread changing winner prediction', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 20,
        predictedAwayScore: 24, // Predicting away by 4
        useSpread: true,
        locked: false,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 27,
        awayScore: 24, // Home wins by 3
        spread: 7, // Home favored by 7, so with spread: 3 - 7 = -4 (away covers)
      };

      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.isCorrect).toBe(true); // Both predict away covers
    });
  });

  describe('computeScore - Lock Bonus and Penalty', () => {
    it('should award lock bonus for correct locked pick', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 27,
        predictedAwayScore: 24,
        useSpread: false,
        locked: true,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 30,
        awayScore: 20,
      };

      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.isCorrect).toBe(true);
      expect(score.lockBonus).toBe(mockLeague.lockBonus);
      expect(score.totalScore).toBe(
        score.winnerPoints + score.accuracyScore + mockLeague.lockBonus
      );
    });

    it('should apply lock penalty for incorrect locked pick', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 27,
        predictedAwayScore: 24,
        useSpread: false,
        locked: true,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 20,
        awayScore: 30,
      };

      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.isCorrect).toBe(false);
      expect(score.lockBonus).toBe(-mockLeague.lockPenalty);
      expect(score.totalScore).toBe(score.accuracyScore - mockLeague.lockPenalty);
    });

    it('should not apply lock bonus/penalty for unlocked picks', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 27,
        predictedAwayScore: 24,
        useSpread: false,
        locked: false,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 30,
        awayScore: 20,
      };

      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.lockBonus).toBe(0);
    });
  });

  describe('computeScore - Complex Scenarios', () => {
    it('should handle perfect prediction with lock bonus', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 27,
        predictedAwayScore: 24,
        useSpread: false,
        locked: true,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 27,
        awayScore: 24,
      };

      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.isCorrect).toBe(true);
      expect(score.winnerPoints).toBe(SCORING_CONFIG.WINNER_POINTS);
      expect(score.accuracyScore).toBe(SCORING_CONFIG.MAX_ACCURACY_POINTS);
      expect(score.lockBonus).toBe(mockLeague.lockBonus);
      expect(score.totalScore).toBe(
        SCORING_CONFIG.WINNER_POINTS + SCORING_CONFIG.MAX_ACCURACY_POINTS + mockLeague.lockBonus
      );
    });

    it('should handle worst case scenario - incorrect lock with large margin error', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 35,
        predictedAwayScore: 10, // Predicting blowout
        useSpread: false,
        locked: true,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 10,
        awayScore: 35, // Complete opposite result
      };

      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.isCorrect).toBe(false);
      expect(score.winnerPoints).toBe(0);
      expect(score.accuracyScore).toBe(0); // Margin error > 20
      expect(score.lockBonus).toBe(-mockLeague.lockPenalty);
      expect(score.totalScore).toBe(-mockLeague.lockPenalty);
    });

    it('should handle spread-adjusted lock bonus', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 20,
        predictedAwayScore: 24,
        useSpread: true,
        locked: true,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 24,
        awayScore: 21, // Home wins by 3
        spread: 7, // With spread: 3 - 7 = -4 (away covers)
      };

      const score = scoringService.computeScore(prediction, actualResult);

      // Predicted away wins, with spread away covers -> correct
      expect(score.isCorrect).toBe(true);
      expect(score.lockBonus).toBe(mockLeague.lockBonus);
    });
  });

  describe('computeScore - Edge Cases', () => {
    it('should handle zero scores', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 0,
        predictedAwayScore: 0,
        useSpread: false,
        locked: false,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 0,
        awayScore: 0,
      };

      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.isCorrect).toBe(true);
      expect(score.winnerPoints).toBe(SCORING_CONFIG.WINNER_POINTS);
      expect(score.accuracyScore).toBe(SCORING_CONFIG.MAX_ACCURACY_POINTS);
    });

    it('should handle very high scores', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 52,
        predictedAwayScore: 48,
        useSpread: false,
        locked: false,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 55,
        awayScore: 52, // Margin difference of 1
      };

      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.isCorrect).toBe(true);
      expect(score.accuracyScore).toBeGreaterThan(18); // Very close margin
    });

    it('should handle negative spread', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 20,
        predictedAwayScore: 27,
        useSpread: true,
        locked: false,
        league: mockLeague,
      };

      const actualResult = {
        homeScore: 20,
        awayScore: 27,
        spread: -7, // Away team favored by 7 (negative from home perspective)
      };

      const score = scoringService.computeScore(prediction, actualResult);

      expect(score.isCorrect).toBe(true);
      expect(score.totalScore).toBeGreaterThan(0);
    });
  });

  describe('getScorePreview', () => {
    it('should provide score preview with same logic as computeScore', () => {
      const prediction = {
        id: 'pred-1',
        predictedHomeScore: 24,
        predictedAwayScore: 20,
        useSpread: false,
        locked: true,
        league: mockLeague,
      };

      const currentResult = {
        homeScore: 24,
        awayScore: 20,
      };

      const preview = scoringService.getScorePreview(prediction, currentResult);

      expect(preview.isCorrect).toBe(true);
      expect(preview.winnerPoints).toBe(SCORING_CONFIG.WINNER_POINTS);
      expect(preview.accuracyScore).toBe(SCORING_CONFIG.MAX_ACCURACY_POINTS);
      expect(preview.lockBonus).toBe(mockLeague.lockBonus);
    });
  });
});
