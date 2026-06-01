#!/bin/bash

# Railway Deployment Script
# This script helps set up and deploy the Downstream application to Railway

echo "🚀 Railway Deployment Helper for Downstream"
echo "==========================================="
echo ""

# Check if in the right directory
if [ ! -f "railway.json" ]; then
    echo "❌ Error: Please run this script from the root project directory"
    exit 1
fi

echo "✅ Found railway.json"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "⚠️  Git repository not found. Initializing..."
    git init
    git add .
    git commit -m "Initial commit - ready for Railway deployment"
fi

echo "📋 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git push origin main"
echo ""
echo "2. Go to https://railway.app"
echo "3. Create a new project and connect your GitHub repository"
echo ""
echo "4. Add PostgreSQL database:"
echo "   - Click '+ New' → 'Database' → 'PostgreSQL'"
echo ""
echo "5. Configure Backend Service:"
echo "   - Root Directory: server"
echo "   - Add environment variables from DEPLOYMENT.md"
echo ""
echo "6. Configure Frontend Service:"
echo "   - Root Directory: client"
echo "   - Add VITE_API_URL environment variable"
echo ""
echo "7. Connect services and deploy!"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT.md"
