
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


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

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

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
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
