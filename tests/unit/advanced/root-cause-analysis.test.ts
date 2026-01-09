import { RootCauseAnalyzer } from '../../../src/advanced/root-cause-analysis';

describe('RootCauseAnalyzer', () => {
  let analyzer: RootCauseAnalyzer;

  beforeEach(() => {
    analyzer = new RootCauseAnalyzer();
  });

  describe('analyze', () => {
    it('should detect null reference errors', async () => {
      const result = await analyzer.analyze({
        error: 'TypeError: Cannot read property of undefined',
        stackTrace: 'at foo (/src/test.ts:10)',
        file: 'test.ts',
        line: 10,
        timestamp: new Date(),
        environment: {},
      });

      expect(result.rootCauses.some((c) => c.type === 'null-reference')).toBe(true);
    });

    it('should detect async timing issues', async () => {
      const result = await analyzer.analyze({
        error: 'Error: Request timeout exceeded',
        stackTrace: 'at async fetchData (/src/api.ts:25)',
        file: 'api.ts',
        line: 25,
        timestamp: new Date(),
        environment: {},
      });

      expect(result.rootCauses.some((c) => c.type === 'async-timing')).toBe(true);
    });

    it('should track analysis timeline', async () => {
      const result = await analyzer.analyze({
        error: 'Error',
        stackTrace: 'at test',
        file: 'test.ts',
        line: 1,
        timestamp: new Date(),
        environment: {},
      });

      expect(result.timeline.length).toBeGreaterThan(0);
    });
  });

  describe('getAnalysis', () => {
    it('should retrieve stored analysis', async () => {
      const result = await analyzer.analyze({
        error: 'Error',
        stackTrace: 'at test',
        file: 'test.ts',
        line: 1,
        timestamp: new Date(),
        environment: {},
      });

      const stored = analyzer.getAnalysis(result.errorId);
      expect(stored).not.toBeNull();
    });
  });
});
