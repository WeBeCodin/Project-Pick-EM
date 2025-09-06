// Database client for frontend API routes
let PrismaClient: any;
let prisma: any = null;

// Dynamic import to avoid build-time dependency
async function getPrismaClient() {
  if (!prisma && process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('placeholder')) {
    try {
      const { PrismaClient: PC } = await import('@prisma/client');
      PrismaClient = PC;
      prisma = new PC({
        log: ['error', 'warn'],
      });
      console.log('✅ Database client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize database client:', error);
      return null;
    }
  }
  return prisma;
}

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
}
