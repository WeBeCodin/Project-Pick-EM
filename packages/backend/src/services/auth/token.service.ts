import * as jwt from 'jsonwebtoken';
import { config } from '../../config';

export interface JwtPayload {
  userId: string;
  username?: string;
  email?: string;
  role?: string;
}

/**
 * TokenService encapsulates JWT sign/verify operations for access and refresh tokens.
 */
export class TokenService {
  /**
   * Sign an access token with short expiration.
   */
  signAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.JWT_SECRET as jwt.Secret, {
      expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    } as jwt.SignOptions);
  }

  /**
   * Verify an access token and return payload if valid.
   */
  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
  }

  /**
   * Sign a refresh token with longer expiration.
   */
  signRefreshToken(payload: JwtPayload & { family?: string }): string {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET as jwt.Secret, {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    } as jwt.SignOptions);
  }

  /**
   * Verify a refresh token and return payload if valid.
   */
  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtPayload;
  }
}

export const tokenService = new TokenService();
