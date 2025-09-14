/**
 * Persistent League Storage System for Vercel Serverless Environment
 * 
 * This system provides persistent league storage using multiple fallback mechanisms:
 * 1. Vercel KV (Redis) - Primary storage (if configured)
 * 2. Local file storage - Development/fallback
 * 3. In-memory storage - Last resort
 * 
 * The system automatically handles data migration and provides session persistence
 * even in serverless environments where in-memory data is ephemeral.
 */

interface LeagueMember {
  userId: string;
  username: string;
  joinedAt: string;
  role: 'owner' | 'member';
  status: 'ACTIVE' | 'INACTIVE';
  isActive: boolean;
}

interface League {
  id: string;
  name: string;
  description: string;
  code: string;
  creator: string;
  members: LeagueMember[];
  maxMembers: number;
  isPrivate: boolean;
  scoringType: 'STANDARD' | 'CONFIDENCE';
  scoringSystem: 'STANDARD' | 'CONFIDENCE';
  createdAt: string;
  updatedAt: string;
  memberCount: number;
}

interface UserSession {
  leagues: string[];
  lastActive: string;
  username?: string;
  email?: string;
}

interface PersistentStorage {
  leagues: League[];
  userSessions: Record<string, UserSession>;
  leagueIdCounter: number;
  lastUpdated: string;
}

class LeagueStorageManager {
  private static instance: LeagueStorageManager;
  private storageKey = 'nfl_pickem_leagues_v1';
  private cache: PersistentStorage | null = null;

  private constructor() {}

  public static getInstance(): LeagueStorageManager {
    if (!LeagueStorageManager.instance) {
      LeagueStorageManager.instance = new LeagueStorageManager();
    }
    return LeagueStorageManager.instance;
  }

  /**
   * Get the default/seed data structure
   */
  private getDefaultData(): PersistentStorage {
    return {
      leagues: [
        {
          id: 'league_1',
          name: 'Demo League',
          description: 'A sample league for testing user persistence',
          code: 'DEMO2024',
          creator: 'demo-persistent-user',
          members: [
            {
              userId: 'demo-persistent-user',
              username: 'demo-user',
              joinedAt: new Date().toISOString(),
              role: 'owner',
              status: 'ACTIVE',
              isActive: true
            }
          ],
          maxMembers: 20,
          isPrivate: false,
          scoringType: 'STANDARD',
          scoringSystem: 'STANDARD',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          memberCount: 1
        }
      ],
      userSessions: {
        'demo-persistent-user': {
          leagues: ['league_1'],
          lastActive: new Date().toISOString(),
          username: 'demo-user',
          email: ''
        }
      },
      leagueIdCounter: 2,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Load data from persistent storage with multiple fallbacks
   */
  async loadData(): Promise<PersistentStorage> {
    // Return cached data if available
    if (this.cache) {
      return this.cache;
    }

    try {
      let data: PersistentStorage | null = null;

      // Try Vercel KV first (if available)
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        try {
          const response = await fetch(`${process.env.KV_REST_API_URL}/get/${this.storageKey}`, {
            headers: {
              'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}`
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.result) {
              data = JSON.parse(result.result);
              if (data) {
                const leagueCount = data.leagues?.length || 0;
                console.log(`📦 Loaded data from Vercel KV: ${leagueCount} leagues found`);
                if (leagueCount > 0 && data.leagues) {
                  console.log(`📋 Leagues loaded: ${data.leagues.map(l => `${l.name} (${l.id})`).join(', ')}`);
                }
              }
            } else {
              console.log('📦 Vercel KV returned empty result - no data found');
            }
          } else {
            console.warn(`⚠️  Vercel KV GET failed with status: ${response.status}`);
          }
        } catch (kvError) {
          console.warn('⚠️  Vercel KV unavailable, using fallback:', kvError);
        }
      }

      // Fallback to file system (development)
      if (!data && typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        try {
          const fs = await import('fs').then(m => m.promises);
          const path = await import('path');
          const filePath = path.join(process.cwd(), '.data', 'leagues.json');
          
          try {
            const fileData = await fs.readFile(filePath, 'utf-8');
            data = JSON.parse(fileData);
            console.log('📁 Loaded data from file system');
          } catch (fileError) {
            console.log('📁 Creating new data file');
          }
        } catch (fsError) {
          console.warn('⚠️  File system unavailable');
        }
      }

      // Use default data if nothing found
      if (!data) {
        data = this.getDefaultData();
        console.log('🆕 Using default data structure');
      }

      // Validate and update data structure
      data = this.validateAndMigrate(data);

      // Update cache (permanent until manually deleted)
      this.cache = data;

      return data;
    } catch (error) {
      console.error('❌ Error loading league data:', error);
      return this.getDefaultData();
    }
  }

  /**
   * Save data to persistent storage
   */
  async saveData(data: PersistentStorage): Promise<void> {
    try {
      data.lastUpdated = new Date().toISOString();
      const jsonData = JSON.stringify(data);
      const leagueCount = data.leagues?.length || 0;
      console.log(`💾 Saving ${leagueCount} leagues to storage at ${data.lastUpdated}`);
      if (leagueCount > 0) {
        console.log(`📋 Leagues to save: ${data.leagues.map(l => `${l.name} (${l.id})`).join(', ')}`);
      }

      // Save to Vercel KV first (if available)
      if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        try {
          // Use PERSIST command to ensure data never expires in Vercel KV
          const setResponse = await fetch(`${process.env.KV_REST_API_URL}/set/${this.storageKey}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ value: jsonData })
          });

          if (setResponse.ok) {
            // Explicitly remove any TTL with PERSIST command
            const persistResponse = await fetch(`${process.env.KV_REST_API_URL}/persist/${this.storageKey}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (persistResponse.ok) {
              console.log('💾 Data saved to Vercel KV with no expiry (persisted indefinitely)');
            } else {
              console.log('💾 Data saved to Vercel KV (persist command failed, may have default TTL)');
            }
          }
        } catch (kvError) {
          console.warn('⚠️  Failed to save to Vercel KV:', kvError);
        }
      }

      // Save to file system (development)
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        try {
          const fs = await import('fs').then(m => m.promises);
          const path = await import('path');
          const dataDir = path.join(process.cwd(), '.data');
          const filePath = path.join(dataDir, 'leagues.json');
          
          await fs.mkdir(dataDir, { recursive: true });
          await fs.writeFile(filePath, jsonData, 'utf-8');
          console.log('💾 Data saved to file system');
        } catch (fsError) {
          console.warn('⚠️  Failed to save to file system:', fsError);
        }
      }

      // Update cache (permanent until manually deleted)
      this.cache = data;

    } catch (error) {
      console.error('❌ Error saving league data:', error);
      throw error;
    }
  }

  /**
   * Validate and migrate data structure
   */
  private validateAndMigrate(data: any): PersistentStorage {
    const defaultData = this.getDefaultData();

    // Ensure all required fields exist
    const validatedData: PersistentStorage = {
      leagues: Array.isArray(data.leagues) ? data.leagues : defaultData.leagues,
      userSessions: data.userSessions && typeof data.userSessions === 'object' 
        ? data.userSessions 
        : defaultData.userSessions,
      leagueIdCounter: typeof data.leagueIdCounter === 'number' 
        ? data.leagueIdCounter 
        : defaultData.leagueIdCounter,
      lastUpdated: data.lastUpdated || new Date().toISOString()
    };

    // Validate league structure
    validatedData.leagues = validatedData.leagues.map(league => ({
      ...league,
      memberCount: league.members ? league.members.filter(m => m.isActive).length : 0,
      updatedAt: league.updatedAt || new Date().toISOString()
    }));

    return validatedData;
  }

  /**
   * Delete a league (only creator can delete)
   */
  async deleteLeague(leagueId: string, userId: string): Promise<boolean> {
    try {
      const data = await this.loadData();
      
      // Find the league
      const league = data.leagues.find(l => l.id === leagueId);
      if (!league) {
        return false;
      }

      // Check if user is the creator
      if (league.creator !== userId) {
        throw new Error('Only the league creator can delete the league');
      }

      // Remove the league
      data.leagues = data.leagues.filter(l => l.id !== leagueId);

      // Remove league from all user sessions
      Object.keys(data.userSessions).forEach(sessionUserId => {
        const session = data.userSessions[sessionUserId];
        session.leagues = session.leagues.filter(id => id !== leagueId);
      });

      // Save the updated data
      await this.saveData(data);
      
      console.log(`🗑️ League ${leagueId} deleted by creator ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting league:', error);
      throw error;
    }
  }

  /**
   * Clear cache (force reload)
   */
  clearCache(): void {
    this.cache = null;
  }
}

// Export the singleton instance
export const leagueStorage = LeagueStorageManager.getInstance();
export type { League, LeagueMember, UserSession, PersistentStorage };