/**
 * QA Agent Unit Tests
 * Verifies acceptance criteria for Issue #31
 */

import { QAAgent, QAAgentInput } from '../../../src/agents/qa-agent';
import { Task } from '../../../src/types';

describe('QAAgent', () => {
  let agent: QAAgent;

  beforeEach(() => {
    agent = new QAAgent();
  });

  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'task-1',
    storyId: 'story-1',
    title: 'Test Task',
    description: 'Test description',
    type: 'backend',
    complexity: 'medium',
    checklist: ['Step 1', 'Step 2'],
    estimatedHours: 4,
    ...overrides,
  });

  describe('constructor', () => {
    it('should create agent with correct name', () => {
      expect(agent.getName()).toBe('QA Agent');
    });
  });

  describe('process()', () => {
    it('should accept test generation request', async () => {
      const input: QAAgentInput = {
        task: createTask({ title: 'UserService' }),
      };

      const result = await agent.process(input);

      expect(result).toBeDefined();
      expect(result.agentName).toBe('QA Agent');
    });

    it('should generate test cases', async () => {
      const input: QAAgentInput = {
        task: createTask({ title: 'Calculator' }),
      };

      const result = await agent.process(input);

      expect(result.data).toBeDefined();
      expect(result.data.testCases).toBeDefined();
      expect(Array.isArray(result.data.testCases)).toBe(true);
      expect(result.data.testCases.length).toBeGreaterThan(0);
    });

    it('should define test strategy', async () => {
      const input: QAAgentInput = {
        task: createTask({ title: 'AuthModule' }),
      };

      const result = await agent.process(input);

      expect(result.data.strategy).toBeDefined();
      expect(result.data.strategy.coverage).toBeDefined();
    });

    it('should generate test code', async () => {
      const input: QAAgentInput = {
        task: createTask({ title: 'LoginForm' }),
      };

      const result = await agent.process(input);

      expect(result.data.testCode).toBeDefined();
      expect(typeof result.data.testCode).toBe('string');
    });

    it('should calculate metrics', async () => {
      const input: QAAgentInput = {
        task: createTask({ title: 'DataProcessor' }),
      };

      const result = await agent.process(input);

      expect(result.data.metrics).toBeDefined();
      expect(typeof result.data.metrics.totalTests).toBe('number');
    });
  });
});
