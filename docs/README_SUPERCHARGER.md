# Supercharger Manifesto v3.1 - Implementation Guide

This document describes the Supercharger redesign implementation and how to use the new spec-first, visual-intelligence-enabled workflow.

## 🎯 What is Supercharger?

Supercharger is an architectural pattern that transforms the codebase into a **specification-first, visual-intelligence-enabled** system. It implements the Supercharger Manifesto Master Key v3.1, which emphasizes:

1. **Specifications drive implementation** - Not the other way around
2. **Visual intelligence** - Automated design review and regression detection
3. **Quality gates** - Comprehensive validation before merge
4. **Agentic workflows** - AI agents assist with design review and iteration

## 📦 What Was Added

### 1. Specifications (`specs/`)

**Purpose**: Living documentation that defines design and business logic

Files added:
- `specs/README.md` - Guide to writing and maintaining specs
- `specs/design/style-guide.md` - Design tokens, colors, typography
- `specs/design/design-principles.md` - Core design philosophy
- `specs/features/league-membership.spec.md` - Example feature specification

**Usage**:
```bash
# Browse specs
ls specs/

# Validate specs (placeholder - requires spec-kit)
npm run spec:validate
```

### 2. CI/CD Workflows (`.github/workflows/`)

**Purpose**: Automated validation and quality gates

Files added:
- `supercharger.yml` - Main validation pipeline (specs, types, tests, security)
- `supercharger-design.yml` - Visual regression and design review

**What they do**:
- Validate specification structure
- Run TypeScript type checking
- Execute unit and integration tests
- Perform security scans
- Run E2E tests
- Capture visual regression screenshots
- Generate automated design review reports
- Comment on PRs with findings

### 3. Claude Agent Configuration (`.claude/`)

**Purpose**: AI agent instructions for design review and iteration

Files added:
- `claude.md` - Visual Intelligence Protocol
- `agents/design-reviewer.md` - Design review agent instructions
- `agents/design-iteration.md` - Design iteration agent instructions

**Invocation**:
- Automatically triggered on PRs with UI changes
- Manually: `@claude review design` in PR comments

### 4. Copilot Instructions (`.github/copilot-instructions.md`)

**Purpose**: Context for GitHub Copilot to understand project patterns

**What it provides**:
- Code patterns and conventions
- TypeScript standards
- Design system integration
- Testing approaches
- Anti-patterns to avoid

### 5. Visual Testing (`tests/visual/`, `playwright.config.ts`)

**Purpose**: Catch unintended visual changes

Files added:
- `tests/visual/visual-regression.spec.ts` - Visual test suite
- `test-results/baseline/README.md` - Baseline management guide
- Updated `playwright.config.ts` - Multiple viewport support

**Usage**:
```bash
# Run visual tests
npm run test:visual

# Run all viewports
npm run test:visual:all

# Update baselines
npm run test:visual:update
```

### 6. Design Review Script (`scripts/automated-design-review.js`)

**Purpose**: Automated design review with screenshot capture

**What it does**:
- Waits for app to be running
- Captures screenshots of key pages
- Runs visual regression tests
- Checks for console errors
- Performs basic accessibility checks
- Generates markdown report

**Usage**:
```bash
# Start app first
npm run dev:frontend

# Then in another terminal
npm run design-review

# Report saved to: design-review-report.md
```

### 7. Package Scripts

Added to `package.json`:
- `test:visual` - Run visual regression tests (desktop)
- `test:visual:all` - Run visual tests on all viewports
- `test:visual:update` - Update visual baselines
- `dev:preview` - Start preview server
- `spec:validate` - Validate specifications (stub)
- `design-review` - Run automated design review

## 🚀 Getting Started

### Initial Setup

1. **Install dependencies** (Playwright already installed, but ensure browsers are ready):
   ```bash
   npx playwright install
   ```

2. **Review specifications**:
   ```bash
   cat specs/README.md
   cat specs/design/style-guide.md
   ```

3. **Run visual tests**:
   ```bash
   # Start the app
   npm run dev:frontend
   
   # In another terminal, run visual tests
   npm run test:visual
   ```

4. **Generate initial baselines** (first time only):
   ```bash
   npm run test:visual:update
   ```

### Daily Workflow

#### 1. Spec-First Development

Before implementing a feature:

```bash
# Create or update feature spec
vim specs/features/my-feature.spec.md

# Follow template in specs/README.md
```

#### 2. Implement with Design Tokens

Use design tokens from `specs/design/style-guide.md`:

```typescript
import { tokens } from '@/styles/tokens'; // Future

// Use tokens, not hardcoded values
const Button = styled.button`
  background: ${tokens.colors.primary[500]};
  padding: ${tokens.spacing[3]} ${tokens.spacing[6]};
  border-radius: ${tokens.radius.lg};
`;
```

#### 3. Run Visual Tests

After making UI changes:

```bash
npm run test:visual
```

If tests fail:
- Check `playwright-report/` for diffs
- Review `test-results/diff/` for visual differences
- Update baselines if changes are intentional: `npm run test:visual:update`

#### 4. Design Review

Before opening PR:

```bash
# Ensure app is running
npm run dev:frontend

# Run design review
npm run design-review

# Review the report
cat design-review-report.md
```

#### 5. Open PR

Design review workflow automatically:
- Runs visual regression tests
- Captures screenshots
- Posts design review comment to PR
- Uploads artifacts

## 🎨 Visual Regression Testing

### Understanding Visual Tests

Visual tests compare current screenshots to approved baselines:

```
test-results/
├── baseline/        # Approved screenshots
├── current/         # Latest test run
└── diff/            # Differences (when tests fail)
```

### When to Update Baselines

Update baselines when:
- ✅ Design changes are intentional
- ✅ Changes align with design specs
- ✅ Changes are reviewed and approved

**Never** update to hide bugs!

### Baseline Management

```bash
# View what changed
git diff test-results/baseline/

# Update specific test
npx playwright test tests/visual/visual-regression.spec.ts:10 --update-snapshots

# Update all baselines
npm run test:visual:update

# Commit updates
git add test-results/baseline/
git commit -m "chore: update visual baselines for header redesign"
```

## 🤖 AI Agent Usage

### Design Reviewer Agent

**Invocation**:
- Automatic: Runs on PRs with UI changes
- Manual: Comment `@claude review design` on PR

**What it checks**:
- Color contrast ratios (WCAG AA)
- Design token usage
- Responsive behavior
- Accessibility
- Visual consistency

**Output**: Markdown report posted as PR comment

### Design Iteration Agent

**Invocation**: 
- Comment `@claude iterate on this design` on PR
- Provide context about what needs improvement

**What it does**:
- Analyzes current design
- Proposes improvements
- Provides code examples
- Documents rationale

## 🔧 Configuration

### Playwright Visual Config

Edit `playwright.config.ts` to adjust:
- Screenshot thresholds
- Viewport sizes
- Browser configurations

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,    // Adjust tolerance
    threshold: 0.2,         // 20% threshold
  },
}
```

### Design Review Config

Edit `scripts/automated-design-review.js` to customize:
- Timeout settings
- Pages to check
- Accessibility rules
- Report format

## 📊 CI/CD Integration

### Supercharger Validation Pipeline

**Runs on**: Every push and PR

**Steps**:
1. Validate specifications
2. Generate types from specs (stub)
3. Lint code
4. Type check (TypeScript)
5. Run unit tests
6. Run integration tests (with database)
7. Security scan
8. E2E tests
9. Deploy preview (stub)

**View results**: GitHub Actions tab in repository

### Design Review Workflow

**Runs on**: Pull requests

**Steps**:
1. Run visual regression tests
2. Capture screenshots (multiple viewports)
3. Run automated design review script
4. Generate report
5. Post report as PR comment
6. Upload artifacts

**Artifacts**:
- Screenshots: `visual-screenshots`
- Test results: `visual-test-results`
- Design review report: `design-review-report`

## 🎓 Best Practices

### Writing Specs

1. **Be Specific**: Include examples, edge cases, test scenarios
2. **Define Invariants**: What must always be true?
3. **Link Related Specs**: Cross-reference design and feature specs
4. **Update with Code**: Keep specs in sync with implementation

### Design System Usage

1. **Always Use Tokens**: No hardcoded colors, spacing, etc.
2. **Follow Hierarchy**: Use consistent typography scale
3. **Responsive First**: Design for mobile, enhance for desktop
4. **Accessible Always**: WCAG AA minimum

### Visual Testing

1. **Test Key Flows**: Focus on user-facing pages
2. **Multiple Viewports**: Desktop, tablet, mobile
3. **All States**: Default, hover, focus, error, loading
4. **Meaningful Names**: Clear screenshot filenames

### CI/CD

1. **Green Main Branch**: Keep main passing
2. **Review Before Merge**: Don't skip design review
3. **Fix Regressions**: Address visual test failures
4. **Update Docs**: Keep specs current

## 🐛 Troubleshooting

### Visual Tests Failing

**Issue**: Tests fail but visuals look identical

**Solution**:
- Check for font rendering differences
- Adjust threshold in `playwright.config.ts`
- Ensure consistent test environment

**Issue**: Tests are flaky

**Solution**:
- Add `waitForTimeout()` before screenshots
- Disable animations in test mode
- Mock dynamic content (timestamps, etc.)

### Design Review Not Running

**Issue**: Workflow doesn't trigger

**Solution**:
- Check workflow file syntax
- Ensure PR targets `main` branch
- Verify GitHub Actions is enabled

**Issue**: App not starting in CI

**Solution**:
- Check if app port is available
- Verify environment variables are set
- Increase timeout in script

### Baseline Updates Not Working

**Issue**: Baselines don't update

**Solution**:
- Ensure you're running with `--update-snapshots`
- Check file permissions
- Verify git tracks baseline directory

## 📚 Resources

### Documentation

- [Specifications Guide](../specs/README.md)
- [Style Guide](../specs/design/style-guide.md)
- [Design Principles](../specs/design/design-principles.md)
- [Feature Spec Example](../specs/features/league-membership.spec.md)

### Agent Documentation

- [Visual Intelligence Protocol](../.claude/claude.md)
- [Design Reviewer Agent](../.claude/agents/design-reviewer.md)
- [Design Iteration Agent](../.claude/agents/design-iteration.md)

### External Resources

- [Playwright Visual Testing](https://playwright.dev/docs/test-snapshots)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Design Tokens W3C Community](https://design-tokens.github.io/community-group/)

## 🎯 Next Steps

### Recommended Actions

1. **Populate Design System**
   - Convert style guide tokens to CSS/JS
   - Create design token file
   - Update components to use tokens

2. **Add More Specs**
   - Create specs for remaining features
   - Document component specifications
   - Define API contracts

3. **Integrate Spec-Kit** (Future)
   - Install spec validation tool
   - Generate TypeScript types from specs
   - Automate type generation in CI

4. **Expand Visual Tests**
   - Add tests for all pages
   - Test more component states
   - Add accessibility audit tools (axe-core)

5. **Enable Branch Protection**
   - Require design review to pass
   - Require visual tests to pass
   - Block merge on failing checks

## ✅ Success Metrics

Supercharger is working when:
- [ ] All new features have specifications
- [ ] Design tokens used consistently (no hardcoded values)
- [ ] Visual regression tests catch unintended changes
- [ ] Design review provides actionable feedback
- [ ] PR process includes automated design validation
- [ ] Accessibility issues caught before manual review

## 🔄 Feedback & Iteration

This is v3.1 of the Supercharger implementation. Feedback welcome!

**Report issues**:
- Design review false positives/negatives
- Visual test flakiness
- Spec template improvements
- Agent behavior suggestions

**Contribute**:
- Improve design review script
- Add new visual test patterns
- Enhance spec templates
- Document best practices

---

**Version**: 3.1.0  
**Last Updated**: 2025-10-15  
**Status**: Active

---

## Quick Reference

```bash
# Visual Testing
npm run test:visual              # Run visual tests
npm run test:visual:update       # Update baselines
npx playwright show-report       # View test results

# Design Review
npm run design-review            # Run automated review
cat design-review-report.md      # Read report

# Specifications
cat specs/README.md              # Spec guide
npm run spec:validate            # Validate specs (stub)

# Development
npm run dev:preview              # Start preview server
npm run ci:quality-gates         # Run all quality gates
```
