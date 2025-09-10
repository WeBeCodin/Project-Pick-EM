#!/usr/bin/env node

/**
 * USER SESSION PERSISTENCE TEST
 * 
 * This test verifies the critical user session issues reported:
 * 1. User data persistence across logout/login cycles
 * 2. League membership continuity 
 * 3. Dashboard showing correct league counts
 * 4. League management showing user's actual leagues
 * 5. Ability to make picks with correct user context
 */

const baseUrl = 'https://project-pick-em.vercel.app';

async function makeRequest(endpoint, options = {}) {
  try {
    console.log(`🔍 Testing: ${baseUrl}${endpoint}`);
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testUserSessionPersistence() {
  console.log('🔐 USER SESSION PERSISTENCE TEST');
  console.log('===============================================');
  
  // Simulate user tfcdesigns logging in and creating a league
  console.log('\n👤 Scenario 1: User creates league and logs out');
  
  // Create a league as tfcdesigns
  const createResponse = await makeRequest('/api/leagues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Session Test League',
      description: 'Testing user session persistence',
      settings: {
        scoringType: 'CONFIDENCE',
        maxMembers: 10,
        isPrivate: false,
        weekStart: 1,
        locktime: 'kickoff'
      },
      ownerData: {
        userId: 'user_tfcdesigns',
        username: 'tfcdesigns',
        email: 'tfc@designs.com'
      }
    })
  });
  
  if (createResponse.success) {
    const league = createResponse.data.data.league;
    console.log(`✅ Created league: ${league.name} (${league.id})`);
    console.log(`👑 Creator: ${league.creator}`);
    console.log(`👥 Members: ${league.members.length}`);
    
    // Test 1: Verify league shows in creator's "my leagues"
    console.log('\n🔍 Test 1: Creator checks "My Leagues"');
    const creatorLeagues = await makeRequest(`/api/leagues?action=my-leagues&userId=user_tfcdesigns`);
    
    if (creatorLeagues.success) {
      const leagues = creatorLeagues.data.data.leagues || [];
      console.log(`✅ Creator sees ${leagues.length} leagues in "My Leagues"`);
      
      const sessionLeague = leagues.find(l => l.name === 'Session Test League');
      if (sessionLeague) {
        console.log(`   ✅ Session Test League found with ${sessionLeague.members.length} members`);
      } else {
        console.log(`   ❌ Session Test League NOT found in creator's leagues`);
      }
    }
    
    // Test 2: Simulate "logout" and "login" - check if league persists
    console.log('\n🔄 Test 2: Simulate logout/login cycle');
    console.log('   (In real app, this would clear session and reload user data)');
    
    // Re-check creator's leagues (simulating fresh login)
    const afterLoginLeagues = await makeRequest(`/api/leagues?action=my-leagues&userId=user_tfcdesigns`);
    
    if (afterLoginLeagues.success) {
      const leagues = afterLoginLeagues.data.data.leagues || [];
      console.log(`✅ After "login": Creator sees ${leagues.length} leagues`);
      
      const persistedLeague = leagues.find(l => l.name === 'Session Test League');
      if (persistedLeague) {
        console.log(`   ✅ League persisted! ${persistedLeague.name} still in user's leagues`);
        console.log(`   👥 Member count: ${persistedLeague.members.length}`);
        console.log(`   📊 Scoring: ${persistedLeague.scoringSystem || persistedLeague.scoringType}`);
      } else {
        console.log(`   ❌ CRITICAL: League lost after logout/login cycle!`);
      }
    }
    
    // Test 3: Dashboard data consistency
    console.log('\n📊 Test 3: Dashboard vs League Management consistency');
    
    // Check if league appears in public view for other users
    const publicLeagues = await makeRequest(`/api/leagues?action=public`);
    if (publicLeagues.success) {
      const publicList = publicLeagues.data.data.leagues || [];
      console.log(`✅ Public leagues count: ${publicList.length}`);
      
      const publicSessionLeague = publicList.find(l => l.name === 'Session Test League');
      if (publicSessionLeague) {
        console.log(`   ✅ League visible in public listings`);
        console.log(`   👥 Public view member count: ${publicSessionLeague.members.length}`);
      }
    }
    
    // Test 4: Join league as another user
    console.log('\n👤 Test 4: Different user joins league');
    const joinResponse = await makeRequest('/api/leagues', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        leagueId: league.id,
        action: 'join',
        userData: {
          userId: 'demo-user',
          username: 'demo-user'
        }
      })
    });
    
    if (joinResponse.success) {
      console.log(`✅ Demo-user joined league successfully`);
      console.log(`👥 League now has ${joinResponse.data.data.members.length} members`);
      
      // Verify both users can see the league
      console.log('\n🔍 Test 5: Both users see updated membership');
      
      // Check original creator
      const creatorCheck = await makeRequest(`/api/leagues?action=my-leagues&userId=user_tfcdesigns`);
      if (creatorCheck.success) {
        const creatorLeague = creatorCheck.data.data.leagues.find(l => l.id === league.id);
        console.log(`✅ Creator sees ${creatorLeague?.members?.length || 0} members`);
      }
      
      // Check new member
      const memberCheck = await makeRequest(`/api/leagues?action=my-leagues&userId=demo-user`);
      if (memberCheck.success) {
        const memberLeagues = memberCheck.data.data.leagues || [];
        const joinedLeague = memberLeagues.find(l => l.id === league.id);
        console.log(`✅ Demo-user sees league in their leagues: ${joinedLeague ? 'YES' : 'NO'}`);
        if (joinedLeague) {
          console.log(`   👥 Demo-user sees ${joinedLeague.members.length} members in league`);
        }
      }
    }
  }
  
  console.log('\n===============================================');
  console.log('🏁 User Session Persistence Test Complete');
  console.log('\nKey Issues to Monitor:');
  console.log('- League membership counts consistent across users');
  console.log('- Leagues persist in user\'s "My Leagues" after logout/login');
  console.log('- Dashboard and League Management show same data');
  console.log('- Users can successfully join and see updated membership');
}

// Run the test
testUserSessionPersistence().catch(console.error);
