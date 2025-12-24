/**
 * Jira Integration Tests
 * Issue #208: Jira Cloud Integration
 */

import {
  JiraIntegration,
  jiraIntegration,
} from '../../../src/advanced/jira-integration';

describe('JiraIntegration', () => {
  let jira: JiraIntegration;

  beforeEach(() => {
    jira = new JiraIntegration();
  });

  afterEach(() => {
    jira.reset();
  });

  describe('configuration', () => {
    it('should configure Jira connection', () => {
      jira.configure({
        cloudId: 'cloud123',
        accessToken: 'token123',
        projectKey: 'PRISM',
        defaultIssueType: 'Story',
      });

      // Should not throw
      expect(jira).toBeDefined();
    });

    it('should test connection successfully when configured', async () => {
      jira.configure({
        cloudId: 'cloud123',
        accessToken: 'token123',
        projectKey: 'PRISM',
        defaultIssueType: 'Story',
      });

      const result = await jira.testConnection();
      expect(result).toBe(true);
    });

    it('should fail connection test when not configured', async () => {
      const result = await jira.testConnection();
      expect(result).toBe(false);
    });
  });

  describe('issue operations', () => {
    beforeEach(() => {
      jira.configure({
        cloudId: 'cloud123',
        accessToken: 'token123',
        projectKey: 'PRISM',
        defaultIssueType: 'Story',
      });
    });

    it('should fetch issues from Jira', async () => {
      const issues = await jira.fetchIssues();

      expect(issues).toBeInstanceOf(Array);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].key).toBeDefined();
    });

    it('should create issue in Jira', () => {
      const issue = jira.createIssue({
        summary: 'Test Issue',
        description: 'Test description',
      });

      expect(issue.key).toBeDefined();
      expect(issue.summary).toBe('Test Issue');
      expect(issue.status.category).toBe('todo');
    });

    it('should transition issue status', () => {
      const issue = jira.createIssue({ summary: 'Test Issue' });
      const updated = jira.transitionIssue(issue.key, 'In Progress');

      expect(updated).toBeDefined();
      expect(updated?.status.name).toBe('In Progress');
    });

    it('should return null for non-existent issue transition', () => {
      const result = jira.transitionIssue('FAKE-999', 'Done');
      expect(result).toBeNull();
    });
  });

  describe('sprint management', () => {
    it('should get sprints', () => {
      const sprints = jira.getSprints();

      expect(sprints).toBeInstanceOf(Array);
      expect(sprints.length).toBeGreaterThan(0);
      expect(sprints[0].name).toBeDefined();
      expect(sprints[0].state).toBeDefined();
    });

    it('should include active sprint', () => {
      const sprints = jira.getSprints();
      const active = sprints.find(s => s.state === 'active');
      expect(active).toBeDefined();
    });
  });

  describe('GitHub sync', () => {
    beforeEach(() => {
      jira.configure({
        cloudId: 'cloud123',
        accessToken: 'token123',
        projectKey: 'PRISM',
        defaultIssueType: 'Story',
      });
    });

    it('should sync issues from GitHub', () => {
      const result = jira.syncFromGitHub([
        { title: 'Issue 1', body: 'Body 1', labels: ['bug'], state: 'open' },
        { title: 'Issue 2', body: 'Body 2', labels: ['feature'], state: 'closed' },
      ]);

      expect(result.created).toBe(2);
      expect(result.errors.length).toBe(0);
      expect(result.syncedAt).toBeInstanceOf(Date);
    });

    it('should return errors when not configured', () => {
      jira.reset();
      const result = jira.syncFromGitHub([{ title: 'Test', body: 'Test', labels: [], state: 'open' }]);

      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('custom fields', () => {
    it('should get custom field mapping', () => {
      const mapping = jira.getCustomFieldMapping();

      expect(mapping).toBeDefined();
      expect(typeof mapping).toBe('object');
    });
  });

  describe('singleton instance', () => {
    it('should export singleton instance', () => {
      expect(jiraIntegration).toBeInstanceOf(JiraIntegration);
    });
  });
});
