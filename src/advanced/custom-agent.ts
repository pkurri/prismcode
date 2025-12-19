/**
 * Custom Agent Creation Service
 * Issue #122: Custom Agent Creation
 *
 * Create and manage custom AI agents
 */

import logger from '../utils/logger';

export interface CustomAgent {
  id: string;
  name: string;
  description: string;
  role: string;
  systemPrompt: string;
  capabilities: string[];
  model: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  input: string;
  output: string;
  duration: number;
  tokenUsage: { input: number; output: number };
  timestamp: Date;
}

/**
 * Custom Agent Manager
 * Manages custom AI agents
 */
export class CustomAgentManager {
  private agents: Map<string, CustomAgent> = new Map();
  private executions: AgentExecution[] = [];

  constructor() {
    logger.info('CustomAgentManager initialized');
  }

  /**
   * Create agent
   */
  createAgent(
    config: Omit<CustomAgent, 'id' | 'isActive' | 'createdAt' | 'updatedAt'>
  ): CustomAgent {
    const id = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const agent: CustomAgent = {
      id,
      ...config,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.agents.set(id, agent);
    logger.info('Custom agent created', { id, name: config.name });

    return agent;
  }

  /**
   * Get agent
   */
  getAgent(id: string): CustomAgent | undefined {
    return this.agents.get(id);
  }

  /**
   * List agents
   */
  listAgents(): CustomAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Update agent
   */
  updateAgent(id: string, updates: Partial<CustomAgent>): CustomAgent | null {
    const agent = this.agents.get(id);
    if (!agent) return null;

    Object.assign(agent, updates, { updatedAt: new Date() });
    return agent;
  }

  /**
   * Execute agent (mock)
   */
  executeAgent(agentId: string, input: string): AgentExecution | null {
    const agent = this.agents.get(agentId);
    if (!agent || !agent.isActive) return null;

    const execution: AgentExecution = {
      id: `exec_${Date.now()}`,
      agentId,
      input,
      output: `Mock response from ${agent.name}: Processed "${input}"`,
      duration: Math.random() * 1000,
      tokenUsage: { input: 50, output: 100 },
      timestamp: new Date(),
    };

    this.executions.push(execution);

    // Keep only last 1000 executions
    if (this.executions.length > 1000) {
      this.executions = this.executions.slice(-1000);
    }

    return execution;
  }

  /**
   * Get executions for agent
   */
  getExecutions(agentId: string, limit: number = 10): AgentExecution[] {
    return this.executions
      .filter((e) => e.agentId === agentId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Clone agent
   */
  cloneAgent(id: string, newName: string): CustomAgent | null {
    const original = this.agents.get(id);
    if (!original) return null;

    return this.createAgent({
      name: newName,
      description: original.description,
      role: original.role,
      systemPrompt: original.systemPrompt,
      capabilities: [...original.capabilities],
      model: original.model,
      temperature: original.temperature,
      maxTokens: original.maxTokens,
    });
  }

  /**
   * Delete agent
   */
  deleteAgent(id: string): boolean {
    return this.agents.delete(id);
  }

  /**
   * Reset
   */
  reset(): void {
    this.agents.clear();
    this.executions = [];
    logger.info('CustomAgentManager reset');
  }
}

export const customAgentManager = new CustomAgentManager();
