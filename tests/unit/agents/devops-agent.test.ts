/**
 * DevOps Agent Unit Tests
 * Verifies acceptance criteria for Issue #32
 */

import { DevOpsAgent, DevOpsAgentInput } from '../../../src/agents/devops-agent';
import { Architecture } from '../../../src/types';

describe('DevOpsAgent', () => {
  let agent: DevOpsAgent;

  beforeEach(() => {
    agent = new DevOpsAgent();
  });

  // Must match the Architecture type from types/index.ts
  const createArchitecture = (): Architecture => ({
    frontend: {
      framework: 'React',
      stateManagement: 'Redux',
      routing: 'React Router',
      uiLibrary: 'Material UI',
    },
    backend: {
      runtime: 'Node.js',
      framework: 'Express',
      authentication: 'JWT',
      apiStyle: 'rest',
    },
    database: {
      primary: 'PostgreSQL',
      cache: 'Redis',
    },
    infrastructure: {
      hosting: 'AWS',
      cicd: 'GitHub Actions',
      monitoring: 'DataDog',
    },
    diagrams: {
      systemDiagram: '```mermaid\ngraph TD\n  A-->B\n```',
    },
  });

  describe('constructor', () => {
    it('should create agent with correct name', () => {
      expect(agent.getName()).toBe('DevOps Agent');
    });
  });

  describe('process()', () => {
    it('should accept infrastructure request', async () => {
      const input: DevOpsAgentInput = {
        architecture: createArchitecture(),
      };

      const result = await agent.process(input);

      expect(result).toBeDefined();
      expect(result.agentName).toBe('DevOps Agent');
    });

    it('should generate CI/CD pipeline', async () => {
      const input: DevOpsAgentInput = {
        architecture: createArchitecture(),
      };

      const result = await agent.process(input);

      expect(result.data).toBeDefined();
      expect(result.data.pipeline).toBeDefined();
      expect(result.data.pipeline.name).toBeDefined();
    });

    it('should generate Docker configuration', async () => {
      const input: DevOpsAgentInput = {
        architecture: createArchitecture(),
      };

      const result = await agent.process(input);

      expect(result.data.dockerConfig).toBeDefined();
      expect(typeof result.data.dockerConfig).toBe('string');
    });

    it('should generate monitoring configuration', async () => {
      const input: DevOpsAgentInput = {
        architecture: createArchitecture(),
      };

      const result = await agent.process(input);

      expect(result.data.monitoringConfig).toBeDefined();
    });

    it('should generate infrastructure config', async () => {
      const input: DevOpsAgentInput = {
        architecture: createArchitecture(),
      };

      const result = await agent.process(input);

      expect(result.data.infrastructure).toBeDefined();
    });
  });
});
