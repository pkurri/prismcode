/**
 * Tests for SonarQube Quality Gate Integration
 * Issue #217: SonarQube Quality Gate
 */

import { 
  SonarQubeIntegration, 
  type QualityGateResult,
  type PRAnalysisResult 
} from '../../../src/advanced/sonarqube-integration';

describe('SonarQubeIntegration', () => {
  let sonar: SonarQubeIntegration;

  beforeEach(() => {
    sonar = new SonarQubeIntegration();
  });

  afterEach(() => {
    sonar.reset();
  });

  describe('configuration', () => {
    it('should throw when analyzing without configuration', async () => {
      await expect(sonar.analyze()).rejects.toThrow('SonarQube not configured');
    });

    it('should configure with valid settings', () => {
      sonar.configure({
        serverUrl: 'https://sonarqube.example.com',
        token: 'test_token',
        projectKey: 'test_project',
      });

      // Should not throw when analyzing after configuration
      expect(sonar.analyze()).resolves.toBeDefined();
    });

    it('should accept optional organization and quality gate', () => {
      sonar.configure({
        serverUrl: 'https://sonarqube.example.com',
        token: 'test_token',
        projectKey: 'test_project',
        organization: 'my_org',
        qualityGate: 'my_gate',
      });

      expect(sonar).toBeDefined();
    });
  });

  describe('analysis', () => {
    beforeEach(() => {
      sonar.configure({
        serverUrl: 'https://sonarqube.example.com',
        token: 'test_token',
        projectKey: 'test_project',
      });
    });

    it('should return quality gate result', async () => {
      const result = await sonar.analyze();

      expect(result.status).toBeDefined();
      expect(result.projectKey).toBe('test_project');
      expect(result.analysisDate).toBeInstanceOf(Date);
      expect(result.metrics).toBeInstanceOf(Array);
      expect(result.issues).toBeInstanceOf(Array);
      expect(typeof result.coverage).toBe('number');
      expect(typeof result.duplications).toBe('number');
      expect(result.rating).toBeDefined();
    });

    it('should include rating grades', async () => {
      const result = await sonar.analyze();

      expect(['A', 'B', 'C', 'D', 'E']).toContain(result.rating.reliability);
      expect(['A', 'B', 'C', 'D', 'E']).toContain(result.rating.security);
      expect(['A', 'B', 'C', 'D', 'E']).toContain(result.rating.maintainability);
    });

    it('should track analysis history', async () => {
      await sonar.analyze('main');
      await sonar.analyze('develop');

      const history = sonar.getHistory();

      expect(history.length).toBe(2);
    });
  });

  describe('PR analysis', () => {
    beforeEach(() => {
      sonar.configure({
        serverUrl: 'https://sonarqube.example.com',
        token: 'test_token',
        projectKey: 'test_project',
      });
    });

    it('should analyze pull request', async () => {
      const result = await sonar.analyzePR(123, 'main');

      expect(typeof result.passed).toBe('boolean');
      expect(typeof result.newIssues).toBe('number');
      expect(typeof result.fixedIssues).toBe('number');
      expect(typeof result.newCoverage).toBe('number');
      expect(typeof result.coverageDiff).toBe('number');
      expect(result.blockers).toBeInstanceOf(Array);
      expect(result.criticals).toBeInstanceOf(Array);
    });

    it('should generate PR comment', async () => {
      const prResult: PRAnalysisResult = {
        passed: true,
        newIssues: 2,
        fixedIssues: 5,
        newCoverage: 85.5,
        coverageDiff: 2.3,
        blockers: [],
        criticals: [],
      };

      const comment = sonar.generatePRComment(prResult);

      expect(comment).toContain('SonarQube Quality Gate');
      expect(comment).toContain('Passed');
      expect(comment).toContain('New Issues');
      expect(comment).toContain('85.5%');
    });

    it('should include blocker details in failed PR comment', async () => {
      const prResult: PRAnalysisResult = {
        passed: false,
        newIssues: 3,
        fixedIssues: 0,
        newCoverage: 70.0,
        coverageDiff: -5.0,
        blockers: [{
          key: 'block-1',
          rule: 'security:S001',
          severity: 'BLOCKER',
          message: 'SQL Injection vulnerability',
          file: 'src/db.ts',
          line: 42,
          effort: '1h',
          type: 'VULNERABILITY',
        }],
        criticals: [],
      };

      const comment = sonar.generatePRComment(prResult);

      expect(comment).toContain('Failed');
      expect(comment).toContain('Blocker');
      expect(comment).toContain('SQL Injection');
    });
  });

  describe('quality gate check', () => {
    beforeEach(() => {
      sonar.configure({
        serverUrl: 'https://sonarqube.example.com',
        token: 'test_token',
        projectKey: 'test_project',
      });
    });

    it('should pass with good metrics', () => {
      const result: QualityGateResult = {
        status: 'OK',
        projectKey: 'test',
        analysisDate: new Date(),
        metrics: [],
        issues: [],
        coverage: 85,
        duplications: 2,
        rating: { reliability: 'A', security: 'A', maintainability: 'A' },
      };

      const check = sonar.checkQualityGate(result);

      expect(check.passed).toBe(true);
      expect(check.failures).toHaveLength(0);
    });

    it('should fail with low coverage', () => {
      const result: QualityGateResult = {
        status: 'OK',
        projectKey: 'test',
        analysisDate: new Date(),
        metrics: [],
        issues: [],
        coverage: 50,
        duplications: 2,
        rating: { reliability: 'A', security: 'A', maintainability: 'A' },
      };

      const check = sonar.checkQualityGate(result);

      expect(check.passed).toBe(false);
      expect(check.failures.some(f => f.includes('Coverage'))).toBe(true);
    });

    it('should fail with blocker issues', () => {
      const result: QualityGateResult = {
        status: 'ERROR',
        projectKey: 'test',
        analysisDate: new Date(),
        metrics: [],
        issues: [{
          key: 'block-1',
          rule: 'test',
          severity: 'BLOCKER',
          message: 'Critical issue',
          file: 'test.ts',
          line: 1,
          effort: '1h',
          type: 'BUG',
        }],
        coverage: 85,
        duplications: 2,
        rating: { reliability: 'A', security: 'A', maintainability: 'A' },
      };

      const check = sonar.checkQualityGate(result);

      expect(check.passed).toBe(false);
      expect(check.failures.some(f => f.includes('blocker'))).toBe(true);
    });
  });

  describe('issue organization', () => {
    beforeEach(() => {
      sonar.configure({
        serverUrl: 'https://sonarqube.example.com',
        token: 'test_token',
        projectKey: 'test_project',
      });
    });

    it('should group issues by file', async () => {
      const result = await sonar.analyze();

      const fileMap = sonar.getIssuesByFile(result);

      expect(fileMap).toBeInstanceOf(Map);

      for (const [file, issues] of fileMap) {
        expect(typeof file).toBe('string');
        expect(issues).toBeInstanceOf(Array);
        expect(issues.every(i => i.file === file)).toBe(true);
      }
    });
  });
});
