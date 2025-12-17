# PrismCode Repository Structure

```
prismcode/
├── .github/                    # GitHub configurations
│   ├── workflows/              # CI/CD workflows
│   │   ├── ci.yml              # Main CI pipeline
│   │   ├── docs.yml            # Documentation deployment
│   │   ├── pr-automation.yml   # PR automation
│   │   └── ide-auto-assign.yml # IDE issue assignment
│   └── labeler.yml             # Auto-labeling config
│
├── docs/                       # VitePress documentation
│   ├── .vitepress/             # VitePress config
│   ├── guide/                  # User guides
│   ├── agents/                 # Agent documentation
│   └── api/                    # API reference
│
├── src/                        # Source code
│   ├── agents/                 # AI Agent implementations
│   │   ├── base-agent.ts       # Base agent class
│   │   ├── pm-agent.ts         # PM Agent
│   │   ├── architect-agent.ts  # Architect Agent
│   │   ├── coder-agent.ts      # Coder Agent
│   │   └── index.ts            # Agent exports
│   │
│   ├── core/                   # Core functionality
│   │   ├── orchestrator.ts     # Multi-agent orchestrator
│   │   ├── execution-plan.ts   # Execution planning
│   │   ├── agent-bus.ts        # Agent communication
│   │   └── index.ts            # Core exports
│   │
│   ├── utils/                  # Utilities
│   │   ├── logger.ts           # Winston logging
│   │   ├── sentry.ts           # Error tracking
│   │   ├── health.ts           # Health checks
│   │   ├── errors.ts           # Error handling
│   │   ├── security.ts         # Security utilities
│   │   └── index.ts            # Utility exports
│   │
│   ├── types/                  # Type definitions
│   │   └── index.ts            # All types
│   │
│   └── index.ts                # Main entry point
│
├── tests/                      # Test suite
│   ├── unit/                   # Unit tests
│   │   ├── agents/             # Agent tests
│   │   └── utils/              # Utility tests
│   ├── e2e/                    # End-to-end tests
│   └── fixtures/               # Test fixtures
│
├── scripts/                    # Automation scripts
│   ├── validate-env.js         # Environment validation
│   └── setup-phase0-project.js # Project setup
│
├── issues/                     # Issue definitions
│   └── README.md               # Issue structure docs
│
├── .env.example                # Environment template
├── .gitignore                  # Git ignores
├── .eslintrc.json              # ESLint config
├── .prettierrc.json            # Prettier config
├── .editorconfig               # Editor config
├── jest.config.js              # Jest config
├── playwright.config.ts        # Playwright config
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
└── README.md                   # Project readme
```

## Directory Purposes

### `/src/agents/`
AI agent implementations. Each agent extends `BaseAgent` and handles specific tasks.

### `/src/core/`
Core orchestration logic. The `Orchestrator` coordinates agents, `ExecutionPlan` manages task dependencies.

### `/src/utils/`
Shared utilities including logging, error handling, security, and health checks.

### `/tests/`
Test suite with Jest (unit) and Playwright (E2E).

### `/docs/`
VitePress documentation site.

### `/scripts/`
Automation and setup scripts.
