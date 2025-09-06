'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Lock,
  Globe,
  UserPlus,
  ArrowLeft,
  Check,
  AlertCircle
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
  stats: {
    totalMembers: number;
    activeMembers: number;
  };
  inviteCode: string;
  createdAt: string;
}

export default function JoinLeaguePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const leagueId = params.id as string;
  
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && leagueId) {
      loadLeague();
    }
  }, [isAuthenticated, leagueId]);

  const loadLeague = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/leagues?action=single&leagueId=${leagueId}`);
      const data = await response.json();
      
      if (data.success) {
        setLeague(data.data);
      } else {
        setError(data.error || 'League not found');
      }
    } catch (err) {
      setError('Failed to load league information');
      console.error('Error loading league:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeague = async () => {
    if (!league || !user) return;
    
    try {
      setJoining(true);
      setError(null);
      
      const response = await fetch('/api/leagues', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leagueId: league.id,
          action: 'join',
          userData: {
            userId: user.id,
            username: user.username,
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/leagues/${league.id}`);
        }, 2000);
      } else {
        setError(data.error || 'Failed to join league');
      }
    } catch (err) {
      setError('Failed to join league');
      console.error('Error joining league:', err);
    } finally {
      setJoining(false);
    }
  };

  const getScoringSystemLabel = (system: string) => {
    switch (system) {
      case 'confidence': return 'Confidence Points';
      case 'standard': return 'Standard';
      case 'spread': return 'Against Spread';
      default: return system;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-2/3"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !league) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                League Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>
              <Button onClick={() => router.push('/leagues')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Leagues
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-center">
              <Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Successfully Joined!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Welcome to {league?.name}! Redirecting to league dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!league) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/leagues')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leagues
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Join League
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You've been invited to join this league
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            {/* League Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {league.name}
                  </h2>
                  {league.settings.isPrivate && <Lock className="h-5 w-5 text-gray-500" />}
                  {!league.settings.isPrivate && <Globe className="h-5 w-5 text-green-500" />}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {league.description}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Created by {league.ownerName} • {new Date(league.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* League Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {league.stats.totalMembers}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Current Members
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {league.settings.maxMembers}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Max Members
                </div>
              </div>
            </div>

            {/* League Settings */}
            <div className="space-y-3 mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white">League Settings</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Scoring System:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getScoringSystemLabel(league.settings.scoringSystem)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm text-gray-600 dark:text-gray-400">League Type:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {league.settings.isPrivate ? 'Private (Invite Only)' : 'Public'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Approval Required:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {league.settings.requireApproval ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700 dark:text-red-400">{error}</span>
                </div>
              </div>
            )}

            {/* Join Action */}
            <div className="space-y-4">
              {league.stats.totalMembers >= league.settings.maxMembers ? (
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <Users className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                  <p className="text-yellow-700 dark:text-yellow-400 font-medium">
                    League is Full
                  </p>
                  <p className="text-yellow-600 dark:text-yellow-500 text-sm">
                    This league has reached its maximum number of members.
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleJoinLeague}
                  disabled={joining}
                  className="w-full"
                  size="lg"
                >
                  {joining ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Joining...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Join {league.name}
                    </>
                  )}
                </Button>
              )}
              
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By joining this league, you agree to participate in the {new Date().getFullYear()} NFL season picks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
