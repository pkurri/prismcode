/**
 * Auto-Fix PR Generator Tests
 * Issue #245
 */

import { AutoFixPRGenerator } from '../../../src/advanced/auto-fix-pr';

describe('AutoFixPRGenerator', () => {
  let generator: AutoFixPRGenerator;

  beforeEach(() => {
    generator = new AutoFixPRGenerator();
  });

  describe('security patches', () => {
    it('should generate security patch PR', () => {
      const vuln = {
        cveId: 'CVE-2024-1234',
        severity: 'high' as const,
        package: 'lodash',
        currentVersion: '4.17.0',
        fixedVersion: '4.17.21',
        description: 'Prototype pollution vulnerability',
        publishedAt: new Date(),
      };

      const pr = generator.generateSecurityPatchPR(vuln);

      expect(pr.id).toBeDefined();
      expect(pr.category).toBe('security');
      expect(pr.priority).toBe('high');
      expect(pr.title).toContain('CVE-2024-1234');
      expect(pr.labels).toContain('security');
    });

    it('should include CVE in description', () => {
      const vuln = {
        cveId: 'CVE-2024-5678',
        severity: 'critical' as const,
        package: 'axios',
        currentVersion: '0.21.0',
        fixedVersion: '0.21.4',
        description: 'SSRF vulnerability',
        publishedAt: new Date(),
      };

      const pr = generator.generateSecurityPatchPR(vuln);
      expect(pr.description).toContain('CVE-2024-5678');
    });
  });

  describe('dependency updates', () => {
    it('should generate dependency update PR', () => {
      const updates = [
        {
          name: 'react',
          currentVersion: '17.0.0',
          latestVersion: '18.2.0',
          updateType: 'major' as const,
          breaking: true,
        },
        {
          name: 'typescript',
          currentVersion: '4.9.0',
          latestVersion: '5.0.0',
          updateType: 'major' as const,
          breaking: false,
        },
      ];

      const pr = generator.generateDependencyUpdatePR(updates);

      expect(pr.category).toBe('dependency');
      expect(pr.title).toContain('2 package(s)');
      expect(pr.labels).toContain('dependencies');
    });

    it('should mark breaking changes as high priority', () => {
      const updates = [
        {
          name: 'react',
          currentVersion: '17.0.0',
          latestVersion: '18.2.0',
          updateType: 'major' as const,
          breaking: true,
        },
      ];

      const pr = generator.generateDependencyUpdatePR(updates);
      expect(pr.priority).toBe('high');
    });
  });

  describe('lint fixes', () => {
    it('should generate lint fix PR', () => {
      const violations = [
        {
          rule: 'no-unused-vars',
          severity: 'error' as const,
          line: 10,
          column: 5,
          message: 'x is defined but never used',
        },
        {
          rule: 'prefer-const',
          severity: 'warning' as const,
          line: 15,
          column: 3,
          message: 'Use const instead of let',
        },
      ];

      const pr = generator.generateLintFixPR('src/utils.ts', violations);

      expect(pr.category).toBe('lint');
      expect(pr.priority).toBe('low');
      expect(pr.title).toContain('2 issue(s)');
    });
  });

  describe('auto-merge', () => {
    it('should enable auto-merge for low-risk lint fixes', () => {
      const violations = [
        { rule: 'no-console', severity: 'warning' as const, line: 1, column: 1, message: '' },
      ];
      const pr = generator.generateLintFixPR('src/test.ts', violations);

      expect(pr.autoMergeEnabled).toBe(true);
    });

    it('should respect auto-merge configuration', () => {
      generator.configureAutoMerge({ policy: 'never' });

      const violations = [
        { rule: 'no-console', severity: 'warning' as const, line: 1, column: 1, message: '' },
      ];
      const pr = generator.generateLintFixPR('src/test.ts', violations);

      expect(pr.autoMergeEnabled).toBe(false);
    });
  });

  describe('statistics', () => {
    it('should track PR statistics', () => {
      const vuln = {
        cveId: 'CVE-2024-1111',
        severity: 'low' as const,
        package: 'test',
        currentVersion: '1.0.0',
        fixedVersion: '1.0.1',
        description: 'Test',
        publishedAt: new Date(),
      };

      generator.generateSecurityPatchPR(vuln);
      const stats = generator.getStats();

      expect(stats.totalGenerated).toBe(1);
      expect(stats.byCategory.security).toBe(1);
    });

    it('should track merged PRs', () => {
      const vuln = {
        cveId: 'CVE-2024-2222',
        severity: 'low' as const,
        package: 'test',
        currentVersion: '1.0.0',
        fixedVersion: '1.0.1',
        description: 'Test',
        publishedAt: new Date(),
      };

      const pr = generator.generateSecurityPatchPR(vuln);
      generator.markMerged(pr.id, true);

      const stats = generator.getStats();
      expect(stats.autoMerged).toBe(1);
    });
  });

  describe('fix suggestions', () => {
    it('should find deprecation fixes', () => {
      const source = 'const str = "hello".substr(0, 3);';
      const suggestions = generator.analyzeFixes(source, 'test.ts');

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].category).toBe('deprecation');
    });
  });
});
