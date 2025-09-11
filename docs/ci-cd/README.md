# CI/CD Quality Gates

This repo is configured with GitHub Actions to enforce quality gates:

- Prisma schema validation and type generation
- CodeQL static analysis
- Playwright E2E scaffold
- Dependabot automated updates with Prisma diff checks
- Merge queue signals (configured in repo settings)

## Local E2E Setup

```bash
npm i -D @playwright/test
npx playwright install
npx playwright test
```
