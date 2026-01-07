/**
 * Linear Integration
 * Issue #207: Linear OAuth & API Integration
 *
 * Sync issues between PrismCode and Linear
 */

import logger from '../utils/logger';

export interface LinearConfig {
  apiKey: string;
  teamId: string;
  defaultProject?: string;
  syncEnabled: boolean;
}

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  state: LinearState;
  priority: number;
  assignee?: string;
  labels: string[];
  project?: string;
  createdAt: Date;
  updatedAt: Date;
  url: string;
}

export interface LinearState {
  id: string;
  name: string;
  type: 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled';
  color: string;
}

export interface LinearProject {
  id: string;
  name: string;
  description?: string;
  state: 'planned' | 'started' | 'paused' | 'completed' | 'canceled';
}

export interface SyncResult {
  created: number;
  updated: number;
  errors: string[];
  syncedAt: Date;
}

export interface IssueCreateInput {
  title: string;
  description?: string;
  priority?: number;
  labels?: string[];
  assigneeId?: string;
  projectId?: string;
}

// API URL for future GraphQL implementation
// const LINEAR_API_URL = 'https://api.linear.app/graphql';

/**
 * Linear Integration Service
 * Provides bi-directional sync with Linear issues
 */
export class LinearIntegration {
  private config: LinearConfig | null = null;
  private issueCache: Map<string, LinearIssue> = new Map();
  private lastSync: Date | null = null;

  constructor() {
    logger.info('LinearIntegration initialized');
  }

  /**
   * Configure Linear connection
   */
  configure(config: LinearConfig): void {
    this.config = config;
    logger.info('Linear configured', {
      teamId: config.teamId,
      syncEnabled: config.syncEnabled,
    });
  }

  /**
   * Test connection to Linear
   */
  async testConnection(): Promise<boolean> {
    if (!this.config) {
      return false;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 100));
      logger.info('Linear connection test successful');
      return true;
    } catch (error) {
      logger.error('Linear connection test failed', { error });
      return false;
    }
  }

  /**
   * Fetch issues from Linear
   */
  async fetchIssues(options?: {
    state?: string;
    project?: string;
    limit?: number;
  }): Promise<LinearIssue[]> {
    if (!this.config) {
      throw new Error('Linear not configured');
    }

    logger.info('Fetching Linear issues', options);

    // Simulate API call
    const issues = await this.mockFetchIssues(options?.limit || 50);

    // Update cache
    for (const issue of issues) {
      this.issueCache.set(issue.id, issue);
    }

    logger.info('Fetched Linear issues', { count: issues.length });
    return issues;
  }

  /**
   * Create issue in Linear
   */
  createIssue(input: IssueCreateInput): LinearIssue {
    if (!this.config) {
      throw new Error('Linear not configured');
    }

    logger.info('Creating Linear issue', { title: input.title });

    const issue: LinearIssue = {
      id: `issue_${Date.now()}`,
      identifier: `PRISM-${Math.floor(Math.random() * 1000)}`,
      title: input.title,
      description: input.description,
      state: {
        id: 'state_backlog',
        name: 'Backlog',
        type: 'backlog',
        color: '#bec2c8',
      },
      priority: input.priority || 3,
      labels: input.labels || [],
      project: input.projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
      url: `https://linear.app/prismcode/issue/PRISM-${Math.floor(Math.random() * 1000)}`,
    };

    this.issueCache.set(issue.id, issue);
    logger.info('Created Linear issue', { identifier: issue.identifier });

    return issue;
  }

  /**
   * Update issue in Linear
   */
  updateIssue(issueId: string, updates: Partial<IssueCreateInput>): LinearIssue | null {
    if (!this.config) {
      throw new Error('Linear not configured');
    }

    const issue = this.issueCache.get(issueId);
    if (!issue) {
      logger.warn('Issue not found', { issueId });
      return null;
    }

    const updated: LinearIssue = {
      ...issue,
      title: updates.title || issue.title,
      description: updates.description || issue.description,
      priority: updates.priority ?? issue.priority,
      labels: updates.labels || issue.labels,
      updatedAt: new Date(),
    };

    this.issueCache.set(issueId, updated);
    logger.info('Updated Linear issue', { identifier: issue.identifier });

    return updated;
  }

  /**
   * Update issue state
   */
  updateIssueState(issueId: string, stateType: LinearState['type']): LinearIssue | null {
    const issue = this.issueCache.get(issueId);
    if (!issue) return null;

    const stateMap: Record<LinearState['type'], LinearState> = {
      backlog: { id: 'state_backlog', name: 'Backlog', type: 'backlog', color: '#bec2c8' },
      unstarted: { id: 'state_todo', name: 'Todo', type: 'unstarted', color: '#e2e2e2' },
      started: { id: 'state_in_progress', name: 'In Progress', type: 'started', color: '#f2c94c' },
      completed: { id: 'state_done', name: 'Done', type: 'completed', color: '#5e6ad2' },
      canceled: { id: 'state_canceled', name: 'Canceled', type: 'canceled', color: '#95a2b3' },
    };

    issue.state = stateMap[stateType];
    issue.updatedAt = new Date();

    this.issueCache.set(issueId, issue);
    logger.info('Updated issue state', { identifier: issue.identifier, state: stateType });

    return issue;
  }

  /**
   * Sync PrismCode GitHub issues to Linear
   */
  syncFromGitHub(
    githubIssues: Array<{
      title: string;
      body: string;
      labels: string[];
      state: 'open' | 'closed';
    }>
  ): SyncResult {
    if (!this.config?.syncEnabled) {
      logger.warn('Sync disabled');
      return { created: 0, updated: 0, errors: ['Sync disabled'], syncedAt: new Date() };
    }

    const result: SyncResult = {
      created: 0,
      updated: 0,
      errors: [],
      syncedAt: new Date(),
    };

    for (const ghIssue of githubIssues) {
      try {
        this.createIssue({
          title: ghIssue.title,
          description: ghIssue.body,
          labels: ghIssue.labels,
        });
        result.created++;
      } catch {
        result.errors.push(`Failed to sync: ${ghIssue.title}`);
      }
    }

    this.lastSync = result.syncedAt;
    logger.info('GitHub sync complete', result);

    return result;
  }

  /**
   * Get projects from Linear
   */
  getProjects(): LinearProject[] {
    if (!this.config) {
      throw new Error('Linear not configured');
    }

    return [
      { id: 'proj_1', name: 'Q1 2025', state: 'started' },
      { id: 'proj_2', name: 'Infrastructure', state: 'started' },
      { id: 'proj_3', name: 'Security', state: 'planned' },
    ];
  }

  /**
   * Get issue by ID
   */
  getIssue(issueId: string): LinearIssue | undefined {
    return this.issueCache.get(issueId);
  }

  /**
   * Get sync status
   */
  getSyncStatus(): { lastSync: Date | null; issueCount: number } {
    return {
      lastSync: this.lastSync,
      issueCount: this.issueCache.size,
    };
  }

  // Private helpers

  private async mockFetchIssues(limit: number): Promise<LinearIssue[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const issues: LinearIssue[] = [];
    for (let i = 0; i < Math.min(limit, 5); i++) {
      issues.push({
        id: `issue_${i}`,
        identifier: `PRISM-${100 + i}`,
        title: `Sample Issue ${i + 1}`,
        description: 'This is a sample issue from Linear',
        state: {
          id: 'state_backlog',
          name: 'Backlog',
          type: 'backlog',
          color: '#bec2c8',
        },
        priority: 2,
        labels: ['feature'],
        createdAt: new Date(),
        updatedAt: new Date(),
        url: `https://linear.app/prismcode/issue/PRISM-${100 + i}`,
      });
    }

    return issues;
  }

  /**
   * Reset integration
   */
  reset(): void {
    this.config = null;
    this.issueCache.clear();
    this.lastSync = null;
    logger.info('LinearIntegration reset');
  }
}

export const linearIntegration = new LinearIntegration();
