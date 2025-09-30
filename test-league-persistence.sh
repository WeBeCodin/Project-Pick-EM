#!/bin/bash

# Test script to verify league persistence after pick submission
echo "🔧 Testing League Persistence After Pick Submission"
echo "================================================="

BASE_URL="https://project-pick-5twstd89h-webecodins-projects.vercel.app"
USER_ID="test-user-123" # Static user ID for testing
GAME_ID="test-game-123" # Static game ID for testing
TEAM_ID="kc-chiefs-test-id" # Static team ID for testing

echo ""
echo "Step 1: Create a test league"
# This payload now includes the 'settings' object required by the frontend API
LEAGUE_DATA=$(cat <<EOF
{
  "name": "Pick Persistence Test League",
  "description": "A league to test data persistence against the deployed frontend API.",
  "settings": {
    "isPrivate": false,
    "maxMembers": 20,
    "scoringSystem": "STANDARD"
  }
}
EOF
)

# Use x-user-id header for authentication
CREATE_RESULT=$(curl -s -X POST "${BASE_URL}/api/leagues" \
  -H "Content-Type: application/json" \
  -H "x-user-id: ${USER_ID}" \
  -d "$LEAGUE_DATA")

echo "League creation result:"
echo "$CREATE_RESULT" | jq '.'

# The frontend API returns the league object directly in `data`
LEAGUE_ID=$(echo "$CREATE_RESULT" | jq -r '.data.id // empty')

if [ ! -z "$LEAGUE_ID" ]; then
  echo ""
  echo "✅ League created successfully with ID: $LEAGUE_ID"
  
  echo ""
  echo "Step 2: Verify league exists before pick"
  # Use the correct API endpoint with query parameter
  LEAGUES_BEFORE=$(curl -s -H "x-user-id: ${USER_ID}" "${BASE_URL}/api/leagues?action=my-leagues" | jq '.data | length')
  echo "Number of leagues before pick: $LEAGUES_BEFORE"

  echo ""
  echo "Step 3: Submit a pick"
  echo "NOTE: The pick submission endpoint (/api/v1/picks) is a backend route."
  echo "This call is expected to fail against the frontend, but we proceed to test league persistence."
  PICK_DATA=$(cat <<EOF
{
  "gameId": "${GAME_ID}",
  "selectedTeamId": "${TEAM_ID}"
}
EOF
)
  
  PICK_RESULT=$(curl -s -X POST "${BASE_URL}/api/v1/picks" \
    -H "Content-Type: application/json" \
    -H "x-user-id: ${USER_ID}" \
    -d "$PICK_DATA")
  
  echo "Pick submission result (expected to fail gracefully):"
  echo "$PICK_RESULT" | jq '.'
  
  echo ""
  echo "Step 4: Check if league still exists after pick submission"
  # Use the correct API endpoint with query parameter
  LEAGUES_AFTER=$(curl -s -H "x-user-id: ${USER_ID}" "${BASE_URL}/api/leagues?action=my-leagues" | jq '.data | length')
  echo "Number of leagues after pick: $LEAGUES_AFTER"
  
  if [ "$LEAGUES_AFTER" -gt 0 ]; then
    echo "✅ SUCCESS: League persisted after pick submission!"
    echo ""
    echo "Remaining leagues:"
    curl -s -H "x-user-id: ${USER_ID}" "${BASE_URL}/api/leagues?action=my-leagues" | jq '.data[] | {id: .id, name: .name}'
  else
    echo "❌ FAIL: League disappeared after pick submission"
  fi
  
else
  echo "❌ Failed to create test league"
fi