/**
 * PM Agent Unit Tests
 * Verifies acceptance criteria for Issue #8
 */

import { PMAgent, PMAgentInput } from '../../../src/agents/pm-agent';

describe('PMAgent', () => {
  let agent: PMAgent;

  beforeEach(() => {
    agent = new PMAgent();
  });

  describe('constructor', () => {
    it('should create agent with correct name', () => {
      expect(agent.getName()).toBe('PM Agent');
    });
  });

  describe('process()', () => {
    it('should accept feature description input', async () => {
      const input: PMAgentInput = {
        feature: {
          feature: 'User authentication system with login, logout, and password reset',
        },
      };

      const result = await agent.process(input);

      expect(result).toBeDefined();
      expect(result.agentName).toBe('PM Agent');
    });

    it('should generate epic/story/task hierarchy', async () => {
      const input: PMAgentInput = {
        feature: {
          feature: 'E-commerce shopping cart with add, remove, and checkout functionality',
        },
      };

      const result = await agent.process(input);

      expect(result.data).toBeDefined();
      expect(result.data.epics).toBeDefined();
      expect(result.data.stories).toBeDefined();
      expect(result.data.tasks).toBeDefined();
    });

    it('should generate acceptance criteria in stories', async () => {
      const input: PMAgentInput = {
        feature: {
          feature: 'User profile management with view and edit capabilities',
        },
      };

      const result = await agent.process(input);

      expect(result.data.stories).toBeDefined();
      expect(Array.isArray(result.data.stories)).toBe(true);
      if (result.data.stories.length > 0) {
        expect(result.data.stories[0].acceptanceCriteria).toBeDefined();
      }
    });

    it('should estimate story points', async () => {
      const input: PMAgentInput = {
        feature: {
          feature: 'Dashboard with chart and stats widgets',
        },
      };

      const result = await agent.process(input);

      expect(result.data.stories).toBeDefined();
      if (result.data.stories.length > 0) {
        expect(typeof result.data.stories[0].storyPoints).toBe('number');
      }
    });

    it('should generate timeline', async () => {
      const input: PMAgentInput = {
        feature: {
          feature: 'API integration with REST endpoints',
        },
      };

      const result = await agent.process(input);

      expect(result.data.timeline).toBeDefined();
      expect(typeof result.data.timeline).toBe('string');
    });

    it('should calculate total effort', async () => {
      const input: PMAgentInput = {
        feature: {
          feature: 'Full text search feature',
        },
      };

      const result = await agent.process(input);

      expect(result.data.totalEffort).toBeDefined();
      expect(typeof result.data.totalEffort).toBe('number');
    });
  });
});
