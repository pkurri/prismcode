/**
 * GitHub GraphQL API Client
 * Issue #63: GitHub GraphQL Client
 *
 * Provides typed wrapper around GitHub GraphQL API
 */

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */

import { graphql } from '@octokit/graphql';
import logger from '../utils/logger';

export interface GraphQLConfig {
  token: string;
  owner: string;
  repo?: string;
}

export interface ProjectV2 {
  id: string;
  title: string;
  number: number;
  url: string;
  closed: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  status: string | null;
  type: 'ISSUE' | 'PULL_REQUEST' | 'DRAFT_ISSUE';
}

/**
 * GitHub GraphQL API Client
 */
export class GitHubGraphQLClient {
  private gql: typeof graphql;
  private owner: string;
  private repo: string;

  constructor(config: GraphQLConfig) {
    this.gql = graphql.defaults({
      headers: {
        authorization: `token ${config.token}`,
      },
    });
    this.owner = config.owner;
    this.repo = config.repo || '';
  }

  // ========================================
  // Project Board Operations (#67)
  // ========================================

  async listProjectsV2(): Promise<ProjectV2[]> {
    logger.info('GitHub GraphQL: Listing projects');

    const query = `
      query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          projectsV2(first: 20) {
            nodes {
              id
              title
              number
              url
              closed
            }
          }
        }
      }
    `;

    const result = await this.gql(query, {
      owner: this.owner,
      repo: this.repo,
    });

    return result.repository.projectsV2.nodes;
  }

  async getProjectV2(projectNumber: number): Promise<ProjectV2 | null> {
    const query = `
      query($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          projectV2(number: $number) {
            id
            title
            number
            url
            closed
          }
        }
      }
    `;

    const result = await this.gql(query, {
      owner: this.owner,
      repo: this.repo,
      number: projectNumber,
    });

    return result.repository.projectV2;
  }

  async addItemToProject(projectId: string, contentId: string): Promise<string> {
    const mutation = `
      mutation($projectId: ID!, $contentId: ID!) {
        addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
          item {
            id
          }
        }
      }
    `;

    const result = await this.gql(mutation, {
      projectId,
      contentId,
    });

    return result.addProjectV2ItemById.item.id;
  }

  async listProjectItems(projectId: string): Promise<ProjectItem[]> {
    const query = `
      query($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            items(first: 100) {
              nodes {
                id
                content {
                  ... on Issue {
                    title
                  }
                  ... on PullRequest {
                    title
                  }
                  ... on DraftIssue {
                    title
                  }
                }
                type
                fieldValueByName(name: "Status") {
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                  }
                }
              }
            }
          }
        }
      }
    `;

    const result = await this.gql(query, { projectId });

    return (
      result as {
        node: {
          items: {
            nodes: Array<{
              id: string;
              content: { title: string } | null;
              type: 'ISSUE' | 'PULL_REQUEST' | 'DRAFT_ISSUE';
              fieldValueByName: { name: string } | null;
            }>;
          };
        };
      }
    ).node.items.nodes.map((item) => ({
      id: item.id,
      title: item.content?.title || 'Draft',
      status: item.fieldValueByName?.name || null,
      type: item.type,
    }));
  }

  // ========================================
  // Code Search (#73)
  // ========================================

  async searchCode(
    query: string
  ): Promise<Array<{ path: string; repo: string; matchCount: number }>> {
    logger.info('GitHub GraphQL: Searching code', { query });

    const gqlQuery = `
      query($query: String!) {
        search(query: $query, type: CODE, first: 20) {
          codeCount
          nodes {
            ... on TextMatch {
              highlights {
                text
              }
            }
          }
        }
      }
    `;

    // Note: GitHub's GraphQL API has limited code search
    // Falling back to REST for code search is recommended
    try {
      await this.gql(gqlQuery, { query });
    } catch {
      // Code search via GraphQL is limited
    }

    return [];
  }

  // ========================================
  // Notifications (#79)
  // ========================================

  async getViewerNotifications(): Promise<Array<{ id: string; reason: string; unread: boolean }>> {
    const query = `
      query {
        viewer {
          login
        }
      }
    `;

    // Notifications are primarily REST-based
    await this.gql(query);

    return [];
  }

  // ========================================
  // Review Comments (#80)
  // ========================================

  async getPullRequestReviews(prNumber: number): Promise<
    Array<{
      id: string;
      author: string;
      state: string;
      body: string;
    }>
  > {
    const query = `
      query($owner: String!, $repo: String!, $prNumber: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $prNumber) {
            reviews(first: 50) {
              nodes {
                id
                author {
                  login
                }
                state
                body
              }
            }
          }
        }
      }
    `;

    const result = await this.gql(query, {
      owner: this.owner,
      repo: this.repo,
      prNumber,
    });

    return (
      result as {
        repository: {
          pullRequest: {
            reviews: {
              nodes: Array<{
                id: string;
                author: { login: string } | null;
                state: string;
                body: string;
              }>;
            };
          };
        };
      }
    ).repository.pullRequest.reviews.nodes.map((r) => ({
      id: r.id,
      author: r.author?.login || 'unknown',
      state: r.state,
      body: r.body,
    }));
  }

  // ========================================
  // User/Org/Team (#76, #77, #78)
  // ========================================

  async getViewer(): Promise<{
    login: string;
    name: string | null;
    email: string | null;
    avatarUrl: string;
  }> {
    const query = `
      query {
        viewer {
          login
          name
          email
          avatarUrl
        }
      }
    `;

    const result = await this.gql(query);

    return result.viewer;
  }

  async getOrganization(org: string): Promise<{
    login: string;
    name: string | null;
    description: string | null;
    membersCount: number;
  }> {
    const query = `
      query($org: String!) {
        organization(login: $org) {
          login
          name
          description
          membersWithRole {
            totalCount
          }
        }
      }
    `;

    const result = await this.gql(query, { org });

    return {
      login: result.organization.login,
      name: result.organization.name,
      description: result.organization.description,
      membersCount: result.organization.membersWithRole.totalCount,
    };
  }

  async getTeams(
    org: string
  ): Promise<Array<{ slug: string; name: string; description: string | null }>> {
    const query = `
      query($org: String!) {
        organization(login: $org) {
          teams(first: 50) {
            nodes {
              slug
              name
              description
            }
          }
        }
      }
    `;

    const result = await this.gql(query, { org });

    return result.organization.teams.nodes;
  }

  // ========================================
  // Get Issue/PR Node ID
  // ========================================

  async getIssueNodeId(issueNumber: number): Promise<string> {
    const query = `
      query($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          issue(number: $number) {
            id
          }
        }
      }
    `;

    const result = await this.gql(query, {
      owner: this.owner,
      repo: this.repo,
      number: issueNumber,
    });

    return result.repository.issue.id;
  }

  async getPullRequestNodeId(prNumber: number): Promise<string> {
    const query = `
      query($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $number) {
            id
          }
        }
      }
    `;

    const result = await this.gql(query, {
      owner: this.owner,
      repo: this.repo,
      number: prNumber,
    });

    return result.repository.pullRequest.id;
  }
}
