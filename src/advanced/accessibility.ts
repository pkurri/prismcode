/**
 * Accessibility-First Development Agent
 * Issue #254: Accessibility-First Development Agent
 *
 * Scans code for accessibility issues and WCAG compliance
 */

import logger from '../utils/logger';

export interface AccessibilityIssue {
  id: string;
  ruleId: string;
  type: 'error' | 'warning' | 'notice';
  message: string;
  element: string;
  line: number;
  wcagCriteria?: string; // e.g., "1.1.1"
}

export interface WCAGReport {
  score: number; // 0-100
  issues: AccessibilityIssue[];
  level: 'A' | 'AA' | 'AAA' | 'Fail';
}

/**
 * Accessibility Agent
 * Validates WCAG compliance and ARIA usage
 */
export class AccessibilityAgent {
  constructor() {
    logger.info('AccessibilityAgent initialized');
  }

  /**
   * Scan HTML/JSX content for accessibility issues
   */
  scanContent(content: string): WCAGReport {
    const issues: AccessibilityIssue[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 1. Check for images without alt text
      if (/<img\b/.test(line) && !/alt=["']/.test(line)) {
        issues.push(
          this.createIssue(
            'img-alt-missing',
            'error',
            'Image missing alt attribute',
            line,
            i + 1,
            '1.1.1'
          )
        );
      }

      // 2. Check for clickable elements without keyboard handling
      if (/onClick=/.test(line) && !/onKey(Down|Up|Press)=/.test(line) && /<div|<span/.test(line)) {
        issues.push(
          this.createIssue(
            'keyboard-handler-missing',
            'warning',
            'Clickable non-interactive element missing keyboard handler',
            line,
            i + 1,
            '2.1.1'
          )
        );
      }

      // 3. Check for form inputs without labels
      if (/<input\b/.test(line) && !/aria-label=|aria-labelledby=|id=/.test(line)) {
        issues.push(
          this.createIssue(
            'input-label-missing',
            'error',
            'Input element missing accessible label',
            line,
            i + 1,
            '1.3.1'
          )
        );
      }

      // 4. Check for ambiguous link text
      if (/<a\b/.test(line)) {
        const match = line.match(/>([^<]+)</);
        if (match && /click here|read more/i.test(match[1])) {
          issues.push(
            this.createIssue(
              'link-text-quality',
              'warning',
              `Ambiguous link text "${match[1]}"`,
              line,
              i + 1,
              '2.4.4'
            )
          );
        }
      }
    }

    const score = this.calculateScore(issues, lines.length);

    const report: WCAGReport = {
      score,
      issues,
      level: this.determineLevel(score, issues),
    };

    logger.info('Accessibility scan complete', { score, issuesCount: issues.length });
    return report;
  }

  /**
   * Validate ARIA attributes specifically
   */
  validateARIA(content: string): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const lines = content.split('\n');

    const validRoles = ['button', 'checkbox', 'alert', 'dialog', 'tab', 'navigation'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const roleMatch = line.match(/role=["']([^"']+)["']/);

      if (roleMatch) {
        const role = roleMatch[1];
        if (!validRoles.includes(role)) {
          issues.push(
            this.createIssue(
              'aria-role-invalid',
              'error',
              `Invalid ARIA role "${role}"`,
              line,
              i + 1,
              '4.1.2'
            )
          );
        }
      }
    }

    return issues;
  }

  /**
   * Helper to create issue object
   */
  private createIssue(
    ruleId: string,
    type: AccessibilityIssue['type'],
    message: string,
    elementLine: string,
    line: number,
    wcagCriteria?: string
  ): AccessibilityIssue {
    return {
      id: `a11y_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      ruleId,
      type,
      message,
      element: elementLine.trim(),
      line,
      wcagCriteria,
    };
  }

  /**
   * Calculate 0-100 score
   */
  private calculateScore(issues: AccessibilityIssue[], totalLines: number): number {
    if (totalLines === 0) return 100;

    const errorWeight = 5;
    const warningWeight = 2;

    const penalty = issues.reduce((acc, issue) => {
      return acc + (issue.type === 'error' ? errorWeight : warningWeight);
    }, 0);

    const rawScore = 100 - (penalty * 10) / Math.max(10, totalLines); // Normalized somewhat
    return Math.max(0, Math.min(100, Math.round(rawScore)));
  }

  /**
   * Determine WCAG conformance level
   */
  private determineLevel(score: number, issues: AccessibilityIssue[]): WCAGReport['level'] {
    const hasErrors = issues.some((i) => i.type === 'error');

    if (hasErrors) return 'Fail';
    if (score >= 90) return 'AAA';
    if (score >= 80) return 'AA';
    return 'A'; // Requires review effectively
  }
}

export const accessibilityAgent = new AccessibilityAgent();
