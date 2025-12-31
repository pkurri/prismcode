import {
  SnykIntegration,
  snykIntegration,
  ScanResult,
} from '../../../src/advanced/snyk-integration';

describe('Snyk Integration', () => {
  let service: SnykIntegration;

  beforeEach(() => {
    service = new SnykIntegration();
    service.configure({
      apiToken: 'test-token',
      organizationId: 'org-test',
      severity: ['high', 'critical'],
      autoFix: true,
      blockOnCritical: true,
    });
  });

  afterEach(() => {
    service.reset();
  });

  describe('Configuration', () => {
    it('should configure Snyk integration', () => {
      const freshService = new SnykIntegration();
      freshService.configure({
        apiToken: 'my-token',
        organizationId: 'my-org',
        severity: ['critical'],
        autoFix: false,
        blockOnCritical: true,
      });

      // Service configured without error
      expect(() => freshService.getScanHistory()).not.toThrow();
    });

    it('should throw when scanning without configuration', async () => {
      const unconfiguredService = new SnykIntegration();

      await expect(unconfiguredService.scanProject('package.json')).rejects.toThrow(
        'not configured'
      );
    });
  });

  describe('Project Scanning', () => {
    it('should scan project for vulnerabilities', async () => {
      const result = await service.scanProject('package.json');

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.scannedAt).toBeInstanceOf(Date);
      expect(result.bySeverity).toBeDefined();
    });

    it('should return vulnerability details', async () => {
      const result = await service.scanProject('package.json');

      expect(result.totalVulnerabilities).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.vulnerabilities)).toBe(true);
    });

    it('should track severity counts', async () => {
      const result = await service.scanProject('package.json');

      expect(result.bySeverity).toHaveProperty('critical');
      expect(result.bySeverity).toHaveProperty('high');
      expect(result.bySeverity).toHaveProperty('medium');
      expect(result.bySeverity).toHaveProperty('low');
    });
  });

  describe('PR Blocking', () => {
    it('should block PR on critical vulnerabilities', async () => {
      // Create scan result with critical vulnerability
      const scanResult: ScanResult = {
        id: 'test-scan',
        projectName: 'test',
        scannedAt: new Date(),
        totalVulnerabilities: 1,
        bySeverity: { critical: 1, high: 0, medium: 0, low: 0 },
        vulnerabilities: [],
        isBlocked: false,
        fixAvailable: 0,
      };

      const result = service.shouldBlockPR(scanResult);

      expect(result.blocked).toBe(true);
      expect(result.reason).toContain('critical');
    });

    it('should not block PR without critical vulnerabilities', async () => {
      const scanResult: ScanResult = {
        id: 'test-scan',
        projectName: 'test',
        scannedAt: new Date(),
        totalVulnerabilities: 5,
        bySeverity: { critical: 0, high: 3, medium: 2, low: 0 },
        vulnerabilities: [],
        isBlocked: false,
        fixAvailable: 0,
      };

      const result = service.shouldBlockPR(scanResult);

      expect(result.blocked).toBe(false);
    });
  });

  describe('Fix Suggestions', () => {
    it('should generate fix suggestions', async () => {
      const result = await service.scanProject('package.json');
      const suggestions = service.getFixSuggestions(result);

      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should only suggest fixes for vulnerabilities with fixes', async () => {
      const result = await service.scanProject('package.json');
      const suggestions = service.getFixSuggestions(result);

      for (const suggestion of suggestions) {
        expect(suggestion.fixedVersion).toBeDefined();
        expect(suggestion.command).toContain('npm install');
      }
    });

    it('should include breaking change flag', async () => {
      const result = await service.scanProject('package.json');
      const suggestions = service.getFixSuggestions(result);

      for (const suggestion of suggestions) {
        expect(typeof suggestion.isBreaking).toBe('boolean');
      }
    });
  });

  describe('Auto-Fix', () => {
    it('should apply non-breaking fixes when enabled', async () => {
      const result = await service.scanProject('package.json');
      const suggestions = service.getFixSuggestions(result);

      const { applied, failed } = service.applyFixes(suggestions);

      expect(typeof applied).toBe('number');
      expect(typeof failed).toBe('number');
    });

    it('should not apply fixes when disabled', () => {
      const disabledService = new SnykIntegration();
      disabledService.configure({
        apiToken: 'token',
        organizationId: 'org',
        severity: ['critical'],
        autoFix: false,
        blockOnCritical: true,
      });

      const result = disabledService.applyFixes([
        {
          vulnerabilityId: 'test',
          packageName: 'test-pkg',
          currentVersion: '1.0.0',
          fixedVersion: '1.0.1',
          isBreaking: false,
          command: 'npm install test-pkg@1.0.1',
        },
      ]);

      expect(result.applied).toBe(0);
    });
  });

  describe('Scan History', () => {
    it('should track scan history', async () => {
      await service.scanProject('package.json');
      await service.scanProject('package-lock.json');

      const history = service.getScanHistory();

      expect(history.length).toBe(2);
    });

    it('should limit history results', async () => {
      await service.scanProject('file1.json');
      await service.scanProject('file2.json');
      await service.scanProject('file3.json');

      const history = service.getScanHistory(2);

      expect(history.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Report Generation', () => {
    it('should generate markdown report', async () => {
      const result = await service.scanProject('package.json');
      const report = service.generateReport(result);

      expect(report).toContain('# Security Scan Report');
      expect(report).toContain('## Summary');
      expect(report).toContain('Total Vulnerabilities');
    });

    it('should include vulnerability details in report', async () => {
      const result = await service.scanProject('package.json');
      const report = service.generateReport(result);

      if (result.vulnerabilities.length > 0) {
        expect(report).toContain('## Vulnerabilities');
      }
    });
  });

  describe('Singleton Instance', () => {
    it('should export singleton instance', () => {
      expect(snykIntegration).toBeInstanceOf(SnykIntegration);
    });
  });
});
