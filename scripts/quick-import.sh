#!/bin/bash

# PrismCode Quick Import Script
# Imports all 140 remaining issues to GitHub

set -e

echo "🚀 PrismCode Issue Import"
echo "========================="
echo ""

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ Error: GITHUB_TOKEN not set"
  echo ""
  echo "Get a token: https://github.com/settings/tokens/new"
  echo "Required scopes: repo, workflow"
  echo ""
  echo "Then run:"
  echo "  export GITHUB_TOKEN=ghp_your_token_here"
  echo "  ./scripts/quick-import.sh"
  exit 1
fi

echo "✅ GitHub token found"
echo ""

# Check for required dependencies
if ! command -v node &> /dev/null; then
  echo "❌ Error: Node.js not installed"
  echo "Install: https://nodejs.org/"
  exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install --no-save @octokit/rest chalk ora
echo ""

# Run import
echo "🚀 Starting import..."
echo ""
node scripts/import-all-issues.js

echo ""
echo "✅ Import complete!"
echo ""
echo "View issues: https://github.com/pkurri/prismcode/issues"
