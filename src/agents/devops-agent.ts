/**
 * DevOps Agent - CI/CD and Infrastructure Agent
 *
 * Handles:
 * - CI/CD pipeline generation
 * - Infrastructure as Code
 * - Deployment strategies
 * - Monitoring configuration
 * - Container orchestration
 */

import { BaseAgent } from './base-agent';
import { AgentOutput, Architecture } from '../types';
import logger from '../utils/logger';

/**
 * DevOps Agent input
 */
export interface DevOpsAgentInput {
  architecture: Architecture;
  requirements?: string[];
  constraints?: string[];
  context?: Record<string, unknown>;
}

/**
 * CI/CD Pipeline
 */
export interface Pipeline {
  name: string;
  trigger: string[];
  stages: PipelineStage[];
}

/**
 * Pipeline stage
 */
export interface PipelineStage {
  name: string;
  jobs: string[];
  dependsOn?: string;
  condition?: string;
}

/**
 * Infrastructure config
 */
export interface InfraConfig {
  provider: 'aws' | 'gcp' | 'azure' | 'vercel' | 'docker';
  resources: InfraResource[];
  networking: Record<string, unknown>;
  security: Record<string, unknown>;
}

/**
 * Infrastructure resource
 */
export interface InfraResource {
  name: string;
  type: string;
  config: Record<string, unknown>;
}

/**
 * DevOps Agent output
 */
export interface DevOpsAgentOutput extends AgentOutput {
  data: {
    pipeline: Pipeline;
    infrastructure: InfraConfig;
    dockerConfig: string;
    kubernetesManifests?: string;
    monitoringConfig: string;
  };
}

/**
 * DevOps Agent - Generates CI/CD and infrastructure configs
 */
export class DevOpsAgent extends BaseAgent {
  constructor() {
    super('DevOps Agent');
  }

  /**
   * Process architecture to generate DevOps artifacts
   */
  async process(input: DevOpsAgentInput): Promise<DevOpsAgentOutput> {
    const startTime = Date.now();
    logger.info(`${this.name}: Starting DevOps configuration`);

    try {
      // Step 1: Generate CI/CD pipeline
      const pipeline = this.generatePipeline(input.architecture);

      // Step 2: Generate infrastructure config
      const infrastructure = this.generateInfrastructure(input.architecture);

      // Step 3: Generate Docker config
      const dockerConfig = this.generateDockerConfig(input.architecture);

      // Step 4: Generate monitoring config
      const monitoringConfig = this.generateMonitoringConfig(input.architecture);

      // Step 5: Generate Kubernetes manifests if needed
      const kubernetesManifests =
        input.architecture.infrastructure.hosting.includes('kubernetes') ||
        input.architecture.infrastructure.hosting.includes('ECS')
          ? this.generateKubernetesManifests(input.architecture)
          : undefined;

      const processingTime = Date.now() - startTime;
      logger.info(`${this.name}: DevOps configuration complete`, { processingTime });

      return {
        agentName: this.name,
        data: {
          pipeline,
          infrastructure,
          dockerConfig,
          kubernetesManifests,
          monitoringConfig,
        },
        metadata: {
          processingTime,
          confidence: 0.85,
        },
      };
    } catch (error) {
      logger.error(`${this.name}: Error during configuration`, { error });
      throw error;
    }
  }

  /**
   * Generate CI/CD pipeline
   */
  private generatePipeline(_architecture: Architecture): Pipeline {
    return {
      name: 'CI/CD Pipeline',
      trigger: ['push:main', 'pull_request:main'],
      stages: [
        {
          name: 'Build',
          jobs: ['checkout', 'install', 'lint', 'typecheck', 'build'],
        },
        {
          name: 'Test',
          jobs: ['unit-tests', 'integration-tests'],
          dependsOn: 'Build',
        },
        {
          name: 'Security',
          jobs: ['dependency-audit', 'sast-scan'],
          dependsOn: 'Build',
        },
        {
          name: 'Deploy-Staging',
          jobs: ['docker-build', 'push-registry', 'deploy-staging'],
          dependsOn: 'Test',
          condition: 'branch == main',
        },
        {
          name: 'E2E-Tests',
          jobs: ['playwright-tests'],
          dependsOn: 'Deploy-Staging',
        },
        {
          name: 'Deploy-Production',
          jobs: ['deploy-production', 'health-check'],
          dependsOn: 'E2E-Tests',
          condition: 'manual_approval',
        },
      ],
    };
  }

  /**
   * Generate infrastructure configuration
   */
  private generateInfrastructure(architecture: Architecture): InfraConfig {
    const provider = this.determineProvider(architecture);

    return {
      provider,
      resources: this.generateResources(architecture, provider),
      networking: {
        vpc: true,
        subnets: ['public', 'private'],
        loadBalancer: true,
        cdn: architecture.infrastructure.hosting !== 'local',
      },
      security: {
        waf: true,
        ddosProtection: true,
        encryption: {
          atRest: true,
          inTransit: true,
        },
        secrets: 'vault',
      },
    };
  }

  /**
   * Determine cloud provider
   */
  private determineProvider(architecture: Architecture): InfraConfig['provider'] {
    const hosting = architecture.infrastructure.hosting.toLowerCase();

    if (hosting.includes('aws') || hosting.includes('ecs')) return 'aws';
    if (hosting.includes('gcp')) return 'gcp';
    if (hosting.includes('azure')) return 'azure';
    if (hosting.includes('vercel')) return 'vercel';
    return 'docker';
  }

  /**
   * Generate infrastructure resources
   */
  private generateResources(
    architecture: Architecture,
    provider: InfraConfig['provider'],
  ): InfraResource[] {
    const resources: InfraResource[] = [];

    // Compute
    resources.push({
      name: 'app-service',
      type: provider === 'aws' ? 'ecs-service' : 'container',
      config: {
        cpu: '512',
        memory: '1024',
        replicas: 2,
        autoscaling: {
          min: 2,
          max: 10,
          targetCpu: 70,
        },
      },
    });

    // Database
    if (architecture.database.primary) {
      resources.push({
        name: 'database',
        type: provider === 'aws' ? 'rds' : 'postgres',
        config: {
          engine: architecture.database.primary.toLowerCase(),
          instanceClass: 'db.t3.medium',
          storage: 100,
          backups: true,
        },
      });
    }

    // Cache
    if (architecture.database.cache) {
      resources.push({
        name: 'cache',
        type: provider === 'aws' ? 'elasticache' : 'redis',
        config: {
          engine: 'redis',
          nodeType: 'cache.t3.small',
          replicas: 1,
        },
      });
    }

    return resources;
  }

  /**
   * Generate Docker configuration
   */
  private generateDockerConfig(architecture: Architecture): string {
    return `# Docker Compose for ${architecture.backend.framework}

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      - REDIS_URL=\${REDIS_URL}
    depends_on:
      - db
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: prismcode
      POSTGRES_USER: prismcode
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
`;
  }

  /**
   * Generate Kubernetes manifests
   */
  private generateKubernetesManifests(_architecture: Architecture): string {
    return `# Kubernetes Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prismcode-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: prismcode
  template:
    metadata:
      labels:
        app: prismcode
    spec:
      containers:
      - name: app
        image: prismcode:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /healthz
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
        readinessProbe:
          httpGet:
            path: /readyz
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: prismcode-service
spec:
  selector:
    app: prismcode
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
`;
  }

  /**
   * Generate monitoring configuration
   */
  private generateMonitoringConfig(_architecture: Architecture): string {
    const monitoring = _architecture.infrastructure.monitoring;

    return `# Monitoring Configuration

## Metrics
- Application metrics: ${monitoring}
- Infrastructure metrics: CloudWatch/Prometheus
- Custom metrics enabled

## Alerts
- CPU > 80%: Warning
- Memory > 85%: Warning
- Error rate > 1%: Critical
- Response time > 2s: Warning
- Response time > 5s: Critical

## Dashboards
- System Overview
- API Performance
- Error Tracking
- Resource Usage

## Logging
- Structured JSON logging
- Log retention: 30 days
- Log aggregation: ${monitoring.includes('Datadog') ? 'Datadog' : 'CloudWatch'}

## Tracing
- Distributed tracing enabled
- Sample rate: 10%
- Trace retention: 7 days
`;
  }
}
