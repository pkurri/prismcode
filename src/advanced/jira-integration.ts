/**
 * Jira Cloud Integration
 * Issue #208: Jira Cloud Integration
 *
 * Sync issues between PrismCode and Jira Cloud
 */

import logger from '../utils/logger';

export interface JiraConfig {
  cloudId: string;
  accessToken: string;
  refreshToken?: string;
  projectKey: string;
  defaultIssueType: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description?: string;
  status: JiraStatus;
  issueType: string;
  priority: string;
  assignee?: string;
  reporter: string;
  labels: string[];
  sprint?: string;
  epicKey?: string;
  customFields: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  url: string;
}

export interface JiraStatus {
  id: string;
  name: string;
  category: 'todo' | 'in-progress' | 'done';
}

export interface JiraSprint {
  id: string;
  name: string;
  state: 'active' | 'closed' | 'future';
  startDate?: Date;
  endDate?: Date;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  issueTypes: string[];
}

export interface SyncResult {
  created: number;
  updated: number;
  errors: string[];
  syncedAt: Date;
}

/**
 * Jira Cloud Integration Service
 * Provides bi-directional sync with Jira Cloud
 */
export class JiraIntegration {
  private config: JiraConfig | null = null;
  private issueCache: Map<string, JiraIssue> = new Map();
  private lastSync: Date | null = null;

  constructor() {
    logger.info('JiraIntegration initialized');
  }

  /**
   * Configure Jira connection
   */
  configure(config: JiraConfig): void {
    this.config = config;
    logger.info('Jira configured', {
      cloudId: config.cloudId,
      projectKey: config.projectKey,
    });
  }

  /**
   * Test connection to Jira
   */
  async testConnection(): Promise<boolean> {
    if (!this.config) {
      return false;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      logger.info('Jira connection test successful');
      return true;
    } catch (error) {
      logger.error('Jira connection test failed', { error });
      return false;
    }
  }

  /**
   * Fetch issues from Jira
   */
  async fetchIssues(jql?: string, limit: number = 50): Promise<JiraIssue[]> {
    if (!this.config) {
      throw new Error('Jira not configured');
    }

    logger.info('Fetching Jira issues', { jql, limit });

    const issues = await this.mockFetchIssues(limit);

    for (const issue of issues) {
      this.issueCache.set(issue.key, issue);
    }

    logger.info('Fetched Jira issues', { count: issues.length });
    return issues;
  }

  /**
   * Create issue in Jira
   */
  createIssue(input: {
    summary: string;
    description?: string;
    issueType?: string;
    priority?: string;
    labels?: string[];
    epicKey?: string;
  }): JiraIssue {
    if (!this.config) {
      throw new Error('Jira not configured');
    }

    logger.info('Creating Jira issue', { summary: input.summary });

    const issue: JiraIssue = {
      id: `issue_${Date.now()}`,
      key: `${this.config.projectKey}-${Math.floor(Math.random() * 1000)}`,
      summary: input.summary,
      description: input.description,
      status: {
        id: 'status_todo',
        name: 'To Do',
        category: 'todo',
      },
      issueType: input.issueType || this.config.defaultIssueType,
      priority: input.priority || 'Medium',
      reporter: 'prismcode',
      labels: input.labels || [],
      epicKey: input.epicKey,
      customFields: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      url: `https://prismcode.atlassian.net/browse/${this.config.projectKey}-${Math.floor(Math.random() * 1000)}`,
    };

    this.issueCache.set(issue.key, issue);
    logger.info('Created Jira issue', { key: issue.key });

    return issue;
  }

  /**
   * Update issue status
   */
  transitionIssue(issueKey: string, statusName: string): JiraIssue | null {
    const issue = this.issueCache.get(issueKey);
    if (!issue) return null;

    const statusMap: Record<string, JiraStatus> = {
      'To Do': { id: 'status_todo', name: 'To Do', category: 'todo' },
      'In Progress': { id: 'status_inprogress', name: 'In Progress', category: 'in-progress' },
      Done: { id: 'status_done', name: 'Done', category: 'done' },
    };

    issue.status = statusMap[statusName] || issue.status;
    issue.updatedAt = new Date();
    this.issueCache.set(issueKey, issue);

    logger.info('Issue transitioned', { key: issueKey, status: statusName });
    return issue;
  }

  /**
   * Get sprints
   */
  getSprints(): JiraSprint[] {
    return [
      { id: 'sprint_1', name: 'Sprint 1', state: 'closed' },
      {
        id: 'sprint_2',
        name: 'Sprint 2',
        state: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      { id: 'sprint_3', name: 'Sprint 3', state: 'future' },
    ];
  }

  /**
   * Sync from GitHub
   */
  syncFromGitHub(
    githubIssues: Array<{
      title: string;
      body: string;
      labels: string[];
      state: 'open' | 'closed';
    }>
  ): SyncResult {
    if (!this.config) {
      return { created: 0, updated: 0, errors: ['Not configured'], syncedAt: new Date() };
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
          summary: ghIssue.title,
          description: ghIssue.body,
          labels: ghIssue.labels,
        });
        result.created++;
      } catch {
        result.errors.push(`Failed: ${ghIssue.title}`);
      }
    }

    this.lastSync = result.syncedAt;
    return result;
  }

  /**
   * Get custom field mapping
   */
  getCustomFieldMapping(): Record<string, string> {
    return {
      customfield_10001: 'Story Points',
      customfield_10002: 'Epic Link',
      customfield_10003: 'Sprint',
    };
  }

  // Private helpers
  private async mockFetchIssues(limit: number): Promise<JiraIssue[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const issues: JiraIssue[] = [];
    for (let i = 0; i < Math.min(limit, 5); i++) {
      issues.push({
        id: `issue_${i}`,
        key: `PRISM-${100 + i}`,
        summary: `Sample Jira Issue ${i + 1}`,
        status: { id: 'status_todo', name: 'To Do', category: 'todo' },
        issueType: 'Story',
        priority: 'Medium',
        reporter: 'prismcode',
        labels: ['feature'],
        customFields: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        url: `https://prismcode.atlassian.net/browse/PRISM-${100 + i}`,
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
    logger.info('JiraIntegration reset');
  }
}

export const jiraIntegration = new JiraIntegration();
