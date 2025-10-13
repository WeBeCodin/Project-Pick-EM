-- AlterTable League: Add lock system configuration
ALTER TABLE "leagues" ADD COLUMN "enableLocks" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "leagues" ADD COLUMN "lockBonus" INTEGER NOT NULL DEFAULT 20;
ALTER TABLE "leagues" ADD COLUMN "lockPenalty" INTEGER NOT NULL DEFAULT 15;

-- CreateTable Event: Append-only event log for data protection
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "aggregateType" VARCHAR(50) NOT NULL,
    "aggregateId" VARCHAR(100) NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable Snapshot: State snapshots for reconciliation
CREATE TABLE "snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "aggregateType" VARCHAR(50) NOT NULL,
    "aggregateId" VARCHAR(100) NOT NULL,
    "state" JSONB NOT NULL,
    "lastEventId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable Prediction: Score predictions with locks
CREATE TABLE "predictions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "leagueId" UUID NOT NULL,
    "gameId" UUID NOT NULL,
    "predictedHomeScore" INTEGER NOT NULL,
    "predictedAwayScore" INTEGER NOT NULL,
    "useSpread" BOOLEAN NOT NULL DEFAULT false,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "winnerPoints" INTEGER,
    "accuracyScore" INTEGER,
    "lockBonus" INTEGER,
    "totalScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scoredAt" TIMESTAMP(3),

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable GameSpread: RSS feed spread data
CREATE TABLE "game_spreads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "gameId" UUID NOT NULL,
    "spread" DOUBLE PRECISION NOT NULL,
    "source" VARCHAR(100) NOT NULL,
    "fetchedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_spreads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_aggregateType_aggregateId_createdAt_idx" ON "events"("aggregateType", "aggregateId", "createdAt");
CREATE INDEX "events_eventType_idx" ON "events"("eventType");
CREATE INDEX "events_createdAt_idx" ON "events"("createdAt");

-- CreateIndex
CREATE INDEX "snapshots_aggregateType_aggregateId_idx" ON "snapshots"("aggregateType", "aggregateId");
CREATE INDEX "snapshots_createdAt_idx" ON "snapshots"("createdAt");
CREATE UNIQUE INDEX "snapshots_aggregateType_aggregateId_createdAt_key" ON "snapshots"("aggregateType", "aggregateId", "createdAt");

-- CreateIndex
CREATE INDEX "predictions_userId_leagueId_idx" ON "predictions"("userId", "leagueId");
CREATE INDEX "predictions_gameId_idx" ON "predictions"("gameId");
CREATE INDEX "predictions_locked_idx" ON "predictions"("locked");
CREATE UNIQUE INDEX "predictions_userId_gameId_leagueId_key" ON "predictions"("userId", "gameId", "leagueId");

-- CreateIndex
CREATE INDEX "game_spreads_gameId_idx" ON "game_spreads"("gameId");
CREATE INDEX "game_spreads_fetchedAt_idx" ON "game_spreads"("fetchedAt");
CREATE UNIQUE INDEX "game_spreads_gameId_source_key" ON "game_spreads"("gameId", "source");

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "leagues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_spreads" ADD CONSTRAINT "game_spreads_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
