/**
 * Agent Pool Manager Tests
 * Issue #204
 */

import { AgentPool } from '../../../src/advanced/agent-pool';

describe('AgentPool', () => {
  let pool: AgentPool;

  beforeEach(() => {
    // Use very long health check interval to avoid timer issues in tests
    pool = new AgentPool({
      minAgents: 1,
      maxAgents: 5,
      healthCheckIntervalMs: 999999999, // Effectively disabled for tests
      gracefulShutdownTimeoutMs: 100, // Fast shutdown for tests
    });
  });

  afterEach(async () => {
    await pool.shutdown();
  }, 10000);

  describe('initialization', () => {
    it('should create pool with default config', () => {
      const defaultPool = new AgentPool();
      expect(defaultPool).toBeDefined();
    });

    it('should validate minAgents >= 1', () => {
      expect(() => new AgentPool({ minAgents: 0 })).toThrow('minAgents must be at least 1');
    });

    it('should validate maxAgents >= minAgents', () => {
      expect(() => new AgentPool({ minAgents: 5, maxAgents: 3 })).toThrow(
        'maxAgents must be >= minAgents'
      );
    });

    it('should validate maxAgents <= 10', () => {
      expect(() => new AgentPool({ maxAgents: 15 })).toThrow('maxAgents cannot exceed 10');
    });

    it('should initialize with minimum agents', () => {
      pool.initialize();
      const stats = pool.getStats();
      expect(stats.totalAgents).toBeGreaterThanOrEqual(1);
    });
  });

  describe('agent management', () => {
    beforeEach(() => {
      pool.initialize();
    });

    it('should add agents up to max limit', () => {
      for (let i = 0; i < 4; i++) {
        pool.addAgent();
      }
      const stats = pool.getStats();
      expect(stats.totalAgents).toBe(5);
    });

    it('should reject adding agents beyond max', () => {
      for (let i = 0; i < 4; i++) {
        pool.addAgent();
      }
      expect(() => pool.addAgent()).toThrow('Maximum agent limit reached');
    });

    it('should remove agents', async () => {
      const agentId = pool.addAgent();
      const removed = await pool.removeAgent(agentId, true);
      expect(removed).toBe(true);
    });

    it('should not remove below minimum agents unless forced', async () => {
      const agents = pool.getAllAgentStates();
      const removed = await pool.removeAgent(agents[0].id, false);
      expect(removed).toBe(false);
    });
  });

  describe('task assignment', () => {
    beforeEach(() => {
      pool.initialize();
    });

    it('should assign task to idle agent', () => {
      const agentId = pool.assignTask({
        taskId: 'task-1',
        priority: 1,
      });
      expect(agentId).toBeTruthy();

      const agent = pool.getAgentState(agentId!);
      expect(agent?.status).toBe('busy');
      expect(agent?.currentTask).toBe('task-1');
    });

    it('should complete task and free agent', () => {
      const agentId = pool.assignTask({
        taskId: 'task-1',
        priority: 1,
      });

      pool.completeTask(agentId!, true);

      const agent = pool.getAgentState(agentId!);
      expect(agent?.status).toBe('idle');
      expect(agent?.currentTask).toBeUndefined();
      expect(agent?.completedTasks).toBe(1);
    });

    it('should decrease health on task failure', () => {
      const agentId = pool.assignTask({
        taskId: 'task-1',
        priority: 1,
      });

      const initialHealth = pool.getAgentState(agentId!)?.health;
      pool.completeTask(agentId!, false);

      const agent = pool.getAgentState(agentId!);
      expect(agent?.health).toBeLessThan(initialHealth!);
      expect(agent?.errorCount).toBe(1);
    });
  });

  describe('health monitoring', () => {
    beforeEach(() => {
      pool.initialize();
    });

    it('should record heartbeat', () => {
      const agents = pool.getAllAgentStates();
      const agentId = agents[0].id;
      const before = pool.getAgentState(agentId)?.lastHeartbeat;

      pool.recordHeartbeat(agentId);

      const after = pool.getAgentState(agentId)?.lastHeartbeat;
      expect(after!.getTime()).toBeGreaterThanOrEqual(before!.getTime());
    });
  });

  describe('statistics', () => {
    beforeEach(() => {
      pool.initialize();
    });

    it('should return accurate stats', () => {
      pool.addAgent();
      pool.assignTask({ taskId: 'task-1', priority: 1 });

      const stats = pool.getStats();
      expect(stats.totalAgents).toBe(2);
      expect(stats.busyAgents).toBe(1);
      expect(stats.idleAgents).toBe(1);
      // uptime can be 0 if test runs in sub-millisecond time
      expect(stats.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('shutdown', () => {
    beforeEach(() => {
      pool.initialize();
    });

    it('should gracefully shutdown', async () => {
      pool.addAgent();
      await pool.shutdown();

      const stats = pool.getStats();
      expect(stats.totalAgents).toBe(0);
    });
  });
});
