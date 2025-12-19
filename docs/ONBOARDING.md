# Developer Onboarding Guide

Welcome to PrismCode! This guide will help you get started.

## Quick Start (5 minutes)

### 1. Installation

```bash
npm install prismcode
```

### 2. Configuration

Create `.env` file:

```env
OPENAI_API_KEY=your_openai_key
GITHUB_TOKEN=your_github_token
```

### 3. First Project

```typescript
import { PrismCode } from 'prismcode';

const pc = new PrismCode();

// Describe your feature
const result = await pc.analyze(`
  Build a user authentication system with:
  - Email/password login
  - OAuth support
  - Password reset flow
`);

// Generate implementation
const plan = await pc.generatePlan(result);
await pc.execute(plan);
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│                 PrismCode                    │
├─────────────────────────────────────────────┤
│  ┌─────┐ ┌──────┐ ┌─────┐ ┌────┐ ┌──────┐  │
│  │ PM  │ │Arch  │ │Code │ │ QA │ │DevOps│  │
│  │Agent│ │Agent │ │Agent│ │Agt │ │Agent │  │
│  └─────┘ └──────┘ └─────┘ └────┘ └──────┘  │
├─────────────────────────────────────────────┤
│           Orchestration Layer               │
├─────────────────────────────────────────────┤
│    Analytics │ Cost │ Rate Limiting │ SSO  │
└─────────────────────────────────────────────┘
```

## Key Concepts

### Agents

Specialized AI workers that handle specific tasks:

- **PM Agent**: Requirements and user stories
- **Architect**: System design
- **Coder**: Implementation
- **QA**: Testing
- **DevOps**: Deployment

### Workflow

1. Feature → PM Agent → Stories
2. Stories → Architect → Design
3. Design → Coder → Code
4. Code → QA → Tests
5. Tests → DevOps → Deploy

---

## IDE Extensions

### VS Code / Cursor

```bash
code --install-extension prismcode.vscode-extension
```

### Windsurf

Available in extension marketplace.

---

## Common Tasks

### Generate User Stories

```typescript
const stories = await pm.generateStories('Add user profile page');
```

### Create Architecture

```typescript
const design = await architect.designArchitecture(stories);
```

### Generate Code

```typescript
const code = await coder.generateCode(design);
```

---

## Troubleshooting

| Issue           | Solution             |
| --------------- | -------------------- |
| API key invalid | Check `.env` file    |
| Rate limited    | Wait or upgrade plan |
| Build fails     | Run `npm run build`  |

## Resources

- [API Reference](./API.md)
- [Examples](./EXAMPLES.md)
- [GitHub](https://github.com/pkurri/prismcode)
