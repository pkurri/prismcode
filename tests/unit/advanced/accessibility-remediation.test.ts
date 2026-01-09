import { AccessibilityRemediator } from '../../../src/advanced/accessibility-remediation';

describe('AccessibilityRemediator', () => {
  let remediator: AccessibilityRemediator;

  beforeEach(() => {
    remediator = new AccessibilityRemediator();
  });

  describe('detectIssues', () => {
    it('should detect images without alt', () => {
      const html = '<img src="photo.jpg">';
      const issues = remediator.detectIssues(html);

      expect(issues.some((i) => i.type === 'missing-alt')).toBe(true);
    });

    it('should detect inputs without labels', () => {
      const html = '<input type="text">';
      const issues = remediator.detectIssues(html);

      expect(issues.some((i) => i.type === 'missing-label')).toBe(true);
    });

    it('should detect missing lang attribute', () => {
      const html = '<html><body></body></html>';
      const issues = remediator.detectIssues(html);

      expect(issues.some((i) => i.type === 'missing-lang')).toBe(true);
    });
  });

  describe('remediate', () => {
    it('should fix missing alt text', async () => {
      const html = '<img src="test.jpg">';
      const result = await remediator.remediate(html);

      expect(result.fixed).toBeGreaterThan(0);
      expect(result.actions[0].fixedCode).toContain('alt=');
    });

    it('should fix missing labels', async () => {
      const html = '<input type="email">';
      const result = await remediator.remediate(html);

      expect(result.actions.some((a) => a.fixedCode.includes('aria-label'))).toBe(true);
    });
  });

  describe('getSuggestions', () => {
    it('should return suggestions without applying', () => {
      const html = '<img src="a.jpg"><input type="text">';
      const suggestions = remediator.getSuggestions(html);

      expect(suggestions.length).toBe(2);
    });
  });
});
