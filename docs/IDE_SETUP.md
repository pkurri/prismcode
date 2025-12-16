# 🛠️ IDE Integration Setup Guide

PrismCode is designed to work seamlessly with modern AI-powered IDEs. This guide covers setup for **Windsurf**, **Google Antigravity**, **Cursor**, and **VS Code**.

---

## 🌊 Windsurf IDE Setup

### Prerequisites
- **Windsurf** installed ([download](https://windsurf.com))
- **Node.js 18+** installed
- **GitHub Personal Access Token**

### 1. Install Windsurf

```bash
# macOS
brew install --cask windsurf

# Windows
winget install Codeium.Windsurf

# Linux
curl -fsSL https://windsurf.com/install.sh | sh
```

### 2. Configure MCP Servers

Create `.windsurf/mcp_config.json` in your project root:

```json
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
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "args": ["./src", "./docs"]
    },
    "typescript": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-typescript"],
      "env": {
        "TS_NODE_PROJECT": "./tsconfig.json"
      }
    },
    "prismcode": {
      "command": "node",
      "args": ["./dist/cli.js", "--mcp-server"],
      "disabled": true,
      "alwaysAllow": ["list_agents", "execute_agent", "get_issues"]
    }
  }
}
```

### 3. Set Environment Variables

Create `.env` file:

```bash
# GitHub Integration
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=pkurri
GITHUB_REPO=prismcode

# OpenAI for Agents
OPENAI_API_KEY=sk-your-key-here

# Anthropic for Frontend Agent
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Sentry (optional)
SENTRY_DSN=https://your-sentry-dsn
```

### 4. Use Cascade Commands

Open Windsurf Cascade (`Cmd/Ctrl + L`):

```
# List GitHub issues
@github list issues in pkurri/prismcode with label "phase-0"

# Execute PrismCode agents
@prismcode pm-agent "Add user authentication"

# Review code with context
@cascade Review src/agents/BaseAgent.ts for:
- TypeScript best practices
- Memory leaks
- Error handling
- Performance issues

# Implement issue
@cascade Implement issue #2 dev environment setup
Include: package.json, scripts/setup.js, .env.example
Follow Node.js best practices

# Generate tests
@cascade Write unit tests for PMAgent class
Coverage: 100%
Framework: Jest
Include: mocks for OpenAI API
```

### 5. Windsurf Workflows

#### Workflow 1: Implement an Issue
```
1. @github show issue #5
2. @cascade Analyze requirements and create implementation plan
3. @cascade Generate code following the plan
4. @cascade Write tests with 80%+ coverage
5. @github create pull request for issue #5
```

#### Workflow 2: Code Review
```
1. @github show PR #10
2. @cascade Review all changed files for:
   - Security vulnerabilities
   - Performance issues
   - Code style consistency
   - Missing tests
3. @github add review comments
```

#### Workflow 3: Debug Agent
```
1. @cascade Analyze error in logs/error.log
2. @cascade Identify root cause in src/agents/PMAgent.ts
3. @cascade Generate fix with tests
4. Run tests to verify
```

---

## 🪐 Google Antigravity Setup

### Prerequisites
- **Google Antigravity** installed ([antigravity.google](https://antigravity.google))
- **Google Cloud account** (for auth)
- **GitHub integration** enabled

### 1. Install Antigravity

```bash
# Visit https://antigravity.google
# Sign in with Google account
# Download for your platform

# macOS
open Antigravity.dmg

# Windows
Antigravity-Setup.exe

# Linux
sudo dpkg -i antigravity.deb
```

### 2. Connect GitHub

1. Open Antigravity
2. Settings → Integrations → GitHub
3. Authorize Antigravity app
4. Select repository: `pkurri/prismcode`

### 3. Manager View Configuration

Create `.antigravity/config.json`:

```json
{
  "project": {
    "name": "PrismCode",
    "repository": "pkurri/prismcode",
    "defaultBranch": "main"
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
    },
    "architect": {
      "model": "gemini-exp-1206",
      "capabilities": ["system-design", "architecture", "patterns"],
      "budget": "high"
    }
  },
  "execution": {
    "parallelism": 5,
    "autoVerify": true,
    "planBeforeExecute": true
  }
}
```

### 4. Manager View Workflows

#### Create Agent Group for Phase 0

```
Manager View (Cmd/Ctrl + Shift + M)

Create Group: "Phase 0 - Foundation"

Assign Tasks:
1. Backend Agent
   - Task: "Implement issue #2 dev environment setup"
   - Files: package.json, scripts/setup.js, .env.example
   - Mode: Plan
   
2. DevOps Agent
   - Task: "Implement issue #5 CI/CD pipeline"
   - Files: .github/workflows/ci-cd.yml
   - Dependencies: Task 1
   - Mode: Plan
   
3. QA Agent
   - Task: "Implement issue #6 testing infrastructure"
   - Files: jest.config.js, playwright.config.ts
   - Dependencies: Task 1
   - Mode: Plan
   
4. Technical Writer Agent
   - Task: "Implement issue #8 documentation site"
   - Files: docs/.vitepress/*, docs/guide/*
   - Dependencies: Tasks 1-3
   - Mode: Plan

Execution Settings:
- Parallel: Tasks 2-3 (after Task 1)
- Verification: Run tests after each task
- Auto-commit: On success
- Create PR: When all complete

Click: "Generate Plans" → Review → "Execute All"
```

#### Single Issue Implementation

```
Manager View → New Task

Description: "Implement issue #7 Base Agent Architecture"

Agent: Backend
Model: gemini-2.0-flash-thinking-exp
Budget: Medium
Mode: Plan → Execute

Context:
- Issue URL: https://github.com/pkurri/prismcode/issues/7
- Codebase: ./src
- Related: TypeScript strict mode (#4)

Requirements:
- Follow issue acceptance criteria exactly
- Write comprehensive tests (100% coverage)
- Add JSDoc comments
- Update CHANGELOG.md

Verification:
- npm test passes
- npm run lint passes
- Build succeeds

Click: "Plan" → Review plan → "Execute"
```

### 5. Artifacts & Review

Antigravity generates **Artifacts** for every agent action:

- **Plans**: Detailed implementation plans before execution
- **Code**: Generated files with explanations
- **Tests**: Unit/integration tests
- **Screenshots**: Visual verification for UI work
- **Logs**: Execution logs and errors

**Review Workflow:**
1. Agent generates plan → Review in Artifacts panel
2. Add comments/feedback directly on artifacts
3. Agent incorporates feedback automatically
4. Agent executes → Review generated code
5. Approve → Auto-commit to branch

---

## 🎯 Cursor IDE Setup

Create `.cursorrules` file:

```markdown
# PrismCode Development Rules

## Code Style
- TypeScript strict mode always
- 2-space indentation
- Single quotes for strings
- No semicolons
- ESLint + Prettier enforced

## Architecture
- All agents extend BaseAgent
- Use EventEmitter for agent communication
- OpenAI for PM/Architect agents
- Anthropic Claude for coding agents
- Winston for logging, Sentry for errors

## Testing
- Jest for unit tests (80%+ coverage)
- Playwright for E2E tests
- Mock all external APIs
- Test files: `__tests__/*.test.ts`

## Agents
- PMAgent: Breaks down features → GPT-4 Turbo
- ArchitectAgent: System design → GPT-4 Turbo
- FrontendCoderAgent: React components → Claude 3.5 Sonnet
- BackendCoderAgent: APIs/logic → Claude 3.5 Sonnet
- QAAgent: Test generation → GPT-4 Turbo
- DevOpsAgent: CI/CD → GPT-4 Turbo

## GitHub Integration
- Use Octokit for REST API
- GraphQL for complex queries
- Auto-create issues from plans
- Link PRs to issues
```

**Cursor Commands:**
```
Cmd+K: "Implement BaseAgent class following .cursorrules"
Cmd+L: "Explain how the agent orchestrator works"
Cmd+I: "Generate tests for PMAgent with 100% coverage"
```

---

## ⚙️ VS Code Setup

Install extensions:
```bash
code --install-extension GitHub.copilot
code --install-extension GitHub.copilot-chat
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

Create `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "github.copilot.enable": {
    "*": true
  }
}
```

---

## 🛠️ Quick Start Comparison

| Feature | Windsurf | Antigravity | Cursor | VS Code |
|---------|----------|-------------|--------|----------|
| **Best For** | Context-aware AI | Multi-agent tasks | Fast coding | Traditional dev |
| **MCP Support** | ✅ Native | ❌ | ✅ Via extension | ❌ |
| **Multi-Agent** | ❌ | ✅ Manager View | ❌ | ❌ |
| **GitHub Integration** | ✅ MCP server | ✅ Native | ✅ API | ✅ Extension |
| **Cost** | Free beta | Free (Google account) | $20/month | Free + Copilot |
| **Recommended Use** | Implementation | Planning + Execution | Quick edits | Testing |

---

## 🚀 Recommended Workflow

### For Solo Developers
**Use Windsurf** for everything:
1. @github to browse issues
2. @cascade to implement
3. Built-in testing and debugging

### For Teams
**Use Antigravity Manager View**:
1. Create agent groups for each phase
2. Assign tasks to agents
3. Parallel execution across team
4. Review artifacts together

### For Mixed Workflows
1. **Antigravity**: Planning (generates detailed plans)
2. **Windsurf**: Implementation (best MCP integration)
3. **Cursor**: Quick fixes (fastest)
4. **VS Code**: Code review (familiar interface)

---

## 📚 Resources

- [Windsurf MCP Documentation](https://windsurf.com/university/tutorials/configuring-first-mcp-server)
- [Google Antigravity Docs](https://developers.googleblog.com/en/build-with-google-antigravity-our-new-agentic-development-platform/)
- [Cursor Rules Guide](https://docs.cursor.com/context/rules-for-ai)
- [PrismCode GitHub Issues](https://github.com/pkurri/prismcode/issues)

---

## ❓ Troubleshooting

### Windsurf MCP Not Working
```bash
# Check MCP server status
npx @modelcontextprotocol/inspector

# Restart Windsurf
Cmd/Ctrl + Shift + P → "Reload Window"

# Check logs
~/.windsurf/logs/mcp-*.log
```

### Antigravity Agent Errors
```
# Check agent budget/quota
Settings → Usage → View quota

# Review artifact errors
Artifacts panel → Logs tab

# Reset agent
Manager View → Agent → Reset State
```

### GitHub Integration Issues
```bash
# Verify token permissions
gh auth status

# Required scopes: repo, workflow, read:org
gh auth refresh -s repo,workflow,read:org
```

---

**Ready to build?** Pick your IDE and start with [Issue #2](https://github.com/pkurri/prismcode/issues/2)! 🚀