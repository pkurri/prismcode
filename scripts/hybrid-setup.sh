#!/bin/bash

# PrismCode Hybrid IDE Setup Script
# Sets up both Windsurf and Antigravity with cross-sync

set -e

echo "🚀 PrismCode Hybrid IDE Setup"
echo "============================="
echo ""

# Check prerequisites
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ Error: GITHUB_TOKEN not set"
  echo ""
  echo "Get a token: https://github.com/settings/tokens/new"
  echo "Then run: export GITHUB_TOKEN=ghp_your_token_here"
  exit 1
fi

echo "✅ GitHub token found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install --no-save @octokit/rest
echo ""

# Create IDE labels
echo "🏷️  Creating IDE-specific labels..."
node scripts/create-ide-labels.js
echo ""

# Setup Windsurf MCP
echo "🌊 Configuring Windsurf MCP..."
mkdir -p .windsurf

cat > .windsurf/mcp_config.json << 'EOF'
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./src", "./docs"]
    },
    "typescript": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-typescript"],
      "env": {
        "TS_NODE_PROJECT": "./tsconfig.json"
      }
    }
  }
}
EOF

echo "✅ Windsurf MCP configured"
echo ""

# Setup Antigravity config
echo "🪐 Configuring Antigravity..."
mkdir -p .antigravity

cat > .antigravity/config.json << 'EOF'
{
  "project": {
    "name": "PrismCode",
    "repository": "pkurri/prismcode",
    "defaultBranch": "main"
  },
  "sync": {
    "windsurfEnabled": true,
    "syncInterval": "5m",
    "pullLatest": true,
    "autoMerge": true
  },
  "agents": {
    "backend": {
      "model": "gemini-2.0-flash-thinking-exp-1219",
      "capabilities": ["node", "typescript", "api", "database"],
      "budget": "medium"
    },
    "frontend": {
      "model": "gemini-2.0-flash-thinking-exp-1219",
      "capabilities": ["react", "typescript", "tailwind", "ui"],
      "budget": "medium"
    },
    "qa": {
      "model": "gemini-2.0-flash-thinking-exp-1219",
      "capabilities": ["testing", "jest", "playwright"],
      "budget": "low"
    },
    "devops": {
      "model": "gemini-2.0-flash-thinking-exp-1219",
      "capabilities": ["ci-cd", "docker", "github-actions"],
      "budget": "low"
    }
  },
  "execution": {
    "parallelism": 5,
    "autoVerify": true,
    "planBeforeExecute": true
  }
}
EOF

echo "✅ Antigravity configured"
echo ""

echo "============================="
echo "✅ Hybrid Setup Complete!"
echo "============================="
echo ""
echo "📋 What's been set up:"
echo "  🌊 Windsurf MCP servers configured"
echo "  🪐 Antigravity multi-agent config created"
echo "  🏷️  IDE-specific labels created in GitHub"
echo "  🔄 Cross-IDE sync workflows active"
echo ""
echo "📖 Next steps:"
echo "  1. Open Windsurf: windsurf ."
echo "  2. Open Antigravity: Visit https://antigravity.google"
echo "  3. Pick an issue and start coding!"
echo ""
echo "🎯 Try this:"
echo "  Windsurf Cascade (Cmd+L):"
echo "    @github list issues with label phase-0"
echo "    @cascade Implement issue #2"
echo ""
echo "  Antigravity Manager View (Cmd+Shift+M):"
echo "    Create Group: Phase 0 Foundation"
echo "    Assign tasks to agents"
echo "    Execute in parallel"
echo ""
echo "🚀 Happy coding!"
