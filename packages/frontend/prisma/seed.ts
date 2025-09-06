/**
 * Database Seed Script
 * Populates the database with initial data for development
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create the 2024 NFL Season
    const season2024 = await prisma.season.upsert({
      where: { year: 2024 },
      update: {},
      create: {
        year: 2024,
        startDate: new Date('2024-09-05'),
        endDate: new Date('2025-02-09'),
        isActive: false,
        isCurrent: false,
      },
    });

    // Create the 2025 NFL Season (current)
    const season2025 = await prisma.season.upsert({
      where: { year: 2025 },
      update: {},
      create: {
        year: 2025,
        startDate: new Date('2025-09-04'),
        endDate: new Date('2026-02-08'),
        isActive: true,
        isCurrent: true,
      },
    });

    console.log('✅ Created seasons:', { season2024: season2024.year, season2025: season2025.year });

    // Create NFL Teams
    const teams = [
      // AFC East
      { name: 'Bills', city: 'Buffalo', fullName: 'Buffalo Bills', abbreviation: 'BUF', conference: 'AFC' as const, division: 'EAST' as const },
      { name: 'Dolphins', city: 'Miami', fullName: 'Miami Dolphins', abbreviation: 'MIA', conference: 'AFC' as const, division: 'EAST' as const },
      { name: 'Patriots', city: 'New England', fullName: 'New England Patriots', abbreviation: 'NE', conference: 'AFC' as const, division: 'EAST' as const },
      { name: 'Jets', city: 'New York', fullName: 'New York Jets', abbreviation: 'NYJ', conference: 'AFC' as const, division: 'EAST' as const },
      
      // AFC North
      { name: 'Ravens', city: 'Baltimore', fullName: 'Baltimore Ravens', abbreviation: 'BAL', conference: 'AFC' as const, division: 'NORTH' as const },
      { name: 'Bengals', city: 'Cincinnati', fullName: 'Cincinnati Bengals', abbreviation: 'CIN', conference: 'AFC' as const, division: 'NORTH' as const },
      { name: 'Browns', city: 'Cleveland', fullName: 'Cleveland Browns', abbreviation: 'CLE', conference: 'AFC' as const, division: 'NORTH' as const },
      { name: 'Steelers', city: 'Pittsburgh', fullName: 'Pittsburgh Steelers', abbreviation: 'PIT', conference: 'AFC' as const, division: 'NORTH' as const },
      
      // AFC South
      { name: 'Texans', city: 'Houston', fullName: 'Houston Texans', abbreviation: 'HOU', conference: 'AFC' as const, division: 'SOUTH' as const },
      { name: 'Colts', city: 'Indianapolis', fullName: 'Indianapolis Colts', abbreviation: 'IND', conference: 'AFC' as const, division: 'SOUTH' as const },
      { name: 'Jaguars', city: 'Jacksonville', fullName: 'Jacksonville Jaguars', abbreviation: 'JAX', conference: 'AFC' as const, division: 'SOUTH' as const },
      { name: 'Titans', city: 'Tennessee', fullName: 'Tennessee Titans', abbreviation: 'TEN', conference: 'AFC' as const, division: 'SOUTH' as const },
      
      // AFC West
      { name: 'Broncos', city: 'Denver', fullName: 'Denver Broncos', abbreviation: 'DEN', conference: 'AFC' as const, division: 'WEST' as const },
      { name: 'Chiefs', city: 'Kansas City', fullName: 'Kansas City Chiefs', abbreviation: 'KC', conference: 'AFC' as const, division: 'WEST' as const },
      { name: 'Raiders', city: 'Las Vegas', fullName: 'Las Vegas Raiders', abbreviation: 'LV', conference: 'AFC' as const, division: 'WEST' as const },
      { name: 'Chargers', city: 'Los Angeles', fullName: 'Los Angeles Chargers', abbreviation: 'LAC', conference: 'AFC' as const, division: 'WEST' as const },
      
      // NFC East
      { name: 'Cowboys', city: 'Dallas', fullName: 'Dallas Cowboys', abbreviation: 'DAL', conference: 'NFC' as const, division: 'EAST' as const },
      { name: 'Giants', city: 'New York', fullName: 'New York Giants', abbreviation: 'NYG', conference: 'NFC' as const, division: 'EAST' as const },
      { name: 'Eagles', city: 'Philadelphia', fullName: 'Philadelphia Eagles', abbreviation: 'PHI', conference: 'NFC' as const, division: 'EAST' as const },
      { name: 'Commanders', city: 'Washington', fullName: 'Washington Commanders', abbreviation: 'WAS', conference: 'NFC' as const, division: 'EAST' as const },
      
      // NFC North
      { name: 'Bears', city: 'Chicago', fullName: 'Chicago Bears', abbreviation: 'CHI', conference: 'NFC' as const, division: 'NORTH' as const },
      { name: 'Lions', city: 'Detroit', fullName: 'Detroit Lions', abbreviation: 'DET', conference: 'NFC' as const, division: 'NORTH' as const },
      { name: 'Packers', city: 'Green Bay', fullName: 'Green Bay Packers', abbreviation: 'GB', conference: 'NFC' as const, division: 'NORTH' as const },
      { name: 'Vikings', city: 'Minnesota', fullName: 'Minnesota Vikings', abbreviation: 'MIN', conference: 'NFC' as const, division: 'NORTH' as const },
      
      // NFC South
      { name: 'Falcons', city: 'Atlanta', fullName: 'Atlanta Falcons', abbreviation: 'ATL', conference: 'NFC' as const, division: 'SOUTH' as const },
      { name: 'Panthers', city: 'Carolina', fullName: 'Carolina Panthers', abbreviation: 'CAR', conference: 'NFC' as const, division: 'SOUTH' as const },
      { name: 'Saints', city: 'New Orleans', fullName: 'New Orleans Saints', abbreviation: 'NO', conference: 'NFC' as const, division: 'SOUTH' as const },
      { name: 'Buccaneers', city: 'Tampa Bay', fullName: 'Tampa Bay Buccaneers', abbreviation: 'TB', conference: 'NFC' as const, division: 'SOUTH' as const },
      
      // NFC West
      { name: 'Cardinals', city: 'Arizona', fullName: 'Arizona Cardinals', abbreviation: 'ARI', conference: 'NFC' as const, division: 'WEST' as const },
      { name: 'Rams', city: 'Los Angeles', fullName: 'Los Angeles Rams', abbreviation: 'LAR', conference: 'NFC' as const, division: 'WEST' as const },
      { name: '49ers', city: 'San Francisco', fullName: 'San Francisco 49ers', abbreviation: 'SF', conference: 'NFC' as const, division: 'WEST' as const },
      { name: 'Seahawks', city: 'Seattle', fullName: 'Seattle Seahawks', abbreviation: 'SEA', conference: 'NFC' as const, division: 'WEST' as const },
    ];

    console.log('🏈 Creating NFL teams...');
    const createdTeams: any[] = [];
    for (const team of teams) {
      const createdTeam = await prisma.team.upsert({
        where: { abbreviation: team.abbreviation },
        update: {},
        create: team,
      });
      createdTeams.push(createdTeam);
    }
    console.log(`✅ Created ${createdTeams.length} teams`);

    // Create Week 1 of 2025 season
    const week1 = await prisma.week.upsert({
      where: { 
        seasonId_weekNumber: {
          seasonId: season2025.id,
          weekNumber: 1
        }
      },
      update: {},
      create: {
        seasonId: season2025.id,
        weekNumber: 1,
        weekType: 'REGULAR',
        startDate: new Date('2025-09-04'),
        endDate: new Date('2025-09-08'),
        pickDeadline: new Date('2025-09-05T20:00:00Z'),
        isActive: true,
      },
    });

    console.log('✅ Created Week 1 of 2025 season');

    // Create a demo user
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@nflpickem.com' },
      update: {},
      create: {
        email: 'demo@nflpickem.com',
        username: 'demo_user',
        displayName: 'Demo User',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewgvsPkgr7lH3yEO', // "password123"
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    console.log('✅ Created demo user:', demoUser.email);

    // Create a demo league
    const demoLeague = await prisma.league.upsert({
      where: { code: 'DEMO2025' },
      update: {},
      create: {
        name: 'Demo League 2025',
        description: 'A demonstration league for testing the NFL Pick Em application',
        code: 'DEMO2025',
        seasonId: season2025.id,
        createdById: demoUser.id,
        maxMembers: 50,
        isPrivate: false, // Make it public for demo
        scoringSystem: 'STANDARD',
      },
    });

    console.log('✅ Created demo league:', demoLeague.name);

    // Add demo user to the league
    await prisma.userLeague.upsert({
      where: {
        userId_leagueId: {
          userId: demoUser.id,
          leagueId: demoLeague.id,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        leagueId: demoLeague.id,
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: new Date(),
      },
    });

    console.log('✅ Added demo user to demo league');

    // Create some basic achievements
    const achievements = [
      {
        name: 'First Pick',
        description: 'Make your first pick in any league',
        category: 'MILESTONE' as const,
        rarity: 'COMMON' as const,
        points: 10,
        criteria: { type: 'pick_count', threshold: 1 },
      },
      {
        name: 'Perfect Week',
        description: 'Get every pick correct in a single week',
        category: 'PERFECT' as const,
        rarity: 'RARE' as const,
        points: 100,
        criteria: { type: 'perfect_week', threshold: 1 },
      },
      {
        name: 'League Champion',
        description: 'Win a league championship',
        category: 'SOCIAL' as const,
        rarity: 'LEGENDARY' as const,
        points: 500,
        criteria: { type: 'league_wins', threshold: 1 },
      },
    ];

    console.log('🏆 Creating achievements...');
    for (const achievement of achievements) {
      await prisma.achievement.upsert({
        where: { name: achievement.name },
        update: {},
        create: achievement,
      });
    }

    console.log('✅ Created achievements');

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
