# Predictions & Event Sourcing Feature

This document describes the predictions-based scoring system with event sourcing and single-game locks implemented in Project-Pick-EM.

## Overview

The predictions feature introduces three major capabilities:

1. **Event Sourcing & Data Protection**: Append-only event log with reconciliation to prevent data loss
2. **Prediction-based Scoring**: Score predictions with accuracy-weighted algorithm and optional spread usage
3. **Single-game Lock System**: Per-week unique locks with bonus/penalty scoring

## Event Sourcing & Data Protection

### Purpose

Provides out-of-the-box persistent data protection to stop pick/league resets by maintaining an immutable audit trail of all changes.

### Components

#### Events Table
- Append-only log of all mutations (picks, leagues, users, game results)
- Schema: `events(id, aggregate_type, aggregate_id, event_type, payload, created_at)`
- Event types: `PREDICTION_CREATED`, `PREDICTION_UPDATED`, `PREDICTION_DELETED`, etc.

#### Snapshots Table
- Periodic snapshots of aggregate state for performance
- Schema: `snapshots(id, aggregate_type, aggregate_id, state, last_event_id, created_at)`
- Created every 10th reconciliation

#### Reconciliation Service
- Background job runs every 5 minutes
- Rebuilds canonical state from events
- Detects and fixes inconsistencies
- Manual trigger: `POST /api/admin/reconcile`

### Usage

```typescript
// Events are automatically appended when predictions are created/updated
import { eventService } from './services/events/events.service';

// Append event
await eventService.appendEvent({
  aggregateType: 'prediction',
  aggregateId: 'pred-123',
  eventType: 'PREDICTION_CREATED',
  payload: { userId, gameId, scores, ... }
});

// Read event history
const events = await eventService.readEvents('prediction', 'pred-123');
```

## Prediction-based Scoring

### Scoring Algorithm

The scoring algorithm awards points based on three factors:

#### 1. Winner Points (10 points)
- Awarded for correctly predicting the winner
- Based on final score margin (or margin after spread if using spread)

#### 2. Accuracy Bonus (0-20 points)
- Based on how close the predicted margin matches the actual margin
- Formula: `accuracyScore = max(0, round(20 * max(0, 1 - |predicted_margin - actual_margin| / 20)))`
- Perfect margin match = 20 points
- Off by 20+ points = 0 points
- Linear interpolation between

#### 3. Lock Bonus/Penalty (configurable)
- If locked and correct: +lockBonus (default 20)
- If locked and incorrect: -lockPenalty (default 15)

### Spread-Aware Scoring

Players can optionally use official point spreads:
- Toggle `useSpread` flag on prediction
- Spread is applied to actual margin before winner detection and accuracy calculation
- Spreads fetched from RSS feeds and stored in `game_spreads` table

### Configuration

Scoring constants can be configured via environment variables:

```env
WINNER_POINTS=10
MAX_ACCURACY_POINTS=20
MARGIN_NORMALIZATION=20
```

### Examples

**Perfect Prediction:**
- Predicted: Home 27, Away 24 (margin: +3)
- Actual: Home 27, Away 24 (margin: +3)
- Score: 10 (winner) + 20 (perfect accuracy) = 30 points

**Close Prediction:**
- Predicted: Home 24, Away 20 (margin: +4)
- Actual: Home 27, Away 20 (margin: +7)
- Margin difference: 3
- Score: 10 (winner) + 17 (accuracy) = 27 points

**Wrong Winner:**
- Predicted: Home 27, Away 24
- Actual: Home 20, Away 27
- Score: 0 (wrong winner) + 0 (large margin error) = 0 points

**Locked Pick Bonus:**
- Predicted: Home 27, Away 24 (locked)
- Actual: Home 30, Away 20
- Score: 10 + 15 (accuracy) + 20 (lock bonus) = 45 points

## Single-game Lock System

### Overview

Leagues can enable a lock system where each player may lock exactly one game per week, with unique locks per game.

### Configuration

League settings:
```typescript
{
  enableLocks: boolean,  // Enable lock system
  lockBonus: number,     // Bonus for correct locked pick (default: 20)
  lockPenalty: number    // Penalty for incorrect locked pick (default: 15)
}
```

### Rules

1. **One lock per user per week**: Each user can lock at most one game per week in a league
2. **Unique lock per game**: Each game can only be locked by one user in a league
3. **Lock before kickoff**: Locks must be set before game kickoff
4. **Bonus/penalty applied**: Lock bonus awarded for correct, penalty for incorrect

### Validation

When enabling locks, the system validates:
- `maxParticipants <= numberOfGamesPerWeek` (ensures enough games for all players)

### API Usage

#### Create/Update Prediction with Lock

```bash
POST /api/v1/predictions
{
  "userId": "user-123",
  "leagueId": "league-456",
  "gameId": "game-789",
  "predictedHomeScore": 24,
  "predictedAwayScore": 20,
  "useSpread": false,
  "locked": true
}
```

#### Get Lock Availability

```bash
GET /api/v1/predictions/locks/availability?leagueId=league-456&weekId=week-1
```

Response:
```json
{
  "success": true,
  "data": {
    "locksEnabled": true,
    "gamesWithLocks": [
      {
        "gameId": "game-789",
        "userId": "user-123",
        "username": "player1"
      }
    ]
  }
}
```

## Spread Fetcher

### Configuration

The spread fetcher fetches point spreads from RSS feeds:

```env
RSS_SPREAD_FEED_URL=https://example.com/spreads.rss
ENABLE_SPREAD_FETCHING=true
```

### Usage

The spread fetcher runs hourly as a cron job. Manual triggers:

```bash
# Fetch spreads now
POST /api/admin/spreads/fetch

# Response
{
  "success": true,
  "data": {
    "spreadsUpdated": 15
  }
}
```

### Implementation Note

The current spread fetcher includes a stub RSS parser. Implement actual parsing based on your RSS feed format:

```typescript
// In spread-fetcher.service.ts
private async parseSpreadsFeed(feedData: string): Promise<SpreadData[]> {
  // TODO: Implement based on your RSS feed format
  // Example using xml2js:
  const parser = new XMLParser();
  const parsed = parser.parse(feedData);
  return parsed.items.map(item => ({
    gameId: mapToGameId(item.externalId),
    spread: parseFloat(item.spread),
    source: 'ESPN'
  }));
}
```

## Background Jobs

### Reconciliation Job
- **Schedule**: Every 5 minutes
- **Purpose**: Rebuild state from events, detect inconsistencies
- **Manual trigger**: `POST /api/admin/reconcile`

### Spread Fetcher Job
- **Schedule**: Hourly
- **Purpose**: Fetch and persist game spreads
- **Manual trigger**: `POST /api/admin/spreads/fetch`

### Scoring Job
- **Trigger**: After game completes
- **Purpose**: Compute scores for all predictions
- **Manual trigger**: `POST /api/admin/scores/compute/:weekId`

## Database Schema

### New Tables

#### events
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type VARCHAR(50) NOT NULL,
  aggregate_id VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### snapshots
```sql
CREATE TABLE snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type VARCHAR(50) NOT NULL,
  aggregate_id VARCHAR(100) NOT NULL,
  state JSONB NOT NULL,
  last_event_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### predictions
```sql
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  league_id UUID NOT NULL REFERENCES leagues(id),
  game_id UUID NOT NULL REFERENCES games(id),
  predicted_home_score INTEGER NOT NULL,
  predicted_away_score INTEGER NOT NULL,
  use_spread BOOLEAN NOT NULL DEFAULT false,
  locked BOOLEAN NOT NULL DEFAULT false,
  winner_points INTEGER,
  accuracy_score INTEGER,
  lock_bonus INTEGER,
  total_score INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL,
  scored_at TIMESTAMP,
  UNIQUE (user_id, game_id, league_id)
);
```

#### game_spreads
```sql
CREATE TABLE game_spreads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id),
  spread DOUBLE PRECISION NOT NULL,
  source VARCHAR(100) NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (game_id, source)
);
```

### Schema Changes

#### leagues table
```sql
ALTER TABLE leagues ADD COLUMN enable_locks BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE leagues ADD COLUMN lock_bonus INTEGER NOT NULL DEFAULT 20;
ALTER TABLE leagues ADD COLUMN lock_penalty INTEGER NOT NULL DEFAULT 15;
```

## API Endpoints

### Predictions
- `POST /api/v1/predictions` - Create/update prediction
- `GET /api/v1/predictions` - Get user predictions (filter by league/week)
- `GET /api/v1/predictions/:id` - Get single prediction
- `DELETE /api/v1/predictions/:id` - Delete prediction
- `GET /api/v1/predictions/locks/availability` - Get lock availability

### Admin
- `POST /api/admin/reconcile` - Run reconciliation now
- `POST /api/admin/spreads/fetch` - Fetch spreads now
- `POST /api/admin/scores/compute/:weekId` - Compute scores for week
- `POST /api/admin/scores/compute/game/:gameId` - Compute scores for game

## Testing

### Unit Tests

Run scoring algorithm tests:
```bash
cd packages/backend
npm test -- src/services/scoring/__tests__/scoring.service.test.ts
```

Coverage target: >90% for scoring logic

### Integration Tests

Run predictions and lock enforcement tests:
```bash
npm test -- src/services/predictions/__tests__/predictions-locks.test.ts
```

### CI/CD

The feature has its own CI workflow (`.github/workflows/feature-predictions.yml`) that:
- Runs all prediction/scoring tests
- Validates database schema
- Checks test coverage
- Ensures migrations apply correctly

## Local Development

### Running Migrations

```bash
cd packages/backend
npx prisma migrate dev --name add_predictions_events_locks
npx prisma generate
```

### Running Background Jobs

Jobs start automatically with the backend server. To run manually:

```bash
# Start server (starts all cron jobs)
npm run dev:backend

# Or trigger manually via API
curl -X POST http://localhost:3001/api/admin/reconcile
curl -X POST http://localhost:3001/api/admin/spreads/fetch
```

### Environment Setup

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=postgresql://pickem:password@localhost:5432/nfl_pickem
REDIS_URL=redis://localhost:6379

# Spread fetcher
RSS_SPREAD_FEED_URL=https://your-spread-feed.com/rss
ENABLE_SPREAD_FETCHING=true

# Scoring config (optional)
WINNER_POINTS=10
MAX_ACCURACY_POINTS=20
MARGIN_NORMALIZATION=20
```

## Security Notes

- **No secrets in code**: RSS feed URLs must be provided via environment variables
- **Event log immutability**: Events cannot be modified or deleted
- **Input validation**: All predictions validated before saving
- **Rate limiting**: Apply rate limits to prediction endpoints in production
- **Authentication**: Ensure proper authentication on all endpoints

## Performance Considerations

- **Event log**: Indexed on `(aggregate_type, aggregate_id, created_at)`
- **Snapshots**: Reduce event replay overhead
- **Reconciliation**: Runs every 5 minutes, processes in batches
- **Caching**: Consider caching frequently accessed predictions and spreads

## Future Enhancements

1. **Real-time updates**: WebSocket support for live score updates
2. **Advanced analytics**: Historical accuracy tracking per user
3. **Multiple lock strategies**: Different lock rules (e.g., lock any 3 games)
4. **Spread providers**: Support multiple spread sources with consensus
5. **ML predictions**: AI-assisted prediction suggestions
6. **Social features**: Share predictions, compare with friends
