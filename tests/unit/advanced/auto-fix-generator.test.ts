import { AutonomousFixGenerator } from '../../../src/advanced/auto-fix-generator';

describe('AutonomousFixGenerator', () => {
  let generator: AutonomousFixGenerator;

  beforeEach(() => {
    generator = new AutonomousFixGenerator();
  });

  describe('generateFixes', () => {
    it('should generate fixes for issues', async () => {
      const result = await generator.generateFixes([
        {
          id: '1',
          type: 'missing-semicolon',
          file: 'test.ts',
          line: 5,
          message: 'Missing semicolon',
          severity: 'error',
        },
      ]);

      expect(result.fixedCount).toBeGreaterThan(0);
    });

    it('should skip unfixable issues', async () => {
      const result = await generator.generateFixes([
        {
          id: '1',
          type: 'unknown-xyz-error',
          file: 'test.ts',
          line: 1,
          message: 'Unknown',
          severity: 'error',
        },
      ]);

      expect(result.skippedCount).toBe(1);
    });
  });

  describe('getFix', () => {
    it('should retrieve generated fix', async () => {
      await generator.generateFixes([
        {
          id: 'fix1',
          type: 'null-check',
          file: 'test.ts',
          line: 10,
          message: 'Null check needed',
          severity: 'warning',
        },
      ]);

      const fix = generator.getFix('fix1');
      expect(fix).not.toBeNull();
    });
  });

  describe('validateFix', () => {
    it('should validate good fixes', async () => {
      const result = await generator.generateFixes([
        {
          id: 'v1',
          type: 'type-assertion',
          file: 'test.ts',
          line: 1,
          message: 'Type assertion',
          severity: 'error',
        },
      ]);

      const fix = result.fixes[0];
      const validation = generator.validateFix(fix);
      expect(validation.valid).toBe(true);
    });
  });
});
