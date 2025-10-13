'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Lock, TrendingUp, AlertCircle } from 'lucide-react';

interface Game {
  id: string;
  homeTeam: { name: string; abbreviation: string };
  awayTeam: { name: string; abbreviation: string };
  kickoffTime: string;
  week: { id: string; weekNumber: number };
  status: string;
}

interface Spread {
  gameId: string;
  spread: number;
  source: string;
}

interface LockInfo {
  gameId: string;
  userId: string;
  username: string;
}

interface PredictionFormProps {
  game: Game | null;
  leagueId: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prediction: PredictionData) => Promise<void>;
  existingPrediction?: {
    predictedHomeScore: number;
    predictedAwayScore: number;
    useSpread: boolean;
    locked: boolean;
  };
  spread?: Spread;
  locksEnabled: boolean;
  lockBonus: number;
  lockPenalty: number;
  isGameLockedByOther: boolean;
  lockedByUsername?: string;
  userHasLockedThisWeek: boolean;
}

export interface PredictionData {
  gameId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  useSpread: boolean;
  locked: boolean;
}

export function PredictionForm({
  game,
  leagueId,
  userId,
  isOpen,
  onClose,
  onSubmit,
  existingPrediction,
  spread,
  locksEnabled,
  lockBonus,
  lockPenalty,
  isGameLockedByOther,
  lockedByUsername,
  userHasLockedThisWeek,
}: PredictionFormProps) {
  const [predictedHomeScore, setPredictedHomeScore] = useState<number>(
    existingPrediction?.predictedHomeScore ?? 24
  );
  const [predictedAwayScore, setPredictedAwayScore] = useState<number>(
    existingPrediction?.predictedAwayScore ?? 20
  );
  const [useSpread, setUseSpread] = useState<boolean>(existingPrediction?.useSpread ?? false);
  const [locked, setLocked] = useState<boolean>(existingPrediction?.locked ?? false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingPrediction) {
      setPredictedHomeScore(existingPrediction.predictedHomeScore);
      setPredictedAwayScore(existingPrediction.predictedAwayScore);
      setUseSpread(existingPrediction.useSpread);
      setLocked(existingPrediction.locked);
    } else {
      setPredictedHomeScore(24);
      setPredictedAwayScore(20);
      setUseSpread(false);
      setLocked(false);
    }
  }, [existingPrediction, game]);

  if (!isOpen || !game) return null;

  const handleSubmit = async () => {
    if (predictedHomeScore < 0 || predictedAwayScore < 0) {
      alert('Scores cannot be negative');
      return;
    }

    if (predictedHomeScore > 100 || predictedAwayScore > 100) {
      alert('Scores seem unrealistic (max 100)');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        gameId: game.id,
        predictedHomeScore,
        predictedAwayScore,
        useSpread,
        locked,
      });
      onClose();
    } catch (error: any) {
      console.error('Error submitting prediction:', error);
      alert(error.message || 'Failed to submit prediction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatGameTime = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' at ' +
      date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    );
  };

  const predictedMargin = predictedHomeScore - predictedAwayScore;
  const predictedWinner =
    predictedMargin > 0 ? game.homeTeam.name : predictedMargin < 0 ? game.awayTeam.name : 'Tie';

  const canLock = locksEnabled && !isGameLockedByOther && !userHasLockedThisWeek;
  const canToggleLock = canLock || (locked && existingPrediction?.locked);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Make Your Prediction</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Game Info */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Week {game.week.weekNumber} • {formatGameTime(game.kickoffTime)}
                </span>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {game.awayTeam.name} @ {game.homeTeam.name}
                </div>
              </div>
            </div>

            {/* Spread Info */}
            {spread && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Official Spread: {spread.spread > 0 ? game.homeTeam.abbreviation : game.awayTeam.abbreviation}{' '}
                    {Math.abs(spread.spread)}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Source: {spread.source}
                  </p>
                </div>
              </div>
            )}

            {/* Score Predictions */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Predicted Final Scores
              </h4>

              {/* Away Team Score */}
              <div className="flex items-center space-x-4">
                <label className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {game.awayTeam.name} (Away)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={predictedAwayScore}
                  onChange={(e) => setPredictedAwayScore(parseInt(e.target.value) || 0)}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Home Team Score */}
              <div className="flex items-center space-x-4">
                <label className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {game.homeTeam.name} (Home)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={predictedHomeScore}
                  onChange={(e) => setPredictedHomeScore(parseInt(e.target.value) || 0)}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Predicted Outcome */}
              <div className="text-center py-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Your Prediction:</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {predictedWinner} by {Math.abs(predictedMargin)}
                </p>
              </div>
            </div>

            {/* Use Spread Option */}
            {spread && (
              <div className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <input
                  type="checkbox"
                  id="useSpread"
                  checked={useSpread}
                  onChange={(e) => setUseSpread(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="useSpread" className="flex-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Use Official Spread for Scoring
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    The spread will be applied to the final score when determining your winner pick and
                    accuracy bonus.
                  </p>
                </label>
              </div>
            )}

            {/* Lock Option */}
            {locksEnabled && (
              <div className="border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Lock This Pick
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Lock this game for bonus points if correct (+{lockBonus}) or penalty if wrong (-
                      {lockPenalty})
                    </p>
                  </div>
                </div>

                {isGameLockedByOther && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      This game is already locked by {lockedByUsername}
                    </p>
                  </div>
                )}

                {userHasLockedThisWeek && !existingPrediction?.locked && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      You already have a locked pick this week
                    </p>
                  </div>
                )}

                {canToggleLock && (
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="locked"
                      checked={locked}
                      onChange={(e) => setLocked(e.target.checked)}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label htmlFor="locked" className="text-sm font-medium text-gray-900 dark:text-white">
                      Lock this pick
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : existingPrediction ? 'Update Prediction' : 'Submit Prediction'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
