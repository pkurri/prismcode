/**
 * Version Control Integration Tests
 * Tests for Issue #139
 */

import { VersionControlManager } from '../../../src/advanced/version-control';

describe('VersionControlManager', () => {
  let manager: VersionControlManager;

  beforeEach(() => {
    manager = new VersionControlManager();
    manager.reset();
  });

  describe('addRepository', () => {
    it('should add repository', () => {
      const repo = manager.addRepository('my-app', 'https://github.com/user/app');

      expect(repo.id).toBeDefined();
      expect(repo.name).toBe('my-app');
      expect(repo.status).toBe('connected');
    });
  });

  describe('listRepositories', () => {
    it('should list all repositories', () => {
      manager.addRepository('repo1', 'url1');
      manager.addRepository('repo2', 'url2');

      const repos = manager.listRepositories();
      expect(repos.length).toBe(2);
    });
  });

  describe('recordCommit', () => {
    it('should record commit', () => {
      const repo = manager.addRepository('test', 'url');
      const commit = manager.recordCommit(repo.id, {
        message: 'Initial commit',
        author: 'test@example.com',
        date: new Date(),
        files: ['README.md'],
      });

      expect(commit).toBeDefined();
      expect(commit!.sha).toBeDefined();
    });
  });

  describe('getCommits', () => {
    it('should get commits for repo', () => {
      const repo = manager.addRepository('test', 'url');
      manager.recordCommit(repo.id, {
        message: 'Commit 1',
        author: 'test@example.com',
        date: new Date(),
        files: [],
      });

      const commits = manager.getCommits(repo.id);
      expect(commits.length).toBe(1);
    });
  });

  describe('branches', () => {
    it('should add branch', () => {
      const repo = manager.addRepository('test', 'url');
      const branch = manager.addBranch(repo.id, 'feature/new');

      expect(branch).toBeDefined();
      expect(branch!.name).toBe('feature/new');
    });

    it('should get branches', () => {
      const repo = manager.addRepository('test', 'url');
      manager.addBranch(repo.id, 'develop');

      const branches = manager.getBranches(repo.id);
      expect(branches.length).toBe(2); // main + develop
    });
  });

  describe('syncRepository', () => {
    it('should sync repository', () => {
      const repo = manager.addRepository('test', 'url');
      const result = manager.syncRepository(repo.id);

      expect(result).toBe(true);
      expect(manager.getRepository(repo.id)!.lastSync).toBeDefined();
    });
  });

  describe('removeRepository', () => {
    it('should remove repository', () => {
      const repo = manager.addRepository('test', 'url');
      manager.removeRepository(repo.id);

      expect(manager.listRepositories().length).toBe(0);
    });
  });
});
