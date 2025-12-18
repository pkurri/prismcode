/**
 * Architect Agent Unit Tests  
 * Verifies acceptance criteria for Issue #27
 */

import { ArchitectAgent, ArchitectAgentInput } from '../../../src/agents/architect-agent';

describe('ArchitectAgent', () => {
  let agent: ArchitectAgent;

  beforeEach(() => {
    agent = new ArchitectAgent();
  });

  describe('constructor', () => {
    it('should create agent with correct name', () => {
      expect(agent.getName()).toBe('Architect Agent');
    });
  });

  describe('process()', () => {
    it('should accept architecture requirements', async () => {
      const input: ArchitectAgentInput = {
        feature: {
          feature: 'Real-time chat application with WebSocket support and message persistence',
        },
      };

      const result = await agent.process(input);

      expect(result).toBeDefined();
      expect(result.agentName).toBe('Architect Agent');
    });

    it('should generate system architecture', async () => {
      const input: ArchitectAgentInput = {
        feature: {
          feature: 'API gateway with rate limiting and authentication',
        },
      };

      const result = await agent.process(input);

      expect(result.data).toBeDefined();
      expect(result.data.architecture).toBeDefined();
    });

    it('should generate diagrams', async () => {
      const input: ArchitectAgentInput = {
        feature: {
          feature: 'E-commerce platform with product catalog and order management',
        },
      };

      const result = await agent.process(input);

      expect(result.data.diagrams).toBeDefined();
      expect(result.data.diagrams.system).toBeDefined();
    });

    it('should identify design patterns', async () => {
      const input: ArchitectAgentInput = {
        feature: {
          feature: 'Event-driven system with pub/sub and event sourcing',
        },
      };

      const result = await agent.process(input);

      expect(result.data.patterns).toBeDefined();
      expect(Array.isArray(result.data.patterns)).toBe(true);
    });

    it('should provide technical decisions', async () => {
      const input: ArchitectAgentInput = {
        feature: {
          feature: 'Blog platform with CMS and SEO optimization',
        },
      };

      const result = await agent.process(input);

      expect(result.data.decisions).toBeDefined();
      expect(Array.isArray(result.data.decisions)).toBe(true);
    });
  });
});
