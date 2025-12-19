/**
 * GitHub REST API Service
 * Provides wrapper around Octokit REST API with error handling and rate limiting
 *
 * Issue #67
 */

import { Octokit } from '@octokit/rest';
import logger from '../utils/logger';

export interface GitHubConfig {
  token?: string;
  owner?: string;
  repo?: string;
}

export interface CreateIssueParams {
  title: string;
  body: string;
  labels?: string[];
  assignees?: string[];
  milestone?: number;
}

export interface UpdateIssueParams {
  title?: string;
  body?: string;
  state?: 'open' | 'closed';
  labels?: string[];
  assignees?: string[];
  milestone?: number;
}

/**
 * GitHub REST API Service wrapper
 */
export class GitHubRestService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(config: GitHubConfig = {}) {
    this.octokit = new Octokit({
      auth: config.token || process.env.GITHUB_TOKEN,
      retry: {
        enabled: true,
        retries: 3,
      },
      throttle: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onRateLimit: (retryAfter: number, options: Record<string, unknown>) => {
          logger.warn(`Rate limit hit, retrying after ${retryAfter}s`, { options });
          return true;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSecondaryRateLimit: (retryAfter: number, options: Record<string, unknown>) => {
          logger.warn(`Secondary rate limit hit, retrying after ${retryAfter}s`, { options });
          return true;
        },
      },
    });

    this.owner = config.owner || process.env.GITHUB_OWNER || '';
    this.repo = config.repo || process.env.GITHUB_REPO || '';

    if (!this.owner || !this.repo) {
      logger.warn('GitHub owner or repo not configured');
    }
  }

  /**
   * Create a new issue
   */
  async createIssue(params: CreateIssueParams): Promise<number> {
    try {
      logger.info('Creating GitHub issue', { title: params.title });

      const response = await this.octokit.issues.create({
        owner: this.owner,
        repo: this.repo,
        title: params.title,
        body: params.body,
        labels: params.labels,
        assignees: params.assignees,
        milestone: params.milestone,
      });

      logger.info('Issue created', { number: response.data.number });
      return response.data.number;
    } catch (error) {
      logger.error('Failed to create issue', { error, title: params.title });
      throw error;
    }
  }

  /**
   * Update an existing issue
   */
  async updateIssue(issueNumber: number, params: UpdateIssueParams): Promise<void> {
    try {
      logger.info('Updating GitHub issue', { issueNumber });

      await this.octokit.issues.update({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        title: params.title,
        body: params.body,
        state: params.state,
        labels: params.labels,
        assignees: params.assignees,
        milestone: params.milestone,
      });

      logger.info('Issue updated', { issueNumber });
    } catch (error) {
      logger.error('Failed to update issue', { error, issueNumber });
      throw error;
    }
  }

  /**
   * Get issue details
   */
  async getIssue(issueNumber: number) {
    try {
      const response = await this.octokit.issues.get({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get issue', { error, issueNumber });
      throw error;
    }
  }

  /**
   * Close an issue
   */
  async closeIssue(issueNumber: number, comment?: string): Promise<void> {
    try {
      logger.info('Closing issue', { issueNumber });

      if (comment) {
        await this.addComment(issueNumber, comment);
      }

      await this.octokit.issues.update({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        state: 'closed',
      });

      logger.info('Issue closed', { issueNumber });
    } catch (error) {
      logger.error('Failed to close issue', { error, issueNumber });
      throw error;
    }
  }

  /**
   * Add a comment to an issue
   */
  async addComment(issueNumber: number, body: string): Promise<void> {
    try {
      await this.octokit.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        body,
      });

      logger.info('Comment added', { issueNumber });
    } catch (error) {
      logger.error('Failed to add comment', { error, issueNumber });
      throw error;
    }
  }

  /**
   * Add labels to an issue
   */
  async addLabels(issueNumber: number, labels: string[]): Promise<void> {
    try {
      await this.octokit.issues.addLabels({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber,
        labels,
      });

      logger.info('Labels added', { issueNumber, labels });
    } catch (error) {
      logger.error('Failed to add labels', { error, issueNumber });
      throw error;
    }
  }

  /**
   * Create a pull request
   */
  async createPullRequest(params: {
    title: string;
    body: string;
    head: string;
    base: string;
  }): Promise<number> {
    try {
      logger.info('Creating pull request', { title: params.title });

      const response = await this.octokit.pulls.create({
        owner: this.owner,
        repo: this.repo,
        title: params.title,
        body: params.body,
        head: params.head,
        base: params.base,
      });

      logger.info('Pull request created', { number: response.data.number });
      return response.data.number;
    } catch (error) {
      logger.error('Failed to create pull request', { error });
      throw error;
    }
  }

  /**
   * Get repository information
   */
  async getRepository() {
    try {
      const response = await this.octokit.repos.get({
        owner: this.owner,
        repo: this.repo,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get repository', { error });
      throw error;
    }
  }

  /**
   * List repository issues
   */
  async listIssues(
    params: {
      state?: 'open' | 'closed' | 'all';
      labels?: string;
      sort?: 'created' | 'updated' | 'comments';
      direction?: 'asc' | 'desc';
      per_page?: number;
    } = {}
  ) {
    try {
      const response = await this.octokit.issues.listForRepo({
        owner: this.owner,
        repo: this.repo,
        state: params.state || 'open',
        labels: params.labels,
        sort: params.sort || 'created',
        direction: params.direction || 'desc',
        per_page: params.per_page || 30,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to list issues', { error });
      throw error;
    }
  }
}

// Export singleton instance
export const githubRest = new GitHubRestService();
