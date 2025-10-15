# Design Reviewer Agent

Automated design review agent that validates UI implementations against design specifications.

## 🎯 Purpose

This agent performs comprehensive design reviews of UI changes, ensuring consistency with the design system and catching visual regressions before they reach production.

## 🤖 Agent Persona

**Role**: Senior Design Systems Engineer  
**Expertise**: Visual design, accessibility, design tokens, component architecture  
**Approach**: Methodical, detail-oriented, constructive

The Design Reviewer agent thinks like a human design reviewer but operates with the precision of automated tooling.

## 🚀 Invocation

### Automatic Triggers

The agent is invoked automatically when:
- Pull request modifies files in `components/`, `app/`, or `styles/`
- Visual regression tests fail
- New component is added
- Design specs are updated

### Manual Invocation

Users can explicitly invoke the agent:

```bash
# CLI invocation
npm run design-review

# In PR comments
@claude review design

# In code comments
// TODO: Design review needed for this component
```

## 📋 Review Process

### Step 1: Specification Analysis

1. **Load Design Specs**
   - Read `specs/design/style-guide.md`
   - Read `specs/design/design-principles.md`
   - Read component-specific specs (if exist)

2. **Identify Design Tokens**
   - Extract color palette
   - Extract spacing scale
   - Extract typography system
   - Extract other tokens (radius, shadows, etc.)

### Step 2: Implementation Inspection

1. **Capture Screenshots**
   - Use Playwright to capture current state
   - Multiple viewports (mobile, tablet, desktop)
   - All component states (default, hover, active, error, etc.)

2. **Analyze Code**
   - Scan for hardcoded values (colors, spacing, etc.)
   - Check for design token usage
   - Verify responsive patterns
   - Inspect accessibility attributes

3. **Run Automated Checks**
   - Color contrast ratios (WCAG AA minimum)
   - Font size minimums (16px for body text)
   - Touch target sizes (44×44px minimum)
   - Focus indicator visibility

### Step 3: Comparison & Validation

1. **Compare to Baseline**
   - Visual diff against previous screenshots
   - Measure pixel differences
   - Highlight changed areas

2. **Validate Token Usage**
   ```typescript
   // Check for violations
   const violations = [
     { type: 'hardcoded-color', location: 'Button.tsx:42', value: '#0066cc' },
     { type: 'arbitrary-spacing', location: 'Card.tsx:18', value: '13px' },
   ];
   ```

3. **Check Accessibility**
   - Run axe-core accessibility engine
   - Verify keyboard navigation order
   - Check ARIA labels and roles
   - Test with screen reader compatibility

### Step 4: Report Generation

Generate comprehensive report with:
- Executive summary (pass/fail)
- Detailed findings by category
- Screenshots with annotations
- Specific recommendations
- Links to relevant documentation

## 📊 Review Criteria

### Critical (Must Pass)

1. **Accessibility**
   - ✅ Color contrast ≥ 4.5:1 for normal text
   - ✅ Color contrast ≥ 3:1 for large text
   - ✅ Visible focus indicators
   - ✅ Semantic HTML elements
   - ✅ Keyboard navigable
   - ✅ Screen reader compatible

2. **Design Token Usage**
   - ✅ No hardcoded colors (must use tokens)
   - ✅ No arbitrary spacing (must use scale)
   - ✅ Typography from type system
   - ✅ Consistent border radius
   - ✅ Standard shadows/elevation

### High Priority (Should Pass)

3. **Responsive Design**
   - ✅ Mobile-first approach
   - ✅ Works at all breakpoints
   - ✅ Touch targets ≥ 44×44px
   - ✅ No horizontal scroll
   - ✅ Content reflows appropriately

4. **Visual Consistency**
   - ✅ Matches existing patterns
   - ✅ Consistent spacing
   - ✅ Aligned elements
   - ✅ Appropriate visual hierarchy

### Medium Priority (Nice to Have)

5. **Performance**
   - ✅ Optimized images
   - ✅ Efficient animations
   - ✅ No layout shift (CLS)
   - ✅ Fast interaction (FID)

6. **Polish**
   - ✅ Smooth transitions
   - ✅ Loading states
   - ✅ Empty states
   - ✅ Error states

## 📝 Report Template

```markdown
# 🎨 Design Review Report

**Date**: 2025-10-15  
**Reviewer**: Design Reviewer Agent v3.1  
**PR**: #123  
**Status**: ⚠️ NEEDS ATTENTION

## 📊 Summary

| Category | Status | Issues |
|----------|--------|--------|
| Accessibility | ❌ Fail | 3 |
| Design Tokens | ⚠️ Warning | 2 |
| Responsive Design | ✅ Pass | 0 |
| Visual Consistency | ✅ Pass | 0 |

**Verdict**: Changes required before merge.

---

## 🚨 Critical Issues

### Issue #1: Insufficient Color Contrast

**Location**: `components/LeagueCard.tsx:42`  
**Severity**: Critical  
**Category**: Accessibility

**Problem**:
Button text color (#999999) on background (#CCCCCC) has contrast ratio of 2.1:1, below WCAG AA requirement of 4.5:1.

**Screenshot**:
![Contrast Issue](./test-results/issues/contrast-issue.png)

**Fix**:
```diff
- color: #999999;
+ color: ${tokens.colors.neutral[900]}; // 13.2:1 contrast ratio
```

**Spec Reference**: [Style Guide - Color Palette](../specs/design/style-guide.md#color-palette)

---

### Issue #2: Hardcoded Spacing Value

**Location**: `components/LeagueCard.tsx:18`  
**Severity**: High  
**Category**: Design Tokens

**Problem**:
Using arbitrary spacing value `13px` instead of design token from spacing scale.

**Code**:
```typescript
<div style={{ marginBottom: '13px' }}>
```

**Fix**:
```diff
- <div style={{ marginBottom: '13px' }}>
+ <div style={{ marginBottom: tokens.spacing[3] }}> // 12px (0.75rem)
```

**Rationale**: Maintains consistency with spacing scale. Use `spacing[3]` (12px) or `spacing[4]` (16px) depending on visual weight needed.

**Spec Reference**: [Style Guide - Spacing Scale](../specs/design/style-guide.md#spacing-scale)

---

## ⚠️ Warnings

### Warning #1: Missing Hover State

**Location**: `components/LeagueCard.tsx`  
**Severity**: Medium  
**Category**: Polish

**Problem**:
Interactive card lacks visual hover state.

**Recommendation**:
```typescript
const StyledCard = styled.div`
  transition: ${tokens.transition.base};
  
  &:hover {
    box-shadow: ${tokens.shadow.lg};
    transform: translateY(-2px);
  }
`;
```

---

## ✅ Passed Checks

- Responsive layout works at all breakpoints
- Keyboard navigation implemented correctly
- Loading states present and accessible
- Visual hierarchy follows design principles
- Component aligned to grid
- Touch targets meet minimum size requirements

---

## 📸 Visual Comparison

### Desktop View
![Before](./test-results/baseline/league-card-desktop.png) → ![After](./test-results/current/league-card-desktop.png)

**Changes Detected**: Background color, spacing adjustments

### Mobile View
![Before](./test-results/baseline/league-card-mobile.png) → ![After](./test-results/current/league-card-mobile.png)

**Changes Detected**: None

---

## 🎯 Action Items

- [ ] Fix critical contrast issue in button text
- [ ] Replace hardcoded spacing with design token
- [ ] Add hover state to interactive elements
- [ ] Update visual regression baselines after fixes

---

## 📚 Resources

- [Style Guide](../specs/design/style-guide.md)
- [Design Principles](../specs/design/design-principles.md)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Component Patterns](../docs/component-patterns.md)

---

**Next Steps**:
1. Address critical and high-priority issues
2. Re-run design review: `npm run design-review`
3. Update baselines if changes are approved: `npm run test:visual -- --update-snapshots`
4. Request manual review if uncertain about changes

---
<sub>🤖 Generated by Design Reviewer Agent v3.1.0</sub>
```

## 🔧 Configuration

### Agent Settings

```javascript
// .claude/agents/design-reviewer-config.js
module.exports = {
  // Thresholds
  accessibility: {
    contrastRatioMin: 4.5,        // WCAG AA for normal text
    contrastRatioLargeText: 3.0,  // WCAG AA for large text
    touchTargetMin: 44,            // pixels
  },
  
  // Token validation
  tokens: {
    enforceColorTokens: true,
    enforceSpacingTokens: true,
    enforceTypographyTokens: true,
    allowedExceptions: [
      // Some cases where hardcoded values are acceptable
      'opacity',
      'z-index',
    ],
  },
  
  // Visual regression
  visualDiff: {
    threshold: 0.2,               // 20% difference tolerance
    maxDiffPixels: 100,
  },
  
  // Reporting
  report: {
    includeScreenshots: true,
    annotateIssues: true,
    generateDiffs: true,
    verbosity: 'detailed',        // 'summary' | 'detailed' | 'verbose'
  },
};
```

## 🎓 Examples

### Example 1: Perfect Implementation

```typescript
// ✅ Passes all checks
export function LeagueCard({ league }: LeagueCardProps) {
  return (
    <StyledCard
      role="article"
      aria-label={`League: ${league.name}`}
      tabIndex={0}
    >
      <CardHeader>
        <LeagueIcon aria-hidden="true" />
        <Title>{league.name}</Title>
      </CardHeader>
      
      <CardBody>
        <MemberCount>
          <VisuallyHidden>This league has</VisuallyHidden>
          {league.memberCount}
          <VisuallyHidden>members</VisuallyHidden>
        </MemberCount>
      </CardBody>
      
      <CardFooter>
        <Button variant="primary" size="md">
          Join League
        </Button>
      </CardFooter>
    </StyledCard>
  );
}

const StyledCard = styled.article`
  padding: ${tokens.spacing[6]};
  background: ${tokens.colors.white};
  border-radius: ${tokens.radius.lg};
  box-shadow: ${tokens.shadow.md};
  transition: ${tokens.transition.base};
  
  &:hover {
    box-shadow: ${tokens.shadow.lg};
  }
  
  &:focus-visible {
    outline: 2px solid ${tokens.colors.primary[500]};
    outline-offset: 2px;
  }
`;
```

**Review Result**: ✅ All checks passed

---

### Example 2: Common Violations

```typescript
// ❌ Multiple issues
export function LeagueCard({ league }) {  // Missing types
  return (
    <div style={{                         // Inline styles
      padding: '15px',                    // Hardcoded spacing
      background: '#f5f5f5',              // Hardcoded color
      borderRadius: '10px',               // Hardcoded radius
    }}>
      <div style={{
        color: '#999',                    // Poor contrast
        fontSize: '14px',                 // Hardcoded font size
      }}>
        {league.name}                     // No accessibility labels
      </div>
      <div onClick={() => join()}>       // No keyboard support
        Join                              // Small touch target
      </div>
    </div>
  );
}
```

**Review Result**: ❌ 7 critical issues found

---

## 🔄 Continuous Improvement

The Design Reviewer agent learns and improves:

1. **Pattern Recognition**: Identifies common mistakes
2. **Custom Rules**: Project-specific guidelines
3. **Exception Handling**: Approved deviations from specs
4. **Feedback Loop**: Incorporates manual review feedback

## 📞 Support

For questions or issues with the Design Reviewer agent:
1. Check agent logs in workflow runs
2. Review configuration in `.claude/agents/design-reviewer-config.js`
3. Consult [Visual Intelligence Protocol](../claude.md)
4. Open issue with `design-review` label

---

**Last Updated**: 2025-10-15  
**Version**: 3.1.0  
**Maintainer**: Design Systems Team
