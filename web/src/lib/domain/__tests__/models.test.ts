import { createProject, createWorkspace } from '../models';

describe('Domain Models', () => {
  describe('createProject', () => {
    it('creates project with required fields', () => {
      const repo = { provider: 'github' as const, url: 'https://github.com/test/repo', branch: 'main' };
      const project = createProject('ws-1', 'Test Project', repo);
      expect(project.name).toBe('Test Project');
      expect(project.workspaceId).toBe('ws-1');
      expect(project.repository.url).toBe('https://github.com/test/repo');
      expect(project.settings.autoFix).toBe(true);
      expect(project.settings.coverageThreshold).toBe(80);
    });

    it('creates project with default stack', () => {
      const repo = { provider: 'github' as const, url: 'url', branch: 'main' };
      const project = createProject('ws-1', 'Project', repo);
      expect(project.stack.language).toBe('typescript');
    });
  });

  describe('createWorkspace', () => {
    it('creates workspace with owner as member', () => {
      const workspace = createWorkspace('My Workspace', 'user-1');
      expect(workspace.name).toBe('My Workspace');
      expect(workspace.owner).toBe('user-1');
      expect(workspace.members).toHaveLength(1);
      expect(workspace.members[0].role).toBe('owner');
    });

    it('creates workspace with default settings', () => {
      const workspace = createWorkspace('Workspace', 'user-1');
      expect(workspace.settings.defaultBranch).toBe('main');
      expect(workspace.settings.ciEnabled).toBe(true);
    });
  });
});
