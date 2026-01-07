import { autonomousDebugger } from '../../../src/advanced/autonomous-debugging';

describe('AutonomousDebugger', () => {
  describe('debugSystem', () => {
    beforeEach(() => {
      // Ensure fix verification passes
      jest.spyOn(Math, 'random').mockReturnValue(0.6);
    });

    afterEach(() => {
      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should attempt to debug a null pointer exception', async () => {
      const context = {
        files: ['app.ts'],
        errorLog: 'TypeError: Cannot read properties of null (reading "user")',
      };

      const result = await autonomousDebugger.debugSystem(context);

      expect(result).toBeDefined();
      expect(result.attempts).toBeGreaterThan(0);
      expect(result.analysis.errorType).toBe('NullPointerException');
      expect(result.analysis.confidence).toBeGreaterThan(0.5);
    });

    it('should attempt to debug a timeout', async () => {
      const context = {
        files: ['api.ts'],
        errorLog: 'Error: Timeout exceeded',
      };

      const result = await autonomousDebugger.debugSystem(context);

      expect(result.analysis.errorType).toBe('TimeoutError');
    });

    it('should handle low confidence scenarios', async () => {
      const context = {
        files: ['unknown.ts'],
        errorLog: 'Something weird happened',
      };

      const result = await autonomousDebugger.debugSystem(context);

      // Might succeed or fail depending on heuristic, but shouldn't crash
      expect(result).toBeDefined();
    });
  });
});
