import { bugPredictionEngine } from '../../../src/advanced/bug-prediction';

describe('BugPredictionEngine', () => {
  describe('analyzeCode', () => {
    it('should detect null reference patterns', async () => {
      const code = 'const x = user.profile.settings.theme;';
      const predictions = await bugPredictionEngine.analyzeCode('test.ts', code);

      expect(predictions.some((p) => p.type === 'null-reference')).toBe(true);
    });

    it('should detect loose equality', async () => {
      const code = 'if (x == 5) { return true; }';
      const predictions = await bugPredictionEngine.analyzeCode('test.ts', code);

      expect(predictions.some((p) => p.type === 'type-coercion')).toBe(true);
    });

    it('should detect off-by-one patterns', async () => {
      const code = 'const item = arr[i - 1];';
      const predictions = await bugPredictionEngine.analyzeCode('test.ts', code);

      expect(predictions.some((p) => p.type === 'off-by-one')).toBe(true);
    });
  });

  describe('analyzeProject', () => {
    it('should analyze multiple files', async () => {
      const files = [
        { path: 'a.ts', content: 'const x = obj.a.b.c;' },
        { path: 'b.ts', content: 'if (x == y) {}' },
      ];

      const result = await bugPredictionEngine.analyzeProject(files);

      expect(result.totalFiles).toBe(2);
      expect(result.predictions.length).toBeGreaterThan(0);
    });
  });

  describe('predictForDiff', () => {
    it('should analyze diff for bugs', () => {
      const diff = '+const value = data.user.profile;';
      const predictions = bugPredictionEngine.predictForDiff(diff);

      expect(predictions.some((p) => p.type === 'null-reference')).toBe(true);
    });
  });
});
