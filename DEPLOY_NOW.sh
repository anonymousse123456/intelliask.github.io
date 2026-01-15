#!/bin/bash

# IntelliAsk Vercel Deployment Script
# This script automates the deployment process

set -e

echo "🚀 IntelliAsk Vercel Deployment Script"
echo "======================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI found"
fi

echo ""
echo "📝 Please ensure you have:"
echo "   1. A Vercel account"
echo "   2. Your Gemini API key ready"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo ""
echo "🔑 Setting up environment variables..."
echo "When prompted, paste your Gemini API key"
echo ""

vercel env add GEMINI_API_KEY production

echo ""
echo "📦 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Next steps:"
echo "   1. Visit your Vercel URL to test the demo"
echo "   2. Check Vercel Dashboard for logs: https://vercel.com/dashboard"
echo "   3. Upload a PDF in the 'Try IntelliAsk' section"
echo ""
echo "🔗 Your API endpoint: https://your-project.vercel.app/api/upload"
echo ""
