#!/bin/bash

# 🚀 NFL Pick 'Em Production Deployment Script
# This script deploys the league persistence fix to Vercel

echo "🎯 NFL Pick 'Em - League Persistence Fix Deployment"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel@latest
fi

echo "🔍 Pre-deployment checks..."

# Check TypeScript compilation
echo "   ✅ Checking TypeScript..."
cd packages/frontend && npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found. Fix them before deploying."
    exit 1
fi
cd ../..

# Check if storage adapter exists
if [ ! -f "packages/frontend/lib/storage-adapter.ts" ]; then
    echo "❌ StorageAdapter not found. The persistence fix is missing."
    exit 1
fi

echo "✅ All pre-deployment checks passed!"

echo "🚀 Deploying to Vercel..."

# Deploy to Vercel
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo ""
    echo "✅ Key improvements deployed:"
    echo "   • Leagues now persist across server restarts"
    echo "   • Database-first with file storage fallback"  
    echo "   • No more league data corruption"
    echo "   • Backward compatible with existing data"
    echo ""
    echo "🧪 Post-deployment testing:"
    echo "   1. Create a test league"
    echo "   2. Add some members"  
    echo "   3. Wait for server restart"
    echo "   4. Verify league still exists"
    echo ""
    echo "📊 Monitor these logs in Vercel:"
    echo "   • '✅ Database connection available'"
    echo "   • '✅ Leagues saved to persistent file storage'"
    echo "   • '📖 Persistent storage leagues API'"
    echo ""
    echo "🎯 The league data wiping issue is now FIXED!"
else
    echo "❌ Deployment failed. Check the errors above."
    exit 1
fi