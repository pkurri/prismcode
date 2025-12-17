/**
 * Main PrismCode class
 */

import { FeatureInput, ProjectPlan, PrismCodeConfig } from '../types';
import { Orchestrator } from './orchestrator';

/**
 * PrismCode - AI-powered multi-agent project orchestration
 */
export class PrismCode {
  private orchestrator: Orchestrator;
  private config: PrismCodeConfig;

  constructor(config: PrismCodeConfig) {
    this.config = config;
    this.orchestrator = new Orchestrator(config);
  }

  /**
   * Generate complete project plan from feature description
   */
  async plan(input: FeatureInput): Promise<ProjectPlan> {
    return await this.orchestrator.orchestrate(input);
  }

  /**
   * Create GitHub issues from project plan
   */
  async createGitHubIssues(_plan: ProjectPlan): Promise<void> {
    // TODO: Implement GitHub issue creation
    throw new Error('Not implemented yet');
  }

  /**
   * Export project plan to various formats
   */
  async export(_plan: ProjectPlan, _format: 'json' | 'markdown' | 'both'): Promise<string> {
    // TODO: Implement export functionality
    throw new Error('Not implemented yet');
  }
}
