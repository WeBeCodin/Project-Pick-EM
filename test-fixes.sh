#!/bin/bash

# Test script to verify league fixes
echo "🔧 Testing NFL Pick 'Em Fixes"
echo "================================"

BASE_URL="https://project-pick-jycbau58t-webecodins-projects.vercel.app"

echo ""
echo "1. Testing Leaderboard (should show empty/no mock users):"
curl -s "${BASE_URL}/api/leagues/standings" | jq '.'

echo ""
echo "2. Testing League Creation (with persistent storage):"
LEAGUE_DATA='{
  "name": "Test Persistence League",
  "description": "Testing league state persistence",
  "settings": {
    "maxMembers": 10,
    "isPrivate": false,
    "requireApproval": false,
    "scoringSystem": "standard",
    "weeklyPayout": false,
    "seasonPayout": true
  }
}'

# Create a test league
RESULT=$(curl -s -X POST "${BASE_URL}/api/leagues" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d "$LEAGUE_DATA")

echo "League creation result:"
echo "$RESULT" | jq '.'

# Extract league ID if successful
LEAGUE_ID=$(echo "$RESULT" | jq -r '.league.id // empty')

if [ ! -z "$LEAGUE_ID" ]; then
  echo ""
  echo "3. Testing League Retrieval (persistence check):"
  curl -s "${BASE_URL}/api/leagues" | jq '.'
  
  echo ""
  echo "✅ Test completed successfully - League ID: $LEAGUE_ID"
else
  echo ""
  echo "❌ League creation failed"
fi

echo ""
echo "🔍 Please manually verify:"
echo "- Leaderboard shows no mock users"
echo "- Created leagues persist across page navigation"
echo "- Pick counter updates dynamically"
