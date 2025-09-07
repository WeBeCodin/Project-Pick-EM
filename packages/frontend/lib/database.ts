// Database client for frontend API routes
import { PrismaClient } from '@prisma/client';

// Global database instance for frontend
declare global {
  var __prisma: PrismaClient | undefined;
}

// Fallback for when no database is available (build time)
let prisma: PrismaClient;

try {
  // Use a global variable to prevent multiple Prisma instances in development
  prisma = globalThis.__prisma || new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder'
      }
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = prisma;
  }
} catch (error) {
  console.warn('Database not available during build, using fallback');
  // Create a mock client for build time
  prisma = {} as PrismaClient;
}

export { prisma };

// Database service functions
export class DatabaseService {
  
  // League operations
  static async createLeague(data: {
    name: string;
    description?: string;
    isPrivate: boolean;
    maxMembers?: number;
    scoringSystem: string;
    createdById: string;
    seasonId: string;
  }) {
    console.log('💾 Creating league in database:', data.name);
    
    // Generate unique invite code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return await prisma.league.create({
      data: {
        ...data,
        code,
        scoringSystem: data.scoringSystem.toUpperCase() as any,
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        creator: true,
        season: true
      }
    });
  }

  static async getLeagues() {
    console.log('📖 Loading leagues from database');
    return await prisma.league.findMany({
      where: {
        deletedAt: null
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        creator: true,
        season: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async getLeagueById(id: string) {
    console.log('📖 Loading league by ID from database:', id);
    return await prisma.league.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true
          }
        },
        creator: true,
        season: true
      }
    });
  }

  static async joinLeague(leagueId: string, userId: string) {
    console.log('🤝 User joining league in database:', { leagueId, userId });
    return await prisma.userLeague.create({
      data: {
        leagueId,
        userId,
        role: 'MEMBER',
        status: 'ACTIVE'
      },
      include: {
        user: true,
        league: true
      }
    });
  }

  // Pick operations
  static async createOrUpdatePick(data: {
    userId: string;
    weekId: string;
    gameId: string;
    selectedTeamId?: string;
    isHomeTeamPick?: boolean;
  }) {
    console.log('💾 Creating/updating pick in database:', data);
    
    // Use upsert to handle create or update
    return await prisma.pick.upsert({
      where: {
        userId_gameId: {
          userId: data.userId,
          gameId: data.gameId
        }
      },
      update: {
        selectedTeamId: data.selectedTeamId,
        isHomeTeamPick: data.isHomeTeamPick,
        updatedAt: new Date()
      },
      create: {
        userId: data.userId,
        weekId: data.weekId,
        gameId: data.gameId,
        selectedTeamId: data.selectedTeamId,
        isHomeTeamPick: data.isHomeTeamPick
      },
      include: {
        user: true,
        game: true,
        selectedTeam: true
      }
    });
  }

  static async getUserPicks(userId: string, weekId?: string) {
    console.log('📖 Loading user picks from database:', { userId, weekId });
    return await prisma.pick.findMany({
      where: {
        userId,
        ...(weekId && { weekId })
      },
      include: {
        game: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        },
        selectedTeam: true
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });
  }

  static async getPickCount(userId: string) {
    console.log('🔢 Counting user picks in database:', userId);
    return await prisma.pick.count({
      where: {
        userId,
        selectedTeamId: {
          not: null
        }
      }
    });
  }

  // User operations
  static async getOrCreateUser(userData: {
    email?: string;
    username: string;
    displayName?: string;
  }) {
    console.log('👤 Getting or creating user in database:', userData.username);
    
    // For demo purposes, create user if not exists
    return await prisma.user.upsert({
      where: {
        username: userData.username
      },
      update: {
        lastLoginAt: new Date(),
        loginCount: {
          increment: 1
        }
      },
      create: {
        username: userData.username,
        email: userData.email || `${userData.username}@demo.com`,
        displayName: userData.displayName || userData.username,
        password: 'demo', // Demo password
        emailVerified: true,
        isActive: true
      }
    });
  }

  // Get current season (demo purposes)
  static async getCurrentSeason() {
    console.log('📅 Getting current season from database');
    let season = await prisma.season.findFirst({
      where: {
        year: 2025,
        isActive: true
      }
    });

    // Create season if not exists
    if (!season) {
      console.log('📅 Creating 2025 season');
      season = await prisma.season.create({
        data: {
          year: 2025,
          startDate: new Date('2025-09-01'),
          endDate: new Date('2026-01-31'),
          isActive: true,
          isCurrent: true,
          weeksCount: 18,
          playoffWeeks: 4
        }
      });
    }

    return season;
  }

  // Leave a league
  static async leaveLeague(leagueId: string, userId: string) {
    console.log('👋 User leaving league in database:', { leagueId, userId });
    return await prisma.userLeague.deleteMany({
      where: {
        leagueId,
        userId
      }
    });
  }

  // Update league settings
  static async updateLeagueSettings(leagueId: string, settings: any) {
    console.log('⚙️ Updating league settings in database:', { leagueId, settings });
    return await prisma.league.update({
      where: { id: leagueId },
      data: {
        ...settings,
        updatedAt: new Date()
      },
      include: {
        members: {
          include: {
            user: true
          }
        },
        creator: true,
        season: true
      }
    });
  }

  static async getCurrentWeek() {
    console.log('📅 Getting current active week from database');
    return await prisma.week.findFirst({
      where: {
        isActive: true
      },
      orderBy: {
        startDate: 'asc'
      }
    });
  }

  static async getOrCreateCurrentWeek() {
    console.log('📅 Getting or creating current week');
    
    // Try to get current active week
    let currentWeek = await this.getCurrentWeek();
    
    if (!currentWeek) {
      // Get current season
      const currentSeason = await this.getCurrentSeason();
      
      if (currentSeason) {
        // Create Week 1 for the current season
        currentWeek = await prisma.week.create({
          data: {
            seasonId: currentSeason.id,
            weekNumber: 1,
            weekType: 'REGULAR',
            name: 'Week 1',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            pickDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            isActive: true
          }
        });
        console.log('✅ Created new Week 1 for season:', currentSeason.year);
      }
    }
    
    return currentWeek;
  }

  static async getOrCreateDefaultGames() {
    console.log('🏈 Getting or creating default games for current week');
    
    // Get current week
    const currentWeek = await this.getOrCreateCurrentWeek();
    if (!currentWeek) {
      console.error('❌ No current week available');
      return [];
    }

    // Check if games exist for this week
    const existingGames = await prisma.game.findMany({
      where: { weekId: currentWeek.id },
      include: {
        homeTeam: true,
        awayTeam: true
      }
    });

    if (existingGames.length > 0) {
      console.log(`✅ Found ${existingGames.length} existing games for week`);
      return existingGames;
    }

    // Get or create teams
    const teams = await this.getOrCreateDefaultTeams();
    if (teams.length < 2) {
      console.error('❌ Not enough teams to create games');
      return [];
    }

    // Create sample games for the week
    const gameDate = new Date();
    gameDate.setHours(gameDate.getHours() + 2); // Games start in 2 hours

    const gamesToCreate = [
      {
        homeTeamId: teams[0].id, // Tampa Bay
        awayTeamId: teams[1].id, // Atlanta
        kickoffTime: new Date(gameDate),
        tvNetwork: 'FOX'
      },
      {
        homeTeamId: teams[2].id, // Miami
        awayTeamId: teams[3].id, // Las Vegas
        kickoffTime: new Date(gameDate.getTime() + 3 * 60 * 60 * 1000), // 3 hours later
        tvNetwork: 'CBS'
      }
    ];

    const createdGames = [];
    for (const gameData of gamesToCreate) {
      try {
        const game = await prisma.game.create({
          data: {
            ...gameData,
            weekId: currentWeek.id,
            status: 'SCHEDULED'
          },
          include: {
            homeTeam: true,
            awayTeam: true
          }
        });
        createdGames.push(game);
      } catch (error) {
        console.error('Error creating game:', error);
      }
    }

    console.log(`✅ Created ${createdGames.length} games for current week`);
    return createdGames;
  }

  static async getOrCreateDefaultTeams() {
    console.log('🏈 Getting or creating default NFL teams');
    
    const existingTeams = await prisma.team.findMany();
    if (existingTeams.length > 0) {
      return existingTeams;
    }

    // Create sample NFL teams
    const teamsToCreate = [
      { 
        name: 'Buccaneers', 
        fullName: 'Tampa Bay Buccaneers',
        abbreviation: 'TB', 
        city: 'Tampa Bay', 
        conference: 'NFC' as const, 
        division: 'SOUTH' as const
      },
      { 
        name: 'Falcons', 
        fullName: 'Atlanta Falcons',
        abbreviation: 'ATL', 
        city: 'Atlanta', 
        conference: 'NFC' as const, 
        division: 'SOUTH' as const
      },
      { 
        name: 'Dolphins', 
        fullName: 'Miami Dolphins',
        abbreviation: 'MIA', 
        city: 'Miami', 
        conference: 'AFC' as const, 
        division: 'EAST' as const
      },
      { 
        name: 'Raiders', 
        fullName: 'Las Vegas Raiders',
        abbreviation: 'LV', 
        city: 'Las Vegas', 
        conference: 'AFC' as const, 
        division: 'WEST' as const
      }
    ];

    const createdTeams = [];
    for (const teamData of teamsToCreate) {
      try {
        const team = await prisma.team.create({
          data: teamData
        });
        createdTeams.push(team);
      } catch (error) {
        console.error('Error creating team:', error);
      }
    }

    console.log(`✅ Created ${createdTeams.length} teams`);
    return createdTeams;
  }
}
