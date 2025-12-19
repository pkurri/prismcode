# PrismCode API Reference

## Overview

PrismCode is a multi-agent AI system for autonomous project management and development. This document provides comprehensive API documentation.

## Core API

### PrismCode Class

```typescript
import { PrismCode } from 'prismcode';

const pc = new PrismCode({
  openaiApiKey: process.env.OPENAI_API_KEY,
  githubToken: process.env.GITHUB_TOKEN,
});
```

#### Methods

| Method                   | Description                   | Returns                    |
| ------------------------ | ----------------------------- | -------------------------- |
| `analyze(feature)`       | Analyze a feature description | `Promise<FeatureAnalysis>` |
| `generatePlan(analysis)` | Generate project plan         | `Promise<ProjectPlan>`     |
| `execute(plan)`          | Execute the plan              | `Promise<ExecutionResult>` |

---

## Agents API

### PM Agent

Manages project requirements and generates user stories.

```typescript
import { PMAgent } from 'prismcode/agents';

const pm = new PMAgent();
const stories = await pm.generateStories(feature);
```

### Architect Agent

Designs system architecture and technical specifications.

```typescript
import { ArchitectAgent } from 'prismcode/agents';

const architect = new ArchitectAgent();
const design = await architect.designArchitecture(requirements);
```

### Coder Agent

Implements code based on specifications.

```typescript
import { CoderAgent } from 'prismcode/agents';

const coder = new CoderAgent();
const code = await coder.generateCode(specification);
```

### QA Agent

Tests and validates implementations.

```typescript
import { QAAgent } from 'prismcode/agents';

const qa = new QAAgent();
const results = await qa.runTests(code);
```

### DevOps Agent

Handles deployment and infrastructure.

```typescript
import { DevOpsAgent } from 'prismcode/agents';

const devops = new DevOpsAgent();
const deployment = await devops.deploy(artifact);
```

---

## Advanced Features

### Analytics Dashboard

```typescript
import { analyticsDashboard } from 'prismcode/advanced';

const metrics = await analyticsDashboard.getMetrics();
const summary = await analyticsDashboard.getDashboardSummary();
```

### Rate Limiting

```typescript
import { rateLimitManager } from 'prismcode/advanced';

rateLimitManager.addRule({
  name: 'api-limit',
  limit: 100,
  windowMs: 60000,
  identifierType: 'user',
});
```

### Cost Tracking

```typescript
import { costTracker } from 'prismcode/advanced';

costTracker.recordCost('gpt-4', 1000, 500); // model, inputTokens, outputTokens
const summary = costTracker.getSummary();
```

---

## Configuration

```typescript
interface PrismCodeConfig {
  openaiApiKey: string;
  githubToken?: string;
  model?: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  maxTokens?: number;
  temperature?: number;
}
```

## Error Handling

```typescript
import { PrismCodeError, ValidationError } from 'prismcode/errors';

try {
  await prismcode.execute(plan);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.details);
  }
}
```

## Rate Limits

| Tier       | Requests/min | Tokens/day |
| ---------- | ------------ | ---------- |
| Free       | 10           | 100,000    |
| Pro        | 100          | 1,000,000  |
| Enterprise | Unlimited    | Unlimited  |

---

## Support

- GitHub: https://github.com/pkurri/prismcode
- Issues: https://github.com/pkurri/prismcode/issues
