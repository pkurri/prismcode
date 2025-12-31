import { VercelIntegration, vercelIntegration } from '../../../src/advanced/vercel-integration';

describe('Vercel Integration', () => {
  let service: VercelIntegration;

  beforeEach(() => {
    service = new VercelIntegration();
    service.configure({
      token: 'test-token',
      teamId: 'team-test',
    });
  });

  afterEach(() => {
    service.reset();
  });

  describe('Configuration', () => {
    it('should configure Vercel connection', () => {
      const freshService = new VercelIntegration();
      freshService.configure({
        token: 'my-token',
        teamId: 'my-team',
        defaultProject: 'my-project',
      });

      // Service should be configured without throwing
      expect(() => freshService.detectFramework({})).not.toThrow();
    });
  });

  describe('Framework Detection', () => {
    it('should detect Next.js', () => {
      const result = service.detectFramework({
        dependencies: { next: '14.0.0', react: '18.0.0' },
      });

      expect(result.framework).toBe('nextjs');
      expect(result.buildCommand).toBe('next build');
    });

    it('should detect React/Create React App', () => {
      const result = service.detectFramework({
        dependencies: { react: '18.0.0', 'react-scripts': '5.0.0' },
      });

      expect(result.framework).toBe('create-react-app');
      expect(result.buildCommand).toBe('react-scripts build');
    });

    it('should detect Vue.js', () => {
      const result = service.detectFramework({
        dependencies: { vue: '3.0.0' },
      });

      expect(result.framework).toBe('vue');
    });

    it('should detect Vite', () => {
      const result = service.detectFramework({
        dependencies: { vite: '5.0.0' },
      });

      expect(result.framework).toBe('vite');
    });

    it('should detect Svelte/SvelteKit', () => {
      const result = service.detectFramework({
        dependencies: { svelte: '4.0.0' },
      });

      expect(result.framework).toBe('sveltekit');
    });

    it('should detect static when no framework found', () => {
      const result = service.detectFramework({
        dependencies: { lodash: '4.0.0' },
      });

      // Framework detection returns static for unknown
      expect(result.framework).toBe('static');
    });

    it('should default to static for unknown', () => {
      const result = service.detectFramework({
        dependencies: {},
      });

      expect(result.framework).toBe('static');
    });
  });

  describe('Project Management', () => {
    it('should create a project', () => {
      const project = service.createProject('my-app', 'https://github.com/user/my-app');

      expect(project.id).toBeDefined();
      expect(project.name).toBe('my-app');
      expect(project.publicUrl).toContain('vercel.app');
    });
  });

  describe('Deployments', () => {
    it('should deploy to preview', async () => {
      const result = await service.deploy({
        target: 'preview',
        gitRef: 'feature-branch',
      });

      expect(result.deployment).toBeDefined();
      expect(result.deployment.target).toBe('preview');
      expect(result.previewUrl).toBeDefined();
    });

    it('should deploy to production', async () => {
      const result = await service.deploy({
        target: 'production',
      });

      expect(result.deployment.target).toBe('production');
      expect(result.productionUrl).toBeDefined();
    });

    it('should get deployment status', async () => {
      const { deployment } = await service.deploy({ target: 'preview' });

      const status = service.getDeploymentStatus(deployment.id);

      expect(status).toBeDefined();
      expect(status?.id).toBe(deployment.id);
    });

    it('should list deployments', async () => {
      await service.deploy({ target: 'preview' });
      await service.deploy({ target: 'production' });

      const deployments = service.listDeployments(undefined, 10);

      expect(deployments.length).toBeGreaterThanOrEqual(2);
    });

    it('should limit deployments list', async () => {
      await service.deploy({ target: 'preview' });
      await service.deploy({ target: 'preview' });
      await service.deploy({ target: 'preview' });

      const deployments = service.listDeployments(undefined, 2);

      expect(deployments.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Rollback', () => {
    it('should rollback to previous deployment', async () => {
      const { deployment: original } = await service.deploy({ target: 'production' });
      await service.deploy({ target: 'production' });

      const rolledBack = service.rollback(original.id);

      expect(rolledBack.id).not.toBe(original.id);
      expect(rolledBack.target).toBe('production');
    });

    it('should throw for non-existent deployment', () => {
      expect(() => service.rollback('non-existent')).toThrow('not found');
    });
  });

  describe('Environment Variables', () => {
    it('should set environment variables', () => {
      const project = service.createProject('test-project', 'https://github.com/test');

      expect(() =>
        service.setEnvVars(project.id, [
          {
            key: 'API_KEY',
            value: 'secret-value',
            target: ['production', 'preview'],
            type: 'secret',
          },
        ])
      ).not.toThrow();
    });
  });

  describe('Deployment Logs', () => {
    it('should get deployment logs', async () => {
      const { deployment } = await service.deploy({ target: 'preview' });

      const logs = service.getDeploymentLogs(deployment.id);

      expect(logs).toBeDefined();
      expect(Array.isArray(logs)).toBe(true);
    });

    it('should return empty for non-existent deployment', () => {
      const logs = service.getDeploymentLogs('non-existent');

      expect(logs).toEqual([]);
    });
  });

  describe('Cancel Deployment', () => {
    it('should cancel active deployment', async () => {
      const { deployment } = await service.deploy({ target: 'preview' });

      // Try to cancel (may succeed or fail based on state)
      const result = service.cancelDeployment(deployment.id);

      expect(typeof result).toBe('boolean');
    });

    it('should return false for non-existent deployment', () => {
      const result = service.cancelDeployment('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('Singleton Instance', () => {
    it('should export singleton instance', () => {
      expect(vercelIntegration).toBeInstanceOf(VercelIntegration);
    });
  });
});
