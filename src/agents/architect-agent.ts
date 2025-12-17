/**
 * Architect Agent - System Design Agent
 *
 * Handles:
 * - System architecture design
 * - Technology stack selection
 * - Design patterns and best practices
 * - Technical decision making
 * - API design and documentation
 * - Mermaid diagram generation
 */

import { BaseAgent } from './base-agent';
import { AgentOutput, Architecture, FeatureInput } from '../types';
import logger from '../utils/logger';

/**
 * Architect Agent input
 */
export interface ArchitectAgentInput {
  feature: FeatureInput;
  requirements?: string[];
  constraints?: string[];
  context?: Record<string, unknown>;
}

/**
 * Architect Agent output
 */
export interface ArchitectAgentOutput extends AgentOutput {
  data: {
    architecture: Architecture;
    decisions: TechnicalDecision[];
    patterns: DesignPattern[];
    diagrams: {
      system: string;
      sequence?: string;
      er?: string;
    };
    recommendations: string[];
  };
}

/**
 * Technical decision record
 */
export interface TechnicalDecision {
  id: string;
  title: string;
  context: string;
  decision: string;
  rationale: string;
  consequences: string[];
  alternatives: string[];
}

/**
 * Design pattern
 */
export interface DesignPattern {
  name: string;
  category: 'creational' | 'structural' | 'behavioral' | 'architectural';
  description: string;
  applicability: string;
}

/**
 * Architect Agent - Designs system architecture
 */
export class ArchitectAgent extends BaseAgent {
  constructor() {
    super('Architect Agent');
  }

  /**
   * Process input to generate architecture design
   */
  async process(input: ArchitectAgentInput): Promise<ArchitectAgentOutput> {
    const startTime = Date.now();
    logger.info(`${this.name}: Starting architecture design`, { feature: input.feature.feature });

    try {
      // Step 1: Design architecture
      const architecture = await this.designArchitecture(input.feature);

      // Step 2: Make technical decisions
      const decisions = await this.makeTechnicalDecisions(input.feature, architecture);

      // Step 3: Identify design patterns
      const patterns = this.identifyPatterns(input.feature, architecture);

      // Step 4: Generate diagrams
      const diagrams = this.generateDiagrams(architecture, input.feature);

      // Step 5: Generate recommendations
      const recommendations = this.generateRecommendations(architecture, input.feature);

      const processingTime = Date.now() - startTime;
      logger.info(`${this.name}: Architecture design complete`, { processingTime });

      return {
        agentName: this.name,
        data: {
          architecture,
          decisions,
          patterns,
          diagrams,
          recommendations,
        },
        metadata: {
          processingTime,
          confidence: 0.8,
        },
      };
    } catch (error) {
      logger.error(`${this.name}: Error during design`, { error });
      throw error;
    }
  }

  /**
   * Design the system architecture
   */
  private async designArchitecture(feature: FeatureInput): Promise<Architecture> {
    const stack = this.selectTechStack(feature);

    return {
      frontend: {
        framework: stack.frontend.framework,
        stateManagement: stack.frontend.stateManagement,
        routing: stack.frontend.routing,
        uiLibrary: stack.frontend.uiLibrary,
      },
      backend: {
        runtime: stack.backend.runtime,
        framework: stack.backend.framework,
        authentication: stack.backend.auth,
        apiStyle: stack.backend.apiStyle,
      },
      database: {
        primary: stack.database.primary,
        cache: stack.database.cache,
        search: stack.database.search,
      },
      infrastructure: {
        hosting: stack.infra.hosting,
        cicd: stack.infra.cicd,
        monitoring: stack.infra.monitoring,
      },
      diagrams: {
        systemDiagram: this.generateSystemDiagram(feature),
        erDiagram: this.generateERDiagram(feature),
        sequenceDiagram: this.generateSequenceDiagram(feature),
      },
    };
  }

  /**
   * Select technology stack based on requirements
   */
  private selectTechStack(feature: FeatureInput): {
    frontend: { framework: string; stateManagement: string; routing: string; uiLibrary: string };
    backend: {
      runtime: string;
      framework: string;
      auth: string;
      apiStyle: 'rest' | 'graphql' | 'trpc';
    };
    database: { primary: string; cache?: string; search?: string };
    infra: { hosting: string; cicd: string; monitoring: string };
  } {
    const isEnterprise = feature.scale === 'enterprise';
    const platform = feature.platform || 'web';

    return {
      frontend: {
        framework: platform === 'web' ? 'Next.js 14' : 'React Native',
        stateManagement: isEnterprise ? 'Zustand + React Query' : 'React Context + SWR',
        routing: 'App Router (Next.js)',
        uiLibrary: isEnterprise ? 'shadcn/ui' : 'Tailwind CSS',
      },
      backend: {
        runtime: 'Node.js 22',
        framework: isEnterprise ? 'NestJS' : 'Express.js',
        auth: 'NextAuth.js + JWT',
        apiStyle: isEnterprise ? 'graphql' : 'rest',
      },
      database: {
        primary: isEnterprise ? 'PostgreSQL' : 'SQLite + Turso',
        cache: isEnterprise ? 'Redis' : undefined,
        search: isEnterprise ? 'OpenSearch' : undefined,
      },
      infra: {
        hosting: isEnterprise ? 'AWS ECS' : 'Vercel',
        cicd: 'GitHub Actions',
        monitoring: isEnterprise ? 'Datadog' : 'Sentry + Vercel Analytics',
      },
    };
  }

  /**
   * Make technical decisions
   */
  private async makeTechnicalDecisions(
    feature: FeatureInput,
    architecture: Architecture,
  ): Promise<TechnicalDecision[]> {
    return [
      {
        id: 'adr-001',
        title: 'Backend Framework Selection',
        context: `Need to select a framework for ${feature.feature}`,
        decision: `Use ${architecture.backend.framework}`,
        rationale: 'Provides good developer experience, TypeScript support, and scalability',
        consequences: ['Team needs framework knowledge', 'Strong typing throughout'],
        alternatives: ['Fastify', 'Koa', 'Hono'],
      },
      {
        id: 'adr-002',
        title: 'Database Selection',
        context: `Need persistent storage for ${feature.feature}`,
        decision: `Use ${architecture.database.primary}`,
        rationale: 'Reliable, well-documented, fits scale requirements',
        consequences: ['Need database migrations', 'Backup strategy required'],
        alternatives: ['MongoDB', 'MySQL', 'DynamoDB'],
      },
      {
        id: 'adr-003',
        title: 'API Design Style',
        context: `Need to define API contract for ${feature.feature}`,
        decision: `Use ${architecture.backend.apiStyle.toUpperCase()} API`,
        rationale: 'Fits client requirements and team expertise',
        consequences: ['Client code generation possible', 'Documentation needed'],
        alternatives:
          architecture.backend.apiStyle === 'rest' ? ['GraphQL', 'tRPC'] : ['REST', 'tRPC'],
      },
    ];
  }

  /**
   * Identify applicable design patterns
   */
  private identifyPatterns(_feature: FeatureInput, _architecture: Architecture): DesignPattern[] {
    return [
      {
        name: 'Repository Pattern',
        category: 'structural',
        description: 'Abstract data access behind a repository interface',
        applicability: 'Data access layer for database operations',
      },
      {
        name: 'Service Layer',
        category: 'architectural',
        description: 'Business logic encapsulated in service classes',
        applicability: 'Core business operations and orchestration',
      },
      {
        name: 'Factory Pattern',
        category: 'creational',
        description: 'Create objects without specifying exact class',
        applicability: 'Agent creation and initialization',
      },
      {
        name: 'Observer Pattern',
        category: 'behavioral',
        description: 'Notify multiple objects about state changes',
        applicability: 'Event-driven communication between agents',
      },
    ];
  }

  /**
   * Generate system diagram
   */
  private generateSystemDiagram(_feature: FeatureInput): string {
    return `
graph TB
    subgraph "Frontend"
        UI[Web UI]
    end
    
    subgraph "Backend"
        API[API Server]
        AUTH[Auth Service]
        AGENTS[Agent Engine]
    end
    
    subgraph "Data"
        DB[(Database)]
        CACHE[(Cache)]
    end
    
    subgraph "External"
        GH[GitHub API]
        AI[AI Provider]
    end
    
    UI --> API
    API --> AUTH
    API --> AGENTS
    API --> DB
    API --> CACHE
    AGENTS --> GH
    AGENTS --> AI
`;
  }

  /**
   * Generate ER diagram
   */
  private generateERDiagram(_feature: FeatureInput): string {
    return `
erDiagram
    PROJECT ||--o{ PLAN : contains
    PLAN ||--o{ EPIC : contains
    EPIC ||--o{ STORY : contains
    STORY ||--o{ TASK : contains
    TASK }o--|| AGENT : assigned_to
    
    PROJECT {
        string id PK
        string name
        string description
        datetime created_at
    }
    
    PLAN {
        string id PK
        string project_id FK
        string status
        json config
    }
    
    EPIC {
        string id PK
        string plan_id FK
        string title
        int effort
    }
`;
  }

  /**
   * Generate sequence diagram
   */
  private generateSequenceDiagram(_feature: FeatureInput): string {
    return `
sequenceDiagram
    participant U as User
    participant O as Orchestrator
    participant PM as PM Agent
    participant A as Architect Agent
    participant C as Coder Agent
    
    U->>O: Submit Feature Request
    O->>PM: Analyze & Plan
    PM-->>O: Project Plan
    O->>A: Design Architecture
    A-->>O: Architecture Design
    O->>C: Generate Code
    C-->>O: Implementation
    O-->>U: Complete Project
`;
  }

  /**
   * Generate diagrams object
   */
  private generateDiagrams(
    architecture: Architecture,
    feature: FeatureInput,
  ): {
    system: string;
    sequence?: string;
    er?: string;
  } {
    return {
      system: this.generateSystemDiagram(feature),
      sequence: this.generateSequenceDiagram(feature),
      er: this.generateERDiagram(feature),
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(architecture: Architecture, feature: FeatureInput): string[] {
    const recommendations: string[] = [];

    recommendations.push(`Use ${architecture.backend.framework} for the backend implementation`);
    recommendations.push(
      `Implement ${architecture.backend.apiStyle.toUpperCase()} API with OpenAPI documentation`,
    );
    recommendations.push('Follow clean architecture principles for maintainability');
    recommendations.push('Implement comprehensive error handling and logging');
    recommendations.push('Set up CI/CD pipeline with GitHub Actions');

    if (feature.scale === 'enterprise') {
      recommendations.push('Implement horizontal scaling with container orchestration');
      recommendations.push('Add rate limiting and request throttling');
      recommendations.push('Set up multi-region deployment for high availability');
    }

    return recommendations;
  }
}
