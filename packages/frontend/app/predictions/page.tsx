'use client';

import React, { useState, useEffect } from 'react';
import { PredictionForm, PredictionData } from '@/components/ui/PredictionForm';

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

interface Prediction {
  id: string;
  gameId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  useSpread: boolean;
  locked: boolean;
  totalScore?: number;
}

interface LockInfo {
  gameId: string;
  userId: string;
  username: string;
}

export default function PredictionsPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [spreads, setSpreads] = useState<Map<string, Spread>>(new Map());
  const [lockInfo, setLockInfo] = useState<LockInfo[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Mock data - replace with actual API calls
  const userId = 'demo-user';
  const leagueId = 'demo-league';
  const locksEnabled = true;
  const lockBonus = 20;
  const lockPenalty = 15;

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls
      // const gamesResponse = await fetch(`/api/v1/games?weekId=${currentWeekId}`);
      // const predictionsResponse = await fetch(`/api/v1/predictions?userId=${userId}&leagueId=${leagueId}`);
      // const locksResponse = await fetch(`/api/v1/predictions/locks/availability?leagueId=${leagueId}&weekId=${currentWeekId}`);
      
      // Mock data for demonstration
      const mockGames: Game[] = [
        {
          id: 'game-1',
          homeTeam: { name: 'Kansas City Chiefs', abbreviation: 'KC' },
          awayTeam: { name: 'Philadelphia Eagles', abbreviation: 'PHI' },
          kickoffTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          week: { id: 'week-1', weekNumber: 1 },
          status: 'SCHEDULED',
        },
        {
          id: 'game-2',
          homeTeam: { name: 'Dallas Cowboys', abbreviation: 'DAL' },
          awayTeam: { name: 'San Francisco 49ers', abbreviation: 'SF' },
          kickoffTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          week: { id: 'week-1', weekNumber: 1 },
          status: 'SCHEDULED',
        },
      ];

      setGames(mockGames);

      // Mock spreads
      const mockSpreads = new Map<string, Spread>();
      mockSpreads.set('game-1', { gameId: 'game-1', spread: 3.5, source: 'ESPN' });
      mockSpreads.set('game-2', { gameId: 'game-2', spread: -2.5, source: 'ESPN' });
      setSpreads(mockSpreads);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load predictions:', error);
      setLoading(false);
    }
  };

  const handleSubmitPrediction = async (data: PredictionData) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/v1/predictions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, leagueId, ...data }),
      // });

      console.log('Submitting prediction:', { userId, leagueId, ...data });

      // Mock success
      alert('Prediction submitted successfully!');
      setIsFormOpen(false);
      await loadPredictions();
    } catch (error) {
      console.error('Failed to submit prediction:', error);
      throw error;
    }
  };

  const openPredictionForm = (game: Game) => {
    setSelectedGame(game);
    setIsFormOpen(true);
  };

  const getExistingPrediction = (gameId: string) => {
    return predictions.find((p) => p.gameId === gameId);
  };

  const isGameLockedByOther = (gameId: string) => {
    const lock = lockInfo.find((l) => l.gameId === gameId);
    return lock ? lock.userId !== userId : false;
  };

  const userHasLockedThisWeek = predictions.some((p) => p.locked);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-600 dark:text-gray-400">Loading predictions...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Weekly Predictions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Make your predictions for this week&apos;s games. Predict the final scores and optionally lock a
            game for bonus points.
          </p>
        </div>

        {/* Info Cards */}
        {locksEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Lock Bonus
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Correct locked pick: +{lockBonus} points
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">
                Lock Penalty
              </h3>
              <p className="text-xs text-red-700 dark:text-red-300">
                Incorrect locked pick: -{lockPenalty} points
              </p>
            </div>
          </div>
        )}

        {/* Games List */}
        <div className="space-y-4">
          {games.map((game) => {
            const prediction = getExistingPrediction(game.id);
            const spread = spreads.get(game.id);
            const isLocked = lockInfo.find((l) => l.gameId === game.id);

            return (
              <div
                key={game.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {new Date(game.kickoffTime).toLocaleDateString()} at{' '}
                      {new Date(game.kickoffTime).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {game.awayTeam.name} @ {game.homeTeam.name}
                    </div>
                    {spread && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Spread: {spread.spread > 0 ? game.homeTeam.abbreviation : game.awayTeam.abbreviation}{' '}
                        {Math.abs(spread.spread)}
                      </div>
                    )}
                    {prediction && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-700 dark:text-gray-300">Your prediction: </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {game.homeTeam.abbreviation} {prediction.predictedHomeScore} -{' '}
                          {prediction.predictedAwayScore} {game.awayTeam.abbreviation}
                        </span>
                        {prediction.locked && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                            🔒 Locked
                          </span>
                        )}
                        {prediction.totalScore !== undefined && (
                          <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
                            {prediction.totalScore} pts
                          </span>
                        )}
                      </div>
                    )}
                    {isLocked && isLocked.userId !== userId && (
                      <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                        🔒 Locked by {isLocked.username}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => openPredictionForm(game)}
                    className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    {prediction ? 'Update' : 'Predict'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* No games message */}
        {games.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-600 dark:text-gray-400">No games available for prediction.</p>
          </div>
        )}
      </div>

      {/* Prediction Form Modal */}
      <PredictionForm
        game={selectedGame}
        leagueId={leagueId}
        userId={userId}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitPrediction}
        existingPrediction={
          selectedGame ? getExistingPrediction(selectedGame.id) : undefined
        }
        spread={selectedGame ? spreads.get(selectedGame.id) : undefined}
        locksEnabled={locksEnabled}
        lockBonus={lockBonus}
        lockPenalty={lockPenalty}
        isGameLockedByOther={selectedGame ? isGameLockedByOther(selectedGame.id) : false}
        lockedByUsername={
          selectedGame
            ? lockInfo.find((l) => l.gameId === selectedGame.id && l.userId !== userId)?.username
            : undefined
        }
        userHasLockedThisWeek={userHasLockedThisWeek}
      />
    </div>
  );
}
