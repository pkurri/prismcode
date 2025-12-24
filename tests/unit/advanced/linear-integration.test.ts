/**
 * Linear Integration Tests
 * Issue #207: Linear OAuth & API Integration
 */

import {
  LinearIntegration,
  linearIntegration,
} from '../../../src/advanced/linear-integration';

describe('LinearIntegration', () => {
  let linear: LinearIntegration;

  beforeEach(() => {
    linear = new LinearIntegration();
  });

  afterEach(() => {
    linear.reset();
  });

  describe('configuration', () => {
    it('should configure Linear connection', () => {
      linear.configure({
        apiKey: 'lin_api_key',
        teamId: 'team123',
        syncEnabled: true,
      });

      expect(linear).toBeDefined();
    });

    it('should test connection successfully when configured', async () => {
      linear.configure({
        apiKey: 'lin_api_key',
        teamId: 'team123',
        syncEnabled: true,
      });

      const result = await linear.testConnection();
      expect(result).toBe(true);
    });

    it('should fail connection test when not configured', async () => {
      const result = await linear.testConnection();
      expect(result).toBe(false);
    });
  });

  describe('issue operations', () => {
    beforeEach(() => {
      linear.configure({
        apiKey: 'lin_api_key',
        teamId: 'team123',
        syncEnabled: true,
      });
    });

    it('should fetch issues from Linear', async () => {
      const issues = await linear.fetchIssues();

      expect(issues).toBeInstanceOf(Array);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].identifier).toBeDefined();
    });

    it('should create issue in Linear', () => {
      const issue = linear.createIssue({
        title: 'Test Linear Issue',
        description: 'Test description',
      });

      expect(issue.identifier).toBeDefined();
      expect(issue.title).toBe('Test Linear Issue');
      expect(issue.state).toBeDefined();
    });

    it('should update issue in Linear', () => {
      const issue = linear.createIssue({ title: 'Original Title' });
      const updated = linear.updateIssue(issue.id, { title: 'Updated Title' });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated Title');
    });

    it('should update issue state', () => {
      const issue = linear.createIssue({ title: 'Test Issue' });
      const updated = linear.updateIssueState(issue.id, 'started');

      expect(updated).toBeDefined();
      expect(updated?.state.type).toBe('started');
    });

    it('should get issue by ID', () => {
      const issue = linear.createIssue({ title: 'Test Issue' });
      const fetched = linear.getIssue(issue.id);

      expect(fetched).toBeDefined();
      expect(fetched?.id).toBe(issue.id);
    });
  });

  describe('project management', () => {
    it('should get projects', () => {
      linear.configure({
        apiKey: 'lin_api_key',
        teamId: 'team123',
        syncEnabled: true,
      });

      const projects = linear.getProjects();
      expect(projects).toBeInstanceOf(Array);
      expect(projects.length).toBeGreaterThan(0);
    });
  });

  describe('GitHub sync', () => {
    beforeEach(() => {
      linear.configure({
        apiKey: 'lin_api_key',
        teamId: 'team123',
        syncEnabled: true,
      });
    });

    it('should sync issues from GitHub', () => {
      const result = linear.syncFromGitHub([
        { title: 'Issue 1', body: 'Body 1', labels: ['bug'], state: 'open' },
        { title: 'Issue 2', body: 'Body 2', labels: ['feature'], state: 'closed' },
      ]);

      expect(result.created).toBe(2);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('sync status', () => {
    it('should get sync status', () => {
      linear.configure({
        apiKey: 'lin_api_key',
        teamId: 'team123',
        syncEnabled: true,
      });

      const status = linear.getSyncStatus();
      expect(status.issueCount).toBeDefined();
    });
  });

  describe('singleton instance', () => {
    it('should export singleton instance', () => {
      expect(linearIntegration).toBeInstanceOf(LinearIntegration);
    });
  });
});
