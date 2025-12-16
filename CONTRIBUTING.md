# Contributing to PrismCode

Thank you for your interest in contributing to PrismCode! 🎉

## Ways to Contribute

### 1. Report Bugs

Found a bug? [Open an issue](https://github.com/pkurri/prismcode/issues/new) with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, etc.)

### 2. Suggest Features

Have an idea? [Start a discussion](https://github.com/pkurri/prismcode/discussions/new?category=ideas)

### 3. Submit Pull Requests

#### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/prismcode.git
   cd prismcode
   ```
3. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Make your changes
5. Run tests:
   ```bash
   npm test
   npm run lint
   ```
6. Commit with conventional commits:
   ```bash
   git commit -m "feat: add new agent capability"
   ```
7. Push and create PR

#### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding/updating tests
- `chore:` Maintenance tasks

### 4. Improve Documentation

Documentation is in `docs/`. PRs for typo fixes, clarity improvements, and examples are always welcome!

### 5. Add Real-World Patterns

Contribute to the pattern database in `lib/patterns/`:

```typescript
// lib/patterns/authentication.ts
export const authenticationPatterns = [
  {
    name: "OAuth 2.0",
    realWorldExample: "GitHub, Google, Facebook login",
    verifiedSource: "https://oauth.net/2/",
    implementation: {
      backend: ["passport.js", "oauth2-server"],
      security: ["PKCE", "state parameter"],
    },
  },
];
```

**Requirements**:
- Must reference real, verifiable implementations
- Include source/documentation links
- No hallucinated patterns

### 6. Create Agent Templates

Build specialized agents in `agents/`:

```typescript
// agents/my-agent/index.ts
import { BaseAgent } from '../base';

export class MySpecializedAgent extends BaseAgent {
  async analyze(input: FeatureInput): Promise<AgentOutput> {
    // Your implementation
  }
}
```

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Setup

```bash
# Clone
git clone https://github.com/pkurri/prismcode.git
cd prismcode

# Install
npm install

# Build
npm run build

# Test
npm test

# Watch mode
npm run dev
```

### Project Structure

```
prismcode/
├── agents/           # Agent implementations
├── docs/             # Documentation
├── examples/         # Example projects
├── lib/              # Core library
│   ├── core/        # Core orchestration
│   ├── agents/      # Agent base classes
│   ├── patterns/    # Real-world pattern database
│   └── integrations/# GitHub, n8n, etc.
├── scripts/          # Utility scripts
└── tests/            # Test files
```

## Code Guidelines

### TypeScript

- Use TypeScript strict mode
- Export interfaces for public APIs
- Document complex functions with JSDoc

```typescript
/**
 * Analyzes a feature and generates project plan
 * @param feature - Feature description
 * @param options - Configuration options
 * @returns Complete project plan
 */
export async function analyzeFeature(
  feature: string,
  options: AnalysisOptions
): Promise<ProjectPlan> {
  // Implementation
}
```

### Testing

- Write unit tests for new features
- Aim for >80% code coverage
- Use descriptive test names

```typescript
describe('ArchitectAgent', () => {
  it('should generate system architecture from feature description', async () => {
    const agent = new ArchitectAgent();
    const result = await agent.analyze({ feature: 'User auth' });
    expect(result.architecture).toBeDefined();
    expect(result.architecture.frontend).toBeDefined();
  });
});
```

### Linting

We use ESLint with TypeScript:

```bash
npm run lint        # Check
npm run lint:fix    # Auto-fix
```

## Review Process

1. **Automated Checks**: CI runs tests and linting
2. **Code Review**: Maintainer reviews code
3. **Testing**: Manual testing if needed
4. **Merge**: Approved PRs are merged to `main`

## Recognition

Contributors are recognized in:
- [Contributors page](https://github.com/pkurri/prismcode/graphs/contributors)
- Release notes
- README (for significant contributions)

## Questions?

Join [GitHub Discussions](https://github.com/pkurri/prismcode/discussions) or open an issue!

## Code of Conduct

Be respectful, inclusive, and professional. We're all here to build great software together. 🚀