import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AuthService } from '../auth.service';
import { TokenService } from '../token.service';
import { PasswordService } from '../password.service';
import { prisma } from '../../../database';
import { ValidationError, UnauthorizedError, ConflictError } from '../../../utils/errors';

// Mock dependencies
jest.mock('../../../database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn()
    },
    loginAttempt: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn()
    }
  }
}));

jest.mock('../token.service');
jest.mock('../password.service');
jest.mock('../../cache/cache.service');
jest.mock('../../../utils/logger');

describe('AuthService', () => {
  let authService: AuthService;
  let mockTokenService: jest.Mocked<TokenService>;
  let mockPasswordService: jest.Mocked<PasswordService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword123',
    displayName: 'Test User',
    emailVerified: true,
    isActive: true,
    lastLoginAt: new Date(),
    loginAttempts: 0,
    lockedAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocked dependencies
    mockTokenService = new TokenService() as jest.Mocked<TokenService>;
    mockPasswordService = new PasswordService() as jest.Mocked<PasswordService>;
    
    authService = new AuthService();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('register', () => {
    const validRegistrationData = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'SecureP@ss123',
      displayName: 'New User'
    };

    it('should successfully register a new user', async () => {
      // Arrange
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      mockPasswordService.hashPassword.mockResolvedValue('hashedPassword123');
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      mockTokenService.generateTokens.mockResolvedValue({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123'
      });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      // Act
      const result = await authService.register(validRegistrationData);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'access-token-123');
      expect(result).toHaveProperty('refreshToken', 'refresh-token-123');
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith('SecureP@ss123');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictError if email already exists', async () => {
      // Arrange
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.register(validRegistrationData))
        .rejects.toThrow(ConflictError);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: validRegistrationData.email },
            { username: validRegistrationData.username }
          ]
        }
      });
    });

    it('should throw ValidationError for weak password', async () => {
      // Arrange
      const weakPasswordData = { ...validRegistrationData, password: '123' };
      mockPasswordService.validatePassword.mockReturnValue({
        isValid: false,
        errors: ['Password must be at least 8 characters']
      });

      // Act & Assert
      await expect(authService.register(weakPasswordData))
        .rejects.toThrow(ValidationError);
      expect(mockPasswordService.validatePassword).toHaveBeenCalledWith('123');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      (prisma.user.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(authService.register(validRegistrationData))
        .rejects.toThrow('Database error');
    });
  });

  describe('login', () => {
    const validLoginData = {
      emailOrUsername: 'testuser',
      password: 'SecureP@ss123',
      userAgent: 'Mozilla/5.0...',
      ipAddress: '192.168.1.1'
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      mockPasswordService.comparePassword.mockResolvedValue(true);
      mockTokenService.generateTokens.mockResolvedValue({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123'
      });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await authService.login(validLoginData);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'access-token-123');
      expect(result).toHaveProperty('refreshToken', 'refresh-token-123');
      expect(mockPasswordService.comparePassword).toHaveBeenCalledWith('SecureP@ss123', 'hashedPassword123');
    });

    it('should throw UnauthorizedError for invalid credentials', async () => {
      // Arrange
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      mockPasswordService.comparePassword.mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(validLoginData))
        .rejects.toThrow(UnauthorizedError);
      expect(prisma.loginAttempt.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedError for non-existent user', async () => {
      // Arrange
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(validLoginData))
        .rejects.toThrow(UnauthorizedError);
    });

    it('should handle account lockout after failed attempts', async () => {
      // Arrange
      const lockedUser = { ...mockUser, loginAttempts: 5, lockedAt: new Date() };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(lockedUser);

      // Act & Assert
      await expect(authService.login(validLoginData))
        .rejects.toThrow(UnauthorizedError);
    });

    it('should reset login attempts on successful login', async () => {
      // Arrange
      const userWithAttempts = { ...mockUser, loginAttempts: 2 };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(userWithAttempts);
      mockPasswordService.comparePassword.mockResolvedValue(true);
      mockTokenService.generateTokens.mockResolvedValue({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123'
      });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      // Act
      await authService.login(validLoginData);

      // Assert
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userWithAttempts.id },
        data: {
          loginAttempts: 0,
          lockedAt: null,
          lastLoginAt: expect.any(Date)
        }
      });
    });
  });

  describe('refreshToken', () => {
    const validRefreshTokenData = {
      refreshToken: 'valid-refresh-token',
      userAgent: 'Mozilla/5.0...',
      ipAddress: '192.168.1.1'
    };

    it('should successfully refresh tokens', async () => {
      // Arrange
      const mockRefreshToken = {
        id: 'token-123',
        token: 'valid-refresh-token',
        userId: 'user-123',
        family: 'family-123',
        expiresAt: new Date(Date.now() + 86400000),
        isRevoked: false,
        user: mockUser
      };

      mockTokenService.verifyRefreshToken.mockResolvedValue(mockRefreshToken);
      mockTokenService.generateTokens.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      });
      (prisma.refreshToken.update as jest.Mock).mockResolvedValue({});
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue({});

      // Act
      const result = await authService.refreshToken(validRefreshTokenData);

      // Assert
      expect(result).toHaveProperty('accessToken', 'new-access-token');
      expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
      expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should revoke token family on reuse detection', async () => {
      // Arrange
      const revokedToken = {
        id: 'token-123',
        token: 'revoked-refresh-token',
        userId: 'user-123',
        family: 'family-123',
        expiresAt: new Date(Date.now() + 86400000),
        isRevoked: true,
        user: mockUser
      };

      mockTokenService.verifyRefreshToken.mockResolvedValue(revokedToken);

      // Act & Assert
      await expect(authService.refreshToken(validRefreshTokenData))
        .rejects.toThrow(UnauthorizedError);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { family: 'family-123' },
        data: { isRevoked: true }
      });
    });
  });

  describe('logout', () => {
    it('should successfully logout and revoke refresh token', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      (prisma.refreshToken.update as jest.Mock).mockResolvedValue({});

      // Act
      const result = await authService.logout(refreshToken);

      // Assert
      expect(result).toEqual({ success: true });
      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { token: refreshToken },
        data: { isRevoked: true }
      });
    });
  });

  describe('resetPassword', () => {
    it('should successfully initiate password reset', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockTokenService.generatePasswordResetToken.mockResolvedValue('reset-token-123');

      // Act
      const result = await authService.resetPassword('test@example.com');

      // Assert
      expect(result).toEqual({ success: true });
      expect(mockTokenService.generatePasswordResetToken).toHaveBeenCalledWith(mockUser.id);
    });

    it('should not reveal if email does not exist', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await authService.resetPassword('nonexistent@example.com');

      // Assert
      expect(result).toEqual({ success: true });
      expect(mockTokenService.generatePasswordResetToken).not.toHaveBeenCalled();
    });
  });

  describe('confirmPasswordReset', () => {
    const validResetData = {
      token: 'valid-reset-token',
      newPassword: 'NewSecureP@ss123'
    };

    it('should successfully reset password with valid token', async () => {
      // Arrange
      mockTokenService.verifyPasswordResetToken.mockResolvedValue('user-123');
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      mockPasswordService.hashPassword.mockResolvedValue('newHashedPassword');
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await authService.confirmPasswordReset(validResetData);

      // Assert
      expect(result).toEqual({ success: true });
      expect(mockPasswordService.hashPassword).toHaveBeenCalledWith('NewSecureP@ss123');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { password: 'newHashedPassword' }
      });
    });

    it('should throw UnauthorizedError for invalid token', async () => {
      // Arrange
      mockTokenService.verifyPasswordResetToken.mockRejectedValue(new Error('Invalid token'));

      // Act & Assert
      await expect(authService.confirmPasswordReset(validResetData))
        .rejects.toThrow(UnauthorizedError);
    });
  });

  describe('validateUser', () => {
    it('should return user for valid user ID', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await authService.validateUser('user-123');

      // Assert
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          isEmailVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });
    });

    it('should return null for non-existent user', async () => {
      // Arrange
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await authService.validateUser('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all tokens for a user', async () => {
      // Arrange
      (prisma.refreshToken.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      // Act
      const result = await authService.revokeAllUserTokens('user-123');

      // Assert
      expect(result).toEqual({ success: true, revokedCount: 3 });
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          isRevoked: false
        },
        data: { isRevoked: true }
      });
    });
  });
});
