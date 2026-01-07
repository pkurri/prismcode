/**
 * Test Impact Analysis Tests
 * Issue #249
 */

import { TestImpactAnalyzer } from '../../../src/advanced/test-impact';

describe('TestImpactAnalyzer', () => {
  let analyzer: TestImpactAnalyzer;

  beforeEach(() => {
    analyzer = new TestImpactAnalyzer();
  });

  afterEach(() => {
    analyzer.clear();
  });

  describe('mapping registration', () => {
    it('should register source-to-test mappings', () => {
      analyzer.registerMapping('src/utils.ts', ['tests/utils.test.ts']);
      const mapping = analyzer.getMapping('src/utils.ts');

      expect(mapping).toBeDefined();
      expect(mapping?.testFiles).toContain('tests/utils.test.ts');
    });

    it('should track coverage percentage', () => {
      analyzer.registerMapping('src/utils.ts', ['tests/utils.test.ts'], 85);
      const mapping = analyzer.getMapping('src/utils.ts');

      expect(mapping?.coverage).toBe(85);
    });
  });

  describe('impact analysis', () => {
    beforeEach(() => {
      analyzer.registerMapping('src/auth.ts', ['tests/auth.test.ts', 'tests/integration.test.ts']);
      analyzer.registerMapping('src/utils.ts', ['tests/utils.test.ts']);
    });

    it('should identify affected tests for changes', () => {
      const changes = [
        {
          filePath: 'src/auth.ts',
          changeType: 'modify' as const,
          linesChanged: [10, 11],
          functionsChanged: ['login'],
          classesChanged: [],
        },
      ];

      const impact = analyzer.analyzeImpact(changes);

      expect(impact.totalTestsAffected).toBe(2);
      expect(impact.affectedTests.some((t) => t.testFile === 'tests/auth.test.ts')).toBe(true);
    });

    it('should calculate reduction percentage', () => {
      const changes = [
        {
          filePath: 'src/utils.ts',
          changeType: 'modify' as const,
          linesChanged: [5],
          functionsChanged: [],
          classesChanged: [],
        },
      ];

      const impact = analyzer.analyzeImpact(changes);
      // 1 test affected out of 3 total = 66.67% reduction
      expect(impact.estimatedReduction).toBeGreaterThan(50);
    });
  });

  describe('minimal test set', () => {
    beforeEach(() => {
      analyzer.registerMapping('src/a.ts', ['tests/a.test.ts']);
      analyzer.registerMapping('src/b.ts', ['tests/b.test.ts']);
      analyzer.registerMapping('src/c.ts', ['tests/c.test.ts']);
    });

    it('should return minimal test set', () => {
      const changes = [
        {
          filePath: 'src/a.ts',
          changeType: 'modify' as const,
          linesChanged: [1],
          functionsChanged: [],
          classesChanged: [],
        },
      ];

      const recommendation = analyzer.getMinimalTestSet(changes);

      expect(recommendation.canSkip).toContain('tests/b.test.ts');
      expect(recommendation.canSkip).toContain('tests/c.test.ts');
    });

    it('should calculate time savings', () => {
      analyzer.recordTestRun('tests/a.test.ts', true, 1000);
      analyzer.recordTestRun('tests/b.test.ts', true, 2000);
      analyzer.recordTestRun('tests/c.test.ts', true, 3000);

      const changes = [
        {
          filePath: 'src/a.ts',
          changeType: 'modify' as const,
          linesChanged: [1],
          functionsChanged: [],
          classesChanged: [],
        },
      ];

      const recommendation = analyzer.getMinimalTestSet(changes);
      expect(recommendation.estimatedSavings.timeReducedMs).toBe(5000); // b + c
    });
  });

  describe('test prioritization', () => {
    it('should prioritize tests by failure likelihood', () => {
      analyzer.registerMapping('src/risky.ts', ['tests/risky.test.ts']);

      // Record history: risky test fails often
      for (let i = 0; i < 10; i++) {
        analyzer.recordTestRun('tests/risky.test.ts', i % 3 !== 0, 100);
      }

      const prioritized = analyzer.prioritizeTests(['tests/risky.test.ts']);
      expect(prioritized[0].failureLikelihood).toBeGreaterThan(0);
    });
  });

  describe('test history', () => {
    it('should record test run history', () => {
      analyzer.recordTestRun('tests/unit.test.ts', true, 500);
      analyzer.recordTestRun('tests/unit.test.ts', false, 600);

      const history = analyzer.getHistory('tests/unit.test.ts');

      expect(history?.totalRuns).toBe(2);
      expect(history?.failures).toBe(1);
      expect(history?.averageDurationMs).toBe(550);
    });
  });

  describe('dependency graph', () => {
    it('should track test dependencies', () => {
      analyzer.registerDependency('tests/integration.test.ts', ['tests/helpers.ts'], []);

      const graph = analyzer.getDependencyGraph();
      const dep = graph.get('tests/integration.test.ts');

      expect(dep?.directDependencies).toContain('tests/helpers.ts');
    });
  });
});
