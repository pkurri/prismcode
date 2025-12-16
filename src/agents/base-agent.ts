/**
 * Base Agent class
 */

import { AgentOutput } from '../types';

/**
 * Base class for all agents
 */
export abstract class BaseAgent {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Process input and return agent-specific output
   */
  abstract async process(input: any): Promise<AgentOutput>;

  /**
   * Get agent name
   */
  getName(): string {
    return this.name;
  }
}