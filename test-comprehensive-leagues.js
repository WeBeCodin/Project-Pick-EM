#!/usr/bin/env node

/**
 * COMPREHENSIVE TEST: User Session Persistence & League Membership
 */

const BASE_URL = 'https://project-pick-em.vercel.app';

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

async function testUserSessionPersistence() {
  console.log('🔐 COMPREHENSIVE LEAGUE & USER SESSION TEST');
  console.log('=' .repeat(60));
  
  // Test 1: Create league as tfcdesigns
  console.log('\n👤 Step 1: Create league as tfcdesigns user');
  const createLeague = await makeRequest('/api/leagues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Testing League',
      description: 'Comprehensive test league',
      ownerData: {
        userId: 'user_tfcdesigns',
        username: 'tfcdesigns'
      },
      settings: {
        maxMembers: 20,
        isPrivate: false,
        scoringSystem: 'CONFIDENCE'
      }
    })
  });
  
  if (!createLeague.success) {
    console.log('❌ Failed to create league:', createLeague.error);
    return;
  }
  
  const leagueId = createLeague.data.data.league.id;
  console.log(`✅ Created league: ${leagueId}`);
  console.log(`📊 League scoring: ${createLeague.data.data.league.scoringSystem || createLeague.data.data.league.scoringType}`);
  console.log(`👥 Initial members: ${createLeague.data.data.league.members.length}`);
  
  // Test 2: Check league shows in creator's leagues
  console.log('\n👤 Step 2: Verify league appears in creator\'s leagues');
  const creatorLeagues = await makeRequest(`/api/leagues?action=my-leagues&userId=user_tfcdesigns`);
  
  if (creatorLeagues.success) {
    const leagues = creatorLeagues.data.data.leagues || [];
    console.log(`✅ Creator has ${leagues.length} leagues`);
    leagues.forEach(league => {
      console.log(`   - ${league.name} (${league.id}) - Members: ${league.members?.length || 0} - Scoring: ${league.scoringSystem || league.scoringType}`);
    });
  }
  
  // Test 3: Join league as demo-user
  console.log('\n👤 Step 3: Join league as demo-user');
  const joinLeague = await makeRequest(`/api/leagues`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      leagueId: leagueId,
      action: 'join',
      userData: {
        userId: 'demo-user',
        username: 'demo-user'
      }
    })
  });
  
  if (joinLeague.success) {
    console.log(`✅ Demo-user joined league`);
    console.log(`👥 League now has ${joinLeague.data.data.members.length} members`);
  } else {
    console.log(`❌ Failed to join league: ${joinLeague.error}`);
  }
  
  // Test 4: Verify both users see correct league data
  console.log('\n👤 Step 4: Verify league membership persistence');
  
  // Check tfcdesigns leagues
  const tfcLeagues = await makeRequest(`/api/leagues?action=my-leagues&userId=user_tfcdesigns`);
  if (tfcLeagues.success) {
    const leagues = tfcLeagues.data.data.leagues || [];
    console.log(`✅ TFC user sees ${leagues.length} leagues`);
    leagues.forEach(league => {
      console.log(`   - ${league.name}: ${league.members?.length || 0} members`);
    });
  }
  
  // Check demo-user leagues  
  const demoLeagues = await makeRequest(`/api/leagues?action=my-leagues&userId=demo-user`);
  if (demoLeagues.success) {
    const leagues = demoLeagues.data.data.leagues || [];
    console.log(`✅ Demo user sees ${leagues.length} leagues`);
    leagues.forEach(league => {
      console.log(`   - ${league.name}: ${league.members?.length || 0} members`);
    });
  }
  
  // Test 5: Verify public leagues show correct data
  console.log('\n👤 Step 5: Verify public leagues display');
  const publicLeagues = await makeRequest('/api/leagues?action=public');
  if (publicLeagues.success) {
    const leagues = publicLeagues.data.data.leagues || [];
    console.log(`✅ Public leagues: ${leagues.length}`);
    leagues.forEach(league => {
      console.log(`   - ${league.name}: ${league.members?.length || 0} members, Scoring: ${league.scoringSystem || league.scoringType}`);
    });
  }
  
  // Test 6: Test scoring system consistency
  console.log('\n📊 Step 6: Verify scoring system data integrity');
  const allLeagues = await makeRequest('/api/leagues');
  if (allLeagues.success) {
    allLeagues.data.data.forEach(league => {
      const scoring = league.scoringSystem || league.scoringType;
      console.log(`📊 ${league.name}: scoringType="${league.scoringType}", scoringSystem="${league.scoringSystem}", resolved="${scoring}"`);
    });
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🏁 Comprehensive Test Complete');
  console.log('KEY METRICS TO VERIFY:');
  console.log('- League membership persists after creation/joining');
  console.log('- Member counts are accurate and consistent');
  console.log('- Scoring systems display correctly');
  console.log('- User context is maintained properly');
}

// Run the comprehensive test
testUserSessionPersistence().catch(console.error);
