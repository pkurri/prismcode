import { selfHealingCICD } from '../../../src/advanced/self-healing-cicd';

describe('SelfHealingCICD', () => {
  describe('startRun', () => {
    it('should start a new pipeline run', () => {
      const run = selfHealingCICD.startRun('build', ['install', 'test', 'build']);

      expect(run.id).toBeDefined();
      expect(run.status).toBe('pending');
      expect(run.stages.length).toBe(3);
    });
  });

  describe('reportFailure', () => {
    it('should detect dependency issues', async () => {
      const run = selfHealingCICD.startRun('test-pipeline', ['install', 'test']);
      const attempt = await selfHealingCICD.reportFailure(run.id, 'install', 'npm install failed');

      expect(attempt).not.toBeNull();
      expect(attempt?.issue.type).toBe('dependency-install');
    });

    it('should detect auth issues', async () => {
      const run = selfHealingCICD.startRun('deploy', ['auth', 'deploy']);
      const attempt = await selfHealingCICD.reportFailure(run.id, 'auth', 'Token expired');

      expect(attempt?.issue.type).toBe('auth-expired');
    });

    it('should attempt healing', async () => {
      const run = selfHealingCICD.startRun('healing-test', ['test']);
      const attempt = await selfHealingCICD.reportFailure(run.id, 'test', 'Flaky test failure');

      expect(attempt?.action.automated).toBe(true);
    });
  });

  describe('getRunStatus', () => {
    it('should return run status', () => {
      const run = selfHealingCICD.startRun('status-test', ['step1']);
      const status = selfHealingCICD.getRunStatus(run.id);

      expect(status?.id).toBe(run.id);
    });

    it('should return null for unknown run', () => {
      const status = selfHealingCICD.getRunStatus('unknown');
      expect(status).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return healing statistics', () => {
      const stats = selfHealingCICD.getStats();

      expect(typeof stats.totalRuns).toBe('number');
      expect(typeof stats.healingRate).toBe('number');
    });
  });
});
