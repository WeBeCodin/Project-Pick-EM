# CI/CD Quality Gates & Testing Guide

## Overview
This document outlines the CI/CD pipeline quality gates implemented to prevent the league membership persistence and user session issues we experienced.

## Quality Gates

### 1. Prisma Schema Validation (`.github/workflows/prisma-validation.yml`)
**Prevents:** Database schema mismatches, migration issues, type generation problems

**Runs:**
- Schema validation (`npx prisma validate`)
- Migration status check
- Type generation verification
- Database connection test

**Triggers:** Push/PR to main, api-fixes-* branches

### 2. CodeQL Security Analysis (`.github/workflows/codeql.yml`)
**Prevents:** SQL injection, authentication bypasses, data leaks

**Runs:**
- Security vulnerability scanning
- Code quality analysis
- Custom queries for league/auth patterns

**Triggers:** Push/PR to main, weekly schedule

### 3. E2E Tests (`.github/workflows/e2e.yml`)
**Prevents:** League membership persistence issues, user session problems

**Tests:**
- League creation and membership tracking
- Logout/login cycle with data persistence
- Member count accuracy across UI
- Scoring system integrity

**Triggers:** Push/PR to main

### 4. Dependabot + Prisma Safety (`.github/dependabot.yml`, `.github/workflows/prisma-dependabot.yml`)
**Prevents:** Breaking changes from dependency updates

**Checks:**
- Destructive migration detection
- Schema validation on Prisma updates
- Type safety verification

## Local Development

### Run E2E Tests Locally
```bash
# Install Playwright
npm i -D @playwright/test
npx playwright install

# Start local stack
docker-compose up -d

# Run tests
npm run e2e
```

### Manual Type Checking
```bash
# Backend types
cd packages/backend
npx prisma generate
npx tsc --noEmit

# Frontend types  
cd packages/frontend
npm run typecheck
```

### Database Migration Safety
```bash
# Check migration status
npx prisma migrate status

# Validate schema
npx prisma validate

# Check for breaking changes
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma
```

## Branch Protection Rules

### Required Status Checks
- `validate-schema` (Prisma Schema Validation)
- `test` (E2E Tests)  
- `analyze` (CodeQL Security Analysis)

### Code Review Requirements
- At least 1 approval required
- CODEOWNERS review for critical paths:
  - `/packages/backend/prisma/`
  - `/packages/backend/src/services/auth/`
  - `/packages/backend/src/services/league/`
  - `/packages/frontend/app/api/`

## Merge Queue Configuration
Located in `.github/merge-queue.yml` - ensures all checks pass before merge.

## Key Files

### Issue Templates
- `.github/ISSUE_TEMPLATE/bug_report.yml` - Structured bug reporting focused on league/auth issues

### Code Ownership
- `.github/CODEOWNERS` - Automatic review requests for critical changes

### Copilot Workspace
- `.github/copilot-workspace.yml` - AI context and validation guidelines

## Monitoring & Alerts

### Vercel Deployment
- GitHub integration enabled
- Auto-alias for PR previews
- Deployment health checks

### Security
- CodeQL alerts enabled
- Dependabot security updates
- Secret scanning (if enabled)

## Best Practices

1. **Always run Prisma validation before committing schema changes**
2. **Test league membership after any auth/session changes**
3. **Verify member counts in all UI components after league operations**
4. **Use TypeScript types from Prisma client for consistency**
5. **Check E2E test results before merging**

## Troubleshooting

### E2E Test Failures
```bash
# Run with debug info
npx playwright test --debug

# Run specific test
npx playwright test league-persistence.spec.ts

# View test results
npx playwright show-report
```

### CI Pipeline Issues
1. Check GitHub Actions logs
2. Verify database connection in CI
3. Ensure all environment variables are set
4. Check for TypeScript compilation errors

## Next Steps

1. **Enable GitHub Advanced Security** in repository settings
2. **Set up Merge Queue** in repository settings
3. **Add more E2E test scenarios** for edge cases
4. **Connect frontend to real backend API** with OpenAPI type generation
