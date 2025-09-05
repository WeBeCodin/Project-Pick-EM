#!/bin/bash

# TypeScript Health Check Script
# Helps diagnose and fix common TypeScript issues in the NFL Pick 'Em project

echo "🔍 TypeScript Health Check for NFL Pick 'Em Backend"
echo "=================================================="
echo

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the backend package directory"
    echo "   Expected: packages/backend/"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo

# 1. Check TypeScript configuration
echo "1. Checking TypeScript Configuration..."
if [ -f "tsconfig.json" ]; then
    echo "   ✅ tsconfig.json found"
    echo "   📋 TypeScript version: $(npx tsc --version)"
else
    echo "   ❌ tsconfig.json missing"
fi
echo

# 2. Check if dependencies exist
echo "2. Checking Key Dependencies..."
key_files=(
    "src/utils/logger.ts"
    "src/services/cache/cache.service.ts" 
    "src/database/index.ts"
    "src/services/rss/rss-parser.service.ts"
)

for file in "${key_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (missing)"
    fi
done
echo

# 3. Try TypeScript compilation
echo "3. Testing TypeScript Compilation..."
if npx tsc --noEmit --showConfig > /dev/null 2>&1; then
    echo "   ✅ TypeScript configuration is valid"
else
    echo "   ❌ TypeScript configuration has issues"
fi

if npx tsc --noEmit > /dev/null 2>&1; then
    echo "   ✅ TypeScript compilation successful"
else
    echo "   ❌ TypeScript compilation failed"
    echo "   Run 'npm run build' for detailed errors"
fi
echo

# 4. Check for node_modules
echo "4. Checking Dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules exists"
    if [ -f "node_modules/.package-lock.json" ] || [ -f "package-lock.json" ]; then
        echo "   ✅ Dependencies locked"
    else
        echo "   ⚠️  No lock file found"
    fi
else
    echo "   ❌ node_modules missing - run 'npm install'"
fi
echo

# 5. Test build and tests
echo "5. Running Quick Tests..."
if npm run build > /dev/null 2>&1; then
    echo "   ✅ Build successful"
else
    echo "   ❌ Build failed"
fi

if npm test -- --testPathPattern=rss --silent > /dev/null 2>&1; then
    echo "   ✅ RSS tests passing"
else
    echo "   ❌ RSS tests failing"
fi
echo

# 6. Suggestions
echo "🛠️  Troubleshooting Suggestions:"
echo "   1. If you see VS Code TypeScript errors but build works:"
echo "      - Press Ctrl+Shift+P → 'TypeScript: Restart TS Server'"
echo "      - Or run: npx tsc --build --clean && npm run build"
echo
echo "   2. If imports are not resolving:"
echo "      - Check file paths are correct relative to current file"
echo "      - Ensure exported names match import statements"
echo "      - Verify tsconfig.json baseUrl and paths are correct"
echo
echo "   3. If tests are failing:"
echo "      - Run 'npm test -- --verbose' for detailed output"
echo "      - Check if Docker services are running: 'docker-compose up -d'"
echo
echo "   4. Reset everything:"
echo "      - rm -rf node_modules dist .tsbuildinfo"
echo "      - npm install && npm run build"
echo

echo "✨ Health check complete!"
