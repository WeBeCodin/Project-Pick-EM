'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Plus, 
  Settings, 
  Trophy, 
  Crown, 
  Lock,
  Globe,
  UserPlus,
  Copy,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchUserLeagues, getEffectiveUserId } from '@/lib/user-utils';

interface League {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  isPrivate: boolean;
  maxMembers?: number;
  allowLateJoin: boolean;
  scoringSystem: 'STANDARD' | 'CONFIDENCE' | 'SPREAD';
  members: Array<{
    userId: string;
    username: string;
    joinedAt: string;
    role: 'owner' | 'admin' | 'member';
    status: 'active' | 'pending' | 'removed';
  }>;
  createdAt: string;
  code: string;
}export default function LeaguesPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my-leagues' | 'public' | 'create'>('my-leagues');
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [publicLeagues, setPublicLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Create League Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    maxMembers: 20,
    isPrivate: false,
    scoringSystem: 'STANDARD' as const,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadLeagues();
    }
  }, [isAuthenticated, activeTab]);

  const loadLeagues = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'my-leagues') {
        const data = await fetchUserLeagues(user, 'my-leagues');
        
        if (data.success) {
          setMyLeagues(data.data.leagues || []);
        } else {
          setError(data.error);
        }
      } else if (activeTab === 'public') {
        const userId = getEffectiveUserId(user);
        const response = await fetch(`/api/leagues?action=public&userId=${userId}`);
        const data = await response.json();
        
        if (data.success) {
          setPublicLeagues(data.data.leagues || []);
        } else {
          setError(data.error);
        }
      }
    } catch (err) {
      setError('Failed to load leagues');
      console.error('Error loading leagues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setActionLoading(true);
      setError(null);
      
      const response = await fetch('/api/leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: createForm.name,
          description: createForm.description,
          settings: {
            maxMembers: createForm.maxMembers,
            isPrivate: createForm.isPrivate,
            scoringSystem: createForm.scoringSystem,
          },
          ownerData: {
            userId: getEffectiveUserId(user),
            username: user?.username || 'Unknown User',
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Reset form
        setCreateForm({
          name: '',
          description: '',
          maxMembers: 20,
          isPrivate: false,
          scoringSystem: 'STANDARD',
        });
        
        // Switch to my leagues and reload explicitly
        setActiveTab('my-leagues');
        
        // Force reload my leagues regardless of current tab state
        const myLeaguesData = await fetchUserLeagues(user, 'my-leagues');
        
        if (myLeaguesData.success) {
          setMyLeagues(myLeaguesData.data.leagues || []);
          // Clear any previous errors since we succeeded
          setError(null);
        }
        
        console.log('✅ League created successfully!', data.data);
      } else {
        setError(data.error || 'Failed to create league');
      }
    } catch (err) {
      setError('Failed to create league');
      console.error('Error creating league:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinLeague = async (leagueId: string) => {
    try {
      setActionLoading(true);
      setError(null);
      
      const response = await fetch('/api/leagues', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leagueId,
          action: 'join',
          userData: {
            userId: getEffectiveUserId(user),
            username: user?.username || 'Unknown User',
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Reload leagues explicitly
        setActiveTab('my-leagues');
        
        // Force reload my leagues regardless of current tab state  
        const myLeaguesData = await fetchUserLeagues(user, 'my-leagues');
        
        if (myLeaguesData.success) {
          setMyLeagues(myLeaguesData.data.leagues || []);
          // Clear any previous errors since we succeeded
          setError(null);
        }
        
        console.log('✅ Joined league successfully!', data.data);
      } else {
        setError(data.error || 'Failed to join league');
      }
    } catch (err) {
      setError('Failed to join league');
      console.error('Error joining league:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewLeague = async (leagueId: string) => {
    try {
      // For now, just switch to my-leagues tab where they can see the league
      setActiveTab('my-leagues');
    } catch (err) {
      console.error('Error viewing league:', err);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyInviteLink = (leagueId: string) => {
    const inviteLink = `${window.location.origin}/leagues/join/${leagueId}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(leagueId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  if (isLoading && !isAuthenticated) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            League Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create, join, and manage your pick 'em leagues
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800 text-sm">{error}</div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('my-leagues')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-leagues'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline-block mr-2" />
                My Leagues
              </button>
              <button
                onClick={() => setActiveTab('public')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'public'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Globe className="h-4 w-4 inline-block mr-2" />
                Public Leagues
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Plus className="h-4 w-4 inline-block mr-2" />
                Create League
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'my-leagues' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your leagues...</p>
              </div>
            ) : myLeagues.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myLeagues.map((league) => (
                  <LeagueCard
                    key={league.id}
                    league={league}
                    isOwner={(league as any).creator === getEffectiveUserId(user) || league.ownerId === getEffectiveUserId(user)}
                    onCopyCode={copyInviteCode}
                    onCopyLink={copyInviteLink}
                    copiedCode={copiedCode}
                    copiedLink={copiedLink}
                    showJoinButton={false}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  No leagues yet
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Create your first league or join an existing one to get started.
                </p>
                <div className="mt-6 space-x-3">
                  <Button onClick={() => setActiveTab('create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create League
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('public')}>
                    <Globe className="h-4 w-4 mr-2" />
                    Browse Public Leagues
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'public' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading public leagues...</p>
              </div>
            ) : publicLeagues.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {publicLeagues.map((league) => {
                  const isAlreadyMember = league.members?.some(member => 
                    member.userId === getEffectiveUserId(user) || 
                    member.username === getEffectiveUserId(user)
                  );
                  return (
                    <LeagueCard
                      key={league.id}
                      league={league}
                      isOwner={false}
                      onJoin={() => handleJoinLeague(league.id)}
                      onView={() => handleViewLeague(league.id)}
                      showJoinButton={!isAlreadyMember}
                      actionLoading={actionLoading}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Globe className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  No public leagues available
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  All public leagues are currently full or there are no public leagues yet.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setActiveTab('create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your Own League
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Create New League
              </h2>
              
              <form onSubmit={handleCreateLeague} className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      League Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter league name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Describe your league"
                    />
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">League Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Members
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="100"
                        value={createForm.maxMembers}
                        onChange={(e) => setCreateForm({ ...createForm, maxMembers: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Scoring System
                      </label>
                      <select
                        value={createForm.scoringSystem}
                        onChange={(e) => setCreateForm({ ...createForm, scoringSystem: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="CONFIDENCE">Confidence Points</option>
                        <option value="STANDARD">Standard (1 point per win)</option>
                        <option value="SPREAD">Against the Spread</option>
                      </select>
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={createForm.isPrivate}
                        onChange={(e) => setCreateForm({ ...createForm, isPrivate: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Private League (invite only)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab('my-leagues')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={actionLoading}>
                    {actionLoading ? 'Creating...' : 'Create League'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface LeagueCardProps {
  league: League;
  isOwner: boolean;
  onCopyCode?: (code: string) => void;
  onCopyLink?: (leagueId: string) => void;
  onJoin?: () => void;
  onView?: () => void;
  copiedCode?: string | null;
  copiedLink?: string | null;
  showJoinButton: boolean;
  actionLoading?: boolean;
}

function LeagueCard({ league, isOwner, onCopyCode, onCopyLink, onJoin, onView, copiedCode, copiedLink, showJoinButton, actionLoading }: LeagueCardProps) {
  const router = useRouter();

  const getScoringSystemLabel = (system: string) => {
    switch (system) {
      case 'CONFIDENCE': return 'Confidence Points';
      case 'STANDARD': return 'Standard';
      case 'SPREAD': return 'Against Spread';
      default: return system;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {league.name}
              </h3>
              {isOwner && <Crown className="h-4 w-4 text-yellow-500" />}
              {league.isPrivate && <Lock className="h-4 w-4 text-gray-500" />}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {league.description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Created by {league.ownerName} • {new Date(league.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {league.members?.length || 0}
            </div>
            <div className="text-xs text-gray-500">
              Members
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {league.maxMembers || 'Unlimited'}
            </div>
            <div className="text-xs text-gray-500">
              Max
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Scoring:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {getScoringSystemLabel(league.scoringSystem)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Type:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {league.isPrivate ? 'Private' : 'Public'}
            </span>
          </div>
        </div>

        {/* Invite Code & Link */}
        {!showJoinButton && (
          <div className="mb-4 space-y-3">
            {/* Invite Code */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-fit">Invite Code:</span>
              <code className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                {league.code}
              </code>
              <button
                onClick={() => onCopyCode?.(league.code)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Copy invite code"
              >
                {copiedCode === league.code ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
            
            {/* Invite Link */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-fit">Invite Link:</span>
              <button
                onClick={() => onCopyLink?.(league.id)}
                className="flex-1 min-w-0 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-left hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors overflow-hidden"
                title="Copy invite link"
              >
                <span className="text-blue-600 dark:text-blue-400 truncate block w-full">
                  {typeof window !== 'undefined' ? `${window.location.origin}/leagues/join/${league.id}` : `/leagues/join/${league.id}`}
                </span>
              </button>
              <div className="p-1 flex-shrink-0">
                {copiedLink === league.id ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {showJoinButton ? (
            <Button
              onClick={onJoin}
              className="w-full"
              size="sm"
              disabled={actionLoading}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {actionLoading ? 'Joining...' : 'Join League'}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                onClick={onView || (() => router.push(`/leagues/${league.id}` as any))}
                className="w-full"
                size="sm"
              >
                <Trophy className="h-4 w-4 mr-2" />
                View League
              </Button>
              {isOwner && (
                <Button
                  onClick={() => router.push(`/leagues/${league.id}/settings` as any)}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
