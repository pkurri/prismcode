/**
 * GitHub GraphQL API Service
 * Provides GraphQL client for advanced GitHub operations
 *
 * Issue #68
 */

import { graphql } from '@octokit/graphql';
import logger from '../utils/logger';

export interface GitHubGraphQLConfig {
  token?: string;
}

/**
 * GitHub GraphQL Service
 */
export class GitHubGraphQLService {
  private graphqlClient: typeof graphql;

  constructor(config: GitHubGraphQLConfig = {}) {
    this.graphqlClient = graphql.defaults({
      headers: {
        authorization: `token ${config.token || process.env.GITHUB_TOKEN}`,
      },
    });
  }

  /**
   * Execute a GraphQL query
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> {
    try {
      logger.debug('Executing GraphQL query', { query, variables });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      const result = await this.graphqlClient<T>(query, variables);
      return result;
    } catch (error) {
      logger.error('GraphQL query failed', { error, query });
      throw error;
    }
  }

  /**
   * Get repository information with GraphQL
   */
  async getRepository(owner: string, name: string) {
    const query = `
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          id
          name
          description
          url
          stargazerCount
          forkCount
          isPrivate
          defaultBranchRef {
            name
          }
          issues(first: 5, states: OPEN) {
            totalCount
            nodes {
              number
              title
              state
            }
          }
          pullRequests(first: 5, states: OPEN) {
            totalCount
            nodes {
              number
              title
              state
            }
          }
        }
      }
    `;

    return await this.query(query, { owner, name });
  }

  /**
   * Get issues with GraphQL pagination
   */
  async getIssues(
    owner: string,
    repo: string,
    options: {
      first?: number;
      after?: string;
      states?: string[];
      labels?: string[];
    } = {}
  ) {
    const { first = 20, after, states = ['OPEN'], labels } = options;

    const query = `
      query($owner: String!, $repo: String!, $first: Int!, $after: String, $states: [IssueState!], $labels: [String!]) {
        repository(owner: $owner, name: $repo) {
          issues(first: $first, after: $after, states: $states, labels: $labels) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              number
              title
              body
              state
              createdAt
              updatedAt
              author {
                login
              }
              labels(first: 10) {
                nodes {
                  name
                }
              }
            }
          }
        }
      }
    `;

    return await this.query(query, { owner, repo, first, after, states, labels });
  }

  /**
   * Create issue using GraphQL mutation
   */
  async createIssue(repositoryId: string, title: string, body?: string, labelIds?: string[]) {
    const mutation = `
      mutation($repositoryId: ID!, $title: String!, $body: String, $labelIds: [ID!]) {
        createIssue(input: {
          repositoryId: $repositoryId,
          title: $title,
          body: $body,
          labelIds: $labelIds
        }) {
          issue {
            id
            number
            title
            url
          }
        }
      }
    `;

    return await this.query(mutation, { repositoryId, title, body, labelIds });
  }

  /**
   * Update issue state
   */
  async updateIssueState(issueId: string, state: 'OPEN' | 'CLOSED') {
    const mutation = `
      mutation($issueId: ID!, $state: IssueState!) {
        updateIssue(input: {
          id: $issueId,
          state: $state
        }) {
          issue {
            id
            number
            state
          }
        }
      }
    `;

    return await this.query(mutation, { issueId, state });
  }

  /**
   * Add comment to issue
   */
  async addComment(subjectId: string, body: string) {
    const mutation = `
      mutation($subjectId: ID!, $body: String!) {
        addComment(input: {
          subjectId: $subjectId,
          body: $body
        }) {
          commentEdge {
            node {
              id
              body
              createdAt
            }
          }
        }
      }
    `;

    return await this.query(mutation, { subjectId, body });
  }

  /**
   * Search issues across repositories
   */
  async searchIssues(searchQuery: string, first: number = 20) {
    const query = `
      query($searchQuery: String!, $first: Int!) {
        search(query: $searchQuery, type: ISSUE, first: $first) {
          issueCount
          edges {
            node {
              ... on Issue {
                number
                title
                state
                repository {
                  nameWithOwner
                }
              }
            }
          }
        }
      }
    `;

    return await this.query(query, { searchQuery, first });
  }

  /**
   * Get pull request details
   */
  async getPullRequest(owner: string, repo: string, number: number) {
    const query = `
      query($owner: String!, $repo: String!, $number: Int!) {
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $number) {
            id
            number
            title
            body
            state
            author {
              login
            }
            commits(last: 1) {
              nodes {
                commit {
                  oid
                  message
                }
              }
            }
            reviews(first: 10) {
              totalCount
              nodes {
                state
                author {
                  login
                }
              }
            }
          }
        }
      }
    `;

    return await this.query(query, { owner, repo, number });
  }

  /**
   * Get user information
   */
  async getUser(login: string) {
    const query = `
      query($login: String!) {
        user(login: $login) {
          id
          login
          name
          email
          bio
          company
          location
          repositories(first: 5) {
            totalCount
          }
          followers {
            totalCount
          }
        }
      }
    `;

    return await this.query(query, { login });
  }
}

// Export singleton instance
export const githubGraphQL = new GitHubGraphQLService();
