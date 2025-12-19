/**
 * Multi-Repo Management Tests
 * Tests for Issue #118
 */

import { MultiRepoManager } from '../../../src/advanced/multi-repo';

describe('MultiRepoManager', () => {
  let manager: MultiRepoManager;

  beforeEach(() => {
    manager = new MultiRepoManager();
    manager.reset();
  });

  describe('addRepo', () => {
    it('should add repository', () => {
      const repo = manager.addRepo(
        'frontend',
        '/path/to/frontend',
        'git@github.com:user/frontend.git'
      );

      expect(repo.id).toBeDefined();
      expect(repo.name).toBe('frontend');
      expect(repo.isActive).toBe(true);
    });
  });

  describe('listRepos', () => {
    it('should list all repos', () => {
      manager.addRepo('repo1', '/path1', 'url1');
      manager.addRepo('repo2', '/path2', 'url2');

      const repos = manager.listRepos();
      expect(repos.length).toBe(2);
    });

    it('should filter by group', () => {
      manager.addRepo('repo1', '/path1', 'url1', 'frontend');
      manager.addRepo('repo2', '/path2', 'url2', 'backend');

      const frontend = manager.listRepos('frontend');
      expect(frontend.length).toBe(1);
    });
  });

  describe('groups', () => {
    it('should create group', () => {
      const group = manager.createGroup('services', 'Services', '#FF0000');

      expect(group.id).toBe('services');
      expect(group.color).toBe('#FF0000');
    });

    it('should list groups', () => {
      manager.addRepo('repo1', '/path', 'url', 'group1');
      manager.addRepo('repo2', '/path', 'url', 'group2');

      const groups = manager.getGroups();
      expect(groups.length).toBe(2);
    });
  });

  describe('crossRepoChange', () => {
    it('should create cross-repo change', () => {
      const repo1 = manager.addRepo('repo1', '/path1', 'url1');
      const repo2 = manager.addRepo('repo2', '/path2', 'url2');

      const change = manager.createCrossRepoChange('Update dependencies', [repo1.id, repo2.id]);

      expect(change.id).toBeDefined();
      expect(change.repos.length).toBe(2);
      expect(change.status).toBe('pending');
    });

    it('should execute cross-repo change', () => {
      const repo = manager.addRepo('repo', '/path', 'url');
      const change = manager.createCrossRepoChange('Change', [repo.id]);

      const result = manager.executeCrossRepoChange(change.id);
      expect(result).toBe(true);
    });
  });

  describe('syncAll', () => {
    it('should sync all repositories', () => {
      manager.addRepo('repo1', '/path1', 'url1');
      manager.addRepo('repo2', '/path2', 'url2');

      const result = manager.syncAll();
      expect(result.synced).toBe(2);
      expect(result.failed).toBe(0);
    });
  });

  describe('removeRepo', () => {
    it('should remove repository', () => {
      const repo = manager.addRepo('test', '/path', 'url');
      manager.removeRepo(repo.id);

      expect(manager.listRepos().length).toBe(0);
    });
  });
});
