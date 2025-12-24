/**
 * Tests for License Compliance Scanner
 * Issue #211: License Compliance Scanner
 */

import { 
  LicenseScanner,
  type SBOMEntry,
  type LicensePolicy 
} from '../../../src/advanced/license-scanner';

describe('LicenseScanner', () => {
  let scanner: LicenseScanner;

  beforeEach(() => {
    scanner = new LicenseScanner();
  });

  afterEach(() => {
    scanner.reset();
  });

  describe('SBOM generation', () => {
    it('should generate SBOM from package.json', async () => {
      const packageJson = {
        name: 'test-project',
        version: '1.0.0',
        dependencies: {
          'lodash': '^4.17.21',
          'express': '^4.18.2',
        },
        devDependencies: {
          'jest': '^29.7.0',
        },
      };

      const sbom = scanner.generateSBOM(JSON.stringify(packageJson));

      expect(sbom.projectName).toBe('test-project');
      expect(sbom.entries).toBeInstanceOf(Array);
      expect(sbom.generatedAt).toBeInstanceOf(Date);
    });

    it('should include license information for each dependency', async () => {
      const packageJson = {
        name: 'test',
        dependencies: { 'lodash': '^4.17.21' },
      };

      const sbom = scanner.generateSBOM(JSON.stringify(packageJson));

      for (const entry of sbom.entries) {
        expect(entry.name).toBeDefined();
        expect(entry.version).toBeDefined();
        expect(entry.license).toBeDefined();
      }
    });
  });

  describe('license compatibility', () => {
    it('should check MIT compatibility', () => {
      const result = scanner.checkCompatibility('MIT', 'MIT');

      expect(result.compatible).toBe(true);
    });

    it('should flag GPL incompatibility with proprietary', () => {
      scanner.setProjectLicense('proprietary');
      const result = scanner.checkCompatibility('GPL-3.0', 'proprietary');

      expect(result.compatible).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should handle unknown licenses', () => {
      const result = scanner.checkCompatibility('UNKNOWN', 'MIT');

      expect(result.warning).toBeDefined();
    });
  });

  describe('policy enforcement', () => {
    it('should set allowed licenses', () => {
      scanner.setPolicy({
        allowedLicenses: ['MIT', 'Apache-2.0', 'BSD-3-Clause'],
        blockedLicenses: ['GPL-3.0', 'AGPL-3.0'],
        requireApproval: ['LGPL-2.1'],
      });

      expect(scanner.getPolicy().allowedLicenses).toContain('MIT');
      expect(scanner.getPolicy().blockedLicenses).toContain('GPL-3.0');
    });

    it('should enforce allowed licenses', async () => {
      scanner.setPolicy({
        allowedLicenses: ['MIT'],
        blockedLicenses: [],
        requireApproval: [],
      });

      const violations = scanner.enforcePolicy([
        { name: 'allowed-pkg', version: '1.0.0', license: 'MIT', source: 'npm' },
        { name: 'blocked-pkg', version: '1.0.0', license: 'GPL-3.0', source: 'npm' },
      ]);

      expect(violations.length).toBeGreaterThan(0);
      expect(violations.some(v => v.package === 'blocked-pkg')).toBe(true);
    });

    it('should flag blocked licenses', async () => {
      scanner.setPolicy({
        allowedLicenses: [],
        blockedLicenses: ['AGPL-3.0'],
        requireApproval: [],
      });

      const violations = scanner.enforcePolicy([
        { name: 'agpl-pkg', version: '1.0.0', license: 'AGPL-3.0', source: 'npm' },
      ]);

      expect(violations.length).toBe(1);
      expect(violations[0].severity).toBe('critical');
    });
  });

  describe('GPL/AGPL flagging', () => {
    it('should flag GPL licenses', async () => {
      const entries: SBOMEntry[] = [
        { name: 'gpl-pkg', version: '1.0.0', license: 'GPL-3.0', source: 'npm' },
        { name: 'mit-pkg', version: '1.0.0', license: 'MIT', source: 'npm' },
      ];

      const flags = scanner.flagCopyleft(entries);

      expect(flags.length).toBe(1);
      expect(flags[0].license).toBe('GPL-3.0');
      expect(flags[0].type).toBe('strong_copyleft');
    });

    it('should flag AGPL licenses with high severity', async () => {
      const entries: SBOMEntry[] = [
        { name: 'agpl-pkg', version: '1.0.0', license: 'AGPL-3.0', source: 'npm' },
      ];

      const flags = scanner.flagCopyleft(entries);

      expect(flags.length).toBe(1);
      expect(flags[0].type).toBe('network_copyleft');
      expect(flags[0].severity).toBe('critical');
    });
  });

  describe('license matrix', () => {
    it('should generate compatibility matrix', () => {
      const matrix = scanner.getCompatibilityMatrix();

      expect(matrix).toBeDefined();
      expect(matrix['MIT']).toBeDefined();
      expect(matrix['MIT']['Apache-2.0']).toBeDefined();
    });

    it('should show transitive compatibility', () => {
      const matrix = scanner.getCompatibilityMatrix();

      // MIT is generally compatible with Apache-2.0
      expect(matrix['MIT']['Apache-2.0'].compatible).toBe(true);
    });
  });

  describe('reports', () => {
    it('should generate compliance report', async () => {
      const entries: SBOMEntry[] = [
        { name: 'pkg1', version: '1.0.0', license: 'MIT', source: 'npm' },
        { name: 'pkg2', version: '2.0.0', license: 'Apache-2.0', source: 'npm' },
      ];

      const report = scanner.generateReport(entries);

      expect(report).toContain('License Compliance Report');
      expect(report).toContain('MIT');
      expect(report).toContain('Apache-2.0');
    });

    it('should include statistics in report', async () => {
      const entries: SBOMEntry[] = [
        { name: 'pkg1', version: '1.0.0', license: 'MIT', source: 'npm' },
        { name: 'pkg2', version: '2.0.0', license: 'MIT', source: 'npm' },
        { name: 'pkg3', version: '3.0.0', license: 'Apache-2.0', source: 'npm' },
      ];

      const report = scanner.generateReport(entries);

      expect(report).toContain('Total Dependencies');
      expect(report).toContain('3');
    });
  });

  describe('scan history', () => {
    it('should track scan history', async () => {
      scanner.generateSBOM('{"name":"test1","dependencies":{}}');
      scanner.generateSBOM('{"name":"test2","dependencies":{}}');

      const history = scanner.getScanHistory();

      expect(history.length).toBe(2);
    });
  });
});
