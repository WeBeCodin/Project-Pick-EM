#!/usr/bin/env node

/**
 * Test script to verify league consistency between dashboard and league management
 */

const BASE_URL = 'https://project-pick-em.vercel.app';
const TEST_USER = 'demo-user';

async function makeRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  console.log(`🔍 Testing: ${url}`);
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testLeagueConsistency() {
  console.log('🏆 Testing League Consistency');
  console.log('=' .repeat(50));
  
  // Test 1: Get leagues from dashboard perspective
  console.log('\n📊 Dashboard Perspective:');
  const dashboardLeagues = await makeRequest(`/api/leagues?action=my-leagues&userId=${TEST_USER}`);
  
  if (dashboardLeagues.success) {
    const count = dashboardLeagues.data.data?.leagues?.length || 0;
    console.log(`✅ Dashboard shows ${count} leagues`);
    dashboardLeagues.data.data.leagues.forEach(league => {
      console.log(`   - ${league.name} (${league.id})`);
    });
  } else {
    console.log(`❌ Dashboard request failed: ${dashboardLeagues.error}`);
  }
  
  // Test 2: Get all leagues (league management perspective)
  console.log('\n🔧 League Management Perspective:');
  const allLeagues = await makeRequest('/api/leagues');
  
  if (allLeagues.success) {
    const count = allLeagues.data.data?.length || 0;
    console.log(`✅ League management shows ${count} total leagues`);
    allLeagues.data.data.forEach(league => {
      console.log(`   - ${league.name} (${league.id}) - Creator: ${league.creator}`);
    });
  } else {
    console.log(`❌ League management request failed: ${allLeagues.error}`);
  }
  
  // Test 3: Create a new league to test consistency
  console.log('\n➕ Creating Test League:');
  const newLeague = await makeRequest('/api/leagues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Consistency Test League',
      description: 'Testing league count consistency',
      ownerData: {
        userId: TEST_USER,
        username: TEST_USER
      },
      settings: {
        maxMembers: 10,
        isPrivate: false,
        scoringSystem: 'Standard'
      }
    })
  });
  
  if (newLeague.success) {
    console.log(`✅ Created league: ${newLeague.data.data.league.name} (${newLeague.data.data.league.id})`);
    
    // Test 4: Verify both endpoints show the new league
    console.log('\n🔄 Verifying Consistency After Creation:');
    
    const updatedDashboard = await makeRequest(`/api/leagues?action=my-leagues&userId=${TEST_USER}`);
    const updatedAll = await makeRequest('/api/leagues');
    
    if (updatedDashboard.success && updatedAll.success) {
      const dashboardCount = updatedDashboard.data.data?.leagues?.length || 0;
      const userLeaguesInAll = updatedAll.data.data.filter(l => l.creator === TEST_USER).length;
      
      console.log(`📊 Dashboard now shows: ${dashboardCount} leagues`);
      console.log(`🔧 User's leagues in all: ${userLeaguesInAll} leagues`);
      
      if (dashboardCount === userLeaguesInAll) {
        console.log('✅ League counts are consistent!');
      } else {
        console.log('❌ League count mismatch detected!');
      }
    }
  } else {
    console.log(`❌ Failed to create test league: ${newLeague.error}`);
  }
  
  // Test 5: Test league-specific picks
  console.log('\n🎯 Testing League-Specific Picks:');
  
  // Get a league ID to test with
  const leaguesForPicks = await makeRequest(`/api/leagues?action=my-leagues&userId=${TEST_USER}`);
  if (leaguesForPicks.success && leaguesForPicks.data.data.leagues.length > 0) {
    const testLeagueId = leaguesForPicks.data.data.leagues[0].id;
    console.log(`📋 Testing picks for league: ${testLeagueId}`);
    
    // Submit a test pick
    const pickSubmission = await makeRequest('/api/picks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: TEST_USER,
        gameId: 'test-game-123',
        selectedTeam: 'home',
        confidence: 5,
        weekId: 'week-1',
        leagueId: testLeagueId
      })
    });
    
    if (pickSubmission.success) {
      console.log(`✅ Pick submitted successfully`);
      
      // Retrieve picks for the league
      const retrievedPicks = await makeRequest(`/api/picks?leagueId=${testLeagueId}&userId=${TEST_USER}`);
      
      if (retrievedPicks.success) {
        const pickCount = retrievedPicks.data.data?.picks?.length || 0;
        console.log(`✅ Retrieved ${pickCount} picks for league ${testLeagueId}`);
      } else {
        console.log(`❌ Failed to retrieve picks: ${retrievedPicks.error}`);
      }
    } else {
      console.log(`❌ Failed to submit pick: ${pickSubmission.error}`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 League Consistency Test Complete');
}

// Run the test
testLeagueConsistency().catch(console.error);
