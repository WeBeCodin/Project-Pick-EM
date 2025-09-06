
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}




  const path = require('path')

/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  username: 'username',
  password: 'password',
  displayName: 'displayName',
  avatarUrl: 'avatarUrl',
  bio: 'bio',
  isActive: 'isActive',
  emailVerified: 'emailVerified',
  emailVerifiedAt: 'emailVerifiedAt',
  lastLoginAt: 'lastLoginAt',
  loginCount: 'loginCount',
  loginAttempts: 'loginAttempts',
  lockedAt: 'lockedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.RefreshTokenScalarFieldEnum = {
  id: 'id',
  token: 'token',
  userId: 'userId',
  family: 'family',
  expiresAt: 'expiresAt',
  isRevoked: 'isRevoked',
  createdAt: 'createdAt',
  lastUsedAt: 'lastUsedAt',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent'
};

exports.Prisma.LoginAttemptScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  identifier: 'identifier',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  success: 'success',
  createdAt: 'createdAt'
};

exports.Prisma.SeasonScalarFieldEnum = {
  id: 'id',
  year: 'year',
  startDate: 'startDate',
  endDate: 'endDate',
  isActive: 'isActive',
  isCurrent: 'isCurrent',
  weeksCount: 'weeksCount',
  playoffWeeks: 'playoffWeeks',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WeekScalarFieldEnum = {
  id: 'id',
  seasonId: 'seasonId',
  weekNumber: 'weekNumber',
  weekType: 'weekType',
  name: 'name',
  startDate: 'startDate',
  endDate: 'endDate',
  pickDeadline: 'pickDeadline',
  tiebreakerGameId: 'tiebreakerGameId',
  isActive: 'isActive',
  isComplete: 'isComplete',
  isScored: 'isScored',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TeamScalarFieldEnum = {
  id: 'id',
  abbreviation: 'abbreviation',
  city: 'city',
  name: 'name',
  fullName: 'fullName',
  conference: 'conference',
  division: 'division',
  logoUrl: 'logoUrl',
  primaryColor: 'primaryColor',
  secondaryColor: 'secondaryColor',
  espnId: 'espnId',
  cbsId: 'cbsId',
  foxId: 'foxId',
  currentWins: 'currentWins',
  currentLosses: 'currentLosses',
  currentTies: 'currentTies',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GameScalarFieldEnum = {
  id: 'id',
  weekId: 'weekId',
  homeTeamId: 'homeTeamId',
  awayTeamId: 'awayTeamId',
  kickoffTime: 'kickoffTime',
  tvNetwork: 'tvNetwork',
  homeScore: 'homeScore',
  awayScore: 'awayScore',
  status: 'status',
  quarter: 'quarter',
  timeRemaining: 'timeRemaining',
  possession: 'possession',
  espnGameId: 'espnGameId',
  cbsGameId: 'cbsGameId',
  foxGameId: 'foxGameId',
  lastUpdatedFrom: 'lastUpdatedFrom',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PickScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  weekId: 'weekId',
  gameId: 'gameId',
  selectedTeamId: 'selectedTeamId',
  isHomeTeamPick: 'isHomeTeamPick',
  isCorrect: 'isCorrect',
  pointsAwarded: 'pointsAwarded',
  tiebreakerScore: 'tiebreakerScore',
  tiebreakerDiff: 'tiebreakerDiff',
  submittedAt: 'submittedAt',
  updatedAt: 'updatedAt',
  lockedAt: 'lockedAt'
};

exports.Prisma.WeeklyResultScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  weekId: 'weekId',
  correctPicks: 'correctPicks',
  totalPicks: 'totalPicks',
  points: 'points',
  weeklyRank: 'weeklyRank',
  tiebreakerUsed: 'tiebreakerUsed',
  accuracy: 'accuracy',
  streak: 'streak',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LeagueScalarFieldEnum = {
  id: 'id',
  seasonId: 'seasonId',
  name: 'name',
  description: 'description',
  code: 'code',
  isPrivate: 'isPrivate',
  maxMembers: 'maxMembers',
  allowLateJoin: 'allowLateJoin',
  scoringSystem: 'scoringSystem',
  createdById: 'createdById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.UserLeagueScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  leagueId: 'leagueId',
  role: 'role',
  status: 'status',
  totalPoints: 'totalPoints',
  totalCorrectPicks: 'totalCorrectPicks',
  currentRank: 'currentRank',
  joinedAt: 'joinedAt',
  lastActiveAt: 'lastActiveAt'
};

exports.Prisma.LeagueMessageScalarFieldEnum = {
  id: 'id',
  leagueId: 'leagueId',
  userId: 'userId',
  message: 'message',
  isAnnouncement: 'isAnnouncement',
  isPinned: 'isPinned',
  createdAt: 'createdAt',
  editedAt: 'editedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.AchievementScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  category: 'category',
  iconUrl: 'iconUrl',
  badgeColor: 'badgeColor',
  points: 'points',
  rarity: 'rarity',
  criteria: 'criteria',
  isActive: 'isActive',
  isSecret: 'isSecret',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserAchievementScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  achievementId: 'achievementId',
  unlockedAt: 'unlockedAt',
  progress: 'progress',
  metadata: 'metadata'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  message: 'message',
  actionUrl: 'actionUrl',
  isRead: 'isRead',
  readAt: 'readAt',
  metadata: 'metadata',
  priority: 'priority',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  entity: 'entity',
  entityId: 'entityId',
  oldValues: 'oldValues',
  newValues: 'newValues',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  requestId: 'requestId',
  createdAt: 'createdAt'
};

exports.Prisma.RssFeedLogScalarFieldEnum = {
  id: 'id',
  source: 'source',
  feedUrl: 'feedUrl',
  feedType: 'feedType',
  success: 'success',
  errorMessage: 'errorMessage',
  itemsProcessed: 'itemsProcessed',
  itemsUpdated: 'itemsUpdated',
  fetchStartedAt: 'fetchStartedAt',
  fetchCompletedAt: 'fetchCompletedAt',
  duration: 'duration',
  responseStatus: 'responseStatus',
  responseHeaders: 'responseHeaders',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.UserOrderByRelevanceFieldEnum = {
  id: 'id',
  email: 'email',
  username: 'username',
  password: 'password',
  displayName: 'displayName',
  avatarUrl: 'avatarUrl',
  bio: 'bio'
};

exports.Prisma.RefreshTokenOrderByRelevanceFieldEnum = {
  id: 'id',
  token: 'token',
  userId: 'userId',
  family: 'family',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent'
};

exports.Prisma.LoginAttemptOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  identifier: 'identifier',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent'
};

exports.Prisma.SeasonOrderByRelevanceFieldEnum = {
  id: 'id'
};

exports.Prisma.WeekOrderByRelevanceFieldEnum = {
  id: 'id',
  seasonId: 'seasonId',
  name: 'name',
  tiebreakerGameId: 'tiebreakerGameId'
};

exports.Prisma.TeamOrderByRelevanceFieldEnum = {
  id: 'id',
  abbreviation: 'abbreviation',
  city: 'city',
  name: 'name',
  fullName: 'fullName',
  logoUrl: 'logoUrl',
  primaryColor: 'primaryColor',
  secondaryColor: 'secondaryColor',
  espnId: 'espnId',
  cbsId: 'cbsId',
  foxId: 'foxId'
};

exports.Prisma.GameOrderByRelevanceFieldEnum = {
  id: 'id',
  weekId: 'weekId',
  homeTeamId: 'homeTeamId',
  awayTeamId: 'awayTeamId',
  tvNetwork: 'tvNetwork',
  quarter: 'quarter',
  timeRemaining: 'timeRemaining',
  possession: 'possession',
  espnGameId: 'espnGameId',
  cbsGameId: 'cbsGameId',
  foxGameId: 'foxGameId',
  lastUpdatedFrom: 'lastUpdatedFrom'
};

exports.Prisma.PickOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  weekId: 'weekId',
  gameId: 'gameId',
  selectedTeamId: 'selectedTeamId'
};

exports.Prisma.WeeklyResultOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  weekId: 'weekId'
};

exports.Prisma.LeagueOrderByRelevanceFieldEnum = {
  id: 'id',
  seasonId: 'seasonId',
  name: 'name',
  description: 'description',
  code: 'code',
  createdById: 'createdById'
};

exports.Prisma.UserLeagueOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  leagueId: 'leagueId'
};

exports.Prisma.LeagueMessageOrderByRelevanceFieldEnum = {
  id: 'id',
  leagueId: 'leagueId',
  userId: 'userId',
  message: 'message'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.AchievementOrderByRelevanceFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  iconUrl: 'iconUrl',
  badgeColor: 'badgeColor'
};

exports.Prisma.UserAchievementOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  achievementId: 'achievementId'
};

exports.Prisma.NotificationOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  title: 'title',
  message: 'message',
  actionUrl: 'actionUrl'
};

exports.Prisma.AuditLogOrderByRelevanceFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  entity: 'entity',
  entityId: 'entityId',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  requestId: 'requestId'
};

exports.Prisma.RssFeedLogOrderByRelevanceFieldEnum = {
  id: 'id',
  source: 'source',
  feedUrl: 'feedUrl',
  feedType: 'feedType',
  errorMessage: 'errorMessage'
};
exports.WeekType = exports.$Enums.WeekType = {
  PRESEASON: 'PRESEASON',
  REGULAR: 'REGULAR',
  WILDCARD: 'WILDCARD',
  DIVISIONAL: 'DIVISIONAL',
  CONFERENCE: 'CONFERENCE',
  SUPERBOWL: 'SUPERBOWL',
  PROBOWL: 'PROBOWL'
};

exports.Conference = exports.$Enums.Conference = {
  AFC: 'AFC',
  NFC: 'NFC'
};

exports.Division = exports.$Enums.Division = {
  NORTH: 'NORTH',
  SOUTH: 'SOUTH',
  EAST: 'EAST',
  WEST: 'WEST'
};

exports.GameStatus = exports.$Enums.GameStatus = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  HALFTIME: 'HALFTIME',
  FINAL: 'FINAL',
  FINAL_OT: 'FINAL_OT',
  POSTPONED: 'POSTPONED',
  CANCELLED: 'CANCELLED'
};

exports.ScoringSystem = exports.$Enums.ScoringSystem = {
  STANDARD: 'STANDARD',
  CONFIDENCE: 'CONFIDENCE',
  SPREAD: 'SPREAD'
};

exports.LeagueRole = exports.$Enums.LeagueRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  MEMBER: 'MEMBER'
};

exports.MemberStatus = exports.$Enums.MemberStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BANNED: 'BANNED'
};

exports.AchievementCategory = exports.$Enums.AchievementCategory = {
  ACCURACY: 'ACCURACY',
  STREAK: 'STREAK',
  PARTICIPATION: 'PARTICIPATION',
  PERFECT: 'PERFECT',
  MILESTONE: 'MILESTONE',
  SPECIAL: 'SPECIAL',
  SOCIAL: 'SOCIAL'
};

exports.Rarity = exports.$Enums.Rarity = {
  COMMON: 'COMMON',
  UNCOMMON: 'UNCOMMON',
  RARE: 'RARE',
  EPIC: 'EPIC',
  LEGENDARY: 'LEGENDARY'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  PICK_REMINDER: 'PICK_REMINDER',
  ACHIEVEMENT_UNLOCKED: 'ACHIEVEMENT_UNLOCKED',
  LEAGUE_INVITE: 'LEAGUE_INVITE',
  LEAGUE_MESSAGE: 'LEAGUE_MESSAGE',
  WEEK_RESULTS: 'WEEK_RESULTS',
  GAME_UPDATE: 'GAME_UPDATE',
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT'
};

exports.Priority = exports.$Enums.Priority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

exports.Prisma.ModelName = {
  User: 'User',
  RefreshToken: 'RefreshToken',
  LoginAttempt: 'LoginAttempt',
  Season: 'Season',
  Week: 'Week',
  Team: 'Team',
  Game: 'Game',
  Pick: 'Pick',
  WeeklyResult: 'WeeklyResult',
  League: 'League',
  UserLeague: 'UserLeague',
  LeagueMessage: 'LeagueMessage',
  Achievement: 'Achievement',
  UserAchievement: 'UserAchievement',
  Notification: 'Notification',
  AuditLog: 'AuditLog',
  RssFeedLog: 'RssFeedLog'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/home/codespace/Project-Pick-EM/packages/frontend/prisma/generated/client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "debian-openssl-1.1.x",
        "native": true
      }
    ],
    "previewFeatures": [
      "fullTextSearch",
      "postgresqlExtensions"
    ],
    "sourceFilePath": "/home/codespace/Project-Pick-EM/packages/frontend/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null
  },
  "relativePath": "../..",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// packages/backend/prisma/schema.prisma\n\ngenerator client {\n  provider        = \"prisma-client-js\"\n  output          = \"./generated/client\"\n  previewFeatures = [\"fullTextSearch\", \"postgresqlExtensions\"]\n}\n\ndatasource db {\n  provider   = \"postgresql\"\n  url        = env(\"DATABASE_URL\")\n  extensions = [uuid_ossp(map: \"uuid-ossp\"), pgcrypto]\n}\n\n// ==========================================\n// CORE USER & AUTHENTICATION MODELS\n// ==========================================\n\nmodel User {\n  id          String  @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  email       String  @unique @db.VarChar(255)\n  username    String  @unique @db.VarChar(50)\n  password    String  @db.VarChar(255) // bcrypt hash\n  displayName String? @db.VarChar(100)\n  avatarUrl   String? @db.VarChar(500)\n  bio         String? @db.Text\n\n  // Account status\n  isActive        Boolean   @default(true)\n  emailVerified   Boolean   @default(false)\n  emailVerifiedAt DateTime?\n  lastLoginAt     DateTime?\n  loginCount      Int       @default(0)\n  loginAttempts   Int       @default(0) // Failed login attempts\n  lockedAt        DateTime? // Account lockout timestamp\n\n  // Metadata\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime? // Soft delete support\n\n  // Relations\n  picks          Pick[]\n  weeklyResults  WeeklyResult[]\n  userLeagues    UserLeague[]\n  createdLeagues League[]          @relation(\"LeagueCreator\")\n  achievements   UserAchievement[]\n  refreshTokens  RefreshToken[]\n  loginHistory   LoginAttempt[] // Renamed to avoid conflict\n  notifications  Notification[]\n  auditLogs      AuditLog[]\n  messages       LeagueMessage[]\n\n  @@index([email])\n  @@index([username])\n  @@index([isActive, emailVerified])\n  @@map(\"users\")\n}\n\nmodel RefreshToken {\n  id         String    @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  token      String    @unique @db.VarChar(500)\n  userId     String    @db.Uuid\n  family     String    @db.VarChar(100) // Token family for rotation detection\n  expiresAt  DateTime\n  isRevoked  Boolean   @default(false) // For token revocation\n  createdAt  DateTime  @default(now())\n  lastUsedAt DateTime?\n  ipAddress  String?   @db.VarChar(45) // IPv6 compatible\n  userAgent  String?   @db.Text\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([token])\n  @@index([userId])\n  @@index([family])\n  @@index([expiresAt])\n  @@index([isRevoked])\n  @@map(\"refresh_tokens\")\n}\n\nmodel LoginAttempt {\n  id         String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userId     String?  @db.Uuid // nullable for non-existent users\n  identifier String   @db.VarChar(255) // email or username attempted\n  ipAddress  String   @db.VarChar(45)\n  userAgent  String?  @db.Text\n  success    Boolean  @default(false)\n  createdAt  DateTime @default(now())\n\n  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@index([identifier])\n  @@index([ipAddress])\n  @@index([createdAt])\n  @@map(\"login_attempts\")\n}\n\n// ==========================================\n// NFL SEASON & GAME MODELS\n// ==========================================\n\nmodel Season {\n  id        String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  year      Int      @unique\n  startDate DateTime @db.Date\n  endDate   DateTime @db.Date\n  isActive  Boolean  @default(false)\n  isCurrent Boolean  @default(false) // Only one can be current\n\n  // Season configuration\n  weeksCount   Int @default(18) // Regular season weeks\n  playoffWeeks Int @default(4) // Playoff weeks\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  weeks   Week[]\n  leagues League[]\n\n  @@index([year])\n  @@index([isActive])\n  @@index([isCurrent])\n  @@map(\"seasons\")\n}\n\nmodel Week {\n  id         String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  seasonId   String   @db.Uuid\n  weekNumber Int // 1-18 for regular season, 19+ for playoffs\n  weekType   WeekType @default(REGULAR)\n  name       String?  @db.VarChar(100) // e.g., \"Week 1\", \"Wild Card Round\"\n\n  // Important dates/times\n  startDate    DateTime @db.Date\n  endDate      DateTime @db.Date\n  pickDeadline DateTime // When picks lock\n\n  // Tiebreaker configuration\n  tiebreakerGameId String? @unique @db.Uuid\n\n  // Status flags\n  isActive   Boolean @default(false)\n  isComplete Boolean @default(false)\n  isScored   Boolean @default(false) // Have scores been calculated\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  season         Season         @relation(fields: [seasonId], references: [id])\n  games          Game[]\n  picks          Pick[]\n  weeklyResults  WeeklyResult[]\n  tiebreakerGame Game?          @relation(\"TiebreakerGame\", fields: [tiebreakerGameId], references: [id])\n\n  @@unique([seasonId, weekNumber])\n  @@index([seasonId])\n  @@index([isActive])\n  @@index([pickDeadline])\n  @@map(\"weeks\")\n}\n\nenum WeekType {\n  PRESEASON\n  REGULAR\n  WILDCARD\n  DIVISIONAL\n  CONFERENCE\n  SUPERBOWL\n  PROBOWL\n}\n\nmodel Team {\n  id           String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  abbreviation String @unique @db.VarChar(5) // e.g., \"KC\", \"SF\"\n  city         String @db.VarChar(50) // e.g., \"Kansas City\"\n  name         String @db.VarChar(50) // e.g., \"Chiefs\"\n  fullName     String @db.VarChar(100) // e.g., \"Kansas City Chiefs\"\n\n  // Conference & Division\n  conference Conference\n  division   Division\n\n  // Branding\n  logoUrl        String? @db.VarChar(500)\n  primaryColor   String? @db.VarChar(7) // Hex color\n  secondaryColor String? @db.VarChar(7) // Hex color\n\n  // External IDs for RSS mapping\n  espnId String? @db.VarChar(50)\n  cbsId  String? @db.VarChar(50)\n  foxId  String? @db.VarChar(50)\n\n  // Stats (updated via RSS)\n  currentWins   Int @default(0)\n  currentLosses Int @default(0)\n  currentTies   Int @default(0)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  homeGames Game[] @relation(\"HomeTeam\")\n  awayGames Game[] @relation(\"AwayTeam\")\n  picks     Pick[]\n\n  @@index([abbreviation])\n  @@index([conference, division])\n  @@map(\"teams\")\n}\n\nenum Conference {\n  AFC\n  NFC\n}\n\nenum Division {\n  NORTH\n  SOUTH\n  EAST\n  WEST\n}\n\nmodel Game {\n  id     String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  weekId String @db.Uuid\n\n  // Teams\n  homeTeamId String @db.Uuid\n  awayTeamId String @db.Uuid\n\n  // Schedule\n  kickoffTime DateTime\n  tvNetwork   String?  @db.VarChar(50) // ESPN, CBS, FOX, etc.\n\n  // Scores\n  homeScore Int?\n  awayScore Int?\n\n  // Game status\n  status        GameStatus @default(SCHEDULED)\n  quarter       String?    @db.VarChar(10) // \"1\", \"2\", \"3\", \"4\", \"OT\", \"FINAL\"\n  timeRemaining String?    @db.VarChar(10) // \"12:34\"\n  possession    String?    @db.VarChar(5) // Team abbreviation with ball\n\n  // External IDs for RSS tracking\n  espnGameId String? @db.VarChar(100)\n  cbsGameId  String? @db.VarChar(100)\n  foxGameId  String? @db.VarChar(100)\n\n  // Metadata\n  lastUpdatedFrom String?  @db.VarChar(50) // Which RSS source last updated\n  createdAt       DateTime @default(now())\n  updatedAt       DateTime @updatedAt\n\n  // Relations\n  week              Week   @relation(fields: [weekId], references: [id])\n  homeTeam          Team   @relation(\"HomeTeam\", fields: [homeTeamId], references: [id])\n  awayTeam          Team   @relation(\"AwayTeam\", fields: [awayTeamId], references: [id])\n  picks             Pick[]\n  tiebreakerForWeek Week?  @relation(\"TiebreakerGame\")\n\n  @@unique([weekId, espnGameId])\n  @@unique([weekId, cbsGameId])\n  @@unique([weekId, foxGameId])\n  @@index([weekId])\n  @@index([kickoffTime])\n  @@index([status])\n  @@map(\"games\")\n}\n\nenum GameStatus {\n  SCHEDULED\n  IN_PROGRESS\n  HALFTIME\n  FINAL\n  FINAL_OT\n  POSTPONED\n  CANCELLED\n}\n\n// ==========================================\n// PICK & SCORING MODELS\n// ==========================================\n\nmodel Pick {\n  id     String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userId String @db.Uuid\n  weekId String @db.Uuid\n  gameId String @db.Uuid\n\n  // Selection\n  selectedTeamId String?  @db.Uuid // null = no pick yet\n  isHomeTeamPick Boolean? // Denormalized for faster queries\n\n  // Scoring\n  isCorrect     Boolean? // null until game complete\n  pointsAwarded Int      @default(0)\n\n  // Tiebreaker (only for designated tiebreaker games)\n  tiebreakerScore Int? // Total points prediction\n  tiebreakerDiff  Int? // Absolute difference from actual\n\n  // Timestamps\n  submittedAt DateTime  @default(now())\n  updatedAt   DateTime  @updatedAt\n  lockedAt    DateTime? // When the pick was locked (kickoff time)\n\n  // Relations\n  user         User  @relation(fields: [userId], references: [id])\n  week         Week  @relation(fields: [weekId], references: [id])\n  game         Game  @relation(fields: [gameId], references: [id])\n  selectedTeam Team? @relation(fields: [selectedTeamId], references: [id])\n\n  @@unique([userId, gameId])\n  @@index([userId, weekId])\n  @@index([gameId])\n  @@index([isCorrect])\n  @@map(\"picks\")\n}\n\nmodel WeeklyResult {\n  id     String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userId String @db.Uuid\n  weekId String @db.Uuid\n\n  // Scoring\n  correctPicks Int @default(0)\n  totalPicks   Int @default(0)\n  points       Int @default(0)\n\n  // Ranking\n  weeklyRank     Int? // Rank for this week\n  tiebreakerUsed Boolean @default(false)\n\n  // Stats\n  accuracy Float? // Percentage correct\n  streak   Int    @default(0) // Current streak (+/- for win/loss)\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  user User @relation(fields: [userId], references: [id])\n  week Week @relation(fields: [weekId], references: [id])\n\n  @@unique([userId, weekId])\n  @@index([weekId, points])\n  @@index([userId])\n  @@map(\"weekly_results\")\n}\n\n// ==========================================\n// LEAGUE & SOCIAL MODELS\n// ==========================================\n\nmodel League {\n  id       String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  seasonId String @db.Uuid\n\n  // League details\n  name        String  @db.VarChar(100)\n  description String? @db.Text\n  code        String  @unique @db.VarChar(10) // Invite code\n\n  // Configuration\n  isPrivate     Boolean       @default(true)\n  maxMembers    Int?\n  allowLateJoin Boolean       @default(true) // Can join after season starts\n  scoringSystem ScoringSystem @default(STANDARD)\n\n  // Creator\n  createdById String @db.Uuid\n\n  // Timestamps\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  deletedAt DateTime? // Soft delete\n\n  // Relations\n  season   Season          @relation(fields: [seasonId], references: [id])\n  creator  User            @relation(\"LeagueCreator\", fields: [createdById], references: [id])\n  members  UserLeague[]\n  messages LeagueMessage[]\n\n  @@index([code])\n  @@index([seasonId])\n  @@index([createdById])\n  @@map(\"leagues\")\n}\n\nenum ScoringSystem {\n  STANDARD // 1 point per correct pick\n  CONFIDENCE // Points based on confidence ranking\n  SPREAD // Against the spread\n}\n\nmodel UserLeague {\n  id       String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userId   String @db.Uuid\n  leagueId String @db.Uuid\n\n  // Role & Status\n  role   LeagueRole   @default(MEMBER)\n  status MemberStatus @default(ACTIVE)\n\n  // Stats (denormalized for performance)\n  totalPoints       Int  @default(0)\n  totalCorrectPicks Int  @default(0)\n  currentRank       Int?\n\n  // Timestamps\n  joinedAt     DateTime @default(now())\n  lastActiveAt DateTime @default(now())\n\n  // Relations\n  user   User   @relation(fields: [userId], references: [id])\n  league League @relation(fields: [leagueId], references: [id])\n\n  @@unique([userId, leagueId])\n  @@index([leagueId, totalPoints])\n  @@index([userId])\n  @@map(\"user_leagues\")\n}\n\nenum LeagueRole {\n  OWNER\n  ADMIN\n  MODERATOR\n  MEMBER\n}\n\nenum MemberStatus {\n  ACTIVE\n  INACTIVE\n  BANNED\n}\n\nmodel LeagueMessage {\n  id       String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  leagueId String @db.Uuid\n  userId   String @db.Uuid\n\n  message        String  @db.Text\n  isAnnouncement Boolean @default(false)\n  isPinned       Boolean @default(false)\n\n  createdAt DateTime  @default(now())\n  editedAt  DateTime?\n  deletedAt DateTime? // Soft delete\n\n  // Relations\n  league League @relation(fields: [leagueId], references: [id])\n  user   User   @relation(fields: [userId], references: [id])\n\n  @@index([leagueId, createdAt])\n  @@index([userId])\n  @@map(\"league_messages\")\n}\n\n// ==========================================\n// GAMIFICATION & ENGAGEMENT MODELS\n// ==========================================\n\nmodel Achievement {\n  id String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n\n  // Achievement details\n  name        String              @unique @db.VarChar(100)\n  description String              @db.Text\n  category    AchievementCategory\n\n  // Display\n  iconUrl    String? @db.VarChar(500)\n  badgeColor String? @db.VarChar(7) // Hex color\n\n  // Points & Rarity\n  points Int    @default(0)\n  rarity Rarity @default(COMMON)\n\n  // Criteria (stored as JSON for flexibility)\n  criteria Json // e.g., { \"type\": \"streak\", \"value\": 5 }\n\n  // Flags\n  isActive Boolean @default(true)\n  isSecret Boolean @default(false) // Hidden until unlocked\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  users UserAchievement[]\n\n  @@index([category])\n  @@index([rarity])\n  @@map(\"achievements\")\n}\n\nenum AchievementCategory {\n  ACCURACY // High pick accuracy\n  STREAK // Win streaks\n  PARTICIPATION // Consistent participation\n  PERFECT // Perfect weeks\n  MILESTONE // Total picks/wins milestones\n  SPECIAL // Special events\n  SOCIAL // League participation\n}\n\nenum Rarity {\n  COMMON\n  UNCOMMON\n  RARE\n  EPIC\n  LEGENDARY\n}\n\nmodel UserAchievement {\n  id            String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userId        String @db.Uuid\n  achievementId String @db.Uuid\n\n  unlockedAt DateTime @default(now())\n  progress   Int      @default(100) // Percentage for progressive achievements\n  metadata   Json? // Additional context about the achievement\n\n  // Relations\n  user        User        @relation(fields: [userId], references: [id])\n  achievement Achievement @relation(fields: [achievementId], references: [id])\n\n  @@unique([userId, achievementId])\n  @@index([userId])\n  @@index([unlockedAt])\n  @@map(\"user_achievements\")\n}\n\nmodel Notification {\n  id     String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userId String @db.Uuid\n\n  // Notification content\n  type      NotificationType\n  title     String           @db.VarChar(200)\n  message   String           @db.Text\n  actionUrl String?          @db.VarChar(500)\n\n  // Status\n  isRead Boolean   @default(false)\n  readAt DateTime?\n\n  // Metadata\n  metadata  Json? // Additional context\n  priority  Priority  @default(NORMAL)\n  expiresAt DateTime? // Auto-delete after this date\n\n  createdAt DateTime @default(now())\n\n  // Relations\n  user User @relation(fields: [userId], references: [id])\n\n  @@index([userId, isRead])\n  @@index([createdAt])\n  @@index([type])\n  @@map(\"notifications\")\n}\n\nenum NotificationType {\n  PICK_REMINDER\n  ACHIEVEMENT_UNLOCKED\n  LEAGUE_INVITE\n  LEAGUE_MESSAGE\n  WEEK_RESULTS\n  GAME_UPDATE\n  SYSTEM_ANNOUNCEMENT\n}\n\nenum Priority {\n  LOW\n  NORMAL\n  HIGH\n  URGENT\n}\n\n// ==========================================\n// AUDIT & ANALYTICS MODELS\n// ==========================================\n\nmodel AuditLog {\n  id     String  @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userId String? @db.Uuid // Null for system actions\n\n  // Action details\n  action   String  @db.VarChar(100)\n  entity   String  @db.VarChar(50)\n  entityId String? @db.Uuid\n\n  // Change tracking\n  oldValues Json?\n  newValues Json?\n\n  // Request context\n  ipAddress String? @db.VarChar(45)\n  userAgent String? @db.Text\n  requestId String? @db.VarChar(100)\n\n  createdAt DateTime @default(now())\n\n  // Relations\n  user User? @relation(fields: [userId], references: [id])\n\n  @@index([userId])\n  @@index([entity, entityId])\n  @@index([createdAt])\n  @@index([action])\n  @@map(\"audit_logs\")\n}\n\n// ==========================================\n// RSS FEED TRACKING\n// ==========================================\n\nmodel RssFeedLog {\n  id String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n\n  // Feed details\n  source   String @db.VarChar(50) // ESPN, CBS, FOX\n  feedUrl  String @db.VarChar(500)\n  feedType String @db.VarChar(50) // schedule, scores, news\n\n  // Fetch status\n  success        Boolean\n  errorMessage   String? @db.Text\n  itemsProcessed Int     @default(0)\n  itemsUpdated   Int     @default(0)\n\n  // Timing\n  fetchStartedAt   DateTime\n  fetchCompletedAt DateTime?\n  duration         Int? // milliseconds\n\n  // Response data\n  responseStatus  Int?\n  responseHeaders Json?\n\n  createdAt DateTime @default(now())\n\n  @@index([source, createdAt])\n  @@index([success])\n  @@index([feedType])\n  @@map(\"rss_feed_logs\")\n}\n",
  "inlineSchemaHash": "c57a532af13d0c5f6b91a879c3d7c8919b36bcb547139a638153c10db80a4438",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "prisma/generated/client",
    "generated/client",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"dbName\":\"users\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"username\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"password\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"displayName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"avatarUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bio\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"emailVerified\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"emailVerifiedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastLoginAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"loginCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"loginAttempts\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lockedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"deletedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"picks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Pick\",\"relationName\":\"PickToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"weeklyResults\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"WeeklyResult\",\"relationName\":\"UserToWeeklyResult\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userLeagues\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserLeague\",\"relationName\":\"UserToUserLeague\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdLeagues\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"League\",\"relationName\":\"LeagueCreator\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"achievements\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserAchievement\",\"relationName\":\"UserToUserAchievement\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"refreshTokens\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"RefreshToken\",\"relationName\":\"RefreshTokenToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"loginHistory\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"LoginAttempt\",\"relationName\":\"LoginAttemptToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notifications\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Notification\",\"relationName\":\"NotificationToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"auditLogs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AuditLog\",\"relationName\":\"AuditLogToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"messages\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"LeagueMessage\",\"relationName\":\"LeagueMessageToUser\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"RefreshToken\":{\"dbName\":\"refresh_tokens\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"token\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"family\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isRevoked\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastUsedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ipAddress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userAgent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"RefreshTokenToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"LoginAttempt\":{\"dbName\":\"login_attempts\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"identifier\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ipAddress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userAgent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"success\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"LoginAttemptToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Season\":{\"dbName\":\"seasons\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"year\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"endDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isCurrent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"weeksCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":18,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playoffWeeks\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":4,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"weeks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Week\",\"relationName\":\"SeasonToWeek\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leagues\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"League\",\"relationName\":\"LeagueToSeason\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Week\":{\"dbName\":\"weeks\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seasonId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"weekNumber\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"weekType\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"WeekType\",\"default\":\"REGULAR\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"endDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pickDeadline\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tiebreakerGameId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isComplete\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isScored\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"season\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Season\",\"relationName\":\"SeasonToWeek\",\"relationFromFields\":[\"seasonId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"games\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Game\",\"relationName\":\"GameToWeek\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"picks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Pick\",\"relationName\":\"PickToWeek\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"weeklyResults\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"WeeklyResult\",\"relationName\":\"WeekToWeeklyResult\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tiebreakerGame\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Game\",\"relationName\":\"TiebreakerGame\",\"relationFromFields\":[\"tiebreakerGameId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"seasonId\",\"weekNumber\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"seasonId\",\"weekNumber\"]}],\"isGenerated\":false},\"Team\":{\"dbName\":\"teams\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"abbreviation\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"city\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fullName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conference\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Conference\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"division\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Division\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"logoUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"primaryColor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"secondaryColor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"espnId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cbsId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"foxId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentWins\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentLosses\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentTies\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"homeGames\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Game\",\"relationName\":\"HomeTeam\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"awayGames\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Game\",\"relationName\":\"AwayTeam\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"picks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Pick\",\"relationName\":\"PickToTeam\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Game\":{\"dbName\":\"games\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"weekId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"homeTeamId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"awayTeamId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"kickoffTime\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tvNetwork\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"homeScore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"awayScore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"GameStatus\",\"default\":\"SCHEDULED\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quarter\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timeRemaining\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"possession\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"espnGameId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cbsGameId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"foxGameId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastUpdatedFrom\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"week\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Week\",\"relationName\":\"GameToWeek\",\"relationFromFields\":[\"weekId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"homeTeam\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Team\",\"relationName\":\"HomeTeam\",\"relationFromFields\":[\"homeTeamId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"awayTeam\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Team\",\"relationName\":\"AwayTeam\",\"relationFromFields\":[\"awayTeamId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"picks\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Pick\",\"relationName\":\"GameToPick\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tiebreakerForWeek\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Week\",\"relationName\":\"TiebreakerGame\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"weekId\",\"espnGameId\"],[\"weekId\",\"cbsGameId\"],[\"weekId\",\"foxGameId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"weekId\",\"espnGameId\"]},{\"name\":null,\"fields\":[\"weekId\",\"cbsGameId\"]},{\"name\":null,\"fields\":[\"weekId\",\"foxGameId\"]}],\"isGenerated\":false},\"Pick\":{\"dbName\":\"picks\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"weekId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gameId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"selectedTeamId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isHomeTeamPick\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isCorrect\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pointsAwarded\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tiebreakerScore\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tiebreakerDiff\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"submittedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"lockedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"PickToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"week\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Week\",\"relationName\":\"PickToWeek\",\"relationFromFields\":[\"weekId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"game\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Game\",\"relationName\":\"GameToPick\",\"relationFromFields\":[\"gameId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"selectedTeam\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Team\",\"relationName\":\"PickToTeam\",\"relationFromFields\":[\"selectedTeamId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"gameId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"gameId\"]}],\"isGenerated\":false},\"WeeklyResult\":{\"dbName\":\"weekly_results\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"weekId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"correctPicks\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalPicks\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"points\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"weeklyRank\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"tiebreakerUsed\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"accuracy\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Float\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"streak\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UserToWeeklyResult\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"week\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Week\",\"relationName\":\"WeekToWeeklyResult\",\"relationFromFields\":[\"weekId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"weekId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"weekId\"]}],\"isGenerated\":false},\"League\":{\"dbName\":\"leagues\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seasonId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isPrivate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maxMembers\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"allowLateJoin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"scoringSystem\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"ScoringSystem\",\"default\":\"STANDARD\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdById\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"deletedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"season\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Season\",\"relationName\":\"LeagueToSeason\",\"relationFromFields\":[\"seasonId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"creator\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"LeagueCreator\",\"relationFromFields\":[\"createdById\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"members\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserLeague\",\"relationName\":\"LeagueToUserLeague\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"messages\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"LeagueMessage\",\"relationName\":\"LeagueToLeagueMessage\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserLeague\":{\"dbName\":\"user_leagues\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leagueId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"LeagueRole\",\"default\":\"MEMBER\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"MemberStatus\",\"default\":\"ACTIVE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalPoints\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"totalCorrectPicks\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentRank\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"joinedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastActiveAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UserToUserLeague\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"league\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"League\",\"relationName\":\"LeagueToUserLeague\",\"relationFromFields\":[\"leagueId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"leagueId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"leagueId\"]}],\"isGenerated\":false},\"LeagueMessage\":{\"dbName\":\"league_messages\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leagueId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isAnnouncement\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isPinned\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"editedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"deletedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"league\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"League\",\"relationName\":\"LeagueToLeagueMessage\",\"relationFromFields\":[\"leagueId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"LeagueMessageToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Achievement\":{\"dbName\":\"achievements\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"category\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"AchievementCategory\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"iconUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"badgeColor\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"points\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rarity\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Rarity\",\"default\":\"COMMON\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"criteria\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isSecret\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"users\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"UserAchievement\",\"relationName\":\"AchievementToUserAchievement\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"UserAchievement\":{\"dbName\":\"user_achievements\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"achievementId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unlockedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"progress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":100,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"UserToUserAchievement\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"achievement\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Achievement\",\"relationName\":\"AchievementToUserAchievement\",\"relationFromFields\":[\"achievementId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"userId\",\"achievementId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"userId\",\"achievementId\"]}],\"isGenerated\":false},\"Notification\":{\"dbName\":\"notifications\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotificationType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actionUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isRead\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"readAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"priority\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Priority\",\"default\":\"NORMAL\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"NotificationToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"AuditLog\":{\"dbName\":\"audit_logs\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"action\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"entityId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"oldValues\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"newValues\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ipAddress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userAgent\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requestId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"User\",\"relationName\":\"AuditLogToUser\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"RssFeedLog\":{\"dbName\":\"rss_feed_logs\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"dbgenerated\",\"args\":[\"gen_random_uuid()\"]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"source\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"feedUrl\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"feedType\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"success\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"errorMessage\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemsProcessed\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemsUpdated\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fetchStartedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fetchCompletedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"duration\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"responseStatus\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"responseHeaders\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"WeekType\":{\"values\":[{\"name\":\"PRESEASON\",\"dbName\":null},{\"name\":\"REGULAR\",\"dbName\":null},{\"name\":\"WILDCARD\",\"dbName\":null},{\"name\":\"DIVISIONAL\",\"dbName\":null},{\"name\":\"CONFERENCE\",\"dbName\":null},{\"name\":\"SUPERBOWL\",\"dbName\":null},{\"name\":\"PROBOWL\",\"dbName\":null}],\"dbName\":null},\"Conference\":{\"values\":[{\"name\":\"AFC\",\"dbName\":null},{\"name\":\"NFC\",\"dbName\":null}],\"dbName\":null},\"Division\":{\"values\":[{\"name\":\"NORTH\",\"dbName\":null},{\"name\":\"SOUTH\",\"dbName\":null},{\"name\":\"EAST\",\"dbName\":null},{\"name\":\"WEST\",\"dbName\":null}],\"dbName\":null},\"GameStatus\":{\"values\":[{\"name\":\"SCHEDULED\",\"dbName\":null},{\"name\":\"IN_PROGRESS\",\"dbName\":null},{\"name\":\"HALFTIME\",\"dbName\":null},{\"name\":\"FINAL\",\"dbName\":null},{\"name\":\"FINAL_OT\",\"dbName\":null},{\"name\":\"POSTPONED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null}],\"dbName\":null},\"ScoringSystem\":{\"values\":[{\"name\":\"STANDARD\",\"dbName\":null},{\"name\":\"CONFIDENCE\",\"dbName\":null},{\"name\":\"SPREAD\",\"dbName\":null}],\"dbName\":null},\"LeagueRole\":{\"values\":[{\"name\":\"OWNER\",\"dbName\":null},{\"name\":\"ADMIN\",\"dbName\":null},{\"name\":\"MODERATOR\",\"dbName\":null},{\"name\":\"MEMBER\",\"dbName\":null}],\"dbName\":null},\"MemberStatus\":{\"values\":[{\"name\":\"ACTIVE\",\"dbName\":null},{\"name\":\"INACTIVE\",\"dbName\":null},{\"name\":\"BANNED\",\"dbName\":null}],\"dbName\":null},\"AchievementCategory\":{\"values\":[{\"name\":\"ACCURACY\",\"dbName\":null},{\"name\":\"STREAK\",\"dbName\":null},{\"name\":\"PARTICIPATION\",\"dbName\":null},{\"name\":\"PERFECT\",\"dbName\":null},{\"name\":\"MILESTONE\",\"dbName\":null},{\"name\":\"SPECIAL\",\"dbName\":null},{\"name\":\"SOCIAL\",\"dbName\":null}],\"dbName\":null},\"Rarity\":{\"values\":[{\"name\":\"COMMON\",\"dbName\":null},{\"name\":\"UNCOMMON\",\"dbName\":null},{\"name\":\"RARE\",\"dbName\":null},{\"name\":\"EPIC\",\"dbName\":null},{\"name\":\"LEGENDARY\",\"dbName\":null}],\"dbName\":null},\"NotificationType\":{\"values\":[{\"name\":\"PICK_REMINDER\",\"dbName\":null},{\"name\":\"ACHIEVEMENT_UNLOCKED\",\"dbName\":null},{\"name\":\"LEAGUE_INVITE\",\"dbName\":null},{\"name\":\"LEAGUE_MESSAGE\",\"dbName\":null},{\"name\":\"WEEK_RESULTS\",\"dbName\":null},{\"name\":\"GAME_UPDATE\",\"dbName\":null},{\"name\":\"SYSTEM_ANNOUNCEMENT\",\"dbName\":null}],\"dbName\":null},\"Priority\":{\"values\":[{\"name\":\"LOW\",\"dbName\":null},{\"name\":\"NORMAL\",\"dbName\":null},{\"name\":\"HIGH\",\"dbName\":null},{\"name\":\"URGENT\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-debian-openssl-1.1.x.so.node");
path.join(process.cwd(), "prisma/generated/client/libquery_engine-debian-openssl-1.1.x.so.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "prisma/generated/client/schema.prisma")
