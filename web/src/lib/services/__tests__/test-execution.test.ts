import { executeTests, aggregateResults, TestRun } from '../test-execution';

describe('Service: Test Execution', () => {
  it('executes tests and returns results', async () => {
    const start = Date.now();
    const run = await executeTests('p1', 'main');
    const duration = Date.now() - start;

    expect(run.status).toBe('passed');
    expect(run.branch).toBe('main');
    expect(run.results).toBeDefined();
    expect(run.results?.passed).toBeGreaterThan(0);
    // Should take at least 100ms
    expect(duration).toBeGreaterThanOrEqual(90); // leeway
  });

  it('aggregates results correctly', () => {
    const runs: TestRun[] = [
      {
        id: '1',
        projectId: 'p1',
        branch: 'main',
        commit: 'c1',
        status: 'passed',
        startedAt: new Date(),
        results: {
          total: 10, passed: 10, failed: 0, skipped: 0, 
          duration: 1000, 
          coverage: { lines: 80, functions: 80, branches: 80, statements: 80 },
          suites: []
        }
      },
      {
         id: '2',
         projectId: 'p1',
         branch: 'main',
         commit: 'c2',
         status: 'failed',
         startedAt: new Date(),
         results: {
           total: 10, passed: 5, failed: 5, skipped: 0, 
           duration: 2000, 
           coverage: { lines: 50, functions: 50, branches: 50, statements: 50 },
           suites: []
         }
      }
    ];

    const aggregated = aggregateResults(runs);
    expect(aggregated.passRate).toBe(50); // 1 passed out of 2
    expect(aggregated.avgDuration).toBe(1500); // (1000+2000)/2
    expect(aggregated.avgCoverage).toBe(65); // (80+50)/2
  });
});
