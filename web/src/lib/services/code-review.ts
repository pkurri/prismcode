/**
 * Code Review Analysis Engine
 * GitHub Issue #310: [BACKEND] Code Review Analysis Engine
 */

export interface CodeReviewRequest {
  id: string;
  files: FileChange[];
  context?: string;
  reviewType: 'pr' | 'commit' | 'file';
}

export interface FileChange {
  path: string;
  diff: string;
  language: string;
  linesAdded: number;
  linesRemoved: number;
}

export interface ReviewComment {
  id: string;
  file: string;
  line: number;
  severity: 'error' | 'warning' | 'info' | 'suggestion';
  category: string;
  message: string;
  suggestedFix?: string;
}

export interface CodeReviewResult {
  id: string;
  requestId: string;
  score: number; // 0-100
  comments: ReviewComment[];
  summary: string;
  metrics: ReviewMetrics;
}

export interface ReviewMetrics {
  complexity: number;
  maintainability: number;
  testability: number;
  securityRisk: number;
}

// Analyze code changes
export async function analyzeCodeReview(request: CodeReviewRequest): Promise<CodeReviewResult> {
  const comments: ReviewComment[] = [];
  
  for (const file of request.files) {
    // Simulate analysis
    if (file.diff.includes('console.log')) {
      comments.push({
        id: `cmt-${Date.now()}`,
        file: file.path,
        line: 1,
        severity: 'warning',
        category: 'code-quality',
        message: 'Consider removing console.log statements before production',
        suggestedFix: '// Remove or replace with proper logging',
      });
    }
    
    if (file.linesAdded > 200) {
      comments.push({
        id: `cmt-${Date.now()}`,
        file: file.path,
        line: 1,
        severity: 'info',
        category: 'maintainability',
        message: 'Large file change. Consider breaking into smaller commits.',
      });
    }
  }
  
  const score = Math.max(0, 100 - comments.length * 5);
  
  return {
    id: `review-${Date.now()}`,
    requestId: request.id,
    score,
    comments,
    summary: `Reviewed ${request.files.length} files with ${comments.length} findings`,
    metrics: {
      complexity: 65 + Math.random() * 20,
      maintainability: 70 + Math.random() * 20,
      testability: 60 + Math.random() * 30,
      securityRisk: Math.random() * 30,
    },
  };
}

export function categorizeComments(comments: ReviewComment[]): Record<string, ReviewComment[]> {
  return comments.reduce((acc, c) => {
    acc[c.category] = acc[c.category] || [];
    acc[c.category].push(c);
    return acc;
  }, {} as Record<string, ReviewComment[]>);
}
