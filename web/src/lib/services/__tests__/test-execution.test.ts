import { executeTests, aggregateResults } from '../test-execution';

describe('Test Execution Service', () => {
  describe('executeTests', () => {
    it('executes tests and returns results', async () => {
      const run = await executeTests('proj-1', 'main');
      expect(run.projectId).toBe('proj-1');
      expect(run.branch).toBe('main');
      expect(run.status).toBe('passed');
      expect(run.results).toBeDefined();
      expect(run.results?.total).toBeGreaterThan(0);
    });
  });

  describe('aggregateResults', () => {
    it('aggregates results from multiple runs', () => {
      const runs = [
        { id: 'r1', projectId: 'p1', branch: 'main', commit: 'abc', status: 'passed' as const, startedAt: new Date(), results: { total: 100, passed: 100, failed: 0, skipped: 0, duration: 1000, coverage: { lines: 80, functions: 75, branches: 70, statements: 78 }, suites: [] } },
        { id: 'r2', projectId: 'p1', branch: 'main', commit: 'def', status: 'passed' as const, startedAt: new Date(), results: { total: 100, passed: 100, failed: 0, skipped: 0, duration: 1200, coverage: { lines: 85, functions: 80, branches: 75, statements: 82 }, suites: [] } },
      ];
      const agg = aggregateResults(runs);
      expect(agg.passRate).toBe(100);
      expect(agg.avgDuration).toBe(1100);
      expect(agg.avgCoverage).toBe(82.5);
    });
  });
});
