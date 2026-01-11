import { analyzeError, getDebugPatterns, generateAutonomousFix } from '../debugging-agent';

describe('Debugging Agent Service', () => {
  describe('analyzeError', () => {
    it('analyzes error and returns session', async () => {
      const session = await analyzeError('TypeError: null', 'at line 42');
      expect(session.error).toBe('TypeError: null');
      expect(session.status).toBe('resolved');
      expect(session.suggestion).toBeTruthy();
    });
  });

  describe('getDebugPatterns', () => {
    it('returns common debug patterns', () => {
      const patterns = getDebugPatterns();
      expect(patterns.length).toBeGreaterThan(0);
      patterns.forEach(p => {
        expect(p.pattern).toBeTruthy();
        expect(p.resolution).toBeTruthy();
        expect(p.occurrences).toBeGreaterThan(0);
      });
    });
  });

  describe('generateAutonomousFix', () => {
    it('generates fix code', async () => {
      const session = { id: 's1', error: 'null error', stackTrace: 'line 1', status: 'resolved' as const };
      const fix = await generateAutonomousFix(session);
      expect(fix).toContain('Auto-fix');
    });
  });
});
