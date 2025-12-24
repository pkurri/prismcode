/**
 * Tests for Snyk Security Integration
 * Issue #216: Snyk Integration
 * 
 * Additional tests extending existing coverage
 */

import { SnykIntegration, type ScanResult, type FixSuggestion } from '../../../src/advanced/snyk-integration';

describe('SnykIntegration - Extended Tests', () => {
  let snyk: SnykIntegration;

  beforeEach(() => {
    snyk = new SnykIntegration();
    snyk.configure({
      apiToken: 'test_token',
      organizationId: 'test_org',
      severity: ['low', 'medium', 'high', 'critical'],
      autoFix: true,
      blockOnCritical: true,
    });
  });

  afterEach(() => {
    snyk.reset();
  });

  describe('configuration', () => {
    it('should throw when scanning without configuration', async () => {
      const unconfiguredSnyk = new SnykIntegration();
      
      await expect(unconfiguredSnyk.scanProject('package.json')).rejects.toThrow(
        'Snyk not configured'
      );
    });

    it('should accept partial severity levels', () => {
      snyk.configure({
        apiToken: 'token',
        organizationId: 'org',
        severity: ['critical'],
        autoFix: false,
        blockOnCritical: true,
      });

      // Should not throw
      expect(snyk).toBeDefined();
    });
  });

  describe('vulnerability scanning', () => {
    it('should return scan with vulnerability counts', async () => {
      const result = await snyk.scanProject('package.json');

      expect(result.id).toBeDefined();
      expect(result.projectName).toBeDefined();
      expect(result.scannedAt).toBeInstanceOf(Date);
      expect(result.bySeverity).toBeDefined();
      expect(typeof result.bySeverity.critical).toBe('number');
      expect(typeof result.bySeverity.high).toBe('number');
      expect(typeof result.bySeverity.medium).toBe('number');
      expect(typeof result.bySeverity.low).toBe('number');
    });

    it('should include vulnerability details', async () => {
      const result = await snyk.scanProject('package.json');

      if (result.vulnerabilities.length > 0) {
        const vuln = result.vulnerabilities[0];
        expect(vuln.id).toBeDefined();
        expect(vuln.title).toBeDefined();
        expect(vuln.severity).toBeDefined();
        expect(vuln.packageName).toBeDefined();
        expect(vuln.cvss).toBeDefined();
      }
    });

    it('should track fix availability', async () => {
      const result = await snyk.scanProject('package.json');

      expect(typeof result.fixAvailable).toBe('number');
    });
  });

  describe('PR blocking', () => {
    it('should provide reason when blocking', async () => {
      const result = await snyk.scanProject('package.json');
      // Force a critical vulnerability for testing
      result.bySeverity.critical = 1;
      
      const blockCheck = snyk.shouldBlockPR(result);
      
      if (blockCheck.blocked) {
        expect(blockCheck.reason).toContain('critical');
      }
    });

    it('should not block when no critical issues', async () => {
      const result = await snyk.scanProject('package.json');
      result.bySeverity.critical = 0;
      
      const blockCheck = snyk.shouldBlockPR(result);
      
      expect(blockCheck.blocked).toBe(false);
    });
  });

  describe('fix suggestions', () => {
    it('should generate fix commands', async () => {
      const result = await snyk.scanProject('package.json');
      const suggestions = snyk.getFixSuggestions(result);

      for (const suggestion of suggestions) {
        expect(suggestion.command).toContain('npm install');
        expect(suggestion.packageName).toBeDefined();
        expect(suggestion.fixedVersion).toBeDefined();
      }
    });

    it('should identify breaking changes', async () => {
      const result = await snyk.scanProject('package.json');
      const suggestions = snyk.getFixSuggestions(result);

      for (const suggestion of suggestions) {
        expect(typeof suggestion.isBreaking).toBe('boolean');
      }
    });
  });

  describe('auto-fix', () => {
    it('should apply non-breaking fixes', async () => {
      const result = await snyk.scanProject('package.json');
      const suggestions = snyk.getFixSuggestions(result);
      
      const applied = snyk.applyFixes(suggestions);

      expect(typeof applied.applied).toBe('number');
      expect(typeof applied.failed).toBe('number');
    });

    it('should skip breaking changes', async () => {
      const mockSuggestions: FixSuggestion[] = [
        {
          vulnerabilityId: 'test',
          packageName: 'test-pkg',
          currentVersion: '1.0.0',
          fixedVersion: '2.0.0', // Major version = breaking
          isBreaking: true,
          command: 'npm install test-pkg@2.0.0',
        },
      ];

      const applied = snyk.applyFixes(mockSuggestions);

      expect(applied.failed).toBe(1);
      expect(applied.applied).toBe(0);
    });

    it('should return zeros when autoFix disabled', () => {
      snyk.configure({
        apiToken: 'token',
        organizationId: 'org',
        severity: ['critical'],
        autoFix: false,
        blockOnCritical: true,
      });

      const applied = snyk.applyFixes([]);

      expect(applied.applied).toBe(0);
      expect(applied.failed).toBe(0);
    });
  });

  describe('scan history', () => {
    it('should maintain scan history', async () => {
      await snyk.scanProject('package.json');
      await snyk.scanProject('package-lock.json');

      const history = snyk.getScanHistory();

      expect(history.length).toBe(2);
    });

    it('should limit history results', async () => {
      await snyk.scanProject('file1.json');
      await snyk.scanProject('file2.json');
      await snyk.scanProject('file3.json');

      const history = snyk.getScanHistory(2);

      expect(history.length).toBe(2);
    });
  });

  describe('report generation', () => {
    it('should generate markdown report', async () => {
      const result = await snyk.scanProject('package.json');
      const report = snyk.generateReport(result);

      expect(report).toContain('# Security Scan Report');
      expect(report).toContain('## Summary');
      expect(report).toContain('Total Vulnerabilities');
    });

    it('should include vulnerability details in report', async () => {
      const result = await snyk.scanProject('package.json');
      const report = snyk.generateReport(result);

      if (result.vulnerabilities.length > 0) {
        expect(report).toContain('## Vulnerabilities');
        expect(report).toContain('**Severity:**');
      }
    });
  });
});
