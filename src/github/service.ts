/**
 * GitHub Service - Unified GitHub API interface
 * Issue #61: [EPIC] GitHub Native Integration
 *
 * Combines REST and GraphQL clients into a unified service
 */

import { GitHubRestClient, GitHubConfig, Issue, PullRequest, Label, Milestone, Release, Repository, Branch } from './rest-client';
import { GitHubGraphQLClient, ProjectV2, ProjectItem } from './graphql-client';
import logger from '../utils/logger';

export interface GitHubServiceConfig extends GitHubConfig {
  useGraphQL?: boolean;
}

/**
 * Unified GitHub Service
 */
export class GitHubService {
  private rest: GitHubRestClient;
  private graphql: GitHubGraphQLClient;
  private owner: string;
  private repo: string;

  constructor(config: GitHubServiceConfig) {
    this.rest = new GitHubRestClient(config);
    this.graphql = new GitHubGraphQLClient(config);
    this.owner = config.owner;
    this.repo = config.repo || '';

    logger.info('GitHub Service initialized', { owner: config.owner, repo: config.repo });
  }

  // ========================================
  // Issue Management (#64)
  // ========================================

  get issues() {
    return {
      create: (title: string, body: string, labels?: string[]) => this.rest.createIssue(title, body, labels),
      get: (number: number) => this.rest.getIssue(number),
      update: (number: number, updates: Parameters<typeof this.rest.updateIssue>[1]) =>
        this.rest.updateIssue(number, updates),
      close: (number: number, comment?: string) => this.rest.closeIssue(number, comment),
      list: (options?: { state?: 'open' | 'closed' | 'all'; labels?: string[] }) => this.rest.listIssues(options),
      comment: (number: number, body: string) => this.rest.createComment(number, body),
    };
  }

  // ========================================
  // Pull Request Management (#65, #82, #83, #84)
  // ========================================

  get pullRequests() {
    return {
      create: (title: string, head: string, base: string, body?: string) =>
        this.rest.createPullRequest(title, head, base, body),
      get: (number: number) => this.rest.getPullRequest(number),
      list: (state?: 'open' | 'closed' | 'all') => this.rest.listPullRequests(state),
      merge: (number: number, method?: 'merge' | 'squash' | 'rebase') => this.rest.mergePullRequest(number, method),
      reviews: (number: number) => this.graphql.getPullRequestReviews(number),
    };
  }

  // ========================================
  // Label Management (#68)
  // ========================================

  get labels() {
    return {
      create: (name: string, color: string, description?: string) => this.rest.createLabel(name, color, description),
      list: () => this.rest.listLabels(),
      delete: (name: string) => this.rest.deleteLabel(name),
    };
  }

  // ========================================
  // Milestone Management (#69)
  // ========================================

  get milestones() {
    return {
      create: (title: string, description?: string, dueOn?: string) =>
        this.rest.createMilestone(title, description, dueOn),
      list: () => this.rest.listMilestones(),
    };
  }

  // ========================================
  // Release Management (#70)
  // ========================================

  get releases() {
    return {
      create: (tagName: string, name: string, body?: string) => this.rest.createRelease(tagName, name, body),
      list: () => this.rest.listReleases(),
    };
  }

  // ========================================
  // Repository Management (#71, #86, #87, #88)
  // ========================================

  get repository() {
    return {
      get: () => this.rest.getRepository(),
      updateTopics: (topics: string[]) => this.rest.updateTopics(topics),
    };
  }

  // ========================================
  // Branch Management (#72, #85)
  // ========================================

  get branches() {
    return {
      list: () => this.rest.listBranches(),
      protect: (branch: string, options: Parameters<typeof this.rest.createBranchProtection>[1]) =>
        this.rest.createBranchProtection(branch, options),
    };
  }

  // ========================================
  // Status Checks (#81)
  // ========================================

  get status() {
    return {
      get: (ref: string) => this.rest.getCommitStatus(ref),
    };
  }

  // ========================================
  // Project Boards (#67)
  // ========================================

  get projects() {
    return {
      list: () => this.graphql.listProjectsV2(),
      get: (number: number) => this.graphql.getProjectV2(number),
      addItem: (projectId: string, contentId: string) => this.graphql.addItemToProject(projectId, contentId),
      listItems: (projectId: string) => this.graphql.listProjectItems(projectId),
    };
  }

  // ========================================
  // User/Org/Team (#76, #77, #78)
  // ========================================

  get users() {
    return {
      me: () => this.graphql.getViewer(),
    };
  }

  get organizations() {
    return {
      get: (org: string) => this.graphql.getOrganization(org),
      teams: (org: string) => this.graphql.getTeams(org),
    };
  }

  // ========================================
  // Utility Methods
  // ========================================

  async getIssueNodeId(issueNumber: number): Promise<string> {
    return this.graphql.getIssueNodeId(issueNumber);
  }

  async getPRNodeId(prNumber: number): Promise<string> {
    return this.graphql.getPullRequestNodeId(prNumber);
  }
}

// Re-export types
export type { Issue, PullRequest, Label, Milestone, Release, Repository, Branch, ProjectV2, ProjectItem };
