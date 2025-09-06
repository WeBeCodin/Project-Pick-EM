'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Users } from 'lucide-react';
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPickStats();
    }
  }, [isAuthenticated]);

  const loadPickStats = async () => {
    try {
      // Load user picks
      const picksResponse = await fetch('/api/picks');
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
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

      {/* Live Scoreboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Week 1 Games & Picks
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Make your picks before games start
          </p>
        </div>
        <div className="p-6">
          <LiveScoreboard enablePicks={true} onPickSubmitted={loadPickStats} />
        </div>
      </div>
    </div>
  );
}
