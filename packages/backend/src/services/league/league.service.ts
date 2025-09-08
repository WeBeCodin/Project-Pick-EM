import { prisma } from '../../database';
import { logger } from '../../utils/logger';
import { AppError } from '../../utils/errors';
import { League, UserLeague, User, ScoringSystem } from '@prisma/client';
import { generateLeagueCode } from '../../utils/helpers';

export interface CreateLeagueDto {
  name: string;
  description?: string;
  isPrivate?: boolean;
  maxMembers?: number;
  allowLateJoin?: boolean;
  scoringSystem?: ScoringSystem;
  seasonId?: string;
}

export interface JoinLeagueDto {
  code: string;
  userId: string;
}

export interface LeagueWithMembers extends League {
  members: (UserLeague & {
    user: Pick<User, 'id' | 'username' | 'displayName'>;
  })[];
  creator: Pick<User, 'id' | 'username' | 'displayName'>;
  _count: {
    members: number;
  };
}

class LeagueService {
  /**
   * Create a new league
   */
  async createLeague(userId: string, data: CreateLeagueDto): Promise<LeagueWithMembers> {
    try {
      logger.info(`Creating league for user ${userId}`, { data });

      // Get current season if not provided
      let seasonId = data.seasonId;
      if (!seasonId) {
        const currentSeason = await prisma.season.findFirst({
          where: { 
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() }
          },
          orderBy: { startDate: 'desc' }
        });

        if (!currentSeason) {
          throw new AppError('No active season found', 400);
        }
        seasonId = currentSeason.id;
      }

      // Generate unique league code
      const code = await this.generateUniqueCode();

      // Create league with transaction
      const league = await prisma.$transaction(async (tx) => {
        // Create the league
        const newLeague = await tx.league.create({
          data: {
            name: data.name,
            description: data.description,
            code,
            isPrivate: data.isPrivate ?? true,
            maxMembers: data.maxMembers,
            allowLateJoin: data.allowLateJoin ?? true,
            scoringSystem: data.scoringSystem ?? 'STANDARD',
            seasonId,
            createdById: userId,
          },
          include: {
            creator: {
              select: { id: true, username: true, displayName: true }
            },
            members: {
              include: {
                user: {
                  select: { id: true, username: true, displayName: true }
                }
              }
            },
            _count: {
              select: { members: true }
            }
          }
        });

        // Add creator as a member
        await tx.userLeague.create({
          data: {
            userId,
            leagueId: newLeague.id,
            role: 'OWNER',
            status: 'ACTIVE'
          }
        });

        return newLeague;
      });

      // Fetch the complete league with updated member count
      const completeLeague = await this.getLeagueById(league.id);
      
      logger.info(`League created successfully: ${league.id}`);
      return completeLeague;

    } catch (error) {
      logger.error('Error creating league:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create league', 500);
    }
  }

  /**
   * Join a league by code
   */
  async joinLeague(data: JoinLeagueDto): Promise<LeagueWithMembers> {
    try {
      logger.info(`User ${data.userId} attempting to join league with code ${data.code}`);

      const league = await prisma.league.findUnique({
        where: { code: data.code },
        include: {
          creator: {
            select: { id: true, username: true, displayName: true }
          },
          members: {
            include: {
              user: {
                select: { id: true, username: true, displayName: true }
              }
            }
          },
          _count: {
            select: { members: true }
          }
        }
      });

      if (!league) {
        throw new AppError('League not found', 404);
      }

      // Check if league is full
      if (league.maxMembers && league._count.members >= league.maxMembers) {
        throw new AppError('League is full', 400);
      }

      // Check if user is already a member
      const existingMembership = await prisma.userLeague.findFirst({
        where: {
          userId: data.userId,
          leagueId: league.id,
          status: { not: 'INACTIVE' }
        }
      });

      if (existingMembership) {
        throw new AppError('Already a member of this league', 400);
      }

      // Add user to league
      await prisma.userLeague.create({
        data: {
          userId: data.userId,
          leagueId: league.id,
          role: 'MEMBER',
          status: 'ACTIVE'
        }
      });

      // Return updated league
      const updatedLeague = await this.getLeagueById(league.id);
      
      logger.info(`User ${data.userId} joined league ${league.id} successfully`);
      return updatedLeague;

    } catch (error) {
      logger.error('Error joining league:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to join league', 500);
    }
  }

  /**
   * Get user's leagues
   */
  async getUserLeagues(userId: string): Promise<LeagueWithMembers[]> {
    try {
      const userLeagues = await prisma.userLeague.findMany({
        where: {
          userId,
          status: 'ACTIVE'
        },
        include: {
          league: {
            include: {
              creator: {
                select: { id: true, username: true, displayName: true }
              },
              members: {
                where: { status: 'ACTIVE' },
                include: {
                  user: {
                    select: { id: true, username: true, displayName: true }
                  }
                }
              },
              _count: {
                select: { members: true }
              }
            }
          }
        },
        orderBy: { joinedAt: 'desc' }
      });

      return userLeagues.map(ul => ul.league);
    } catch (error) {
      logger.error('Error fetching user leagues:', error);
      throw new AppError('Failed to fetch leagues', 500);
    }
  }

  /**
   * Get public leagues
   */
  async getPublicLeagues(limit: number = 20): Promise<LeagueWithMembers[]> {
    try {
      const leagues = await prisma.league.findMany({
        where: {
          isPrivate: false,
          deletedAt: null
        },
        include: {
          creator: {
            select: { id: true, username: true, displayName: true }
          },
          members: {
            where: { status: 'ACTIVE' },
            include: {
              user: {
                select: { id: true, username: true, displayName: true }
              }
            }
          },
          _count: {
            select: { members: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return leagues;
    } catch (error) {
      logger.error('Error fetching public leagues:', error);
      throw new AppError('Failed to fetch public leagues', 500);
    }
  }

  /**
   * Get league by ID
   */
  async getLeagueById(leagueId: string): Promise<LeagueWithMembers> {
    try {
      const league = await prisma.league.findUnique({
        where: { id: leagueId },
        include: {
          creator: {
            select: { id: true, username: true, displayName: true }
          },
          members: {
            where: { status: 'ACTIVE' },
            include: {
              user: {
                select: { id: true, username: true, displayName: true }
              }
            }
          },
          _count: {
            select: { members: true }
          }
        }
      });

      if (!league) {
        throw new AppError('League not found', 404);
      }

      return league;
    } catch (error) {
      logger.error('Error fetching league:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch league', 500);
    }
  }

  /**
   * Leave a league
   */
  async leaveLeague(userId: string, leagueId: string): Promise<void> {
    try {
      const membership = await prisma.userLeague.findFirst({
        where: {
          userId,
          leagueId,
          status: 'ACTIVE'
        },
        include: {
          league: true
        }
      });

      if (!membership) {
        throw new AppError('Not a member of this league', 400);
      }

      // Cannot leave if you're the creator
      if (membership.role === 'OWNER') {
        throw new AppError('League creator cannot leave. Transfer ownership or delete the league.', 400);
      }

      // Update membership status
      await prisma.userLeague.update({
        where: { id: membership.id },
        data: { 
          status: 'INACTIVE'
        }
      });

      logger.info(`User ${userId} left league ${leagueId}`);
    } catch (error) {
      logger.error('Error leaving league:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to leave league', 500);
    }
  }

  /**
   * Generate a unique league code
   */
  private async generateUniqueCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = generateLeagueCode();
      
      const existing = await prisma.league.findUnique({
        where: { code }
      });

      if (!existing) {
        return code;
      }
      
      attempts++;
    }

    throw new AppError('Failed to generate unique league code', 500);
  }

  /**
   * Check if user is member of league
   */
  async isUserMember(userId: string, leagueId: string): Promise<boolean> {
    try {
      const membership = await prisma.userLeague.findFirst({
        where: {
          userId,
          leagueId,
          status: 'ACTIVE'
        }
      });

      return !!membership;
    } catch (error) {
      logger.error('Error checking membership:', error);
      return false;
    }
  }
}

export const leagueService = new LeagueService();
