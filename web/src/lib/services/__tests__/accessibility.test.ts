import { scanForAccessibility, autoFixAccessibility } from '../accessibility';

describe('Accessibility Service', () => {
  describe('scanForAccessibility', () => {
    it('scans URL and returns results', async () => {
      const result = await scanForAccessibility('https://example.com');
      expect(result.url).toBe('https://example.com');
      expect(result.issues).toBeInstanceOf(Array);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.scannedAt).toBeInstanceOf(Date);
    });

    it('detects WCAG issues', async () => {
      const result = await scanForAccessibility('https://test.com');
      expect(result.issues.length).toBeGreaterThan(0);
      result.issues.forEach(issue => {
        expect(['A', 'AA', 'AAA']).toContain(issue.wcagLevel);
        expect(['critical', 'serious', 'moderate', 'minor']).toContain(issue.severity);
      });
    });
  });

  describe('autoFixAccessibility', () => {
    it('generates fix for accessibility issue', async () => {
      const issue = { id: 'a1', element: 'img', rule: 'img-alt', severity: 'serious' as const, wcagLevel: 'A' as const, fix: 'Add alt' };
      const result = await autoFixAccessibility(issue);
      expect(result).toContain('Applied fix');
    });
  });
});
