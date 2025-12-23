/**
 * Agent Pool Manager
 * Issue #202: Agent Pool Manager
 *
 * Manage a pool of agents for parallel execution
 */

import logger from '../utils/logger';

export interface AgentInstance {
  id: string;
  name: string;
  status: 'idle' | 'busy' | 'error' | 'shutting_down';
  currentTask?: string;
  startedAt: Date;
  lastActivityAt: Date;
  completedTasks: number;
  errorCount: number;
  resourceUsage: {
    memory: number; // MB
    cpu: number; // percentage
  };
}

export interface PoolConfig {
  minAgents: number;
  maxAgents: number;
  scaleUpThreshold: number; // queue length that triggers scale up
  scaleDownThreshold: number; // idle time before scale down (ms)
  healthCheckInterval: number; // ms
  taskTimeout: number; // ms
}

export interface TaskQueueItem {
  id: string;
  name: string;
  priority: 'high' | 'normal' | 'low';
  payload: Record<string, unknown>;
  createdAt: Date;
  assignedAgent?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface PoolStats {
  totalAgents: number;
  busyAgents: number;
  idleAgents: number;
  queueLength: number;
  completedTasks: number;
  failedTasks: number;
  averageTaskTime: number;
}

/**
 * Agent Pool Manager
 * Provides dynamic scaling and task distribution
 */
export class AgentPoolManager {
  private agents: Map<string, AgentInstance> = new Map();
  private taskQueue: TaskQueueItem[] = [];
  private completedTasks: TaskQueueItem[] = [];
  private config: PoolConfig = {
    minAgents: 1,
    maxAgents: 10,
    scaleUpThreshold: 5,
    scaleDownThreshold: 60000,
    healthCheckInterval: 5000,
    taskTimeout: 300000,
  };
  private agentCounter = 0;
  private taskCounter = 0;

  constructor() {
    logger.info('AgentPoolManager initialized');
  }

  /**
   * Configure the pool
   */
  configure(config: Partial<PoolConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Pool configured', this.config);
  }

  /**
   * Start the pool with minimum agents
   */
  start(): void {
    for (let i = 0; i < this.config.minAgents; i++) {
      this.spawnAgent();
    }
    logger.info('Agent pool started', { agents: this.agents.size });
  }

  /**
   * Spawn a new agent
   */
  spawnAgent(): AgentInstance | null {
    if (this.agents.size >= this.config.maxAgents) {
      logger.warn('Max agents reached', { max: this.config.maxAgents });
      return null;
    }

    const agent: AgentInstance = {
      id: `agent_${++this.agentCounter}`,
      name: `Agent-${this.agentCounter}`,
      status: 'idle',
      startedAt: new Date(),
      lastActivityAt: new Date(),
      completedTasks: 0,
      errorCount: 0,
      resourceUsage: { memory: 50, cpu: 0 },
    };

    this.agents.set(agent.id, agent);
    logger.info('Agent spawned', { id: agent.id, name: agent.name });

    // Check if there are pending tasks
    this.assignPendingTasks();

    return agent;
  }

  /**
   * Submit a task to the pool
   */
  submitTask(
    name: string,
    payload: Record<string, unknown>,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): TaskQueueItem {
    const task: TaskQueueItem = {
      id: `task_${++this.taskCounter}`,
      name,
      priority,
      payload,
      createdAt: new Date(),
      status: 'pending',
    };

    // Insert based on priority
    if (priority === 'high') {
      const insertIndex = this.taskQueue.findIndex(t => t.priority !== 'high');
      if (insertIndex === -1) {
        this.taskQueue.push(task);
      } else {
        this.taskQueue.splice(insertIndex, 0, task);
      }
    } else {
      this.taskQueue.push(task);
    }

    logger.info('Task submitted', { id: task.id, name, priority });

    // Check if we need to scale up
    this.checkScaling();
    this.assignPendingTasks();

    return task;
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId: string): TaskQueueItem | undefined {
    return this.taskQueue.find(t => t.id === taskId) ||
           this.completedTasks.find(t => t.id === taskId);
  }

  /**
   * Complete a task
   */
  completeTask(taskId: string, success: boolean = true): boolean {
    const taskIndex = this.taskQueue.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return false;

    const task = this.taskQueue[taskIndex];
    task.status = success ? 'completed' : 'failed';
    
    // Update agent stats
    if (task.assignedAgent) {
      const agent = this.agents.get(task.assignedAgent);
      if (agent) {
        agent.status = 'idle';
        agent.currentTask = undefined;
        agent.lastActivityAt = new Date();
        if (success) {
          agent.completedTasks++;
        } else {
          agent.errorCount++;
        }
      }
    }

    this.taskQueue.splice(taskIndex, 1);
    this.completedTasks.push(task);

    logger.info('Task completed', { id: taskId, success });
    this.assignPendingTasks();

    return true;
  }

  /**
   * Get pool statistics
   */
  getStats(): PoolStats {
    const agents = Array.from(this.agents.values());
    const busyAgents = agents.filter(a => a.status === 'busy').length;
    const completedCount = this.completedTasks.filter(t => t.status === 'completed').length;
    const failedCount = this.completedTasks.filter(t => t.status === 'failed').length;

    return {
      totalAgents: agents.length,
      busyAgents,
      idleAgents: agents.filter(a => a.status === 'idle').length,
      queueLength: this.taskQueue.filter(t => t.status === 'pending').length,
      completedTasks: completedCount,
      failedTasks: failedCount,
      averageTaskTime: 5000, // Simplified
    };
  }

  /**
   * Get all agents
   */
  getAgents(): AgentInstance[] {
    return Array.from(this.agents.values());
  }

  /**
   * Gracefully shutdown an agent
   */
  shutdownAgent(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    if (agent.status === 'busy') {
      agent.status = 'shutting_down';
      logger.info('Agent marked for shutdown', { id: agentId });
      return true;
    }

    this.agents.delete(agentId);
    logger.info('Agent shutdown', { id: agentId });
    return true;
  }

  /**
   * Shutdown the pool
   */
  shutdown(): void {
    for (const agent of this.agents.values()) {
      if (agent.status === 'idle') {
        this.agents.delete(agent.id);
      } else {
        agent.status = 'shutting_down';
      }
    }
    logger.info('Pool shutdown initiated');
  }

  // Private helpers

  private assignPendingTasks(): void {
    const pendingTasks = this.taskQueue.filter(t => t.status === 'pending');
    const idleAgents = Array.from(this.agents.values()).filter(a => a.status === 'idle');

    for (const task of pendingTasks) {
      if (idleAgents.length === 0) break;

      const agent = idleAgents.shift()!;
      task.assignedAgent = agent.id;
      task.status = 'running';
      agent.status = 'busy';
      agent.currentTask = task.id;
      agent.lastActivityAt = new Date();

      logger.debug('Task assigned', { taskId: task.id, agentId: agent.id });
    }
  }

  private checkScaling(): void {
    const pendingCount = this.taskQueue.filter(t => t.status === 'pending').length;
    
    if (pendingCount >= this.config.scaleUpThreshold && 
        this.agents.size < this.config.maxAgents) {
      this.spawnAgent();
    }
  }

  /**
   * Reset the pool
   */
  reset(): void {
    this.agents.clear();
    this.taskQueue = [];
    this.completedTasks = [];
    this.agentCounter = 0;
    this.taskCounter = 0;
    logger.info('AgentPoolManager reset');
  }
}

export const agentPoolManager = new AgentPoolManager();
