'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface League {
  id: string;
  name: string;
  code: string;
  role: 'ADMIN' | 'MEMBER';
  isActive: boolean;
  joinedAt: string;
}

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  leagues: League[];
  updateLeagues: (leagues: League[]) => Promise<void>;
  getCurrentLeague: () => League | null;
  setCurrentLeague: (leagueId: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, isLoaded: authLoaded } = useClerkAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const router = useRouter();

  const isLoading = !userLoaded || !authLoaded;
  const isAuthenticated = !!(isSignedIn && user);

  // Load leagues from Clerk metadata on auth change
  useEffect(() => {
    if (isAuthenticated && user) {
      const savedLeagues = user.unsafeMetadata?.leagues as League[] || [];
      setLeagues(savedLeagues);
    } else {
      setLeagues([]);
    }
  }, [isAuthenticated, user]);

  const updateLeagues = async (newLeagues: League[]) => {
    if (!user) return;
    
    try {
      // Update Clerk user metadata (using unsafeMetadata for user-writable data)
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          leagues: newLeagues,
          lastUpdated: new Date().toISOString(),
        }
      });
      
      setLeagues(newLeagues);
      toast.success('League data synchronized');
    } catch (error) {
      console.error('Failed to update leagues in Clerk:', error);
      toast.error('Failed to sync league data');
    }
  };

  const getCurrentLeague = () => {
    const currentLeagueId = user?.unsafeMetadata?.currentLeagueId as string;
    return leagues.find(league => league.id === currentLeagueId) || null;
  };

  const setCurrentLeague = async (leagueId: string) => {
    if (!user) return;
    
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          currentLeagueId: leagueId,
        }
      });
      toast.success('Active league updated');
    } catch (error) {
      console.error('Failed to set current league:', error);
      toast.error('Failed to update active league');
    }
  };

  const refreshAuth = async () => {
    // Clerk handles auth refresh automatically
    // Just reload the user data if needed
    if (user) {
      await user.reload();
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    leagues,
    updateLeagues,
    getCurrentLeague,
    setCurrentLeague,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a ClerkAuthProvider');
  }
  return context;
}