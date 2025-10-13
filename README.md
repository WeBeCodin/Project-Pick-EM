# NFL Pick 'Em Challenge

A free-to-play web application for NFL pick 'em challenges, featuring prediction-based scoring with event sourcing, single-game locks, and spread-aware scoring.

## 🚀 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with refresh tokens
- **League Management**: Create and join public/private leagues
- **NFL Game Schedule**: Automatic game schedule updates via RSS feeds
- **Live Scores**: Real-time score tracking and updates
- **Leaderboards**: Weekly and season-long rankings

### New: Predictions & Event Sourcing System
- **Event Sourcing**: Append-only event log with automatic reconciliation (every 5 minutes)
- **Prediction-based Scoring**: Predict exact final scores with accuracy-weighted algorithm
  - Winner points: 10 points for correct winner
  - Accuracy bonus: 0-20 points based on margin accuracy
  - Spread-aware scoring: Optional use of official point spreads
- **Single-game Lock System**: Lock one game per week for bonus/penalty
  - Lock bonus: +20 points for correct locked pick (configurable)
  - Lock penalty: -15 points for incorrect locked pick (configurable)
  - Unique locks per game (only one user can lock each game)
- **Data Protection**: Automated reconciliation prevents data loss

## 📋 Tech Stack

### Backend
- **Node.js 20+** with TypeScript
- **Express 4.18+** - REST API
- **PostgreSQL 16+** - Primary database
- **Redis 7+** - Caching
- **Prisma 5.7+** - ORM
- **Jest 29+** - Testing

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript 5.3+**
- **Tailwind CSS** - Styling
- **Playwright** - E2E testing

### Infrastructure
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Vercel** - Frontend hosting (optional)

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- npm 10+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/WeBeCodin/Project-Pick-EM.git
   cd Project-Pick-EM
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start PostgreSQL and Redis** (using Docker)
   ```bash
   npm run docker:up
   ```

5. **Run database migrations**
   ```bash
   cd packages/backend
   npx prisma migrate dev
   npx prisma generate
   ```

6. **Seed the database** (optional)
   ```bash
   npm run db:seed
   ```

7. **Start development servers**
   ```bash
   # In root directory
   npm run dev
   
   # Or start individually:
   npm run dev:backend  # Backend on port 3001
   npm run dev:frontend # Frontend on port 3000
   ```

8. **Visit the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/health

## 📚 Documentation

- **[Predictions Feature Guide](./docs/features/predictions.md)** - Complete documentation for predictions, event sourcing, and lock system
- **[API Documentation](./docs/api/)** - REST API endpoints
- **[Database Schema](./packages/backend/prisma/schema.prisma)** - Prisma schema

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests with coverage
cd packages/backend
npm test -- --coverage

# Run specific test suites
npm test -- src/services/scoring/__tests__/scoring.service.test.ts
npm test -- src/services/predictions/__tests__/predictions-locks.test.ts

# Run E2E tests
npm run e2e
```

## 📡 API Endpoints

### Predictions
- `POST /api/v1/predictions` - Create/update prediction
- `GET /api/v1/predictions` - Get user predictions
- `GET /api/v1/predictions/:id` - Get single prediction
- `DELETE /api/v1/predictions/:id` - Delete prediction
- `GET /api/v1/predictions/locks/availability` - Get lock availability

### Admin
- `POST /api/admin/reconcile` - Run reconciliation now
- `POST /api/admin/spreads/fetch` - Fetch spreads now
- `POST /api/admin/scores/compute/:weekId` - Compute scores for week

### Picks (Legacy)
- `POST /api/v1/picks` - Submit pick
- `GET /api/v1/picks/week/:weekNumber` - Get user's picks for week

### Leagues
- `POST /api/v1/leagues` - Create league
- `GET /api/v1/leagues` - Get all leagues
- `POST /api/v1/leagues/:id/join` - Join league

## 🏗️ Project Structure

```
Project-Pick-EM/
├── packages/
│   ├── backend/          # Express API server
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   │   ├── events/         # Event sourcing
│   │   │   │   ├── reconciliation/ # Data reconciliation
│   │   │   │   ├── predictions/    # Predictions CRUD
│   │   │   │   ├── scoring/        # Scoring algorithm
│   │   │   │   └── rss/           # RSS feeds & spreads
│   │   │   ├── routes/
│   │   │   └── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── tests/
│   ├── frontend/         # Next.js web app
│   │   ├── app/
│   │   │   ├── predictions/  # Predictions page
│   │   │   ├── leagues/
│   │   │   └── dashboard/
│   │   └── components/
│   │       └── ui/
│   │           ├── PredictionForm.tsx
│   │           └── LiveScoreboard.tsx
│   └── shared/          # Shared TypeScript types
├── docs/                # Documentation
│   └── features/
│       └── predictions.md
├── .github/
│   └── workflows/       # CI/CD workflows
└── docker-compose.yml   # Docker setup
```

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://pickem:password@localhost:5432/nfl_pickem

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Spread Fetcher
RSS_SPREAD_FEED_URL=https://your-spread-feed.com/rss
ENABLE_SPREAD_FETCHING=false

# Scoring Configuration
WINNER_POINTS=10
MAX_ACCURACY_POINTS=20
MARGIN_NORMALIZATION=20
```

See `.env.example` for all available options.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TDD practices
- Write comprehensive tests (>90% coverage for critical paths)
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write meaningful commit messages

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- NFL data provided via RSS feeds
- Community contributors
- Open source libraries used in this project

## 📞 Support

- Issues: [GitHub Issues](https://github.com/WeBeCodin/Project-Pick-EM/issues)
- Discussions: [GitHub Discussions](https://github.com/WeBeCodin/Project-Pick-EM/discussions)

## 🚦 CI/CD Status

[![Predictions Feature](https://github.com/WeBeCodin/Project-Pick-EM/actions/workflows/feature-predictions.yml/badge.svg)](https://github.com/WeBeCodin/Project-Pick-EM/actions/workflows/feature-predictions.yml)
[![Prisma Validation](https://github.com/WeBeCodin/Project-Pick-EM/actions/workflows/prisma-validation.yml/badge.svg)](https://github.com/WeBeCodin/Project-Pick-EM/actions/workflows/prisma-validation.yml)
[![CodeQL](https://github.com/WeBeCodin/Project-Pick-EM/actions/workflows/codeql.yml/badge.svg)](https://github.com/WeBeCodin/Project-Pick-EM/actions/workflows/codeql.yml)
