import { useState, useEffect, useRef } from 'react';

interface Team {
  id: string;
  name: string;
  displayName: string;
  abbreviation: string;
  color: string;
  logo: string;
  score: number;
  records: string;
}

interface GameStatus {
  state: 'pre' | 'in' | 'post';
  completed: boolean;
  description: string;
  detail: string;
  shortDetail: string;
  clock?: string;
  period?: number;
}

interface LiveGame {
  id: string;
  name: string;
  shortName: string;
  date: string;
  week: number;
  season: number;
  status: GameStatus;
  homeTeam: Team;
  awayTeam: Team;
  broadcast: string;
  venue: {
    name: string;
    city: string;
    state: string;
  };
  weather?: {
    temperature: number;
    condition: string;
  };
  odds?: {
    spread: number;
    overUnder: number;
    homeMoneyline: number;
    awayMoneyline: number;
  };
}

interface LiveScoresData {
  games: LiveGame[];
  lastUpdated: string;
  week: number;
  season: number;
}

interface UseLiveScoresOptions {
  /**
   * Polling interval in milliseconds
   * @default 30000 (30 seconds)
   */
  interval?: number;
  
  /**
   * Auto-start polling on mount
   * @default true
   */
  autoStart?: boolean;
  
  /**
   * Only poll when games are live
   * @default true
   */
  onlyWhenLive?: boolean;
}

/**
 * Hook for fetching live NFL scores from ESPN API
 * 
 * @example
 * ```tsx
 * function ScoreBoard() {
 *   const { games, isLoading, error, lastUpdated } = useLiveScores({
 *     interval: 30000, // Poll every 30 seconds
 *     onlyWhenLive: true // Only poll when games are in progress
 *   });
 * 
 *   if (isLoading) return <div>Loading scores...</div>;
 *   if (error) return <div>Error: {error}</div>;
 * 
 *   return (
 *     <div>
 *       <p>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</p>
 *       {games.map(game => (
 *         <GameCard key={game.id} game={game} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useLiveScores(options: UseLiveScoresOptions = {}) {
  const {
    interval = 30000,
    autoStart = true,
    onlyWhenLive = true
  } = options;

  const [data, setData] = useState<LiveScoresData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  /**
   * Fetch scores from our API endpoint
   */
  const fetchScores = async () => {
    try {
      const response = await fetch('/api/scores');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const scoresData: LiveScoresData = await response.json();
      
      if (mountedRef.current) {
        setData(scoresData);
        setError(null);
        setIsLoading(false);
      }
      
      return scoresData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch scores';
      
      if (mountedRef.current) {
        setError(errorMessage);
        setIsLoading(false);
      }
      
      throw err;
    }
  };

  /**
   * Start polling for live updates
   */
  const startPolling = () => {
    if (intervalRef.current) return; // Already polling
    
    setIsPolling(true);
    
    intervalRef.current = setInterval(async () => {
      try {
        const scoresData = await fetchScores();
        
        // If onlyWhenLive is true, stop polling if no games are live
        if (onlyWhenLive && scoresData) {
          const hasLiveGames = scoresData.games.some(game => game.status.state === 'in');
          
          if (!hasLiveGames) {
            stopPolling();
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, interval);
  };

  /**
   * Stop polling
   */
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  };

  /**
   * Manual refresh
   */
  const refresh = async () => {
    setIsLoading(true);
    try {
      await fetchScores();
    } catch (err) {
      console.error('Manual refresh error:', err);
    }
  };

  // Initial fetch and auto-start polling
  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch
    fetchScores().then(scoresData => {
      if (autoStart && scoresData) {
        // Start polling if there are live games or onlyWhenLive is false
        const hasLiveGames = scoresData.games.some(game => game.status.state === 'in');
        
        if (!onlyWhenLive || hasLiveGames) {
          startPolling();
        }
      }
    }).catch(err => {
      console.error('Initial fetch error:', err);
    });

    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  return {
    // Data
    games: data?.games || [],
    lastUpdated: data?.lastUpdated || '',
    week: data?.week || 1,
    season: data?.season || 2025,
    
    // State
    isLoading,
    error,
    isPolling,
    
    // Controls
    startPolling,
    stopPolling,
    refresh,
  };
}

/**
 * Helper hook to get live games only
 */
export function useLiveGames(options?: UseLiveScoresOptions) {
  const { games, ...rest } = useLiveScores(options);
  
  const liveGames = games.filter(game => game.status.state === 'in');
  
  return {
    liveGames,
    games,
    ...rest
  };
}

/**
 * Helper function to format game status for display
 */
export function formatGameStatus(status: GameStatus): string {
  switch (status.state) {
    case 'pre':
      return status.shortDetail; // e.g., "9/5 - 8:20 PM EDT"
    case 'in':
      return status.clock && status.period 
        ? `${status.clock} Q${status.period}`
        : 'Live';
    case 'post':
      return status.completed ? 'Final' : 'Ended';
    default:
      return status.description;
  }
}

/**
 * Helper function to determine if a game is live
 */
export function isGameLive(game: LiveGame): boolean {
  return game.status.state === 'in';
}

/**
 * Helper function to get team color with fallback
 */
export function getTeamColor(team: Team): string {
  return team.color ? `#${team.color}` : '#000000';
}
