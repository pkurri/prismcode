/**
 * GitHub REST Service Tests
 * Tests for Issue #67
 */

import { GitHubRestService } from '../../../src/services/github-rest';

// Mock Octokit
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      issues: {
        create: jest.fn().mockResolvedValue({ data: { number: 123 } }),
        update: jest.fn().mockResolvedValue({ data: {} }),
        get: jest.fn().mockResolvedValue({
          data: {
            number: 123,
            title: 'Test Issue',
            body: 'Test body',
            state: 'open',
          },
        }),
        createComment: jest.fn().mockResolvedValue({ data: {} }),
        addLabels: jest.fn().mockResolvedValue({ data: {} }),
        listForRepo: jest.fn().mockResolvedValue({
          data: [
            { number: 1, title: 'Issue 1' },
            { number: 2, title: 'Issue 2' },
          ],
        }),
      },
      pulls: {
        create: jest.fn().mockResolvedValue({ data: { number: 456 } }),
      },
      repos: {
        get: jest.fn().mockResolvedValue({
          data: {
            name: 'test-repo',
            full_name: 'test-owner/test-repo',
          },
        }),
      },
    })),
  };
});

describe('GitHubRestService', () => {
  let service: GitHubRestService;

  beforeEach(() => {
    service = new GitHubRestService({
      token: 'test-token',
      owner: 'test-owner',
      repo: 'test-repo',
    });
  });

  describe('createIssue', () => {
    it('should create an issue and return issue number', async () => {
      const result = await service.createIssue({
        title: 'Test Issue',
        body: 'Test body',
        labels: ['bug'],
      });

      expect(result).toBe(123);
    });

    it('should handle labels and assignees', async () => {
      const result = await service.createIssue({
        title: 'Test Issue',
        body: 'Test body',
        labels: ['bug', 'feature'],
        assignees: ['johndoe'],
      });

      expect(result).toBe(123);
    });
  });

  describe('updateIssue', () => {
    it('should update an issue', async () => {
      await expect(
        service.updateIssue(123, {
          title: 'Updated Title',
          state: 'closed',
        })
      ).resolves.not.toThrow();
    });

    it('should update issue labels', async () => {
      await expect(
        service.updateIssue(123, {
          labels: ['enhancement'],
        })
      ).resolves.not.toThrow();
    });
  });

  describe('getIssue', () => {
    it('should retrieve issue details', async () => {
      const issue = await service.getIssue(123);

      expect(issue).toBeDefined();
      expect(issue.number).toBe(123);
      expect(issue.title).toBe('Test Issue');
    });
  });

  describe('closeIssue', () => {
    it('should close an issue', async () => {
      await expect(service.closeIssue(123)).resolves.not.toThrow();
    });

    it('should close issue with comment', async () => {
      await expect(
        service.closeIssue(123, 'Closing this issue')
      ).resolves.not.toThrow();
    });
  });

  describe('addComment', () => {
    it('should add a comment to an issue', async () => {
      await expect(
        service.addComment(123, 'This is a comment')
      ).resolves.not.toThrow();
    });
  });

  describe('addLabels', () => {
    it('should add labels to an issue', async () => {
      await expect(
        service.addLabels(123, ['bug', 'critical'])
      ).resolves.not.toThrow();
    });
  });

  describe('createPullRequest', () => {
    it('should create a pull request', async () => {
      const result = await service.createPullRequest({
        title: 'Test PR',
        body: 'PR body',
        head: 'feature-branch',
        base: 'main',
      });

      expect(result).toBe(456);
    });
  });

  describe('getRepository', () => {
    it('should get repository information', async () => {
      const repo = await service.getRepository();

      expect(repo).toBeDefined();
      expect(repo.name).toBe('test-repo');
    });
  });

  describe('listIssues', () => {
    it('should list repository issues', async () => {
      const issues = await service.listIssues();

      expect(issues).toBeDefined();
      expect(Array.isArray(issues)).toBe(true);
      expect(issues.length).toBe(2);
    });

    it('should list issues with filters', async () => {
      const issues = await service.listIssues({
        state: 'closed',
        labels: 'bug',
        per_page: 10,
      });

      expect(issues).toBeDefined();
    });
  });
});
