import * as jwt from 'jsonwebtoken';
import { logger } from '../../utils/logger';
import { randomBytes } from 'crypto';
import { prisma } from '../../database';
import { cacheService } from '../cache/cache.service';

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenData {
  id: string;
  token: string;
  userId: string;
  family: string;
  expiresAt: Date;
  isRevoked: boolean;
  user?: any;
}

export class TokenService {
  private readonly jwtSecret: string;
  private readonly accessTokenExpiry = '15m';

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
  }

  /**
   * Generate access and refresh token pair
   */
  async generateTokens(user: { id: string; email: string; username: string; role?: string }): Promise<TokenPair> {
    try {
      const payload: TokenPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role || 'user'
      };

      // Generate access token
      const accessToken = jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.accessTokenExpiry,
        issuer: 'nfl-pickem-api',
        audience: 'nfl-pickem-client'
      });

      // Generate refresh token (secure random string)
      const refreshToken = this.generateSecureToken();

      logger.debug('Generated token pair for user', { userId: user.id });
      
      return {
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('Error generating tokens:', error);
      throw new Error('Failed to generate authentication tokens');
    }
  }

  /**
   * Verify and decode access token
   */
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      // Check if token is blacklisted
      const isBlacklisted = await cacheService.get(`blacklist:${token}`);
      if (isBlacklisted) {
        throw new Error('Token has been revoked');
      }

      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'nfl-pickem-api',
        audience: 'nfl-pickem-client'
      }) as TokenPayload;

      logger.debug('Access token verified successfully', { userId: decoded.userId });
      return decoded;
    } catch (error) {
      logger.debug('Access token verification failed:', error);
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token and return token data
   */
  async verifyRefreshToken(token: string): Promise<RefreshTokenData> {
    try {
      const refreshTokenData = await prisma.refreshToken.findUnique({
        where: { token },
        select: {
          id: true,
          token: true,
          userId: true,
          family: true,
          expiresAt: true,
          isRevoked: true,
          createdAt: true,
          lastUsedAt: true,
          ipAddress: true,
          userAgent: true,
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              isActive: true,
              emailVerified: true
            }
          }
        }
      });

      if (!refreshTokenData) {
        throw new Error('Refresh token not found');
      }

      if (refreshTokenData.isRevoked) {
        logger.warn('Attempted use of revoked refresh token', { 
          tokenId: refreshTokenData.id,
          userId: refreshTokenData.userId 
        });
        throw new Error('Refresh token has been revoked');
      }

      if (refreshTokenData.expiresAt < new Date()) {
        logger.debug('Refresh token expired', { tokenId: refreshTokenData.id });
        throw new Error('Refresh token has expired');
      }

      if (!refreshTokenData.user.isActive) {
        throw new Error('User account is disabled');
      }

      logger.debug('Refresh token verified successfully', { 
        tokenId: refreshTokenData.id,
        userId: refreshTokenData.userId 
      });

      return refreshTokenData;
    } catch (error) {
      logger.debug('Refresh token verification failed:', error);
      throw error;
    }
  }

  /**
   * Generate password reset token
   */
  async generatePasswordResetToken(userId: string): Promise<string> {
    try {
      const token = randomBytes(32).toString('hex');

      // Store token in cache with expiration (1 hour TTL)
      await cacheService.set(`reset:${token}`, userId, 3600);

      logger.info('Password reset token generated', { userId, tokenLength: token.length });
      return token;
    } catch (error) {
      logger.error('Failed to generate password reset token:', error);
      throw error;
    }
  }

  /**
   * Verify password reset token and return user ID
   */
  async verifyPasswordResetToken(token: string): Promise<string> {
    try {
      const userId = await cacheService.get(`reset:${token}`);
      
      if (!userId) {
        throw new Error('Invalid or expired reset token');
      }

      // Remove token after successful verification (single use)
      await cacheService.del(`reset:${token}`);

      logger.info('Password reset token verified', { userId });
      return userId as string;
    } catch (error) {
      logger.debug('Password reset token verification failed:', error);
      throw error;
    }
  }

  /**
   * Blacklist an access token
   */
  async blacklistToken(token: string): Promise<void> {
    try {
      // Decode token to get expiration
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await cacheService.set(`blacklist:${token}`, 'true', ttl);
        }
      }
      
      logger.debug('Token blacklisted successfully');
    } catch (error) {
      logger.error('Error blacklisting token:', error);
      throw new Error('Failed to blacklist token');
    }
  }

  /**
   * Create refresh token record in database
   */
  async createRefreshToken(
    userId: string, 
    token: string, 
    family: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await prisma.refreshToken.create({
        data: {
          token,
          userId,
          family,
          expiresAt,
          userAgent: userAgent || null,
          ipAddress: ipAddress || null
        }
      });

      logger.debug('Refresh token created in database', { userId, family });
    } catch (error) {
      logger.error('Error creating refresh token:', error);
      throw new Error('Failed to create refresh token');
    }
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(token: string): Promise<void> {
    try {
      await prisma.refreshToken.update({
        where: { token },
        data: { isRevoked: true }
      });

      logger.debug('Refresh token revoked');
    } catch (error) {
      logger.error('Error revoking refresh token:', error);
      throw new Error('Failed to revoke refresh token');
    }
  }

  /**
   * Revoke all tokens in a family (used for token theft detection)
   */
  async revokeTokenFamily(family: string): Promise<void> {
    try {
      await prisma.refreshToken.updateMany({
        where: { family },
        data: { isRevoked: true }
      });

      logger.warn('Token family revoked due to security breach', { family });
    } catch (error) {
      logger.error('Error revoking token family:', error);
      throw new Error('Failed to revoke token family');
    }
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<{ deletedCount: number }> {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isRevoked: true }
          ]
        }
      });

      logger.info(`Cleaned up ${result.count} expired/revoked tokens`);
      return { deletedCount: result.count };
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
      throw new Error('Failed to cleanup expired tokens');
    }
  }

  /**
   * Generate a cryptographically secure random token
   */
  private generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Generate a unique token family ID
   */
  generateTokenFamily(): string {
    return this.generateSecureToken(16);
  }

  /**
   * Get token stats for a user
   */
  async getUserTokenStats(userId: string): Promise<{
    activeTokens: number;
    totalTokens: number;
    lastActivity: Date | null;
  }> {
    try {
      const [activeCount, totalCount, lastToken] = await Promise.all([
        prisma.refreshToken.count({
          where: {
            userId,
            isRevoked: false,
            expiresAt: { gt: new Date() }
          }
        }),
        prisma.refreshToken.count({
          where: { userId }
        }),
        prisma.refreshToken.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        })
      ]);

      return {
        activeTokens: activeCount,
        totalTokens: totalCount,
        lastActivity: lastToken?.createdAt || null
      };
    } catch (error) {
      logger.error('Error getting user token stats:', error);
      throw new Error('Failed to get token statistics');
    }
  }
}
