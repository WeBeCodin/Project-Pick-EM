/**
 * Environment Configuration
 * Centralizes all environment variable handling
 */

import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

interface Config {
  // Application
  NODE_ENV: string;
  PORT: number;
  API_BASE_URL: string;
  FRONTEND_URL: string;

  // Database
  DATABASE_URL: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_SSL: boolean;

  // Redis
  REDIS_URL: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  REDIS_DB: number;

  // Authentication
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  BCRYPT_ROUNDS: number;
  SESSION_SECRET: string;

  // Security
  CORS_ORIGINS: string[];
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;

  // Email
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER?: string;
  EMAIL_PASSWORD?: string;
  EMAIL_FROM: string;
  EMAIL_PROVIDER: string;
  SENDGRID_API_KEY?: string;

  // NFL API
  NFL_API_BASE_URL: string;
  NFL_API_KEY?: string;
  NFL_API_VERSION: string;
  SPORTS_API_KEY?: string;

  // Logging
  LOG_LEVEL: string;
  LOG_FORMAT: string;

  // File Upload
  UPLOAD_DIR: string;
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string[];

  // Caching
  CACHE_TTL: number;
  CACHE_PREFIX: string;

  // Monitoring
  HEALTH_CHECK_URL: string;
  METRICS_URL: string;

  // Development
  DEBUG?: string;
  PRISMA_DEBUG: boolean;
  ENABLE_QUERY_LOGGING: boolean;
}

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value as string;
};

const getEnvAsNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value && defaultValue !== undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value as string, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }
  return parsed;
};

const getEnvAsBoolean = (key: string, defaultValue = false): boolean => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

const getEnvAsArray = (key: string, defaultValue: string[] = []): string[] => {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.split(',').map((item: string) => item.trim());
};

export const config: Config = {
  // Application
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: getEnvAsNumber('PORT', 3001),
  API_BASE_URL: getEnv('API_BASE_URL', 'http://localhost:3001'),
  FRONTEND_URL: getEnv('FRONTEND_URL', 'http://localhost:3000'),

  // Database
  DATABASE_URL: getEnv('DATABASE_URL'),
  DB_HOST: getEnv('DB_HOST', 'localhost'),
  DB_PORT: getEnvAsNumber('DB_PORT', 5432),
  DB_NAME: getEnv('DB_NAME', 'nfl_pickem'),
  DB_USER: getEnv('DB_USER', 'pickem_user'),
  DB_PASSWORD: getEnv('DB_PASSWORD', 'pickem_password'),
  DB_SSL: getEnvAsBoolean('DB_SSL', false),

  // Redis
  REDIS_URL: getEnv('REDIS_URL', 'redis://localhost:6379'),
  REDIS_HOST: getEnv('REDIS_HOST', 'localhost'),
  REDIS_PORT: getEnvAsNumber('REDIS_PORT', 6379),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: getEnvAsNumber('REDIS_DB', 0),

  // Authentication
  JWT_SECRET: getEnv('JWT_SECRET'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
  JWT_EXPIRES_IN: getEnv('JWT_EXPIRES_IN', '15m'),
  JWT_REFRESH_EXPIRES_IN: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  BCRYPT_ROUNDS: getEnvAsNumber('BCRYPT_ROUNDS', 12),
  SESSION_SECRET: getEnv('SESSION_SECRET'),

  // Security
  CORS_ORIGINS: getEnvAsArray('CORS_ORIGINS', ['http://localhost:3000']),
  RATE_LIMIT_WINDOW_MS: getEnvAsNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: getEnvAsNumber('RATE_LIMIT_MAX_REQUESTS', 100),

  // Email
  EMAIL_HOST: getEnv('EMAIL_HOST', 'localhost'),
  EMAIL_PORT: getEnvAsNumber('EMAIL_PORT', 1025),
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: getEnv('EMAIL_FROM', 'NFL Pick Em <noreply@nflpickem.local>'),
  EMAIL_PROVIDER: getEnv('EMAIL_PROVIDER', 'mailhog'),
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,

  // NFL API
  NFL_API_BASE_URL: getEnv('NFL_API_BASE_URL', 'https://api.nfl.com'),
  NFL_API_KEY: process.env.NFL_API_KEY,
  NFL_API_VERSION: getEnv('NFL_API_VERSION', 'v1'),
  SPORTS_API_KEY: process.env.SPORTS_API_KEY,

  // Logging
  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),
  LOG_FORMAT: getEnv('LOG_FORMAT', 'text'),

  // File Upload
  UPLOAD_DIR: getEnv('UPLOAD_DIR', './uploads'),
  MAX_FILE_SIZE: getEnvAsNumber('MAX_FILE_SIZE', 5242880), // 5MB
  ALLOWED_FILE_TYPES: getEnvAsArray('ALLOWED_FILE_TYPES', [
    'image/jpeg',
    'image/png',
    'image/gif',
  ]),

  // Caching
  CACHE_TTL: getEnvAsNumber('CACHE_TTL', 3600), // 1 hour
  CACHE_PREFIX: getEnv('CACHE_PREFIX', 'nfl-pickem:'),

  // Monitoring
  HEALTH_CHECK_URL: getEnv('HEALTH_CHECK_URL', '/health'),
  METRICS_URL: getEnv('METRICS_URL', '/metrics'),

  // Development
  DEBUG: process.env.DEBUG,
  PRISMA_DEBUG: getEnvAsBoolean('PRISMA_DEBUG', false),
  ENABLE_QUERY_LOGGING: getEnvAsBoolean('ENABLE_QUERY_LOGGING', true),
};

// Validate critical configuration
if (config.NODE_ENV === 'production') {
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'SESSION_SECRET',
    'DATABASE_URL',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`${envVar} is required in production`);
    }
  }
}

export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';

export default config;
