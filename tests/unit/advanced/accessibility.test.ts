import { accessibilityAgent } from '../../../src/advanced/accessibility';

describe('AccessibilityAgent', () => {
  describe('scanContent', () => {
    it('should detect missing alt text on images', () => {
      const html = '<div><img src="logo.png"></div>';
      const report = accessibilityAgent.scanContent(html);

      expect(report.issues).toHaveLength(1);
      expect(report.issues[0].ruleId).toBe('img-alt-missing');
      expect(report.level).toBe('Fail');
    });

    it('should detect missing labels on inputs', () => {
      const html = '<input type="text" name="username">';
      const report = accessibilityAgent.scanContent(html);

      expect(report.issues.some((i) => i.ruleId === 'input-label-missing')).toBe(true);
    });

    it('should detect non-interactive clickable elements', () => {
      const html = '<div onClick={() => {}}>Click Me</div>';
      const report = accessibilityAgent.scanContent(html);

      expect(report.issues.some((i) => i.ruleId === 'keyboard-handler-missing')).toBe(true);
    });

    it('should pass accessible content', () => {
      const html = `
        <img src="logo.png" alt="Company Logo">
        <label htmlFor="user">Username</label>
        <input id="user" type="text">
        <button onClick={submit}>Submit</button>
      `;
      const report = accessibilityAgent.scanContent(html);

      expect(report.issues).toHaveLength(0);
      expect(report.score).toBe(100);
      expect(report.level).not.toBe('Fail');
    });
  });

  describe('validateARIA', () => {
    it('should detect invalid ARIA roles', () => {
      const html = '<div role="fake-role"></div>';
      const issues = accessibilityAgent.validateARIA(html);

      expect(issues).toHaveLength(1);
      expect(issues[0].ruleId).toBe('aria-role-invalid');
    });

    it('should accept valid ARIA roles', () => {
      const html = '<div role="alert">Error</div>';
      const issues = accessibilityAgent.validateARIA(html);

      expect(issues).toHaveLength(0);
    });
  });
});
