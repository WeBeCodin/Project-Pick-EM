#!/bin/bash

# Test database integration for NFL Pick 'Em app
echo "🧪 Testing Database Integration"
echo "================================"

# Set database URL for tests
export DATABASE_URL="postgresql://dev_user:dev_password@localhost:5432/nfl_pickem_dev"

# Wait for frontend to be ready
echo "⏳ Waiting for frontend server..."
sleep 3

# Test 1: Get leagues (should return empty array initially)
echo "📊 Test 1: GET leagues..."
curl -s -X GET "http://localhost:3000/api/leagues?userId=testuser&action=my-leagues" | jq '.'

echo ""
echo "📊 Test 2: Create a league..."
curl -s -X POST "http://localhost:3000/api/leagues" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test League",
    "description": "A test league for database integration",
    "settings": {
      "maxMembers": 10,
      "isPrivate": false,
      "scoringSystem": "STANDARD"
    },
    "ownerData": {
      "userId": "testuser",
      "username": "testuser",
      "email": "test@example.com"
    }
  }' | jq '.'

echo ""
echo "📊 Test 3: Get leagues again (should show the created league)..."
curl -s -X GET "http://localhost:3000/api/leagues?userId=testuser&action=my-leagues" | jq '.'

echo ""
echo "📊 Test 4: Test picks API..."
curl -s -X GET "http://localhost:3000/api/picks?userId=testuser" | jq '.'

echo ""
echo "📊 Test 5: Create a pick..."
curl -s -X POST "http://localhost:3000/api/picks" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "testuser",
    "gameId": "game-1",
    "selectedTeam": "home",
    "weekId": "week-1",
    "selectedTeamId": "team-1"
  }' | jq '.'

echo ""
echo "✅ Database integration tests completed!"
echo "🔍 Check the logs above to verify data persistence"
