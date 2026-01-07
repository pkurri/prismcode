import { DebugMemoryManager } from '../../../src/advanced/debug-memory';

describe('DebugMemoryManager', () => {
  let manager: DebugMemoryManager;

  beforeEach(() => {
    manager = new DebugMemoryManager();
  });

  describe('findMatches', () => {
    it('should find matching patterns for undefined error', () => {
      const matches = manager.findMatches('Cannot read property name of undefined');

      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].suggestedFix).toContain('null check');
    });

    it('should find matching patterns for module error', () => {
      const matches = manager.findMatches('Module not found: ./missing-file');

      expect(matches.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown errors', () => {
      const matches = manager.findMatches('Some completely unique error xyz123');

      expect(matches.length).toBe(0);
    });
  });

  describe('recordPattern', () => {
    it('should record a new pattern', () => {
      const pattern = manager.recordPattern({
        errorSignature: 'Custom error pattern',
        symptom: 'Custom symptom',
        rootCause: 'Custom cause',
        solution: 'Custom solution',
        confidence: 0.8,
        tags: ['custom'],
      });

      expect(pattern.id).toBeDefined();
      expect(pattern.occurrences).toBe(1);
    });
  });

  describe('startSession and endSession', () => {
    it('should track debug sessions', () => {
      const session = manager.startSession('Investigating null pointer');

      expect(session.id).toBeDefined();
      expect(session.steps).toHaveLength(0);

      manager.recordStep(session.id, 'Added console.log', 'Variable is undefined');
      manager.endSession(session.id, 'Added null check', []);

      const stats = manager.getStats();
      expect(stats.totalSessions).toBeGreaterThan(0);
    });
  });

  describe('getStats', () => {
    it('should return pattern statistics', () => {
      const stats = manager.getStats();

      expect(stats.totalPatterns).toBeGreaterThan(0);
      expect(stats.topPatterns).toBeDefined();
    });
  });
});
