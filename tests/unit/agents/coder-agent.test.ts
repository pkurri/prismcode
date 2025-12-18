/**
 * Coder Agent Unit Tests
 * Verifies acceptance criteria for Issues #28, #29, #30
 */

import { CoderAgent, CoderAgentInput } from '../../../src/agents/coder-agent';
import { Task } from '../../../src/types';

describe('CoderAgent', () => {
  let agent: CoderAgent;

  beforeEach(() => {
    agent = new CoderAgent();
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
      expect(agent.getName()).toBe('Coder Agent');
    });
  });

  describe('process()', () => {
    it('should accept code generation request', async () => {
      const input: CoderAgentInput = {
        task: createTask({ title: 'Create user service', type: 'backend' }),
      };

      const result = await agent.process(input);

      expect(result).toBeDefined();
      expect(result.agentName).toBe('Coder Agent');
    });

    it('should generate frontend code (Issue #28)', async () => {
      const input: CoderAgentInput = {
        task: createTask({ title: 'Create login form component', type: 'frontend' }),
      };

      const result = await agent.process(input);

      expect(result.data).toBeDefined();
      expect(result.data.files).toBeDefined();
      expect(Array.isArray(result.data.files)).toBe(true);
    });

    it('should generate backend code (Issue #29)', async () => {
      const input: CoderAgentInput = {
        task: createTask({ title: 'Create REST API endpoint', type: 'backend' }),
      };

      const result = await agent.process(input);

      expect(result.data).toBeDefined();
      expect(result.data.files).toBeDefined();
    });

    it('should generate database code (Issue #30)', async () => {
      const input: CoderAgentInput = {
        task: createTask({ title: 'Create user schema', type: 'database' }),
      };

      const result = await agent.process(input);

      expect(result.data).toBeDefined();
      expect(result.data.files).toBeDefined();
    });

    it('should include TypeScript files', async () => {
      const input: CoderAgentInput = {
        task: createTask({ title: 'Create API types', type: 'backend' }),
      };

      const result = await agent.process(input);

      expect(result.data.files).toBeDefined();
      const hasTypes = result.data.files.some((f) => f.path.endsWith('.ts'));
      expect(hasTypes).toBe(true);
    });

    it('should include tests in output', async () => {
      const input: CoderAgentInput = {
        task: createTask({ title: 'Create service', type: 'backend' }),
      };

      const result = await agent.process(input);

      expect(result.data.tests).toBeDefined();
      expect(Array.isArray(result.data.tests)).toBe(true);
    });
  });
});
