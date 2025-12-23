/**
 * Tests for Security and Integration Features
 * Issues #216, #217, #207, #201
 */

import { SnykIntegration } from '../../src/advanced/snyk-integration';
import { SonarQubeIntegration } from '../../src/advanced/sonarqube-integration';
import { LinearIntegration } from '../../src/advanced/linear-integration';
import { VercelIntegration } from '../../src/advanced/vercel-integration';

describe('SnykIntegration', () => {
  let snyk: SnykIntegration;

  beforeEach(() => {
    snyk = new SnykIntegration();
    snyk.configure({
      apiToken: 'test-token',
      organizationId: 'org-123',
      severity: ['high', 'critical'],
      autoFix: true,
      blockOnCritical: true,
    });
  });

  describe('scanProject', () => {
    it('should scan and return vulnerabilities', async () => {
      const result = await snyk.scanProject('package.json');
      
      expect(result.id).toBeDefined();
      expect(result.totalVulnerabilities).toBeGreaterThanOrEqual(0);
      expect(result.bySeverity).toBeDefined();
    });

    it('should track scan history', async () => {
      await snyk.scanProject('package.json');
      const history = snyk.getScanHistory();
      
      expect(history.length).toBe(1);
    });
  });

  describe('shouldBlockPR', () => {
    it('should block on critical vulnerabilities', async () => {
      const result = await snyk.scanProject('package.json');
      result.bySeverity.critical = 1;
      
      const check = snyk.shouldBlockPR(result);
      expect(check.blocked).toBe(true);
    });

    it('should not block when no critical issues', async () => {
      const result = await snyk.scanProject('package.json');
      result.bySeverity.critical = 0;
      
      const check = snyk.shouldBlockPR(result);
      expect(check.blocked).toBe(false);
    });
  });

  describe('getFixSuggestions', () => {
    it('should return fix suggestions for vulnerabilities', async () => {
      const result = await snyk.scanProject('package.json');
      const suggestions = snyk.getFixSuggestions(result);
      
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('generateReport', () => {
    it('should generate markdown report', async () => {
      const result = await snyk.scanProject('package.json');
      const report = snyk.generateReport(result);
      
      expect(report).toContain('# Security Scan Report');
      expect(report).toContain('## Summary');
    });
  });
});

describe('SonarQubeIntegration', () => {
  let sonar: SonarQubeIntegration;

  beforeEach(() => {
    sonar = new SonarQubeIntegration();
    sonar.configure({
      serverUrl: 'https://sonarqube.example.com',
      token: 'test-token',
      projectKey: 'prismcode',
    });
  });

  describe('analyze', () => {
    it('should analyze project and return results', async () => {
      const result = await sonar.analyze('main');
      
      expect(result.status).toBeDefined();
      expect(result.coverage).toBeGreaterThanOrEqual(0);
      expect(result.rating).toBeDefined();
    });
  });

  describe('analyzePR', () => {
    it('should analyze PR and compare with base', async () => {
      const result = await sonar.analyzePR(123, 'main');
      
      expect(result.passed).toBeDefined();
      expect(typeof result.newIssues).toBe('number');
      expect(typeof result.coverageDiff).toBe('number');
    });
  });

  describe('checkQualityGate', () => {
    it('should pass when all conditions met', async () => {
      const analysis = await sonar.analyze();
      const check = sonar.checkQualityGate(analysis);
      
      expect(check.passed).toBe(true);
    });
  });

  describe('generatePRComment', () => {
    it('should generate PR comment markdown', async () => {
      const prResult = await sonar.analyzePR(123, 'main');
      const comment = sonar.generatePRComment(prResult);
      
      expect(comment).toContain('SonarQube Quality Gate');
      expect(comment).toContain('New Issues');
    });
  });
});

describe('LinearIntegration', () => {
  let linear: LinearIntegration;

  beforeEach(() => {
    linear = new LinearIntegration();
    linear.configure({
      apiKey: 'test-api-key',
      teamId: 'team-123',
      syncEnabled: true,
    });
  });

  describe('testConnection', () => {
    it('should test connection successfully', async () => {
      const result = await linear.testConnection();
      expect(result).toBe(true);
    });
  });

  describe('createIssue', () => {
    it('should create issue in Linear', async () => {
      const issue = await linear.createIssue({
        title: 'Test Issue',
        description: 'Test description',
        priority: 2,
      });
      
      expect(issue.id).toBeDefined();
      expect(issue.title).toBe('Test Issue');
      expect(issue.identifier).toMatch(/^PRISM-\d+$/);
    });
  });

  describe('updateIssueState', () => {
    it('should update issue state', async () => {
      const issue = await linear.createIssue({ title: 'Test' });
      const updated = await linear.updateIssueState(issue.id, 'started');
      
      expect(updated?.state.type).toBe('started');
    });
  });

  describe('syncFromGitHub', () => {
    it('should sync GitHub issues to Linear', async () => {
      const result = await linear.syncFromGitHub([
        { title: 'GH Issue 1', body: 'Body', labels: ['bug'], state: 'open' },
        { title: 'GH Issue 2', body: 'Body 2', labels: ['feature'], state: 'open' },
      ]);
      
      expect(result.created).toBe(2);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('getProjects', () => {
    it('should return projects', async () => {
      const projects = await linear.getProjects();
      expect(projects.length).toBeGreaterThan(0);
    });
  });
});

describe('VercelIntegration', () => {
  let vercel: VercelIntegration;

  beforeEach(() => {
    vercel = new VercelIntegration();
    vercel.configure({
      token: 'test-token',
      teamId: 'team-123',
    });
  });

  describe('detectFramework', () => {
    it('should detect Next.js', () => {
      const result = vercel.detectFramework({
        dependencies: { next: '14.0.0', react: '18.0.0' },
      });
      
      expect(result.framework).toBe('nextjs');
      expect(result.outputDirectory).toBe('.next');
    });

    it('should detect Vite', () => {
      const result = vercel.detectFramework({
        dependencies: { vite: '5.0.0' },
      });
      
      expect(result.framework).toBe('vite');
    });

    it('should detect Vue', () => {
      const result = vercel.detectFramework({
        dependencies: { vue: '3.0.0' },
      });
      
      expect(result.framework).toBe('vue');
    });
  });

  describe('createProject', () => {
    it('should create Vercel project', async () => {
      const project = await vercel.createProject('my-app', 'https://github.com/user/repo');
      
      expect(project.id).toBeDefined();
      expect(project.name).toBe('my-app');
      expect(project.publicUrl).toContain('vercel.app');
    });
  });

  describe('deploy', () => {
    it('should deploy to preview', async () => {
      const result = await vercel.deploy({ target: 'preview' });
      
      expect(result.deployment.state).toBe('READY');
      expect(result.previewUrl).toContain('vercel.app');
      expect(result.logs.length).toBeGreaterThan(0);
    });

    it('should deploy to production', async () => {
      const result = await vercel.deploy({ target: 'production' });
      
      expect(result.deployment.target).toBe('production');
      expect(result.productionUrl).toBeDefined();
    });
  });

  describe('rollback', () => {
    it('should rollback to previous deployment', async () => {
      const deployment = await vercel.deploy({ target: 'production' });
      const rollback = await vercel.rollback(deployment.deployment.id);
      
      expect(rollback.state).toBe('READY');
      expect(rollback.target).toBe('production');
    });
  });

  describe('getDeploymentLogs', () => {
    it('should return deployment logs', async () => {
      const deployment = await vercel.deploy({});
      const logs = await vercel.getDeploymentLogs(deployment.deployment.id);
      
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('cancelDeployment', () => {
    it('should return false for completed deployment', async () => {
      const deployment = await vercel.deploy({});
      const canceled = await vercel.cancelDeployment(deployment.deployment.id);
      
      expect(canceled).toBe(false); // Already READY
    });
  });
});
