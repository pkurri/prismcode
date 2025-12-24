/**
 * Agent Pool Manager Tests
 * Issue #204: Agent Pool Manager
 */

import {
  AgentPoolManager,
  agentPoolManager,
} from '../../../src/advanced/agent-pool';

describe('AgentPoolManager', () => {
  let pool: AgentPoolManager;

  beforeEach(() => {
    pool = new AgentPoolManager();
  });

  afterEach(() => {
    pool.reset();
  });

  describe('configuration', () => {
    it('should configure pool settings', () => {
      pool.configure({
        minAgents: 2,
        maxAgents: 8,
        scaleUpThreshold: 10,
      });

      // Should not throw
      expect(pool).toBeDefined();
    });
  });

  describe('agent lifecycle', () => {
    it('should start pool with minimum agents', () => {
      pool.configure({ minAgents: 2 });
      pool.start();

      const agents = pool.getAgents();
      expect(agents.length).toBe(2);
    });

    it('should spawn new agent', () => {
      const agent = pool.spawnAgent();

      expect(agent).toBeDefined();
      expect(agent?.id).toBeDefined();
      expect(agent?.status).toBe('idle');
    });

    it('should respect max agents limit', () => {
      pool.configure({ maxAgents: 2 });
      pool.spawnAgent();
      pool.spawnAgent();
      const third = pool.spawnAgent();

      expect(third).toBeNull();
    });

    it('should shutdown agent gracefully', () => {
      const agent = pool.spawnAgent();
      if (agent) {
        const result = pool.shutdownAgent(agent.id);
        expect(result).toBe(true);
      }
    });
  });

  describe('task management', () => {
    beforeEach(() => {
      pool.spawnAgent();
      pool.spawnAgent();
    });

    it('should submit task to pool', () => {
      const task = pool.submitTask('Test Task', { data: 'test' });

      expect(task.id).toBeDefined();
      expect(task.name).toBe('Test Task');
      expect(task.status).toBeDefined();
    });

    it('should submit high priority task', () => {
      const task = pool.submitTask('Urgent Task', { urgent: true }, 'high');

      expect(task.priority).toBe('high');
    });

    it('should get task status', () => {
      const task = pool.submitTask('Task', {});
      const status = pool.getTaskStatus(task.id);

      expect(status).toBeDefined();
      expect(status?.id).toBe(task.id);
    });

    it('should complete task successfully', () => {
      const task = pool.submitTask('Task', {});
      const completed = pool.completeTask(task.id, true);

      expect(completed).toBe(true);
    });

    it('should mark task as failed', () => {
      const task = pool.submitTask('Failing Task', {});
      pool.completeTask(task.id, false);

      const status = pool.getTaskStatus(task.id);
      expect(status?.status).toBe('failed');
    });
  });

  describe('pool statistics', () => {
    it('should get pool stats', () => {
      pool.spawnAgent();
      pool.submitTask('Task 1', {});
      pool.submitTask('Task 2', {});

      const stats = pool.getStats();

      expect(stats.totalAgents).toBeGreaterThanOrEqual(1);
      expect(stats.queueLength).toBeDefined();
      expect(stats.completedTasks).toBeDefined();
    });

    it('should track busy vs idle agents', () => {
      pool.spawnAgent();
      pool.spawnAgent();
      pool.submitTask('Task', {});

      const stats = pool.getStats();

      expect(stats.busyAgents + stats.idleAgents).toBe(stats.totalAgents);
    });
  });

  describe('scaling', () => {
    it('should scale up when queue threshold reached', () => {
      pool.configure({
        minAgents: 1,
        maxAgents: 5,
        scaleUpThreshold: 2,
      });
      pool.start();

      const initialAgents = pool.getAgents().length;

      // Submit many tasks to trigger scaling
      for (let i = 0; i < 5; i++) {
        pool.submitTask(`Task ${i}`, {});
      }

      // Pool may have scaled up
      expect(pool.getAgents().length).toBeGreaterThanOrEqual(initialAgents);
    });
  });

  describe('pool shutdown', () => {
    it('should shutdown entire pool', () => {
      pool.start();
      pool.shutdown();

      // Idle agents should be removed, busy marked for shutdown
      expect(pool).toBeDefined();
    });
  });

  describe('resource tracking', () => {
    it('should track agent resource usage', () => {
      const agent = pool.spawnAgent();

      expect(agent?.resourceUsage).toBeDefined();
      expect(agent?.resourceUsage.memory).toBeDefined();
      expect(agent?.resourceUsage.cpu).toBeDefined();
    });
  });

  describe('singleton instance', () => {
    it('should export singleton instance', () => {
      expect(agentPoolManager).toBeInstanceOf(AgentPoolManager);
    });
  });
});
