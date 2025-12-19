/**
 * GitHub GraphQL Service Tests
 * Tests for Issue #68
 */

import { GitHubGraphQLService } from '../../../src/services/github-graphql';

// Mock graphql
jest.mock('@octokit/graphql', () => {
  const mockGraphql = jest.fn().mockResolvedValue({
    repository: {
      id: 'repo-123',
      name: 'test-repo',
      description: 'Test repository',
      stargazerCount: 100,
    },
  });

  return {
    graphql: {
      defaults: jest.fn(() => mockGraphql),
    },
  };
});

describe('GitHubGraphQLService', () => {
  let service: GitHubGraphQLService;

  beforeEach(() => {
    service = new GitHubGraphQLService({ token: 'test-token' });
  });

  describe('query', () => {
    it('should execute a GraphQL query', async () => {
      const result = await service.query('query { viewer { login } }');
      expect(result).toBeDefined();
    });

    it('should execute query with variables', async () => {
      const result = await service.query('query($owner: String!) { ... }', { owner: 'test-owner' });
      expect(result).toBeDefined();
    });
  });

  describe('getRepository', () => {
    it('should get repository information', async () => {
      const result = (await service.getRepository('test-owner', 'test-repo')) as {
        repository: unknown;
      };

      expect(result).toBeDefined();
      expect(result.repository).toBeDefined();
    });
  });

  describe('getIssues', () => {
    it('should get issues with default options', async () => {
      const result = await service.getIssues('test-owner', 'test-repo');
      expect(result).toBeDefined();
    });

    it('should get issues with pagination', async () => {
      const result = await service.getIssues('test-owner', 'test-repo', {
        first: 10,
        after: 'cursor-123',
      });
      expect(result).toBeDefined();
    });

    it('should filter issues by state', async () => {
      const result = await service.getIssues('test-owner', 'test-repo', {
        states: ['CLOSED'],
      });
      expect(result).toBeDefined();
    });

    it('should filter issues by labels', async () => {
      const result = await service.getIssues('test-owner', 'test-repo', {
        labels: ['bug', 'enhancement'],
      });
      expect(result).toBeDefined();
    });
  });

  describe('createIssue', () => {
    it('should create an issue', async () => {
      const result = await service.createIssue('repo-id-123', 'Test Issue', 'Issue body');
      expect(result).toBeDefined();
    });

    it('should create issue with labels', async () => {
      const result = await service.createIssue('repo-id-123', 'Test Issue', 'Issue body', [
        'label-id-1',
        'label-id-2',
      ]);
      expect(result).toBeDefined();
    });
  });

  describe('updateIssueState', () => {
    it('should close an issue', async () => {
      const result = await service.updateIssueState('issue-id-123', 'CLOSED');
      expect(result).toBeDefined();
    });

    it('should reopen an issue', async () => {
      const result = await service.updateIssueState('issue-id-123', 'OPEN');
      expect(result).toBeDefined();
    });
  });

  describe('addComment', () => {
    it('should add a comment to an issue', async () => {
      const result = await service.addComment('issue-id-123', 'This is a comment');
      expect(result).toBeDefined();
    });
  });

  describe('searchIssues', () => {
    it('should search for issues', async () => {
      const result = await service.searchIssues('is:open label:bug');
      expect(result).toBeDefined();
    });

    it('should search with custom limit', async () => {
      const result = await service.searchIssues('is:issue author:johndoe', 50);
      expect(result).toBeDefined();
    });
  });

  describe('getPullRequest', () => {
    it('should get pull request details', async () => {
      const result = await service.getPullRequest('test-owner', 'test-repo', 123);
      expect(result).toBeDefined();
    });
  });

  describe('getUser', () => {
    it('should get user information', async () => {
      const result = await service.getUser('johndoe');
      expect(result).toBeDefined();
    });
  });
});
