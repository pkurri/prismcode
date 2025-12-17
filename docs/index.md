---
layout: home

hero:
  name: PrismCode
  text: Multi-Agent Development Platform
  tagline: AI-powered project orchestration for modern software development
  image:
    src: /logo.svg
    alt: PrismCode
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/pkurri/prismcode

features:
  - icon: 🤖
    title: Multi-Agent Orchestration
    details: Coordinate specialized AI agents (PM, Architect, Coder, QA, DevOps) working together on your project.
  
  - icon: 🔗
    title: GitHub Integration
    details: Seamless integration with GitHub for issue tracking, PRs, and project management.
  
  - icon: ⚡
    title: Developer Experience
    details: Zero-friction setup, comprehensive testing, code quality tools, and CI/CD automation.
  
  - icon: 🏗️
    title: Production Ready
    details: Built with TypeScript strict mode, comprehensive logging, error tracking, and monitoring.
  
  - icon: 📊
    title: Intelligent Planning
    details: Automatic project breakdown, effort estimation, and timeline generation.
  
  - icon: 🔄
    title: Continuous Integration
    details: Automated testing, linting, formatting, and deployment workflows.
---

## Quick Example

```typescript
import { PrismCode } from 'prismcode';

const project = new PrismCode({
  github: {
    owner: 'your-username',
    repo: 'your-project'
  }
});

// Generate project plan from feature description
const plan = await project.plan({
  feature: 'User authentication with OAuth',
  context: 'Next.js application'
});

// Create GitHub issues
await project.createIssues(plan);

// Execute with multi-agent orchestration
await project.execute();
```

## Why PrismCode?

### For Solo Developers
- **Accelerate development** with AI-powered code generation
- **Maintain quality** with automated testing and reviews
- **Stay organized** with intelligent project management

### For Teams
- **Coordinate work** across multiple agents and developers
- **Ensure consistency** with standardized workflows
- **Scale efficiently** with parallel task execution

### For Projects
- **Reduce complexity** with automated architecture decisions
- **Improve reliability** with comprehensive testing
- **Faster delivery** with optimized workflows

## Getting Started

```bash
# Clone the repository
git clone https://github.com/pkurri/prismcode.git

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your GitHub token

# Run validation
npm run setup

# Start developing!
npm run dev
```

## Community

- [GitHub Discussions](https://github.com/pkurri/prismcode/discussions)
- [Report Issues](https://github.com/pkurri/prismcode/issues)
- [Contributing Guide](/guide/contributing)

## License

MIT © [Prasad Kurri](https://github.com/pkurri)
