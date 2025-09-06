const { PrismaClient } = require('@prisma/client');

// Test database connectivity and basic operations
async function testDatabase() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://dev_user:dev_password@localhost:5432/nfl_pickem_dev'
      }
    }
  });

  try {
    console.log('🧪 Testing Database Connection...');
    
    // Test 1: Database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Test 2: Create a user
    console.log('\n👤 Testing User Creation...');
    const user = await prisma.user.upsert({
      where: { username: 'testuser' },
      update: { lastLoginAt: new Date() },
      create: {
        username: 'testuser',
        email: 'test@example.com',
        displayName: 'Test User',
        password: 'test123',
        emailVerified: true,
        isActive: true
      }
    });
    console.log('✅ User created/updated:', user.id);

    // Test 3: Create a season
    console.log('\n📅 Testing Season Creation...');
    const season = await prisma.season.upsert({
      where: { year: 2025 },
      update: { isActive: true },
      create: {
        year: 2025,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-01-31'),
        isActive: true,
        isCurrent: true,
        weeksCount: 18,
        playoffWeeks: 4
      }
    });
    console.log('✅ Season created/updated:', season.id);

    // Test 4: Create a league
    console.log('\n🏈 Testing League Creation...');
    const league = await prisma.league.create({
      data: {
        name: 'Test Database League',
        description: 'Testing database persistence',
        isPrivate: false,
        maxMembers: 20,
        scoringSystem: 'STANDARD',
        createdById: user.id,
        seasonId: season.id,
        code: 'TEST123'
      }
    });
    console.log('✅ League created:', league.id);

    // Test 5: Join the league
    console.log('\n🤝 Testing League Membership...');
    const membership = await prisma.userLeague.create({
      data: {
        leagueId: league.id,
        userId: user.id,
        role: 'OWNER',
        status: 'ACTIVE'
      }
    });
    console.log('✅ League membership created');

    // Test 6: Verify data persistence
    console.log('\n🔍 Testing Data Retrieval...');
    const leagueWithMembers = await prisma.league.findFirst({
      where: { id: league.id },
      include: {
        members: {
          include: { user: true }
        },
        creator: true,
        season: true
      }
    });
    console.log('✅ League retrieved with members:', leagueWithMembers.members.length);

    console.log('\n🎉 ALL DATABASE TESTS PASSED!');
    console.log('💾 Data is being properly persisted to PostgreSQL database');
    console.log('🚀 The app should now maintain state across server restarts');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
