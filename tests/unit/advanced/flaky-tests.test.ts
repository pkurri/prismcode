/**
 * Flaky Test Detection Tests
 * Issue #250
 */

import { FlakyTestDetector } from '../../../src/advanced/flaky-tests';

describe('FlakyTestDetector', () => {
  let detector: FlakyTestDetector;

  beforeEach(() => {
    detector = new FlakyTestDetector();
  });

  afterEach(() => {
    detector.clear();
  });

  describe('flakiness detection', () => {
    it('should detect flaky tests from history', () => {
      const testId = 'test-flaky-1';

      // Simulate alternating pass/fail pattern (very flaky)
      for (let i = 0; i < 10; i++) {
        detector.recordTestRun({
          testId,
          testFile: 'tests/flaky.test.ts',
          testName: 'should be stable',
          passed: i % 2 === 0,
          durationMs: 100,
          timestamp: new Date(),
          retryCount: 0,
          environment: 'ci',
        });
      }

      const flaky = detector.detectFlakiness(testId);

      expect(flaky).toBeDefined();
      expect(flaky?.flakinessScore).toBeGreaterThan(0.3);
    });

    it('should not flag stable tests as flaky', () => {
      const testId = 'test-stable-1';

      // All tests pass
      for (let i = 0; i < 10; i++) {
        detector.recordTestRun({
          testId,
          testFile: 'tests/stable.test.ts',
          testName: 'should pass',
          passed: true,
          durationMs: 100,
          timestamp: new Date(),
          retryCount: 0,
          environment: 'ci',
        });
      }

      const flaky = detector.detectFlakiness(testId);
      expect(flaky).toBeNull();
    });
  });

  describe('root cause analysis', () => {
    it('should identify timing issues', () => {
      const testId = 'test-timing';

      for (let i = 0; i < 10; i++) {
        detector.recordTestRun({
          testId,
          testFile: 'tests/slow.test.ts',
          testName: 'should wait',
          passed: i % 3 === 0,
          durationMs: 100,
          timestamp: new Date(),
          errorMessage: i % 3 !== 0 ? 'timeout exceeded waiting for element' : undefined,
          retryCount: 0,
          environment: 'ci',
        });
      }

      const analysis = detector.analyzeRootCause(testId);
      expect(analysis.primaryCause).toBe('timing');
    });

    it('should identify state issues', () => {
      const testId = 'test-state';

      for (let i = 0; i < 10; i++) {
        detector.recordTestRun({
          testId,
          testFile: 'tests/state.test.ts',
          testName: 'should have data',
          passed: i % 2 === 0,
          durationMs: 100,
          timestamp: new Date(),
          errorMessage: i % 2 !== 0 ? 'Cannot read property of undefined' : undefined,
          retryCount: 0,
          environment: 'ci',
        });
      }

      const analysis = detector.analyzeRootCause(testId);
      expect(analysis.primaryCause).toBe('state');
    });
  });

  describe('fix suggestions', () => {
    it('should suggest fixes based on root cause', () => {
      const testId = 'test-needs-fix';

      for (let i = 0; i < 10; i++) {
        detector.recordTestRun({
          testId,
          testFile: 'tests/broken.test.ts',
          testName: 'needs wait',
          passed: i % 2 === 0,
          durationMs: 100,
          timestamp: new Date(),
          errorMessage: i % 2 !== 0 ? 'timeout exceeded' : undefined,
          retryCount: 0,
          environment: 'ci',
        });
      }

      detector.detectFlakiness(testId);
      const fixes = detector.suggestFixes(testId);

      expect(fixes.length).toBeGreaterThan(0);
      expect(fixes[0].category).toBe('wait');
    });
  });

  describe('quarantine', () => {
    it('should quarantine flaky test', () => {
      const testId = 'test-quarantine';

      for (let i = 0; i < 10; i++) {
        detector.recordTestRun({
          testId,
          testFile: 'tests/q.test.ts',
          testName: 'flaky',
          passed: i % 2 === 0,
          durationMs: 100,
          timestamp: new Date(),
          retryCount: 0,
          environment: 'ci',
        });
      }

      detector.quarantine(testId);

      expect(detector.shouldSkip(testId)).toBe(true);
      expect(detector.getQuarantinedTests().length).toBe(1);
    });

    it('should release to monitoring', () => {
      const testId = 'test-release';

      for (let i = 0; i < 10; i++) {
        detector.recordTestRun({
          testId,
          testFile: 'tests/r.test.ts',
          testName: 'was flaky',
          passed: i % 2 === 0,
          durationMs: 100,
          timestamp: new Date(),
          retryCount: 0,
          environment: 'ci',
        });
      }

      detector.quarantine(testId);
      detector.releaseToMonitoring(testId);

      expect(detector.shouldSkip(testId)).toBe(false);
    });
  });

  describe('healing', () => {
    it('should mark test as healed', () => {
      const testId = 'test-healed';

      for (let i = 0; i < 10; i++) {
        detector.recordTestRun({
          testId,
          testFile: 'tests/h.test.ts',
          testName: 'now stable',
          passed: i % 2 === 0,
          durationMs: 100,
          timestamp: new Date(),
          retryCount: 0,
          environment: 'ci',
        });
      }

      detector.markHealed(testId);
      const stats = detector.getHealingStats();

      expect(stats.healed).toBe(1);
    });
  });

  describe('retry logic', () => {
    it('should allow retries for flaky tests', () => {
      const testId = 'test-retry';

      for (let i = 0; i < 10; i++) {
        detector.recordTestRun({
          testId,
          testFile: 'tests/retry.test.ts',
          testName: 'needs retry',
          passed: i % 2 === 0,
          durationMs: 100,
          timestamp: new Date(),
          retryCount: 0,
          environment: 'ci',
        });
      }

      expect(detector.shouldRetry(testId, 0)).toBe(true);
      expect(detector.shouldRetry(testId, 2)).toBe(true);
      expect(detector.shouldRetry(testId, 3)).toBe(false);
    });
  });
});
