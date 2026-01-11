import { detectFlakyTests, generateTests, remediateFlakyTest } from '../test-intelligence';

describe('Test Intelligence Service', () => {
  describe('detectFlakyTests', () => {
    it('detects flaky tests', async () => {
      const tests = [
        { id: 't1', name: 'Test 1', file: 'test.ts', status: 'flaky' as const, lastRun: new Date(), flakyScore: 0.5 },
        { id: 't2', name: 'Test 2', file: 'test.ts', status: 'passing' as const, lastRun: new Date(), flakyScore: 0.1 },
      ];
      const flaky = await detectFlakyTests(tests);
      expect(flaky).toHaveLength(1);
      expect(flaky[0].id).toBe('t1');
    });
  });

  describe('generateTests', () => {
    it('generates tests for a file', async () => {
      const generated = await generateTests('src/component.tsx');
      expect(generated.targetFile).toBe('src/component.tsx');
      expect(generated.testCode).toContain('describe');
      expect(generated.coverage).toBeGreaterThan(0);
    });
  });

  describe('remediateFlakyTest', () => {
    it('returns remediation suggestion', async () => {
      const test = { id: 't1', name: 'Flaky Test', file: 'test.ts', status: 'flaky' as const, lastRun: new Date() };
      const result = await remediateFlakyTest(test);
      expect(result).toContain('Fixed flaky test');
    });
  });
});
