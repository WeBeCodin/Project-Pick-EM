'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Trophy, 
  Crown, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Medal,
  Target,
  ArrowLeft
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

interface League {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  settings: {
    maxMembers: number;
    isPrivate: boolean;
    requireApproval: boolean;
    scoringSystem: 'standard' | 'confidence' | 'spread';
    weeklyPayout: boolean;
    seasonPayout: boolean;
  };
  members: Array<{
    userId: string;
    username: string;
    joinedAt: string;
    role: 'owner' | 'admin' | 'member';
    status: 'active' | 'pending' | 'removed';
  }>;
  stats: {
    totalMembers: number;
    weeklyWinners: Array<{
      week: number;
      winnerId: string;
      winnerName: string;
      score: number;
    }>;
    seasonLeader: {
      userId: string;
      username: string;
      totalScore: number;
    };
  };
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

interface LeagueStanding {
  userId: string;
  username: string;
  totalScore: number;
  weeklyScores: Array<{
    week: number;
    score: number;
    correctPicks: number;
    totalPicks: number;
    rank: number;
  }>;
  stats: {
    averageScore: number;
    bestWeek: number;
    worstWeek: number;
    consistency: number;
    currentStreak: number;
    longestStreak: number;
  };
  rank: number;
  trend: 'up' | 'down' | 'same';
}

export default function LeagueDetailPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const leagueId = params.id as string;
  
  const [league, setLeague] = useState<League | null>(null);
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [activeTab, setActiveTab] = useState<'standings' | 'members' | 'history'>('standings');
  const [, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && leagueId) {
      loadLeagueData();
    }
  }, [isAuthenticated, leagueId]);

  const loadLeagueData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load league details
      const leagueResponse = await fetch(`/api/leagues?id=${leagueId}`);
      const leagueData = await leagueResponse.json();
      
      if (leagueData.success) {
        setLeague(leagueData.data);
      } else {
        setError(leagueData.error);
        return;
      }

      // Load standings
      const standingsResponse = await fetch(`/api/leagues/standings?leagueId=${leagueId}`);
      const standingsData = await standingsResponse.json();
      
      if (standingsData.success) {
        setStandings(standingsData.data.standings);
      } else {
        console.error('Failed to load standings:', standingsData.error);
      }

    } catch (err) {
      setError('Failed to load league data');
      console.error('Error loading league:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-medium text-gray-500">#{rank}</span>;
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-800 text-center">
              <h2 className="text-lg font-semibold mb-2">Error Loading League</h2>
              <p>{error}</p>
              <Button
                onClick={() => router.push('/leagues')}
                className="mt-4"
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Leagues
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!league) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              League Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The league you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.push('/leagues')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leagues
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = league.ownerId === (user?.id || 'anonymous');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              onClick={() => router.push('/leagues')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {isOwner && (
              <Button
                onClick={() => router.push(`/leagues/${leagueId}/settings` as any)}
                variant="outline"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {league.name}
                </h1>
                {isOwner && <Crown className="h-6 w-6 text-yellow-500" />}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {league.description}
              </p>
              <p className="text-sm text-gray-500">
                Created by {league.ownerName} • Invite Code: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{league.inviteCode}</code>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {league.stats.totalMembers}/{league.settings.maxMembers}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Leader</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {league.stats.seasonLeader.username}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Week</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scoring</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {league.settings.scoringSystem === 'confidence' ? 'Confidence' : 
                   league.settings.scoringSystem === 'standard' ? 'Standard' : 'Spread'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('standings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'standings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Trophy className="h-4 w-4 inline-block mr-2" />
                Standings
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'members'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline-block mr-2" />
                Members ({league.stats.totalMembers})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="h-4 w-4 inline-block mr-2" />
                History
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'standings' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Season Standings
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Avg Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trend
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Streak
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {standings.map((standing, index) => (
                    <tr key={standing.userId} className={index < 3 ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getRankDisplay(standing.rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {standing.username}
                            {standing.userId === (user?.id || 'anonymous') && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {standing.totalScore}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {standing.stats.averageScore.toFixed(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTrendIcon(standing.trend)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {standing.stats.currentStreak > 0 ? `${standing.stats.currentStreak} 🔥` : '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                League Members
              </h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4">
                {league.members
                  .filter(member => member.status === 'active')
                  .map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {member.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.username}
                          {member.userId === (user?.id || 'anonymous') && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {member.role === 'owner' && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded capitalize">
                        {member.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Weekly Winners
              </h2>
            </div>
            <div className="p-6">
              {league.stats.weeklyWinners.length > 0 ? (
                <div className="space-y-4">
                  {league.stats.weeklyWinners.map((winner) => (
                    <div key={winner.week} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Week {winner.week} Winner
                        </div>
                        <div className="text-xs text-gray-500">
                          {winner.winnerName}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {winner.score} pts
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    No weekly winners yet
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Weekly winners will appear here as the season progresses.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
