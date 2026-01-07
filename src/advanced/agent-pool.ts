/**
 * Agent Pool Manager
 * Issue #204 - Dynamic agent pool management for parallel execution
 */

/**
 * Agent status enumeration
 */
export type AgentStatus = 'idle' | 'busy' | 'error' | 'shutdown';

/**
 * Individual agent state tracking
 */
export interface AgentState {
  id: string;
  status: AgentStatus;
  health: number; // 0-100 health score
  currentTask?: string;
  taskStartedAt?: Date;
  lastHeartbeat: Date;
  errorCount: number;
  completedTasks: number;
}

/**
 * Pool configuration options
 */
export interface PoolConfig {
  minAgents: number;
  maxAgents: number;
  healthCheckIntervalMs: number;
  heartbeatTimeoutMs: number;
  scaleUpThreshold: number; // Busy percentage to trigger scale up
  scaleDownThreshold: number; // Idle percentage to trigger scale down
  gracefulShutdownTimeoutMs: number;
}

/**
 * Pool statistics
 */
export interface PoolStats {
  totalAgents: number;
  idleAgents: number;
  busyAgents: number;
  errorAgents: number;
  averageHealth: number;
  totalTasksCompleted: number;
  uptime: number;
}

/**
 * Task assignment request
 */
export interface TaskAssignment {
  taskId: string;
  priority: number;
  estimatedDurationMs?: number;
}

/**
 * Default pool configuration
 */
const DEFAULT_CONFIG: PoolConfig = {
  minAgents: 1,
  maxAgents: 10,
  healthCheckIntervalMs: 5000,
  heartbeatTimeoutMs: 30000,
  scaleUpThreshold: 0.8,
  scaleDownThreshold: 0.2,
  gracefulShutdownTimeoutMs: 60000,
};

/**
 * Agent Pool Manager for multi-agent orchestration
 * Provides dynamic scaling, health monitoring, and task distribution
 */
export class AgentPool {
  private agents: Map<string, AgentState> = new Map();
  private config: PoolConfig;
  private startTime: Date;
  private healthCheckInterval?: ReturnType<typeof setInterval>;
  private isShuttingDown: boolean = false;
  private taskQueue: TaskAssignment[] = [];

  constructor(config: Partial<PoolConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startTime = new Date();
    this.validateConfig();
  }

  /**
   * Validate pool configuration
   */
  private validateConfig(): void {
    if (this.config.minAgents < 1) {
      throw new Error('minAgents must be at least 1');
    }
    if (this.config.maxAgents < this.config.minAgents) {
      throw new Error('maxAgents must be >= minAgents');
    }
    if (this.config.maxAgents > 10) {
      throw new Error('maxAgents cannot exceed 10');
    }
  }

  /**
   * Initialize the pool with minimum agents
   */
  initialize(): void {
    for (let i = 0; i < this.config.minAgents; i++) {
      this.addAgent();
    }
    this.startHealthMonitoring();
  }

  /**
   * Start health monitoring interval
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
      this.autoScale();
    }, this.config.healthCheckIntervalMs);
  }

  /**
   * Add a new agent to the pool
   */
  addAgent(): string {
    if (this.agents.size >= this.config.maxAgents) {
      throw new Error('Maximum agent limit reached');
    }

    const id = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const agent: AgentState = {
      id,
      status: 'idle',
      health: 100,
      lastHeartbeat: new Date(),
      errorCount: 0,
      completedTasks: 0,
    };

    this.agents.set(id, agent);
    return id;
  }

  /**
   * Remove an agent from the pool
   */
  async removeAgent(agentId: string, force: boolean = false): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    // Don't remove if below minimum, unless forced
    if (!force && this.agents.size <= this.config.minAgents) {
      return false;
    }

    // Wait for current task to complete if not forcing
    if (!force && agent.status === 'busy' && agent.currentTask) {
      agent.status = 'shutdown';
      const timeout = this.config.gracefulShutdownTimeoutMs;
      const start = Date.now();

      while (agent.status === 'shutdown' && Date.now() - start < timeout) {
        await this.sleep(1000);
      }
    }

    this.agents.delete(agentId);
    return true;
  }

  /**
   * Assign a task to an available agent
   */
  assignTask(assignment: TaskAssignment): string | null {
    if (this.isShuttingDown) {
      return null;
    }

    // Find an idle agent
    const idleAgent = this.findIdleAgent();
    if (idleAgent) {
      return this.assignTaskToAgent(idleAgent.id, assignment);
    }

    // Queue the task if no idle agents
    this.taskQueue.push(assignment);
    this.taskQueue.sort((a, b) => b.priority - a.priority);

    // Try to scale up
    if (this.agents.size < this.config.maxAgents) {
      const newAgentId = this.addAgent();
      return this.assignTaskToAgent(newAgentId, assignment);
    }

    return null;
  }

  /**
   * Assign task to specific agent
   */
  private assignTaskToAgent(agentId: string, assignment: TaskAssignment): string | null {
    const agent = this.agents.get(agentId);
    if (!agent || agent.status !== 'idle') {
      return null;
    }

    agent.status = 'busy';
    agent.currentTask = assignment.taskId;
    agent.taskStartedAt = new Date();
    return agentId;
  }

  /**
   * Find first available idle agent
   */
  private findIdleAgent(): AgentState | undefined {
    for (const agent of this.agents.values()) {
      if (agent.status === 'idle' && agent.health > 50) {
        return agent;
      }
    }
    return undefined;
  }

  /**
   * Complete a task and free the agent
   */
  completeTask(agentId: string, success: boolean = true): void {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return;
    }

    if (success) {
      agent.completedTasks++;
      agent.status = 'idle';
    } else {
      agent.errorCount++;
      agent.health = Math.max(0, agent.health - 10);
      agent.status = agent.health > 30 ? 'idle' : 'error';
    }

    agent.currentTask = undefined;
    agent.taskStartedAt = undefined;
    agent.lastHeartbeat = new Date();

    // Process queued tasks
    if (agent.status === 'idle' && this.taskQueue.length > 0) {
      const nextTask = this.taskQueue.shift();
      if (nextTask) {
        this.assignTaskToAgent(agentId, nextTask);
      }
    }
  }

  /**
   * Record heartbeat from agent
   */
  recordHeartbeat(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.lastHeartbeat = new Date();
      // Slowly recover health on successful heartbeats
      agent.health = Math.min(100, agent.health + 1);
    }
  }

  /**
   * Perform health checks on all agents
   */
  private performHealthChecks(): void {
    const now = new Date();

    for (const agent of this.agents.values()) {
      const timeSinceHeartbeat = now.getTime() - agent.lastHeartbeat.getTime();

      if (timeSinceHeartbeat > this.config.heartbeatTimeoutMs) {
        agent.health = Math.max(0, agent.health - 20);
        if (agent.health === 0) {
          agent.status = 'error';
        }
      }
    }
  }

  /**
   * Auto-scale agent pool based on load
   */
  private autoScale(): void {
    if (this.isShuttingDown) {
      return;
    }

    const stats = this.getStats();
    const busyRatio = stats.busyAgents / stats.totalAgents;
    const idleRatio = stats.idleAgents / stats.totalAgents;

    // Scale up if too many busy
    if (busyRatio >= this.config.scaleUpThreshold && stats.totalAgents < this.config.maxAgents) {
      try {
        this.addAgent();
      } catch {
        // Ignore errors during auto-scaling
      }
    }

    // Scale down if too many idle
    if (idleRatio >= this.config.scaleDownThreshold && stats.totalAgents > this.config.minAgents) {
      const idleAgent = this.findIdleAgent();
      if (idleAgent) {
        this.removeAgent(idleAgent.id).catch(() => {});
      }
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): PoolStats {
    let idleCount = 0;
    let busyCount = 0;
    let errorCount = 0;
    let totalHealth = 0;
    let totalCompleted = 0;

    for (const agent of this.agents.values()) {
      totalHealth += agent.health;
      totalCompleted += agent.completedTasks;

      switch (agent.status) {
        case 'idle':
          idleCount++;
          break;
        case 'busy':
          busyCount++;
          break;
        case 'error':
        case 'shutdown':
          errorCount++;
          break;
      }
    }

    return {
      totalAgents: this.agents.size,
      idleAgents: idleCount,
      busyAgents: busyCount,
      errorAgents: errorCount,
      averageHealth: this.agents.size > 0 ? totalHealth / this.agents.size : 0,
      totalTasksCompleted: totalCompleted,
      uptime: Date.now() - this.startTime.getTime(),
    };
  }

  /**
   * Get state of specific agent
   */
  getAgentState(agentId: string): AgentState | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agent states
   */
  getAllAgentStates(): AgentState[] {
    return Array.from(this.agents.values());
  }

  /**
   * Graceful shutdown of the pool
   */
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Mark all agents for shutdown
    for (const agent of this.agents.values()) {
      if (agent.status === 'idle') {
        agent.status = 'shutdown';
      }
    }

    // Wait for busy agents to complete
    const timeout = this.config.gracefulShutdownTimeoutMs;
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const hasBusyAgents = Array.from(this.agents.values()).some((a) => a.status === 'busy');
      if (!hasBusyAgents) {
        break;
      }
      await this.sleep(1000);
    }

    // Force remove remaining agents
    for (const agentId of this.agents.keys()) {
      await this.removeAgent(agentId, true);
    }

    this.taskQueue = [];
  }

  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Singleton instance for convenience
 */
export const agentPool = new AgentPool();
