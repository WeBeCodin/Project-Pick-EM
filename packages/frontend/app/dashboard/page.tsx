'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Trophy, Users, TrendingUp, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LiveScoreboard from '@/components/ui/LiveScoreboard';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [pickStats, setPickStats] = useState({
    totalPicks: 0,
    totalGames: 16, // Default to 16 games per week
    weekRecord: '0-0',
    winRate: 0
  });
  
  const [leagueStats, setLeagueStats] = useState({
    totalLeagues: 0,
    loading: true
  });
  const [currentLeague, setCurrentLeague] = useState<any>(null);
  const [userLeagues, setUserLeagues] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadLeagueStats();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && currentLeague) {
      loadPickStats();
    }
  }, [isAuthenticated, currentLeague]);

  const loadPickStats = async () => {
    try {
      // Only load picks if a league is selected
      if (!currentLeague) {
        setPickStats({
          totalPicks: 0,
          totalGames: 0,
          weekRecord: '0-0',
          winRate: 0
        });
        return;
      }

      // Load user picks for the selected league
      const picksResponse = await fetch(`/api/picks?leagueId=${currentLeague.id}&userId=${user?.id || 'anonymous'}`);
      const picksData = await picksResponse.json();
      
      // Load current week games to get total count
      const gamesResponse = await fetch('/api/games');
      const gamesData = await gamesResponse.json();
      
      let totalPicks = 0;
      let totalGames = 16; // Default
      
      if (picksData.success && picksData.data && picksData.data.picks) {
        totalPicks = picksData.data.picks.length;
      }
      
      if (gamesData.success && gamesData.data && Array.isArray(gamesData.data)) {
        totalGames = gamesData.data.length;
      }
      
      setPickStats({
        totalPicks,
        totalGames,
        weekRecord: '0-0', // TODO: Calculate actual record
        winRate: 0 // TODO: Calculate actual win rate
      });
      
    } catch (error) {
      console.error('Error loading pick stats:', error);
    }
  };

    const loadLeagueStats = async () => {
    try {
      // Load user leagues
      const response = await fetch('/api/leagues?action=my-leagues');
      const data = await response.json();
      
      if (data.success && data.data) {
        const leagues = data.data.leagues || [];
        setUserLeagues(leagues);
        setLeagueStats({
          totalLeagues: leagues.length,
          loading: false
        });
        
        // Set first league as current if none selected
        if (leagues.length > 0 && !currentLeague) {
          setCurrentLeague(leagues[0]);
        }
      } else {
        setLeagueStats({
          totalLeagues: 0,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error loading league stats:', error);
      setLeagueStats({
        totalLeagues: 0,
        loading: false
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.displayName || user?.username}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Ready to make your picks for this week?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pickStats.totalPicks}/{pickStats.totalGames}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Season Record</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pickStats.weekRecord}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pickStats.winRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Leagues</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {leagueStats.loading ? '...' : leagueStats.totalLeagues}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-8">
        <Button
          onClick={() => router.push('/leagues')}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Trophy className="mr-2 h-5 w-5" />
          Manage Leagues
        </Button>
      </div>

      {/* League Selector */}
      {userLeagues.length > 0 && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Making Picks For:
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select which league you're making picks for
              </p>
            </div>
            <div className="min-w-64">
              <select
                value={currentLeague?.id || ''}
                onChange={(e) => {
                  const league = userLeagues.find(l => l.id === e.target.value);
                  setCurrentLeague(league);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a league...</option>
                {userLeagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.name} ({league.settings?.maxMembers || 'Unlimited'} members)
                  </option>
                ))}
              </select>
            </div>
          </div>
          {currentLeague && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {currentLeague.name}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {currentLeague.description || 'No description'}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    {currentLeague.memberCount || 0} members
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Leagues Warning */}
      {userLeagues.length === 0 && !leagueStats.loading && (
        <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                No leagues joined yet
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>You need to join or create a league before making picks.</p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <Button
                    onClick={() => router.push('/leagues')}
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Join a League
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Scoreboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{currentLeague ? `${currentLeague.name} - ` : ''}Week 1 Games & Picks</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {currentLeague 
              ? `Make your picks for ${currentLeague.name} before games start`
              : 'Select a league above to make picks'
            }
          </p>
        </div>
        <div className="p-6">
          {currentLeague ? (
            <LiveScoreboard 
              enablePicks={true} 
              onPickSubmitted={loadPickStats}
              leagueId={currentLeague.id}
              userId={user?.id || 'anonymous'}
            />
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <Target className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Select a League
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Choose which league you want to make picks for from the selector above.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
