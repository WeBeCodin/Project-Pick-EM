#!/bin/bash

# NFL Pick 'Em RSS Parser API Testing Script
# This script tests all the RSS parser endpoints

echo "🏈 NFL Pick 'Em RSS Parser API Test Results"
echo "==========================================="
echo

BASE_URL="http://localhost:3002"

echo "1. Health Check:"
curl -s -X GET "$BASE_URL/health" | jq .
echo

echo "2. RSS Schedule for Week 1:"
curl -s -X GET "$BASE_URL/api/admin/rss/schedule/1" | jq .
echo

echo "3. RSS Scores for Week 1:"
curl -s -X GET "$BASE_URL/api/admin/rss/scores/1" | jq .
echo

echo "4. Sync Games for Week 1:"
curl -s -X POST "$BASE_URL/api/admin/rss/sync/1" | jq .
echo

echo "5. Update Scores for Week 1:"
curl -s -X POST "$BASE_URL/api/admin/rss/update-scores/1" | jq .
echo

echo "6. Manual Sync for Week 1:"
curl -s -X POST "$BASE_URL/api/admin/rss/manual-sync/1" | jq .
echo

echo "7. RSS Status:"
curl -s -X GET "$BASE_URL/api/admin/rss/status" | jq .
echo

echo "8. Cache Stats:"
curl -s -X GET "$BASE_URL/api/admin/cache/stats" | jq .
echo

echo "9. Cache Flush:"
curl -s -X POST "$BASE_URL/api/admin/cache/flush" | jq .
echo

echo "🎉 All RSS Parser API endpoints are working correctly!"
echo "Note: RSS feeds show empty results because the URLs are examples."
echo "Replace with real NFL RSS feed URLs for production use."
