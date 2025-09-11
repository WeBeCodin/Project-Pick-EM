# Pull Request Template

## 🔍 Overview
<!-- Provide a clear, concise description of the changes -->

## 🎯 Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Performance improvement
- [ ] Code refactoring (no functional changes)
- [ ] Documentation update
- [ ] CI/CD workflow update

## 🔗 Related Issues
<!-- Link any related issues using "Fixes #123" or "Closes #123" -->
Fixes #

## ✅ Testing Checklist
- [ ] **Unit Tests**: Added/updated unit tests for new functionality
- [ ] **E2E Tests**: Verified league persistence across logout/login cycles
- [ ] **Database Tests**: Confirmed Prisma schema changes are backward compatible
- [ ] **Manual Testing**: Tested in development environment
- [ ] **Cross-browser Testing**: Verified functionality across different browsers

### Critical NFL Pick 'Em Features Tested
- [ ] **User Session Persistence**: User remains logged in across page refreshes
- [ ] **League Membership Tracking**: Members persist after logout/login cycles
- [ ] **Member Count Accuracy**: League member counts display correctly (not 0)
- [ ] **Scoring System**: Picks and scores save/display correctly
- [ ] **Data Continuity**: Consistent data between league creation and dashboard pages

## 🛡️ Security Considerations
- [ ] No sensitive data exposed in logs or client-side code
- [ ] Authentication/authorization properly implemented
- [ ] Input validation and sanitization applied
- [ ] SQL injection prevention measures in place

## 📊 Database Changes
- [ ] **Schema Changes**: Prisma migrations created and tested
- [ ] **Data Migration**: Existing data properly migrated
- [ ] **Rollback Plan**: Rollback strategy documented if needed
- [ ] **Performance Impact**: Database performance impact assessed

## 🚀 Deployment Notes
<!-- Any special deployment considerations, environment variables, or migration steps -->

## 📸 Screenshots/Demo
<!-- Include screenshots or GIFs for UI changes -->

## 🔄 Code Review Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is properly documented
- [ ] No commented-out code or debug statements
- [ ] Error handling is appropriate
- [ ] Performance considerations addressed

## 🧪 Quality Gates Passed
- [ ] **TypeScript**: No type errors
- [ ] **Linting**: ESLint checks pass
- [ ] **Prisma Validation**: Schema validation successful
- [ ] **Security Scan**: CodeQL analysis clean
- [ ] **E2E Tests**: Playwright tests pass
- [ ] **Build**: Application builds successfully

---

**Reviewer Guidelines:**
- Verify all quality gates have passed
- Pay special attention to user session and league persistence logic
- Test locally if the change affects critical user flows
- Ensure database changes are backward compatible
