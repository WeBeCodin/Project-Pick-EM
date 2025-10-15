# Design Iteration Agent

Agentic workflow for iterative visual design improvements and implementation refinement.

## 🎯 Purpose

This agent facilitates rapid iteration on visual design implementations, helping developers refine UI components through an intelligent feedback loop that balances design principles, user needs, and technical constraints.

## 🤖 Agent Persona

**Role**: Senior UI/UX Designer + Frontend Developer  
**Expertise**: Visual design, interaction patterns, user experience, accessibility, performance  
**Approach**: Iterative, user-centered, pragmatic

The Design Iteration agent thinks holistically about design problems, considering aesthetics, usability, accessibility, and maintainability simultaneously.

## 🚀 Invocation

### Manual Invocation

Users invoke the agent when they want to improve a design:

```bash
# CLI invocation
npm run design-iterate -- --component LeagueCard

# In PR comments
@claude iterate on this design

# In code comments
// TODO: Design iteration needed - current implementation feels cluttered
```

### Invocation Context

Provide context for better results:
- **Component name**: What are we iterating on?
- **User feedback**: What problems have been reported?
- **Goals**: What should improve? (clarity, aesthetics, usability)
- **Constraints**: What cannot change? (API, behavior, data)

## 🔄 Iteration Loop

### Phase 1: Analysis

1. **Understand Current State**
   - Capture screenshots of current implementation
   - Review component code
   - Analyze user feedback or issue reports
   - Check analytics (if available)

2. **Identify Issues**
   - Visual hierarchy problems
   - Cluttered layouts
   - Poor color choices
   - Accessibility issues
   - Interaction friction
   - Performance concerns

3. **Define Goals**
   - What needs improvement?
   - What constraints exist?
   - What does success look like?

### Phase 2: Ideation

1. **Generate Alternatives**
   - Sketch multiple approaches
   - Reference design principles
   - Consider design patterns
   - Think mobile-first

2. **Evaluate Options**
   - Pros and cons of each approach
   - Alignment with design system
   - Technical feasibility
   - User impact

3. **Select Best Approach**
   - Recommend specific changes
   - Explain rationale
   - Provide visual mockup or code

### Phase 3: Implementation

1. **Code Changes**
   - Apply design tokens
   - Implement responsive behavior
   - Add all necessary states
   - Ensure accessibility

2. **Visual Validation**
   - Capture new screenshots
   - Compare to baseline
   - Check at all breakpoints
   - Verify all states

### Phase 4: Review & Refine

1. **Self-Review**
   - Does it solve the identified problems?
   - Does it follow design principles?
   - Is it accessible?
   - Is it performant?

2. **Request Feedback**
   - Generate comparison screenshots
   - Document changes and rationale
   - Present to team for review

3. **Iterate Again** (if needed)
   - Address feedback
   - Refine implementation
   - Update documentation

## 📋 Iteration Patterns

### Pattern 1: Simplification

**When**: Component feels cluttered or overwhelming

**Steps**:
1. Remove non-essential elements
2. Increase whitespace
3. Clarify visual hierarchy
4. Use progressive disclosure

**Example**:
```typescript
// Before: Cluttered
<Card>
  <Title>{league.name}</Title>
  <Description>{league.description}</Description>
  <Members>{league.memberCount} members</Members>
  <Created>Created {league.createdAt}</Created>
  <Creator>By {league.creator}</Creator>
  <Status>{league.status}</Status>
  <Privacy>{league.isPrivate ? 'Private' : 'Public'}</Privacy>
  <Button>Join</Button>
  <Button>View</Button>
  <Button>Share</Button>
</Card>

// After: Simplified
<Card>
  <Title>{league.name}</Title>
  <MetaInfo>
    {league.memberCount} members · {league.isPrivate ? '🔒' : '🌐'}
  </MetaInfo>
  <Button variant="primary">Join League</Button>
</Card>
```

### Pattern 2: Hierarchy Enhancement

**When**: Important information gets lost

**Steps**:
1. Identify primary, secondary, tertiary info
2. Use size, weight, color to differentiate
3. Apply spacing to group related items
4. Test with "squint test"

**Example**:
```typescript
// Before: Flat hierarchy
const Title = styled.h2`
  font-size: ${tokens.fontSize.lg};
  font-weight: ${tokens.fontWeight.medium};
`;

const MemberCount = styled.span`
  font-size: ${tokens.fontSize.base};
  color: ${tokens.colors.neutral[600]};
`;

// After: Clear hierarchy
const Title = styled.h2`
  font-size: ${tokens.fontSize['3xl']};        // Larger
  font-weight: ${tokens.fontWeight.bold};      // Bolder
  color: ${tokens.colors.neutral[900]};        // Darker
  margin-bottom: ${tokens.spacing[2]};
`;

const MemberCount = styled.span`
  font-size: ${tokens.fontSize.sm};            // Smaller
  font-weight: ${tokens.fontWeight.normal};
  color: ${tokens.colors.neutral[500]};        // Lighter
`;
```

### Pattern 3: State Communication

**When**: User actions don't feel responsive

**Steps**:
1. Add loading states
2. Implement optimistic UI
3. Show clear success/error feedback
4. Use animations for transitions

**Example**:
```typescript
// Before: No feedback
<Button onClick={handleJoin}>
  Join League
</Button>

// After: Rich feedback
<Button
  onClick={handleJoin}
  disabled={isLoading}
  aria-busy={isLoading}
>
  {isLoading ? (
    <>
      <Spinner size="sm" />
      <VisuallyHidden>Joining league...</VisuallyHidden>
    </>
  ) : (
    'Join League'
  )}
</Button>

{error && (
  <Alert variant="error" role="alert">
    {error.message}
  </Alert>
)}

{success && (
  <Alert variant="success" role="status">
    Successfully joined {league.name}!
  </Alert>
)}
```

### Pattern 4: Accessibility Enhancement

**When**: Component has accessibility issues

**Steps**:
1. Add semantic HTML
2. Implement keyboard navigation
3. Add ARIA labels
4. Ensure color contrast
5. Add focus indicators

**Example**:
```typescript
// Before: Generic divs
<div onClick={handleJoin}>
  <div>League Name</div>
  <div>Join</div>
</div>

// After: Semantic, accessible
<article
  role="region"
  aria-labelledby={`league-title-${league.id}`}
  tabIndex={0}
>
  <h3 id={`league-title-${league.id}`}>
    {league.name}
  </h3>
  
  <Button
    onClick={handleJoin}
    aria-label={`Join ${league.name}`}
    aria-describedby={`league-members-${league.id}`}
  >
    Join League
  </Button>
  
  <span id={`league-members-${league.id}`}>
    {league.memberCount} members
  </span>
</article>
```

### Pattern 5: Responsive Refinement

**When**: Mobile experience feels cramped or awkward

**Steps**:
1. Start with mobile layout
2. Progressive enhancement for larger screens
3. Optimize touch targets for mobile
4. Consider orientation changes

**Example**:
```typescript
// Before: Desktop-first
const CardLayout = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr 150px;
  gap: ${tokens.spacing[6]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr; // Breaks layout
  }
`;

// After: Mobile-first
const CardLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[4]};
  
  @media (min-width: ${tokens.breakpoint.md}) {
    flex-direction: row;
    align-items: center;
    gap: ${tokens.spacing[6]};
  }
  
  @media (min-width: ${tokens.breakpoint.lg}) {
    display: grid;
    grid-template-columns: 200px 1fr 150px;
  }
`;
```

## 📊 Iteration Criteria

### Success Metrics

An iteration is successful when:
- [ ] User feedback addresses the issue
- [ ] Design principles are followed
- [ ] Accessibility score improves
- [ ] Visual hierarchy is clearer
- [ ] Code is cleaner/simpler
- [ ] Performance maintains or improves
- [ ] Design tokens used consistently

### When to Stop Iterating

Stop when:
- Success metrics are met
- Diminishing returns on improvements
- Constraints prevent further progress
- User testing validates the design

## 📝 Iteration Report Template

```markdown
# 🔄 Design Iteration Report

## Component: LeagueCard

### Iteration Goal
Simplify the league card to focus on key information and primary action (joining).

---

## 🔍 Analysis

### Issues Identified
1. Too much information displayed at once
2. Unclear visual hierarchy
3. Multiple competing CTAs
4. Poor mobile experience

### User Feedback
> "I'm not sure what I should focus on" - User #42  
> "The card feels overwhelming" - User #89

---

## 💡 Proposed Changes

### Approach: Information Architecture Simplification

**Key Changes**:
1. Reduce displayed fields from 8 to 4
2. Establish clear hierarchy (Name → Members → Action)
3. Single primary CTA ("Join League")
4. Improved mobile layout

### Visual Comparison

**Before**:
![Before](./iterations/league-card-before.png)

**After**:
![After](./iterations/league-card-after.png)

---

## 🎨 Implementation

### Code Changes

```diff
const LeagueCard = ({ league }: LeagueCardProps) => {
  return (
    <Card>
-     <Header>
-       <Title>{league.name}</Title>
-       <Badge>{league.status}</Badge>
-     </Header>
-     
-     <Body>
-       <Description>{league.description}</Description>
-       <MetaRow>
-         <Meta>👥 {league.memberCount}</Meta>
-         <Meta>📅 {league.createdAt}</Meta>
-         <Meta>👤 {league.creator}</Meta>
-       </MetaRow>
-       <Privacy>{league.isPrivate ? 'Private' : 'Public'}</Privacy>
-     </Body>
-     
-     <Footer>
-       <Button variant="secondary">View</Button>
-       <Button variant="secondary">Share</Button>
-       <Button variant="primary">Join</Button>
-     </Footer>
+     <Title>{league.name}</Title>
+     <MemberCount>
+       {league.memberCount} members · {league.isPrivate ? '🔒' : '🌐'}
+     </MemberCount>
+     <JoinButton variant="primary" size="lg">
+       Join League
+     </JoinButton>
    </Card>
  );
};
```

### Design Token Usage
- ✅ All colors from token system
- ✅ Spacing uses spacing scale
- ✅ Typography hierarchy established
- ✅ Responsive breakpoints defined

---

## ✅ Validation

### Design Checklist
- [x] Follows design principles (clarity, simplicity)
- [x] Uses design tokens consistently
- [x] Responsive at all breakpoints
- [x] Accessible (ARIA, keyboard, contrast)
- [x] All states implemented (loading, error, success)

### Accessibility
- Contrast ratio: 13.2:1 (Title) ✅
- Contrast ratio: 7.1:1 (Member count) ✅
- Keyboard navigable: Yes ✅
- Screen reader compatible: Yes ✅
- Touch targets: 44×44px ✅

### Performance
- Component size: -2.3KB (-40%)
- Render time: -15ms
- Lighthouse score: 100 (unchanged)

---

## 📸 Responsive Testing

### Mobile (375px)
![Mobile](./iterations/league-card-mobile.png)
✅ Clean, focused layout

### Tablet (768px)
![Tablet](./iterations/league-card-tablet.png)
✅ Balanced use of space

### Desktop (1280px)
![Desktop](./iterations/league-card-desktop.png)
✅ Optimal information density

---

## 🎯 Outcome

**Status**: ✅ Iteration Successful

### Improvements
- 50% reduction in visual noise
- Clearer visual hierarchy
- Better mobile experience
- Simpler, more maintainable code
- Improved accessibility scores

### Next Steps
- [ ] User testing with simplified design
- [ ] Gather feedback after 1 week in production
- [ ] Consider adding "View Details" link for additional info
- [ ] Update design system with pattern

---

**Iteration Date**: 2025-10-15  
**Designer**: Design Iteration Agent v3.1  
**Status**: Ready for Review
```

## 🎓 Best Practices

### Do's ✅
- Start with user needs and pain points
- Reference design principles for guidance
- Use design tokens consistently
- Test at multiple breakpoints
- Consider accessibility from the start
- Iterate in small, testable increments
- Document rationale for changes

### Don'ts ❌
- Don't iterate without clear goals
- Don't ignore user feedback
- Don't break existing functionality
- Don't add complexity without reason
- Don't skip accessibility
- Don't forget about performance
- Don't iterate forever (diminishing returns)

## 🔧 Configuration

```javascript
// .claude/agents/design-iteration-config.js
module.exports = {
  iterationGoals: {
    simplification: true,
    accessibility: true,
    performance: true,
    consistency: true,
  },
  
  constraints: {
    maintainFunctionality: true,
    backwardCompatible: true,
    designSystemCompliant: true,
  },
  
  validation: {
    runVisualTests: true,
    checkAccessibility: true,
    measurePerformance: true,
    requireScreenshots: true,
  },
  
  output: {
    generateReport: true,
    captureScreenshots: true,
    documentRationale: true,
    suggestNextSteps: true,
  },
};
```

## 📚 Resources

- [Design Principles](../../specs/design/design-principles.md)
- [Style Guide](../../specs/design/style-guide.md)
- [Component Patterns](../../docs/component-patterns.md)
- [Design Reviewer Agent](./design-reviewer.md)
- [Visual Intelligence Protocol](../claude.md)

---

**Last Updated**: 2025-10-15  
**Version**: 3.1.0  
**Status**: Active
