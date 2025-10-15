#!/usr/bin/env node

/**
 * Automated Design Review Script
 * 
 * This script performs automated design review by:
 * 1. Running the application (or waiting for it)
 * 2. Running Playwright visual tests
 * 3. Checking console errors and warnings
 * 4. Running basic accessibility checks
 * 5. Generating a markdown report
 * 
 * Exit codes:
 * - 0: Review completed successfully (may have warnings)
 * - 1: Critical issues found (design review failed)
 * - 2: Could not run review (app not available, etc.)
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  baseURL: process.env.BASE_URL || 'http://localhost:3001',
  timeout: parseInt(process.env.TIMEOUT || '30000', 10),
  reportPath: path.join(process.cwd(), 'design-review-report.md'),
  screenshotDir: path.join(process.cwd(), 'test-results', 'design-review'),
};

// Ensure screenshot directory exists
if (!fs.existsSync(CONFIG.screenshotDir)) {
  fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
}

// Track issues
const issues = {
  critical: [],
  warning: [],
  info: [],
};

// Track console messages
const consoleMessages = {
  errors: [],
  warnings: [],
};

/**
 * Check if the application is running
 */
async function waitForApp() {
  console.log(`🔍 Checking if app is running at ${CONFIG.baseURL}...`);
  
  const maxAttempts = 10;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(CONFIG.baseURL);
      if (response.ok || response.status === 404) {
        console.log('✅ App is responding');
        return true;
      }
    } catch (error) {
      // App not ready yet
    }
    
    attempts++;
    console.log(`⏳ Waiting for app... (${attempts}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.error('❌ App did not start in time');
  return false;
}

/**
 * Run Playwright visual tests
 */
async function runVisualTests() {
  console.log('\n📸 Running visual regression tests...');
  
  try {
    execSync('npm run test:visual', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    console.log('✅ Visual tests passed');
    return { passed: true, message: 'All visual tests passed' };
  } catch (error) {
    console.log('⚠️  Visual tests failed or need baseline updates');
    issues.warning.push({
      category: 'Visual Regression',
      message: 'Visual tests failed. Review diff images in test-results/diff/',
      severity: 'medium',
    });
    return { passed: false, message: 'Visual tests failed' };
  }
}

/**
 * Capture screenshots and check for issues
 */
async function performDesignChecks() {
  console.log('\n🎨 Performing design checks...');
  
  const browser = await chromium.launch({
    headless: true,
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  
  const page = await context.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      consoleMessages.errors.push(text);
    } else if (type === 'warning') {
      consoleMessages.warnings.push(text);
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    consoleMessages.errors.push(error.message);
  });
  
  try {
    // Navigate to home page
    console.log('  - Checking homepage...');
    await page.goto(CONFIG.baseURL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Capture screenshot
    await page.screenshot({
      path: path.join(CONFIG.screenshotDir, 'homepage.png'),
      fullPage: true,
    });
    
    // Check for basic accessibility issues
    await checkAccessibility(page, 'Homepage');
    
    // Check leagues page if it exists
    console.log('  - Checking leagues page...');
    try {
      await page.goto(`${CONFIG.baseURL}/leagues`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      
      await page.screenshot({
        path: path.join(CONFIG.screenshotDir, 'leagues.png'),
        fullPage: true,
      });
      
      await checkAccessibility(page, 'Leagues Page');
    } catch (error) {
      console.log('  ⚠️  Could not load leagues page');
      issues.info.push({
        category: 'Navigation',
        message: 'Leagues page not accessible or not found',
        severity: 'low',
      });
    }
    
    // Analyze console messages
    if (consoleMessages.errors.length > 0) {
      issues.critical.push({
        category: 'Console Errors',
        message: `Found ${consoleMessages.errors.length} console errors`,
        details: consoleMessages.errors.slice(0, 5), // First 5 errors
        severity: 'high',
      });
    }
    
    if (consoleMessages.warnings.length > 5) {
      issues.warning.push({
        category: 'Console Warnings',
        message: `Found ${consoleMessages.warnings.length} console warnings`,
        severity: 'medium',
      });
    }
    
  } catch (error) {
    console.error('❌ Error during design checks:', error.message);
    issues.critical.push({
      category: 'Design Check Failed',
      message: error.message,
      severity: 'high',
    });
  } finally {
    await browser.close();
  }
}

/**
 * Basic accessibility checks
 */
async function checkAccessibility(page, pageName) {
  console.log(`  - Checking accessibility for ${pageName}...`);
  
  // Check for missing alt text on images
  const imagesWithoutAlt = await page.locator('img:not([alt])').count();
  if (imagesWithoutAlt > 0) {
    issues.warning.push({
      category: 'Accessibility',
      message: `${pageName}: Found ${imagesWithoutAlt} images without alt text`,
      severity: 'medium',
    });
  }
  
  // Check for buttons without accessible names
  const buttonsWithoutLabel = await page.locator('button:not([aria-label]):not([aria-labelledby])').filter({
    hasText: /^$/,
  }).count();
  
  if (buttonsWithoutLabel > 0) {
    issues.warning.push({
      category: 'Accessibility',
      message: `${pageName}: Found ${buttonsWithoutLabel} buttons without accessible labels`,
      severity: 'medium',
    });
  }
  
  // Check for proper heading hierarchy
  const h1Count = await page.locator('h1').count();
  if (h1Count === 0) {
    issues.warning.push({
      category: 'Accessibility',
      message: `${pageName}: No h1 heading found`,
      severity: 'low',
    });
  } else if (h1Count > 1) {
    issues.warning.push({
      category: 'Accessibility',
      message: `${pageName}: Multiple h1 headings found (${h1Count})`,
      severity: 'low',
    });
  }
}

/**
 * Generate markdown report
 */
function generateReport() {
  console.log('\n📝 Generating design review report...');
  
  const timestamp = new Date().toISOString();
  const totalIssues = issues.critical.length + issues.warning.length + issues.info.length;
  
  let report = `# 🎨 Automated Design Review Report

**Date**: ${timestamp}  
**Base URL**: ${CONFIG.baseURL}  
**Total Issues**: ${totalIssues}

## 📊 Summary

| Severity | Count |
|----------|-------|
| 🚨 Critical | ${issues.critical.length} |
| ⚠️ Warning | ${issues.warning.length} |
| ℹ️ Info | ${issues.info.length} |

`;

  // Status badge
  if (issues.critical.length > 0) {
    report += `**Status**: ❌ **CRITICAL ISSUES FOUND**\n\n`;
  } else if (issues.warning.length > 0) {
    report += `**Status**: ⚠️ **Warnings Present**\n\n`;
  } else {
    report += `**Status**: ✅ **All Checks Passed**\n\n`;
  }

  report += `---\n\n`;

  // Critical issues
  if (issues.critical.length > 0) {
    report += `## 🚨 Critical Issues\n\n`;
    issues.critical.forEach((issue, index) => {
      report += `### ${index + 1}. ${issue.category}\n\n`;
      report += `**Message**: ${issue.message}\n\n`;
      if (issue.details) {
        report += `**Details**:\n\`\`\`\n${issue.details.join('\n')}\n\`\`\`\n\n`;
      }
      report += `---\n\n`;
    });
  }

  // Warnings
  if (issues.warning.length > 0) {
    report += `## ⚠️ Warnings\n\n`;
    issues.warning.forEach((issue, index) => {
      report += `### ${index + 1}. ${issue.category}\n\n`;
      report += `**Message**: ${issue.message}\n\n`;
      report += `---\n\n`;
    });
  }

  // Info items
  if (issues.info.length > 0) {
    report += `## ℹ️ Informational\n\n`;
    issues.info.forEach((issue, index) => {
      report += `- **${issue.category}**: ${issue.message}\n`;
    });
    report += `\n`;
  }

  // Console messages summary
  report += `## 💬 Console Messages\n\n`;
  report += `- **Errors**: ${consoleMessages.errors.length}\n`;
  report += `- **Warnings**: ${consoleMessages.warnings.length}\n\n`;

  // Screenshots
  report += `## 📸 Screenshots\n\n`;
  report += `Screenshots captured and saved to \`test-results/design-review/\`\n\n`;
  report += `- Homepage: \`homepage.png\`\n`;
  report += `- Leagues: \`leagues.png\`\n\n`;

  // Recommendations
  report += `## 🎯 Recommendations\n\n`;
  
  if (issues.critical.length > 0) {
    report += `1. **Address critical issues immediately** - These may break user experience\n`;
  }
  
  if (issues.warning.length > 0) {
    report += `2. **Review warnings** - These should be addressed before merging\n`;
  }
  
  if (consoleMessages.errors.length > 0) {
    report += `3. **Fix console errors** - Check browser console for details\n`;
  }
  
  report += `4. **Run visual regression tests locally** - Compare screenshots against baselines\n`;
  report += `5. **Update baselines if changes are intentional** - Use \`npm run test:visual -- --update-snapshots\`\n\n`;

  // Resources
  report += `## 📚 Resources\n\n`;
  report += `- [Style Guide](./specs/design/style-guide.md)\n`;
  report += `- [Design Principles](./specs/design/design-principles.md)\n`;
  report += `- [Visual Intelligence Protocol](./.claude/claude.md)\n`;
  report += `- [Design Reviewer Agent](./.claude/agents/design-reviewer.md)\n\n`;

  report += `---\n`;
  report += `<sub>🤖 Generated by automated-design-review.js</sub>\n`;

  // Write report
  fs.writeFileSync(CONFIG.reportPath, report, 'utf8');
  console.log(`✅ Report saved to: ${CONFIG.reportPath}`);
  
  return report;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting automated design review...\n');
  
  try {
    // Check if app is running
    const appRunning = await waitForApp();
    if (!appRunning) {
      console.error('\n❌ Cannot perform design review - app is not running');
      console.error('Start the app with: npm run dev:frontend');
      process.exit(2);
    }
    
    // Run visual tests
    await runVisualTests();
    
    // Perform design checks
    await performDesignChecks();
    
    // Generate report
    const report = generateReport();
    
    // Determine exit code
    console.log('\n' + '='.repeat(60));
    if (issues.critical.length > 0) {
      console.log('❌ Design review failed - critical issues found');
      console.log('='.repeat(60));
      process.exit(1);
    } else if (issues.warning.length > 0) {
      console.log('⚠️  Design review completed with warnings');
      console.log('='.repeat(60));
      process.exit(0); // Don't fail on warnings
    } else {
      console.log('✅ Design review passed - no issues found');
      console.log('='.repeat(60));
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error during design review:', error);
    process.exit(2);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(2);
  });
}

module.exports = { main };
