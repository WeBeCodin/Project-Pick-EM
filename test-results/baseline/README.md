# Visual Test Baselines

This directory contains baseline screenshots for visual regression testing.

## 📸 Purpose

Baseline screenshots serve as the "source of truth" for how components and pages should look. When visual tests run, Playwright compares current screenshots against these baselines to detect unintended visual changes.

## 🗂️ Structure

```
test-results/
├── baseline/                    # Baseline (approved) screenshots
│   ├── homepage-desktop.png
│   ├── homepage-mobile.png
│   ├── leagues-page-desktop.png
│   └── ...
├── current/                     # Current test run screenshots
└── diff/                        # Visual differences (when tests fail)
    ├── homepage-desktop-diff.png
    └── ...
```

## 🔄 Updating Baselines

### When to Update

Update baselines when:
- ✅ Intentional design changes have been made
- ✅ Components have been updated per design specs
- ✅ Changes have been reviewed and approved
- ✅ New viewports or test cases are added

**Never** update baselines to:
- ❌ Hide bugs or regressions
- ❌ Skip proper review
- ❌ Avoid fixing real issues

### How to Update

#### Local Update

```bash
# Run tests and update all snapshots
npm run test:visual -- --update-snapshots

# Update specific test file
npx playwright test tests/visual/visual-regression.spec.ts --update-snapshots

# Update specific test
npx playwright test tests/visual/visual-regression.spec.ts:10 --update-snapshots
```

#### Review Changes

Before committing updated baselines:

```bash
# View what changed
git diff test-results/baseline/

# Use a visual diff tool
code --diff test-results/baseline/homepage-desktop.png test-results/baseline/homepage-desktop.png
```

#### Commit Updates

```bash
# Stage baseline changes
git add test-results/baseline/

# Commit with descriptive message
git commit -m "chore: update visual baselines for header redesign"

# Include PR context
git commit -m "chore: update visual baselines for PR #123

- Updated header component per design spec
- Changed button hover states
- Adjusted mobile navigation layout"
```

## 🎯 Best Practices

### 1. Review Diffs Carefully

When tests fail, examine the diff images:

```bash
# View Playwright HTML report
npx playwright show-report

# Or manually check
ls test-results/diff/
```

Look for:
- Intentional changes (expected)
- Unintentional regressions (bugs)
- Font rendering differences (may be environment-specific)
- Minor pixel shifts (may need threshold adjustment)

### 2. Baseline Naming Convention

Follow the pattern: `{component|page}-{variant}-{viewport}.png`

Examples:
- `homepage-desktop.png`
- `league-card-hover-mobile.png`
- `navigation-expanded-tablet.png`
- `button-disabled-desktop.png`

### 3. Keep Baselines Clean

- Only commit final, approved screenshots
- Delete obsolete baselines when components are removed
- Organize by feature/component when possible

### 4. Document Breaking Changes

When updating baselines for breaking changes:

```markdown
## Visual Breaking Changes

### Header Redesign
- **Before**: Old navigation layout
- **After**: New hamburger menu on mobile
- **Affected**: All pages with navigation
- **Screenshots**: 
  - `navigation-mobile.png`
  - `navigation-tablet.png`
```

## 🔍 Troubleshooting

### False Positives

If tests fail but visuals look identical:

1. **Font rendering differences**
   - May occur across different OS/browsers
   - Consider adjusting `threshold` in playwright.config.ts
   - Document expected variations

2. **Animation timing**
   - Ensure animations complete before capturing
   - Add `waitForTimeout()` before screenshot
   - Disable animations in test environment if needed

3. **Dynamic content**
   - Mock timestamps, random data, etc.
   - Use stable test data
   - Hide dynamic elements during visual tests

### Baseline Drift

If baselines frequently need updating:

1. **Too sensitive**: Increase threshold tolerance
2. **Environment differences**: Ensure consistent test environment (Docker, CI)
3. **Flaky animations**: Disable or wait for completion
4. **Font variations**: Use consistent font rendering settings

## 📊 CI/CD Integration

### In GitHub Actions

Visual tests run automatically on PRs:

```yaml
- name: Run visual regression tests
  run: npm run test:visual

- name: Upload screenshots on failure
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: visual-test-results
    path: test-results/
```

### Baseline Updates in CI

Baselines are NOT automatically updated in CI. To update:

1. Run tests locally
2. Update baselines with `--update-snapshots`
3. Review changes carefully
4. Commit and push updated baselines
5. CI will use new baselines on next run

## 🎨 Design Review Integration

Visual baselines integrate with the automated design review:

1. **Visual tests run** → Capture current state
2. **Compare to baselines** → Detect changes
3. **Design review analyzes** → Check against design specs
4. **Report generated** → Posted to PR
5. **Human review** → Approve or request changes

## 📚 Resources

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Design Review Workflow](../../.github/workflows/supercharger-design.yml)
- [Visual Intelligence Protocol](../../.claude/claude.md)
- [Style Guide](../../specs/design/style-guide.md)

## 🚀 Quick Commands

```bash
# Run visual tests
npm run test:visual

# Update all baselines
npm run test:visual -- --update-snapshots

# Run specific viewport
npx playwright test --project=mobile-chrome

# Debug test
npx playwright test --debug tests/visual/visual-regression.spec.ts

# View report
npx playwright show-report

# Clean test results
rm -rf test-results/ playwright-report/
```

## ✅ Checklist for Baseline Updates

Before updating baselines:
- [ ] Design change is intentional and approved
- [ ] Change aligns with design specifications
- [ ] All affected pages/components reviewed
- [ ] Mobile, tablet, and desktop views checked
- [ ] Accessibility not negatively impacted
- [ ] Performance not degraded
- [ ] Change documented in PR description
- [ ] Team notified of visual changes

---

**Last Updated**: 2025-10-15  
**Version**: 1.0.0
