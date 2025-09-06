#!/bin/bash

# Test script to verify league persistence after pick submission
echo "🔧 Testing League Persistence After Pick Submission"
echo "================================================="

BASE_URL="https://project-pick-5twstd89h-webecodins-projects.vercel.app"

echo ""
echo "Step 1: Create a test league"
LEAGUE_DATA='{
  "name": "Pick Persistence Test League", 
  "description": "Testing league state after pick submission",
  "settings": {
    "maxMembers": 10,
    "isPrivate": false,
    "requireApproval": false,
    "scoringSystem": "standard",
    "weeklyPayout": false,
    "seasonPayout": true
  }
}'

CREATE_RESULT=$(curl -s -X POST "${BASE_URL}/api/leagues" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d "$LEAGUE_DATA")

echo "League creation result:"
echo "$CREATE_RESULT" | jq '.'

LEAGUE_ID=$(echo "$CREATE_RESULT" | jq -r '.data.id // empty')

if [ ! -z "$LEAGUE_ID" ]; then
  echo ""
  echo "✅ League created successfully with ID: $LEAGUE_ID"
  
  echo ""
  echo "Step 2: Verify league exists before pick"
  curl -s "${BASE_URL}/api/leagues" | jq '.data | length'
  
  echo ""
  echo "Step 3: Submit a pick"
  PICK_DATA='{
    "gameId": "game_1",
    "selectedTeam": "home",
    "confidence": 5
  }'
  
  PICK_RESULT=$(curl -s -X POST "${BASE_URL}/api/picks" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer test-token" \
    -d "$PICK_DATA")
  
  echo "Pick submission result:"
  echo "$PICK_RESULT" | jq '.'
  
  echo ""
  echo "Step 4: Check if league still exists after pick submission"
  LEAGUES_AFTER=$(curl -s "${BASE_URL}/api/leagues" | jq '.data | length')
  echo "Number of leagues after pick: $LEAGUES_AFTER"
  
  if [ "$LEAGUES_AFTER" -gt 0 ]; then
    echo "✅ SUCCESS: League persisted after pick submission!"
    echo ""
    echo "Remaining leagues:"
    curl -s "${BASE_URL}/api/leagues" | jq '.data[] | {id: .id, name: .name}'
  else
    echo "❌ FAIL: League disappeared after pick submission"
  fi
  
else
  echo "❌ Failed to create test league"
fi

echo ""
echo "🔍 Manual Test Instructions:"
echo "1. Login to the app at: $BASE_URL"
echo "2. Create a new league in 'Manage Leagues'"
echo "3. Navigate to dashboard and make a pick"
echo "4. Return to 'Manage Leagues' and verify league is still there"
