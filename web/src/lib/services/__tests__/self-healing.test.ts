import { detectIssues, generateAutoFixPR, applyFix } from '../self-healing';

describe('Self-Healing Service', () => {
  describe('detectIssues', () => {
    it('detects issues in files', async () => {
      const issues = await detectIssues(['src/test.ts']);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0]).toHaveProperty('id');
      expect(issues[0]).toHaveProperty('type');
      expect(issues[0]).toHaveProperty('severity');
    });
  });

  describe('generateAutoFixPR', () => {
    it('generates PR from fixes', async () => {
      const fixes = [{ id: 'fix-1', type: 'bug' as const, severity: 'medium' as const, file: 'test.ts', line: 1, description: 'Test', suggestedFix: 'Fix', status: 'pending' as const }];
      const pr = await generateAutoFixPR(fixes);
      expect(pr.title).toContain('Auto-fix');
      expect(pr.fixes).toHaveLength(1);
      expect(pr.status).toBe('draft');
    });
  });

  describe('applyFix', () => {
    it('applies fix and updates status', async () => {
      const fix = { id: 'fix-1', type: 'bug' as const, severity: 'low' as const, file: 'test.ts', line: 1, description: 'Test', suggestedFix: 'Fix', status: 'pending' as const };
      const result = await applyFix(fix);
      expect(result).toBe(true);
      expect(fix.status).toBe('applied');
    });
  });
});
