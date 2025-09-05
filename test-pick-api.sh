#!/bin/bash

# Test script for Pick Submission API
BASE_URL="http://localhost:3002"
USER_ID="test-user-123"
CONTENT_TYPE="Content-Type: application/json"
AUTH_HEADER="x-user-id: $USER_ID"

echo "🏈 Testing Pick Submission API"
echo "================================"

# Test 1: Health check
echo "1. Testing health endpoint..."
curl -s "${BASE_URL}/health" | jq '.status' || echo "❌ Health check failed"
echo ""

# Test 2: Test authentication (should fail without header)
echo "2. Testing authentication (should fail)..."
response=$(curl -s -w "%{http_code}" -o /dev/null "${BASE_URL}/api/v1/picks/leaderboard/week/1")
if [ "$response" = "401" ]; then
    echo "✅ Authentication working (correctly rejected unauthorized request)"
else
    echo "❌ Authentication not working (status: $response)"
fi
echo ""

# Test 3: Get leaderboard (with auth)
echo "3. Testing leaderboard endpoint..."
curl -s -H "$AUTH_HEADER" "${BASE_URL}/api/v1/picks/leaderboard/week/1" | jq '.success' || echo "❌ Leaderboard test failed"
echo ""

# Test 4: Get weekly games (with auth)
echo "4. Testing weekly games endpoint..."
curl -s -H "$AUTH_HEADER" "${BASE_URL}/api/v1/picks/games/week/1" | jq '.success' || echo "❌ Weekly games test failed"
echo ""

# Test 5: Get user picks (with auth)
echo "5. Testing user picks endpoint..."
curl -s -H "$AUTH_HEADER" "${BASE_URL}/api/v1/picks/week/1" | jq '.success' || echo "❌ User picks test failed"
echo ""

# Test 6: Submit a pick (needs valid game data)
echo "6. Testing pick submission..."
echo "Note: This may fail if no valid games exist in the database"
pick_data='{
  "gameId": "test-game-123",
  "selectedTeamId": "test-team-456",
  "tiebreakerScore": 24
}'

response=$(curl -s -H "$AUTH_HEADER" -H "$CONTENT_TYPE" -d "$pick_data" "${BASE_URL}/api/v1/picks")
echo "$response" | jq '.success' 2>/dev/null || echo "Expected: Pick submission may fail without valid game data"
echo ""

echo "🎯 Pick API Testing Complete!"
echo "Note: Some tests may fail due to empty database - this is expected for a fresh installation"
