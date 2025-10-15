# Copilot Workspace Instructions

This document provides guidance for GitHub Copilot when working in this codebase, aligned with the Supercharger Manifesto v3.1.

## 🎯 Project Constitution

### Core Values

1. **Spec-First Development**: Specifications drive implementation
2. **Visual Intelligence**: Design and implementation stay in sync
3. **Type Safety**: Leverage TypeScript's type system fully
4. **Test-Driven**: Write tests before (or alongside) implementation
5. **Accessibility**: Build for all users from the start

### Quality Gates

Before suggesting code changes, ensure:
- [ ] Relevant specifications exist (or create them)
- [ ] TypeScript types are properly defined
- [ ] Tests cover the new functionality
- [ ] Visual design aligns with style guide
- [ ] Accessibility requirements are met

## 📋 Code Patterns

### TypeScript Standards

```typescript
// ✅ Prefer explicit types over inference for public APIs
export interface LeagueMembership {
  id: string;
  leagueId: string;
  userId: string;
  status: MembershipStatus;
  joinedAt: Date;
}

// ✅ Use strict null checks
function getMember(id: string): Member | null {
  // ...
}

// ❌ Avoid 'any'
function processData(data: any) { } // Bad

// ✅ Use proper types
function processData(data: unknown): ProcessedData {
  // Type guard here
}
```

### Error Handling

```typescript
// ✅ Use Result types or explicit error handling
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function joinLeague(
  userId: string, 
  leagueId: string
): Promise<Result<Membership>> {
  try {
    // Implementation
    return { success: true, data: membership };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}
```

### React Component Patterns

```typescript
// ✅ Use TypeScript with React
interface LeagueCardProps {
  league: League;
  onJoin: (leagueId: string) => void;
  isLoading?: boolean;
}

export function LeagueCard({ 
  league, 
  onJoin, 
  isLoading = false 
}: LeagueCardProps) {
  // Component implementation
}

// ✅ Use hooks appropriately
function useLeagueMembership(leagueId: string) {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Implementation
  
  return { membership, isLoading, error };
}
```

## 🎨 Design System Integration

When suggesting UI components, reference the design system:

```typescript
// ✅ Use design tokens from style-guide.md
import { tokens } from '@/styles/tokens';

const Button = styled.button`
  padding: ${tokens.spacing[3]} ${tokens.spacing[6]};
  background: ${tokens.colors.primary[500]};
  border-radius: ${tokens.radius.lg};
  font-size: ${tokens.fontSize.base};
`;
```

### Component Checklist

- [ ] Uses design tokens (colors, spacing, typography)
- [ ] Responsive across breakpoints
- [ ] Keyboard accessible
- [ ] Screen reader compatible
- [ ] Has loading and error states
- [ ] Matches design principles

## 🧪 Testing Approach

### Test Structure

```typescript
// Feature tests follow spec
describe('League Membership', () => {
  describe('Join Public League', () => {
    it('creates ACTIVE membership', async () => {
      // Arrange
      const user = await createTestUser();
      const league = await createTestLeague({ isPrivate: false });
      
      // Act
      const result = await joinLeague(user.id, league.id);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('ACTIVE');
    });
  });
  
  describe('Business Rules', () => {
    it('enforces uniqueness invariant', async () => {
      // Test that user cannot join same league twice
    });
    
    it('maintains member count accuracy', async () => {
      // Test that member_count stays in sync
    });
  });
});
```

### Visual Tests

```typescript
import { test, expect } from '@playwright/test';

test('League card displays correctly', async ({ page }) => {
  await page.goto('/leagues');
  
  // Visual regression
  await expect(page.locator('.league-card').first()).toHaveScreenshot();
  
  // Accessibility
  const violations = await checkA11y(page);
  expect(violations).toHaveLength(0);
});
```

## 📁 File Organization

### Where to Put New Code

```
packages/
├── backend/
│   ├── src/
│   │   ├── services/         # Business logic
│   │   ├── controllers/      # HTTP handlers
│   │   ├── models/           # Data models
│   │   ├── utils/            # Utilities
│   │   └── __tests__/        # Tests alongside code
│   └── prisma/
│       └── schema.prisma     # Database schema
├── frontend/
│   ├── app/                  # Next.js pages
│   ├── components/           # React components
│   │   ├── ui/              # Design system components
│   │   └── features/        # Feature components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities
│   └── __tests__/           # Tests
└── shared/
    └── src/
        └── types/           # Shared TypeScript types
```

### Naming Conventions

- **Files**: `kebab-case.ts` or `PascalCase.tsx` for components
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types/Interfaces**: `PascalCase`

## 🔍 Specification References

When implementing features, reference these specs:

- **Feature Specs**: `specs/features/*.spec.md`
- **Design Specs**: `specs/design/*.md`
- **API Contracts**: Defined in feature specs

### Spec-Driven Workflow

1. **Read the Spec**: Understand requirements from spec file
2. **Check Types**: Ensure types match spec definitions
3. **Write Tests**: Based on test scenarios in spec
4. **Implement**: Code against spec and tests
5. **Validate**: Run visual tests and design review

## 🚫 Anti-Patterns to Avoid

### Code Smells

```typescript
// ❌ Magic numbers
if (members.length > 50) { }

// ✅ Named constants
const MAX_LEAGUE_MEMBERS = 50;
if (members.length > MAX_LEAGUE_MEMBERS) { }

// ❌ Deep nesting
if (user) {
  if (league) {
    if (canJoin) {
      // ...
    }
  }
}

// ✅ Early returns
if (!user) return null;
if (!league) return null;
if (!canJoin) return null;
// ...

// ❌ Mutable shared state
let currentUser = null; // Bad

// ✅ Immutable patterns
const [currentUser, setCurrentUser] = useState<User | null>(null);
```

### Architecture Smells

- **God Objects**: Keep services focused on single responsibility
- **Circular Dependencies**: Maintain clear dependency direction
- **Business Logic in UI**: Keep business logic in services
- **Missing Error Handling**: Always handle errors explicitly

## 🔄 Migration Patterns

When changing existing code:

```typescript
// ✅ Deprecate gradually
/** @deprecated Use newFunction instead. Will be removed in v2.0 */
export function oldFunction() { }

export function newFunction() { }

// ✅ Feature flags for big changes
if (featureFlags.newMembershipFlow) {
  return <NewMembershipFlow />;
}
return <LegacyMembershipFlow />;

// ✅ Database migrations with rollback
// In migration file:
export async function up(db) { }
export async function down(db) { }
```

## 🎯 Context-Specific Guidelines

### League Management

- Always validate membership before allowing actions
- Update member counts atomically with membership changes
- Test persistence across sessions
- Consider capacity limits

### Authentication

- Never store passwords in plain text
- Use JWT for stateless auth
- Implement refresh token rotation
- Rate limit authentication endpoints

### Performance

- Paginate large lists (default 20 items)
- Cache frequently accessed data (Redis)
- Use database indexes appropriately
- Lazy load non-critical resources

### Security

- Validate all inputs
- Sanitize user-generated content
- Use parameterized queries
- Implement CSRF protection

## 🔧 Development Workflow

### Before Starting Work

1. Check if spec exists for the feature
2. Review related specs and design docs
3. Understand existing tests
4. Identify affected components

### During Development

1. Write/update spec if needed
2. Define TypeScript types
3. Write tests first (TDD)
4. Implement feature
5. Run visual regression tests
6. Check accessibility

### Before Committing

1. Run `npm run typecheck`
2. Run `npm run lint`
3. Run `npm test`
4. Run `npm run test:visual`
5. Review design against style guide

## 📚 Key Resources

- [Specifications](../specs/README.md)
- [Style Guide](../specs/design/style-guide.md)
- [Design Principles](../specs/design/design-principles.md)
- [CI/CD Documentation](../docs/ci-cd/README.md)
- [Design Review Agent](../.claude/agents/design-reviewer.md)

## 🤖 Agent Invocation

When user asks for:
- **Design review**: Invoke design-reviewer agent
- **Visual iteration**: Invoke design-iteration agent
- **Spec creation**: Follow spec template in specs/README.md
- **Type generation**: Reference feature specs for contracts

## ✅ Success Criteria

Code is ready to merge when:
- [ ] All tests pass (unit, integration, E2E)
- [ ] Type checking passes with no errors
- [ ] Visual regression tests pass (or updated baselines)
- [ ] Design review agent approves (or exceptions documented)
- [ ] Accessibility checks pass
- [ ] Spec is updated (if applicable)
- [ ] Documentation is updated

---

**Last Updated**: 2025-10-15  
**Version**: 3.1.0

> 💡 **Tip**: These instructions are guidelines to help Copilot understand the project better. They can be updated as the project evolves.
