import { prisma } from '../../database';
import { ValidationError, UnauthorizedError, ConflictError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  displayName?: string;
}

export interface LoginData {
  emailOrUsername: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface RefreshTokenData {
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string | null;
    emailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly tokenService: TokenService;
  private readonly passwordService: PasswordService;
  private readonly maxLoginAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes

  constructor() {
    this.tokenService = new TokenService();
    this.passwordService = new PasswordService();
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      logger.info('Attempting user registration', { email: data.email, username: data.username });

      // Validate password strength
      const passwordValidation = this.passwordService.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        throw new ValidationError(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // Check for existing user
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            { username: data.username }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email === data.email) {
          throw new ConflictError('Email address is already registered');
        }
        if (existingUser.username === data.username) {
          throw new ConflictError('Username is already taken');
        }
      }

      // Hash password
      const hashedPassword = await this.passwordService.hashPassword(data.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          username: data.username,
          password: hashedPassword,
          displayName: data.displayName || null
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          emailVerified: true
        }
      });

      // Generate tokens
      const tokenFamily = this.tokenService.generateTokenFamily();
      const tokens = await this.tokenService.generateTokens(user);

      // Store refresh token
      await this.tokenService.createRefreshToken(
        user.id,
        tokens.refreshToken,
        tokenFamily
      );

      logger.info('User registered successfully', { userId: user.id, email: user.email });

      return {
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Authenticate user login
   */
  async login(data: LoginData): Promise<AuthResult> {
    try {
      logger.info('Attempting user login', { identifier: data.emailOrUsername });

      // Find user by email or username
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.emailOrUsername },
            { username: data.emailOrUsername }
          ]
        },
        select: {
          id: true,
          email: true,
          username: true,
          password: true,
          displayName: true,
          emailVerified: true,
          isActive: true,
          loginAttempts: true,
          lockedAt: true
        }
      });

      // Always record login attempt
      await this.recordLoginAttempt(
        user?.id || null,
        data.emailOrUsername,
        data.ipAddress || 'unknown',
        data.userAgent || null,
        false // Will be updated to true if successful
      );

      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Check if account is locked
      if (user.lockedAt && user.lockedAt > new Date(Date.now() - this.lockoutDuration)) {
        throw new UnauthorizedError('Account is temporarily locked due to too many failed login attempts');
      }

      // Check if account is active
      if (!user.isActive) {
        throw new UnauthorizedError('Account has been deactivated');
      }

      // Verify password
      const isPasswordValid = await this.passwordService.comparePassword(data.password, user.password);
      
      if (!isPasswordValid) {
        // Increment login attempts
        const newAttempts = user.loginAttempts + 1;
        const updateData: any = {
          loginAttempts: newAttempts
        };

        // Lock account if too many attempts
        if (newAttempts >= this.maxLoginAttempts) {
          updateData.lockedAt = new Date();
          logger.warn('Account locked due to failed login attempts', { userId: user.id });
        }

        await prisma.user.update({
          where: { id: user.id },
          data: updateData
        });

        throw new UnauthorizedError('Invalid credentials');
      }

      // Successful login - reset login attempts and update last login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0,
          lockedAt: null,
          lastLoginAt: new Date(),
          loginCount: { increment: 1 }
        }
      });

      // Update the login attempt record to successful
      await this.recordLoginAttempt(
        user.id,
        data.emailOrUsername,
        data.ipAddress || 'unknown',
        data.userAgent || null,
        true
      );

      // Generate tokens
      const tokenFamily = this.tokenService.generateTokenFamily();
      const tokens = await this.tokenService.generateTokens({
        id: user.id,
        email: user.email,
        username: user.username
      });

      // Store refresh token
      await this.tokenService.createRefreshToken(
        user.id,
        tokens.refreshToken,
        tokenFamily,
        data.userAgent,
        data.ipAddress
      );

      logger.info('User login successful', { userId: user.id });

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(data: RefreshTokenData): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      logger.debug('Attempting token refresh');

      // Verify refresh token
      const refreshTokenData = await this.tokenService.verifyRefreshToken(data.refreshToken);

      // Check for token reuse (security breach detection)
      if (refreshTokenData.isRevoked) {
        logger.warn('Token reuse detected - revoking token family', { 
          family: refreshTokenData.family,
          userId: refreshTokenData.userId 
        });
        
        // Revoke entire token family
        await this.tokenService.revokeTokenFamily(refreshTokenData.family);
        throw new UnauthorizedError('Token has been compromised');
      }

      // Revoke current refresh token
      await this.tokenService.revokeRefreshToken(data.refreshToken);

      // Generate new token pair
      const tokens = await this.tokenService.generateTokens({
        id: refreshTokenData.user.id,
        email: refreshTokenData.user.email,
        username: refreshTokenData.user.username
      });

      // Create new refresh token in same family
      await this.tokenService.createRefreshToken(
        refreshTokenData.userId,
        tokens.refreshToken,
        refreshTokenData.family,
        data.userAgent,
        data.ipAddress
      );

      // Update last used timestamp
      await prisma.refreshToken.update({
        where: { id: refreshTokenData.id },
        data: { lastUsedAt: new Date() }
      });

      logger.debug('Token refresh successful', { userId: refreshTokenData.userId });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Logout user and revoke refresh token
   */
  async logout(refreshToken: string): Promise<{ success: boolean }> {
    try {
      logger.debug('Attempting logout');

      await this.tokenService.revokeRefreshToken(refreshToken);

      logger.info('User logged out successfully');
      return { success: true };
    } catch (error) {
      logger.error('Logout failed:', error);
      // Don't throw error for logout - just log it
      return { success: true };
    }
  }

  /**
   * Initiate password reset
   */
  async resetPassword(email: string): Promise<{ success: boolean }> {
    try {
      logger.info('Password reset requested', { email });

      const user = await prisma.user.findUnique({
        where: { email }
      });

      // Always return success to prevent email enumeration
      if (!user) {
        logger.info('Password reset requested for non-existent email', { email });
        return { success: true };
      }

      // Generate reset token
      const resetToken = await this.tokenService.generatePasswordResetToken(user.id);

      // TODO: Send email with reset token
      logger.info('Password reset token generated', { userId: user.id, resetToken });

      return { success: true };
    } catch (error) {
      logger.error('Password reset failed:', error);
      throw error;
    }
  }

  /**
   * Confirm password reset with token
   */
  async confirmPasswordReset(data: { token: string; newPassword: string }): Promise<{ success: boolean }> {
    try {
      logger.info('Attempting password reset confirmation');

      // Validate new password
      const passwordValidation = this.passwordService.validatePassword(data.newPassword);
      if (!passwordValidation.isValid) {
        throw new ValidationError(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // Verify reset token
      const userId = await this.tokenService.verifyPasswordResetToken(data.token);

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new UnauthorizedError('Invalid reset token');
      }

      // Hash new password
      const hashedPassword = await this.passwordService.hashPassword(data.newPassword);

      // Update password and reset login attempts
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          loginAttempts: 0,
          lockedAt: null
        }
      });

      // Revoke all existing refresh tokens for security
      await this.revokeAllUserTokens(userId);

      logger.info('Password reset successful', { userId });
      return { success: true };
    } catch (error) {
      logger.error('Password reset confirmation failed:', error);
      throw error;
    }
  }

  /**
   * Validate user by ID (for middleware)
   */
  async validateUser(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          emailVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return user;
    } catch (error) {
      logger.error('User validation failed:', error);
      return null;
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<{ success: boolean; revokedCount: number }> {
    try {
      const result = await prisma.refreshToken.updateMany({
        where: {
          userId,
          isRevoked: false
        },
        data: { isRevoked: true }
      });

      logger.info('All user tokens revoked', { userId, count: result.count });
      
      return { 
        success: true, 
        revokedCount: result.count 
      };
    } catch (error) {
      logger.error('Failed to revoke user tokens:', error);
      throw error;
    }
  }

  /**
   * Record login attempt for audit and security
   */
  private async recordLoginAttempt(
    userId: string | null,
    identifier: string,
    ipAddress: string,
    userAgent: string | null,
    success: boolean
  ): Promise<void> {
    try {
      await prisma.loginAttempt.create({
        data: {
          userId,
          identifier,
          ipAddress,
          userAgent,
          success
        }
      });
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      logger.error('Failed to record login attempt:', error);
    }
  }

  /**
   * Get user's login history
   */
  async getLoginHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const attempts = await prisma.loginAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          identifier: true,
          ipAddress: true,
          userAgent: true,
          success: true,
          createdAt: true
        }
      });

      return attempts;
    } catch (error) {
      logger.error('Failed to get login history:', error);
      throw error;
    }
  }

  /**
   * Clean up old login attempts (for maintenance)
   */
  async cleanupOldLoginAttempts(olderThanDays: number = 90): Promise<{ deletedCount: number }> {
    try {
      const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
      
      const result = await prisma.loginAttempt.deleteMany({
        where: {
          createdAt: { lt: cutoffDate }
        }
      });

      logger.info(`Cleaned up ${result.count} old login attempts`);
      return { deletedCount: result.count };
    } catch (error) {
      logger.error('Failed to cleanup old login attempts:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
