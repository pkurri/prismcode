# Development Environment Setup

## Overview

This guide covers the complete setup for developing PrismCode.

## Prerequisites

- **Node.js** >= 18.0.0 (v22.14.0 recommended)
- **npm** >= 9.0.0
- **Git** latest version
- **GitHub Personal Access Token** with `repo`, `workflow`, and `project` scopes

## Quick Setup (< 5 minutes)

### 1. Clone Repository

```bash
git clone https://github.com/pkurri/prismcode.git
cd prismcode
```

### 2. Install Dependencies

```bash
# Using the full path if needed (Windows with nvm4w)
C:\nvm4w\nodejs\npm.cmd install

# Or if npm is in PATH
npm install
```

### 3. Configure Environment

```bash
# Copy the example environment file
copy .env.example .env  # Windows
# or
cp .env.example .env # Linux/Mac
```

Edit `.env` and add your GitHub token:

```env
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=pkurri
GITHUB_DEFAULT_REPO=prismcode
```

### 4. Validate Setup

```powershell
# Run environment validation
npm run validate-env
```

This will check:
- Node.js version
- npm availability
- Git installation
- `.env` configuration
- Required dependencies
- TypeScript compiler

### 5. Build the Project

```bash
npm run build
```

##Available Scripts

### Development
- `npm run dev` - Start TypeScript compiler in watch mode
- `npm run build` - Compile TypeScript to JavaScript
- `npm run build:watch` - Build in watch mode
- `npm run typecheck` - Check TypeScript types without building

### Environment Management
- `npm run setup` - Run environment validation (same as validate-env)
- `npm run validate-env` - Validate development environment
- `npm run clean` - Remove build artifacts (dist, coverage)
- `npm run reset` - Full reset (clean + reinstall dependencies)

### Testing (configured in Issue #6)
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

### Code Quality (configured in Issue #11)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Phase 0 Management
- `npm run phase0:setup` - Create feature branches and workstream guides
- `npm run phase0:assign` - Assign issues to agents
- `npm run phase0:project` - Create GitHub Project V2

### GitHub Integration
- `npm run import-issues` - Import issues from JSON
- `npm run create-ide-labels` - Create IDE-specific labels

## Project Structure

```
prismcode/
├── .github/
│   ├── workflows/          # GitHub Actions CI/CD
│   └── ISSUE_TEMPLATE/     # Issue templates
├── docs/                   # Documentation (VitePress)
│   ├── guide/
│   ├── agents/
│   └── .vitepress/
├── scripts/                # Utility scripts
│   ├── validate-env.js     # Environment validation
│   ├── execute-parallel.js # Parallel execution setup
│   ├── assign-agents.js    # Agent assignment
│   └── setup-phase0-project.js
├── src/                    # Source code
│   ├── agents/             # AI agent implementations
│   ├── core/               # Core functionality
│   ├── types/              # TypeScript type definitions
│   └── index.ts            # Entry point
├── tests/                  # Test files (after Issue #6)
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env                    # Environment variables (not in git)
├── .env.example            # Example environment file
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies and scripts
```

## TypeScript Configuration

The project uses **strict mode** TypeScript for maximum type safety:

- `strict: true` - All strict type-checking options enabled
- `esModuleInterop: true` - CommonJS/ES module interoperability
- `skipLibCheck: true` - Skip type checking of declaration files
- `forceConsistentCasingInFileNames: true` - Enforce consistent casing

## Development Workflow

### 1. Start Development

```bash
# Watch mode for automatic recompilation
npm run dev
```

### 2. Make Changes

Edit files in `src/` directory. TypeScript will recompile automatically.

### 3. Run Tests

```bash
npm test
```

### 4. Check Code Quality

```bash
npm run lint
npm run format:check
npm run typecheck
```

### 5. Build for Production

```bash
npm run build
```

Compiled JavaScript will be in `dist/` directory.

## Troubleshooting

### Node/npm not found

**Windows (using nvm4w)**:
```powershell
# Use full path
C:\nvm4w\nodejs\npm.cmd install

# Or refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
```

### "Module not found" errors

```bash
# Reinstall dependencies
npm run reset
```

### TypeScript errors

```bash
# Clear TypeScript cache
npm run clean
npm run build
```

### GitHub token issues

1. Generate new token: https://github.com/settings/tokens/new
2. Required scopes: `repo`, `workflow`, `project`
3. Add to `.env` file
4. Run: `npm run validate-env`

### Permission errors (Windows)

Run PowerShell as Administrator or adjust execution policy:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | `ghp_xxxxxxxxxxxxx` |
| `GITHUB_OWNER` | GitHub username/organization | `pkurri` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_DEFAULT_REPO` | Default repository name | `prismcode` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | - |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | - |
| `N8N_WEBHOOK_URL` | n8n webhook for automation | - |
| `DEBUG` | Enable debug logging | `false` |
| `LOG_LEVEL` | Logging level | `info` |

## IDE Setup

### VS Code / Cursor

Recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

Settings (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### JetBrains (WebStorm, IntelliJ IDEA)

- Enable ESLint: Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
- Enable Prettier: Settings → Languages & Frameworks → JavaScript → Prettier
- TypeScript version: Automatic (from node_modules)

## Next Steps

After completing environment setup:

1. **Run validation**: `npm run validate-env`
2. **Review Phase 0 plan**: See `PHASE0_QUICKSTART.md`
3. **Pick a workstream**: Check `implementation_plan.md`
4. **Start developing**: Follow the workstream guides in `workstreams/`

## Resources

- [Implementation Plan](../implementation_plan.md)
- [Phase 0 Quick Start](../PHASE0_QUICKSTART.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Development Roadmap](../DEVELOPMENT_ROADMAP.md)

## Support

- [GitHub Issues](https://github.com/pkurri/prismcode/issues)
- [GitHub Discussions](https://github.com/pkurri/prismcode/discussions)
- [Documentation](https://pkurri.github.io/prismcode/)
