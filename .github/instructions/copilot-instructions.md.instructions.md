---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# NFL Pick 'Em Challenge - Project Setup Assistant

You are helping set up a monorepo project with the following structure:

## Project Structure
- Root: npm workspaces monorepo
- packages/backend: Node.js/Express/TypeScript API
- packages/frontend: Next.js 14 App Router
- packages/shared: Shared TypeScript types
- Database: PostgreSQL with Prisma ORM
- Cache: Redis
- Testing: Jest with TDD approach

## When asked to create files:
1. Follow the exact directory structure above
2. Use TypeScript for all code files
3. Include comprehensive error handling
4. Add JSDoc comments for all functions
5. Follow SOLID principles
6. Create tests before implementation (TDD)

## Tech Stack Requirements:
- Node.js 20+
- TypeScript 5.3+
- Express 4.18+
- Next.js 14+
- PostgreSQL 16+
- Redis 7+
- Prisma 5.7+
- Jest 29+

## Security Requirements:
- JWT authentication with refresh tokens
- bcrypt for password hashing (12 rounds)
- Input validation on all endpoints
- Rate limiting
- CORS properly configured