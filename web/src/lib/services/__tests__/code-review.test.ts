import { analyzeCodeReview, categorizeComments } from '../code-review';

describe('Code Review Service', () => {
  describe('analyzeCodeReview', () => {
    it('analyzes files and returns review result', async () => {
      const result = await analyzeCodeReview({
        id: 'review-1',
        files: [{ path: 'test.ts', diff: 'console.log("test")', language: 'typescript', linesAdded: 5, linesRemoved: 0 }],
        reviewType: 'pr',
      });
      expect(result.requestId).toBe('review-1');
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.comments).toBeDefined();
    });

    it('flags console.log statements', async () => {
      const result = await analyzeCodeReview({
        id: 'review-2',
        files: [{ path: 'test.ts', diff: 'console.log("debug")', language: 'typescript', linesAdded: 1, linesRemoved: 0 }],
        reviewType: 'commit',
      });
      expect(result.comments.some(c => c.message.includes('console.log'))).toBe(true);
    });
  });

  describe('categorizeComments', () => {
    it('categorizes comments by category', () => {
      const comments = [
        { id: '1', file: 'a.ts', line: 1, severity: 'warning' as const, category: 'style', message: 'Style issue' },
        { id: '2', file: 'b.ts', line: 2, severity: 'error' as const, category: 'security', message: 'Security issue' },
      ];
      const categorized = categorizeComments(comments);
      expect(categorized['style']).toHaveLength(1);
      expect(categorized['security']).toHaveLength(1);
    });
  });
});
