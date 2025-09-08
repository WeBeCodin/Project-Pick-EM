'use client';

import React, { useState } from 'react';
import { useLiveScores, formatGameStatus, isGameLive } from '@/hooks/useLiveScores';
import { PickModal } from '@/components/ui/PickModal';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';

interface LiveScoreboardProps {
  /**
   * Polling interval in milliseconds
   * @default 30000
   */
  interval?: number;
  
  /**
   * Show only live games
   * @default false
   */
  liveOnly?: boolean;
  
  /**
   * Compact view with smaller cards
   * @default false
   */
  compact?: boolean;
  
  /**
   * Maximum number of games to show
   */
  maxGames?: number;

  /**
   * Enable pick functionality
   * @default false
   */
  enablePicks?: boolean;

  /**
   * League ID for league-specific picks
   */
  leagueId?: string;

  /**
   * User ID for pick submission
   */
  userId?: string;

  /**
   * Callback when a pick is submitted successfully
   */
  onPickSubmitted?: () => void;
}

/**
 * Live NFL Scoreboard Component
 * 
 * Displays real-time NFL scores with automatic updates
 */
export function LiveScoreboard({ 
  interval = 30000, 
  liveOnly = false, 
  compact = false,
  maxGames,
  enablePicks = false,
  leagueId,
  userId,
  onPickSubmitted
}: LiveScoreboardProps) {
  const { games, isLoading, error, lastUpdated, isPolling, refresh } = useLiveScores({
    interval,
    onlyWhenLive: true
  });

  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [isPickModalOpen, setIsPickModalOpen] = useState(false);
  const [userPicks, setUserPicks] = useState<Record<string, { selectedTeam: 'home' | 'away'; confidence: number }>>({});

  // Load existing picks on component mount and when page becomes visible
  React.useEffect(() => {
    if (enablePicks) {
      loadUserPicks();
    }
  }, [enablePicks]);

  // Reload picks when the page becomes visible (user returns to tab/page)
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && enablePicks) {
        console.log('🔄 Page became visible, reloading picks...');
        loadUserPicks();
      }
    };

    const handleFocus = () => {
      if (enablePicks) {
        console.log('🔄 Window focused, reloading picks...');
        loadUserPicks();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enablePicks]);

  const loadUserPicks = async () => {
    if (!leagueId || !userId) {
      console.log('⚠️ No leagueId or userId provided, skipping pick loading');
      return;
    }

    try {
      const response = await fetch(`/api/picks?leagueId=${leagueId}&userId=${userId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.picks) {
          const picksMap = result.data.picks.reduce((acc: any, pick: any) => {
            acc[pick.gameId] = {
              selectedTeam: pick.selectedTeam,
              confidence: pick.confidence
            };
            return acc;
          }, {});
          setUserPicks(picksMap);
          console.log(`📦 Loaded ${result.data.picks.length} picks for league ${leagueId}`);
        }
      }
    } catch (error) {
      console.error('Error loading picks:', error);
    }
  };

  const handlePickSubmit = async (gameId: string, selectedTeam: 'home' | 'away', confidence: number) => {
    if (!leagueId || !userId) {
      console.error('❌ Cannot submit pick: leagueId or userId missing');
      return;
    }

    try {
      const response = await fetch('/api/picks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          selectedTeam,
          confidence,
          leagueId,
          userId
        })
      });

      if (response.ok) {
        // Update local state
        setUserPicks(prev => ({
          ...prev,
          [gameId]: { selectedTeam, confidence }
        }));
        
        console.log(`✅ Pick submitted for league ${leagueId}: ${selectedTeam} (confidence: ${confidence})`);
        
        // Call the callback to update parent component
        onPickSubmitted?.();
      } else {
        throw new Error('Failed to submit pick');
      }
    } catch (error) {
      console.error('Error submitting pick:', error);
      throw error;
    }
  };

  const openPickModal = (game: any) => {
    setSelectedGame(game);
    setIsPickModalOpen(true);
  };

  const closePickModal = () => {
    setSelectedGame(null);
    setIsPickModalOpen(false);
  };

  const displayGames = React.useMemo(() => {
    let filteredGames = liveOnly ? games.filter(isGameLive) : games;
    
    if (maxGames) {
      filteredGames = filteredGames.slice(0, maxGames);
    }
    
    return filteredGames;
  }, [games, liveOnly, maxGames]);

  if (isLoading && games.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading live scores...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="ml-2 text-sm text-red-800">Error loading scores: {error}</span>
          </div>
          <button
            onClick={refresh}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-sm rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className={`font-bold text-gray-900 ${compact ? 'text-lg' : 'text-xl'}`}>
            {liveOnly ? 'Live Games' : 'NFL Scores'}
          </h2>
          {isPolling && (
            <div className="flex items-center text-green-600">
              <div className="animate-pulse w-2 h-2 bg-green-600 rounded-full mr-1"></div>
              <span className="text-xs font-medium">LIVE</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3 text-sm text-gray-500">
          {lastUpdated && (
            <span>
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Refresh scores"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Games list */}
      {displayGames.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {liveOnly ? 'No live games right now' : 'No games available'}
        </div>
      ) : (
        <div className={`grid gap-4 ${compact ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
          {displayGames.map(game => (
            <GameCard 
              key={game.id} 
              game={game} 
              compact={compact}
              enablePicks={enablePicks}
              userPick={userPicks[game.id]}
              onPickClick={() => openPickModal(game)}
            />
          ))}
        </div>
      )}

      {/* Pick Modal */}
      {enablePicks && (
        <PickModal
          game={selectedGame}
          isOpen={isPickModalOpen}
          onClose={closePickModal}
          onSubmit={handlePickSubmit}
          existingPick={selectedGame ? userPicks[selectedGame.id] : undefined}
        />
      )}
    </div>
  );
}

interface GameCardProps {
  game: any;
  compact?: boolean;
  enablePicks?: boolean;
  userPick?: {
    selectedTeam: 'home' | 'away';
    confidence: number;
  };
  onPickClick?: () => void;
}

function GameCard({ game, compact, enablePicks, userPick, onPickClick }: GameCardProps) {
  const isLive = isGameLive(game);
  const statusText = formatGameStatus(game.status);
  const canMakePick = enablePicks && game.status.state === 'pre';
  
  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
      isLive ? 'ring-2 ring-green-500 ring-opacity-20' : ''
    }`}>
      <div className={`${compact ? 'p-4' : 'p-6'}`}>
        {/* Game header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className={`text-xs font-medium px-3 py-1 rounded ${
              isLive 
                ? 'bg-green-100 text-green-800' 
                : game.status.state === 'post'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {statusText}
            </span>
            {game.broadcast && (
              <span className="text-xs text-gray-500 font-medium">{game.broadcast}</span>
            )}
          </div>
        </div>

        {/* Teams and scores */}
        <div className="space-y-3">
          {/* Away team */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              {game.awayTeam.logo && (
                <img 
                  src={game.awayTeam.logo} 
                  alt={game.awayTeam.name}
                  className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} object-contain`}
                />
              )}
              <div>
                <div className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
                  {game.awayTeam.abbreviation}
                </div>
                <div className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
                  {game.awayTeam.records}
                </div>
              </div>
            </div>
            <div className={`font-bold ${compact ? 'text-xl' : 'text-2xl'} text-gray-900`}>
              {game.awayTeam.score}
            </div>
          </div>

          {/* Home team */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              {game.homeTeam.logo && (
                <img 
                  src={game.homeTeam.logo} 
                  alt={game.homeTeam.name}
                  className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} object-contain`}
                />
              )}
              <div>
                <div className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
                  {game.homeTeam.abbreviation}
                </div>
                <div className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
                  {game.homeTeam.records}
                </div>
              </div>
            </div>
            <div className={`font-bold ${compact ? 'text-xl' : 'text-2xl'} text-gray-900`}>
              {game.homeTeam.score}
            </div>
          </div>
        </div>

        {/* Game details */}
        {!compact && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium">{game.venue.name}</span>
              {game.weather && (
                <span className="font-medium">{game.weather.temperature}°F, {game.weather.condition}</span>
              )}
            </div>
          </div>
        )}

        {/* Pick section */}
        {enablePicks && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {userPick ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Pick: {userPick.selectedTeam === 'home' ? game.homeTeam.abbreviation : game.awayTeam.abbreviation}
                  </span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Confidence: {userPick.confidence}
                  </span>
                </div>
                {canMakePick && (
                  <Button
                    onClick={onPickClick}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Edit
                  </Button>
                )}
              </div>
            ) : canMakePick ? (
              <Button
                onClick={onPickClick}
                className="w-full"
                size="sm"
              >
                <Target className="h-4 w-4 mr-2" />
                Make Pick
              </Button>
            ) : (
              <div className="text-center text-sm text-gray-500">
                {isLive ? 'Game in progress' : 'Picks closed'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveScoreboard;
