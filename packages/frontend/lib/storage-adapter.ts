// Storage adapter that can use either database or persistent file storage
import { DatabaseService, prisma } from './database';
import fs from 'fs/promises';
import path from 'path';

// File-based storage for when database is not available
const STORAGE_DIR = '/tmp/pickem-storage';
const LEAGUES_FILE = path.join(STORAGE_DIR, 'leagues.json');

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

interface LeagueMember {
  userId: string;
  username: string;
  joinedAt: string;
  role: 'owner' | 'member';
  status: 'ACTIVE' | 'INACTIVE';
  isActive: boolean;
}

export class StorageAdapter {
  private static isDatabaseAvailable: boolean | null = null;

  // Check if database is available
  static async checkDatabaseConnection(): Promise<boolean> {
    if (this.isDatabaseAvailable !== null) {
      return this.isDatabaseAvailable;
    }

    try {
      await prisma.$queryRaw`SELECT 1`;
      this.isDatabaseAvailable = true;
      console.log('✅ Database connection available');
      return true;
    } catch (error) {
      this.isDatabaseAvailable = false;
      console.log('⚠️ Database not available, using file storage fallback');
      return false;
    }
  }

  // Ensure file storage directory exists
  static async ensureStorageDir(): Promise<void> {
    try {
      await fs.mkdir(STORAGE_DIR, { recursive: true });
    } catch (error) {
      console.warn('Could not create storage directory:', error);
    }
  }

  // Load leagues from file storage
  static async loadLeaguesFromFile(): Promise<League[]> {
    try {
      await this.ensureStorageDir();
      const data = await fs.readFile(LEAGUES_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.log('No existing leagues file found, starting with empty array');
      return [];
    }
  }

  // Save leagues to file storage
  static async saveLeaguesToFile(leagues: League[]): Promise<void> {
    try {
      await this.ensureStorageDir();
      await fs.writeFile(LEAGUES_FILE, JSON.stringify(leagues, null, 2));
      console.log('✅ Leagues saved to persistent file storage');
    } catch (error) {
      console.error('❌ Failed to save leagues to file:', error);
    }
  }

  // Get all leagues (database or file)
  static async getLeagues(): Promise<League[]> {
    const isDatabaseAvailable = await this.checkDatabaseConnection();
    
    if (isDatabaseAvailable) {
      try {
        const dbLeagues = await DatabaseService.getLeagues();
        return dbLeagues.map(this.formatLeagueFromDatabase);
      } catch (error) {
        console.error('Database error, falling back to file storage:', error);
        return await this.loadLeaguesFromFile();
      }
    } else {
      return await this.loadLeaguesFromFile();
    }
  }

  // Create league (database or file)
  static async createLeague(data: {
    name: string;
    description: string;
    isPrivate: boolean;
    maxMembers: number;
    scoringSystem: string;
    createdById: string;
    username: string;
  }): Promise<League> {
    const isDatabaseAvailable = await this.checkDatabaseConnection();
    
    if (isDatabaseAvailable) {
      try {
        // Get current season for database
        const currentSeason = await DatabaseService.getCurrentSeason();
        if (!currentSeason) {
          throw new Error('No active season available');
        }

        const dbLeague = await DatabaseService.createLeague({
          ...data,
          seasonId: currentSeason.id
        });

        // Create owner membership
        await DatabaseService.joinLeague(dbLeague.id, data.createdById);

        // Re-fetch with complete data
        const completeLeague = await DatabaseService.getLeagueById(dbLeague.id);
        return this.formatLeagueFromDatabase(completeLeague);
      } catch (error) {
        console.error('Database error creating league, falling back to file storage:', error);
      }
    }

    // File storage fallback
    const leagues = await this.loadLeaguesFromFile();
    const newLeague: League = {
      id: `league_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      description: data.description,
      code: this.generateLeagueCode(),
      creator: data.createdById,
      members: [
        {
          userId: data.createdById,
          username: data.username,
          joinedAt: new Date().toISOString(),
          role: 'owner',
          status: 'ACTIVE',
          isActive: true
        }
      ],
      maxMembers: data.maxMembers,
      isPrivate: data.isPrivate,
      scoringType: data.scoringSystem as 'STANDARD' | 'CONFIDENCE',
      scoringSystem: data.scoringSystem as 'STANDARD' | 'CONFIDENCE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      memberCount: 1
    };

    leagues.push(newLeague);
    await this.saveLeaguesToFile(leagues);
    
    console.log('✅ League created in file storage:', newLeague.name);
    return newLeague;
  }

  // Join league (database or file)
  static async joinLeague(leagueId: string, userId: string, username: string): Promise<League | null> {
    const isDatabaseAvailable = await this.checkDatabaseConnection();
    
    if (isDatabaseAvailable) {
      try {
        await DatabaseService.joinLeague(leagueId, userId);
        const updatedLeague = await DatabaseService.getLeagueById(leagueId);
        return updatedLeague ? this.formatLeagueFromDatabase(updatedLeague) : null;
      } catch (error) {
        console.error('Database error joining league, falling back to file storage:', error);
      }
    }

    // File storage fallback
    const leagues = await this.loadLeaguesFromFile();
    const league = leagues.find(l => l.id === leagueId);
    
    if (!league) {
      return null;
    }

    // Check if already a member
    const existingMember = league.members.find(m => m.userId === userId);
    if (existingMember) {
      if (existingMember.isActive) {
        throw new Error('Already a member of this league');
      } else {
        // Reactivate inactive member
        existingMember.isActive = true;
        existingMember.status = 'ACTIVE';
        existingMember.joinedAt = new Date().toISOString();
      }
    } else {
      // Add new member
      league.members.push({
        userId,
        username,
        joinedAt: new Date().toISOString(),
        role: 'member',
        status: 'ACTIVE',
        isActive: true
      });
    }

    league.memberCount = league.members.filter(m => m.isActive).length;
    league.updatedAt = new Date().toISOString();

    await this.saveLeaguesToFile(leagues);
    console.log('✅ User joined league in file storage:', username, 'to', league.name);
    
    return league;
  }

  // Leave league (database or file)
  static async leaveLeague(leagueId: string, userId: string): Promise<boolean> {
    const isDatabaseAvailable = await this.checkDatabaseConnection();
    
    if (isDatabaseAvailable) {
      try {
        await DatabaseService.leaveLeague(leagueId, userId);
        return true;
      } catch (error) {
        console.error('Database error leaving league, falling back to file storage:', error);
      }
    }

    // File storage fallback
    const leagues = await this.loadLeaguesFromFile();
    const league = leagues.find(l => l.id === leagueId);
    
    if (!league) {
      return false;
    }

    const member = league.members.find(m => m.userId === userId && m.isActive);
    if (!member) {
      return false;
    }

    // Mark as inactive
    member.isActive = false;
    member.status = 'INACTIVE';
    
    league.memberCount = league.members.filter(m => m.isActive).length;
    league.updatedAt = new Date().toISOString();

    await this.saveLeaguesToFile(leagues);
    console.log('✅ User left league in file storage');
    
    return true;
  }

  // Helper to format database league
  private static formatLeagueFromDatabase(dbLeague: any): League {
    const members = dbLeague.members?.map((member: any) => ({
      userId: member.user?.id || member.userId,
      username: member.user?.username || member.user?.displayName || 'Unknown',
      joinedAt: member.joinedAt?.toISOString() || new Date().toISOString(),
      role: member.role?.toLowerCase() === 'owner' ? 'owner' as const : 'member' as const,
      status: member.status || 'ACTIVE' as const,
      isActive: member.status === 'ACTIVE'
    })) || [];

    return {
      id: dbLeague.id,
      name: dbLeague.name,
      description: dbLeague.description || '',
      code: dbLeague.code,
      creator: dbLeague.createdById || dbLeague.creator?.id || 'unknown',
      members,
      maxMembers: dbLeague.maxMembers || 20,
      isPrivate: dbLeague.isPrivate,
      scoringType: dbLeague.scoringSystem,
      scoringSystem: dbLeague.scoringSystem,
      createdAt: dbLeague.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: dbLeague.updatedAt?.toISOString() || new Date().toISOString(),
      memberCount: members.filter((m: LeagueMember) => m.isActive).length
    };
  }

  // Generate unique league code
  private static generateLeagueCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }
}