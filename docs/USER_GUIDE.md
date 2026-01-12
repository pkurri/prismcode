# PrismCode User Guide

Welcome to **PrismCode** - an AI-powered development platform that brings intelligent automation to your entire development workflow.

## Quick Start

```bash
# Clone and install
git clone https://github.com/pkurri/prismcode.git
cd prismcode/web
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access PrismCode.

---

## Core Features

### 1. Dashboard
The central hub displaying your development metrics, active agents, and recent activity.

**Key Elements:**
- Activity Feed - Recent commits, PRs, and agent actions
- Quick Actions - One-click access to common tasks
- Metrics Cards - Code quality, test coverage, deployment status

---

### 2. AI Code Review (`/review`)
Automated code analysis with AI-powered suggestions.

**How to Use:**
1. Navigate to **Code Review** in the sidebar
2. Paste code or select a file
3. Click **Analyze** to get instant feedback
4. Review findings grouped by: Security, Performance, Best Practices

**Categories:**
- 🔴 Critical - Security vulnerabilities
- 🟡 Warning - Performance issues
- 🔵 Info - Style suggestions

---

### 3. Visual Sandbox (`/sandbox`)
AI-powered UI generation from natural language prompts.

**How to Use:**
1. Navigate to **Sandbox**
2. Enter a prompt: "Create a login form with email and password"
3. Click **Generate UI**
4. Edit the generated code in the editor
5. See live preview update automatically

**Tips:**
- Be specific: "dark mode login with social buttons"
- Iterate: modify the code and watch preview update
- Export: copy code to your project

---

### 4. Codebase Q&A (`/ask`)
Ask questions about your codebase using natural language.

**Example Questions:**
- "How does authentication work?"
- "Where is the database configured?"
- "What API endpoints exist?"

The AI searches your codebase and provides answers with source references.

---

### 5. Multi-Agent Orchestrator (`/orchestrator`)
Coordinate AI agents to automate complex tasks.

**Available Agents:**
| Agent | Role |
|-------|------|
| Product Manager | Requirements, priorities |
| Scrum Master | Sprint planning, tracking |
| Developer | Code generation, refactoring |
| QA | Testing, bug detection |

**Creating a Task:**
1. Go to **Orchestrator**
2. Click **Create Task**
3. Describe what you need
4. Select agents to involve
5. Monitor progress in real-time

---

### 6. Workflow Canvas (`/workflows/canvas`)
Visual workflow builder for CI/CD automation.

**Building a Workflow:**
1. Drag nodes from the palette (Trigger, Action, Condition)
2. Connect nodes to define flow
3. Configure each node's parameters
4. Save and activate

**Node Types:**
- **Trigger**: PR opened, Push, Schedule
- **Action**: Run tests, Deploy, Notify
- **Condition**: Branch check, Approval required

---

### 7. Mobile Preview (`/mobile`)
Test your app across different device sizes.

**Supported Devices:**
- iPhone 14 Pro (390x844)
- Pixel 7 (412x915)
- iPad (820x1180)

**Controls:**
- Switch pages to preview
- Toggle Portrait/Landscape
- Select device type

---

### 8. Environments (`/environments`)
Manage sandbox and staging environments.

**Actions:**
- Create new sandbox
- Connect to existing environment
- View environment status
- Access logs and metrics

---

## Navigation

The sidebar organizes features into categories:

| Category | Features |
|----------|----------|
| **Intelligence** | AI Assistant, Code Review, Q&A |
| **Code Quality** | Quality Dashboard, Tech Debt, Testing |
| **DevOps & Infra** | Environments, Deployments, CI/CD |
| **Collaboration** | Team, Video Calls, Session Sharing |
| **Tools** | Workflow Builder, Sandbox, Editor |

**Keyboard Shortcuts:**
- `Cmd/Ctrl + B` - Toggle sidebar
- `Cmd/Ctrl + K` - Quick search
- `Cmd/Ctrl + /` - Open shortcuts panel

---

## API Reference

All features are backed by REST APIs:

| Endpoint | Description |
|----------|-------------|
| `POST /api/code-review` | Analyze code |
| `POST /api/ask` | Query codebase |
| `GET /api/agents` | List agents |
| `POST /api/collaboration` | Join session |

---

## Troubleshooting

**App not loading?**
```bash
npm run dev  # Ensure server is running
```

**Tests failing?**
```bash
npm run test  # Run test suite
```

**Need help?**
- Check `/docs` for detailed documentation
- Open an issue on GitHub

---

## Version

- **Current**: 0.1.0
- **Tests**: 535 passing
- **Coverage**: 65%+
