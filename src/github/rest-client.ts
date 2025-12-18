/**
 * GitHub REST API Client
 * Issue #62: GitHub REST API Client
 *
 * Provides typed wrapper around Octokit REST API
 */

import { Octokit } from '@octokit/rest';
import logger from '../utils/logger';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo?: string;
  baseUrl?: string;
}

export interface Issue {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  labels: string[];
  assignees: string[];
  milestone: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface PullRequest {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed' | 'merged';
  head: string;
  base: string;
  draft: boolean;
  mergeable: boolean | null;
  labels: string[];
  reviewers: string[];
}

export interface Label {
  name: string;
  color: string;
  description: string | null;
}

export interface Milestone {
  number: number;
  title: string;
  description: string | null;
  state: 'open' | 'closed';
  dueOn: string | null;
}

export interface Repository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  defaultBranch: string;
  topics: string[];
  stars: number;
  forks: number;
}

export interface Branch {
  name: string;
  protected: boolean;
  sha: string;
}

export interface Release {
  id: number;
  tagName: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  createdAt: string;
}

/**
 * GitHub REST API Client
 */
export class GitHubRestClient {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(config: GitHubConfig) {
    this.octokit = new Octokit({
      auth: config.token,
      baseUrl: config.baseUrl,
    });
    this.owner = config.owner;
    this.repo = config.repo || '';
  }

  // ========================================
  // Issue Operations (#64)
  // ========================================

  async createIssue(title: string, body: string, labels?: string[]): Promise<Issue> {
    logger.info('GitHub: Creating issue', { title });

    const { data } = await this.octokit.issues.create({
      owner: this.owner,
      repo: this.repo,
      title,
      body,
      labels,
    });

    return this.mapIssue(data);
  }

  async getIssue(issueNumber: number): Promise<Issue> {
    const { data } = await this.octokit.issues.get({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
    });

    return this.mapIssue(data);
  }

  async updateIssue(
    issueNumber: number,
    updates: { title?: string; body?: string; state?: 'open' | 'closed'; labels?: string[] }
  ): Promise<Issue> {
    const { data } = await this.octokit.issues.update({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      ...updates,
    });

    return this.mapIssue(data);
  }

  async closeIssue(issueNumber: number, comment?: string): Promise<void> {
    if (comment) {
      await this.createComment(issueNumber, comment);
    }

    await this.octokit.issues.update({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      state: 'closed',
    });
  }

  async listIssues(options?: { state?: 'open' | 'closed' | 'all'; labels?: string[] }): Promise<Issue[]> {
    const { data } = await this.octokit.issues.listForRepo({
      owner: this.owner,
      repo: this.repo,
      state: options?.state || 'open',
      labels: options?.labels?.join(','),
      per_page: 100,
    });

    return data
      .filter((i) => !i.pull_request)
      .map((i) => this.mapIssue(i));
  }

  async createComment(issueNumber: number, body: string): Promise<void> {
    await this.octokit.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
      body,
    });
  }

  // ========================================
  // Pull Request Operations (#65)
  // ========================================

  async createPullRequest(title: string, head: string, base: string, body?: string): Promise<PullRequest> {
    logger.info('GitHub: Creating PR', { title, head, base });

    const { data } = await this.octokit.pulls.create({
      owner: this.owner,
      repo: this.repo,
      title,
      head,
      base,
      body,
    });

    return this.mapPullRequest(data);
  }

  async getPullRequest(prNumber: number): Promise<PullRequest> {
    const { data } = await this.octokit.pulls.get({
      owner: this.owner,
      repo: this.repo,
      pull_number: prNumber,
    });

    return this.mapPullRequest(data);
  }

  async listPullRequests(state?: 'open' | 'closed' | 'all'): Promise<PullRequest[]> {
    const { data } = await this.octokit.pulls.list({
      owner: this.owner,
      repo: this.repo,
      state: state || 'open',
      per_page: 100,
    });

    return data.map((pr) => this.mapPullRequest(pr));
  }

  async mergePullRequest(prNumber: number, mergeMethod?: 'merge' | 'squash' | 'rebase'): Promise<void> {
    await this.octokit.pulls.merge({
      owner: this.owner,
      repo: this.repo,
      pull_number: prNumber,
      merge_method: mergeMethod || 'squash',
    });
  }

  // ========================================
  // Label Operations (#68)
  // ========================================

  async createLabel(name: string, color: string, description?: string): Promise<Label> {
    const { data } = await this.octokit.issues.createLabel({
      owner: this.owner,
      repo: this.repo,
      name,
      color,
      description,
    });

    return { name: data.name, color: data.color, description: data.description };
  }

  async listLabels(): Promise<Label[]> {
    const { data } = await this.octokit.issues.listLabelsForRepo({
      owner: this.owner,
      repo: this.repo,
      per_page: 100,
    });

    return data.map((l) => ({ name: l.name, color: l.color, description: l.description }));
  }

  async deleteLabel(name: string): Promise<void> {
    await this.octokit.issues.deleteLabel({
      owner: this.owner,
      repo: this.repo,
      name,
    });
  }

  // ========================================
  // Milestone Operations (#69)
  // ========================================

  async createMilestone(title: string, description?: string, dueOn?: string): Promise<Milestone> {
    const { data } = await this.octokit.issues.createMilestone({
      owner: this.owner,
      repo: this.repo,
      title,
      description,
      due_on: dueOn,
    });

    return this.mapMilestone(data);
  }

  async listMilestones(): Promise<Milestone[]> {
    const { data } = await this.octokit.issues.listMilestones({
      owner: this.owner,
      repo: this.repo,
    });

    return data.map((m) => this.mapMilestone(m));
  }

  // ========================================
  // Release Operations (#70)
  // ========================================

  async createRelease(tagName: string, name: string, body?: string): Promise<Release> {
    const { data } = await this.octokit.repos.createRelease({
      owner: this.owner,
      repo: this.repo,
      tag_name: tagName,
      name,
      body,
    });

    return this.mapRelease(data);
  }

  async listReleases(): Promise<Release[]> {
    const { data } = await this.octokit.repos.listReleases({
      owner: this.owner,
      repo: this.repo,
    });

    return data.map((r) => this.mapRelease(r));
  }

  // ========================================
  // Repository Operations (#71)
  // ========================================

  async getRepository(): Promise<Repository> {
    const { data } = await this.octokit.repos.get({
      owner: this.owner,
      repo: this.repo,
    });

    return this.mapRepository(data);
  }

  async updateTopics(topics: string[]): Promise<void> {
    await this.octokit.repos.replaceAllTopics({
      owner: this.owner,
      repo: this.repo,
      names: topics,
    });
  }

  // ========================================
  // Branch Operations (#72, #85)
  // ========================================

  async listBranches(): Promise<Branch[]> {
    const { data } = await this.octokit.repos.listBranches({
      owner: this.owner,
      repo: this.repo,
    });

    return data.map((b) => ({
      name: b.name,
      protected: b.protected,
      sha: b.commit.sha,
    }));
  }

  async createBranchProtection(
    branch: string,
    options: { requiredReviews?: number; requireStatusChecks?: string[] }
  ): Promise<void> {
    await this.octokit.repos.updateBranchProtection({
      owner: this.owner,
      repo: this.repo,
      branch,
      required_status_checks: options.requireStatusChecks
        ? { strict: true, contexts: options.requireStatusChecks }
        : null,
      required_pull_request_reviews: options.requiredReviews
        ? { required_approving_review_count: options.requiredReviews }
        : null,
      enforce_admins: true,
      restrictions: null,
    });
  }

  // ========================================
  // Status & Checks (#81)
  // ========================================

  async getCommitStatus(ref: string): Promise<{ state: string; statuses: Array<{ context: string; state: string }> }> {
    const { data } = await this.octokit.repos.getCombinedStatusForRef({
      owner: this.owner,
      repo: this.repo,
      ref,
    });

    return {
      state: data.state,
      statuses: data.statuses.map((s) => ({ context: s.context, state: s.state })),
    };
  }

  // ========================================
  // Helpers
  // ========================================

  private mapIssue(data: Record<string, unknown>): Issue {
    return {
      number: data.number as number,
      title: data.title as string,
      body: data.body as string | null,
      state: data.state as 'open' | 'closed',
      labels: ((data.labels as Array<{ name: string }>) || []).map((l) => l.name),
      assignees: ((data.assignees as Array<{ login: string }>) || []).map((a) => a.login),
      milestone: (data.milestone as { number: number } | null)?.number || null,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  private mapPullRequest(data: Record<string, unknown>): PullRequest {
    return {
      number: data.number as number,
      title: data.title as string,
      body: data.body as string | null,
      state: data.merged ? 'merged' : (data.state as 'open' | 'closed'),
      head: (data.head as { ref: string }).ref,
      base: (data.base as { ref: string }).ref,
      draft: data.draft as boolean,
      mergeable: data.mergeable as boolean | null,
      labels: ((data.labels as Array<{ name: string }>) || []).map((l) => l.name),
      reviewers: ((data.requested_reviewers as Array<{ login: string }>) || []).map((r) => r.login),
    };
  }

  private mapMilestone(data: Record<string, unknown>): Milestone {
    return {
      number: data.number as number,
      title: data.title as string,
      description: data.description as string | null,
      state: data.state as 'open' | 'closed',
      dueOn: data.due_on as string | null,
    };
  }

  private mapRelease(data: Record<string, unknown>): Release {
    return {
      id: data.id as number,
      tagName: data.tag_name as string,
      name: data.name as string | null,
      body: data.body as string | null,
      draft: data.draft as boolean,
      prerelease: data.prerelease as boolean,
      createdAt: data.created_at as string,
    };
  }

  private mapRepository(data: Record<string, unknown>): Repository {
    return {
      id: data.id as number,
      name: data.name as string,
      fullName: data.full_name as string,
      description: data.description as string | null,
      private: data.private as boolean,
      defaultBranch: data.default_branch as string,
      topics: (data.topics as string[]) || [],
      stars: data.stargazers_count as number,
      forks: data.forks_count as number,
    };
  }
}
