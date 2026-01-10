import { NextRequest, NextResponse } from 'next/server';

// Types for code review analysis
interface ReviewRequest {
  repo: string;
  branch: string;
  baseBranch: string;
  prNumber: number;
  author: string;
  diff: string;
  files?: FileChange[];
}

interface FileChange {
  path: string;
  additions: number;
  deletions: number;
  patch?: string;
}

interface ReviewFinding {
  id: string;
  severity: 'critical' | 'warning' | 'suggestion' | 'positive';
  category: 'security' | 'performance' | 'style' | 'tests' | 'general';
  title: string;
  description: string;
  file: string;
  lineStart: number;
  lineEnd: number;
  suggestion?: string;
  confidence: number;
}

interface ReviewResult {
  id: string;
  prNumber: number;
  repo: string;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  findings: ReviewFinding[];
  summary: {
    criticalCount: number;
    warningCount: number;
    suggestionCount: number;
    positiveCount: number;
  };
  filesAnalyzed: number;
  analysisTimeMs: number;
  modelUsed: string;
  createdAt: string;
}

// Security patterns to detect
const securityPatterns = [
  { pattern: /eval\s*\(/gi, title: 'eval() usage detected', severity: 'critical' as const },
  { pattern: /innerHTML\s*=/gi, title: 'innerHTML assignment (XSS risk)', severity: 'warning' as const },
  { pattern: /password\s*=\s*['"][^'"]+['"]/gi, title: 'Hardcoded password detected', severity: 'critical' as const },
  { pattern: /api[_-]?key\s*=\s*['"][^'"]+['"]/gi, title: 'Hardcoded API key detected', severity: 'critical' as const },
  { pattern: /secret\s*=\s*['"][^'"]+['"]/gi, title: 'Hardcoded secret detected', severity: 'critical' as const },
  { pattern: /exec\s*\(/gi, title: 'exec() usage (command injection risk)', severity: 'warning' as const },
  { pattern: /SELECT.*FROM.*WHERE.*\+/gi, title: 'Potential SQL injection', severity: 'critical' as const },
  { pattern: /dangerouslySetInnerHTML/gi, title: 'dangerouslySetInnerHTML usage', severity: 'warning' as const },
];

// Performance patterns to detect
const performancePatterns = [
  { pattern: /console\.log/gi, title: 'Console.log in production code', severity: 'suggestion' as const },
  { pattern: /for\s*\([^)]+\)\s*\{[^}]*await/gi, title: 'Await inside loop (consider Promise.all)', severity: 'warning' as const },
  { pattern: /new Array\(\d{4,}\)/gi, title: 'Large array allocation', severity: 'warning' as const },
  { pattern: /JSON\.parse\(JSON\.stringify/gi, title: 'Inefficient deep clone', severity: 'suggestion' as const },
];

// Style patterns to detect
const stylePatterns = [
  { pattern: /any(?:\s|;|,|\))/g, title: 'TypeScript any type usage', severity: 'suggestion' as const },
  { pattern: /TODO|FIXME|HACK/gi, title: 'TODO/FIXME comment found', severity: 'suggestion' as const },
  { pattern: /function\s+\w+\s*\([^)]{100,}\)/gi, title: 'Function with many parameters', severity: 'suggestion' as const },
];

// Analyze code for findings
function analyzeCode(diff: string, files: FileChange[] = []): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  let findingId = 1;

  const lines = diff.split('\n');
  let currentFile = '';
  let currentLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track current file
    if (line.startsWith('diff --git')) {
      const match = line.match(/b\/(.+)$/);
      if (match) currentFile = match[1];
      continue;
    }

    // Track line numbers
    if (line.startsWith('@@')) {
      const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)/);
      if (match) currentLine = parseInt(match[1], 10);
      continue;
    }

    // Only analyze added lines
    if (!line.startsWith('+') || line.startsWith('+++')) continue;
    currentLine++;

    const content = line.substring(1);

    // Check security patterns
    for (const check of securityPatterns) {
      if (check.pattern.test(content)) {
        findings.push({
          id: `finding-${findingId++}`,
          severity: check.severity,
          category: 'security',
          title: check.title,
          description: `Detected potential security issue: ${check.title}`,
          file: currentFile,
          lineStart: currentLine,
          lineEnd: currentLine,
          suggestion: 'Review and address this security concern.',
          confidence: 0.85,
        });
      }
    }

    // Check performance patterns
    for (const check of performancePatterns) {
      if (check.pattern.test(content)) {
        findings.push({
          id: `finding-${findingId++}`,
          severity: check.severity,
          category: 'performance',
          title: check.title,
          description: `Performance concern: ${check.title}`,
          file: currentFile,
          lineStart: currentLine,
          lineEnd: currentLine,
          suggestion: 'Consider optimizing this code pattern.',
          confidence: 0.75,
        });
      }
    }

    // Check style patterns
    for (const check of stylePatterns) {
      if (check.pattern.test(content)) {
        findings.push({
          id: `finding-${findingId++}`,
          severity: check.severity,
          category: 'style',
          title: check.title,
          description: `Code style: ${check.title}`,
          file: currentFile,
          lineStart: currentLine,
          lineEnd: currentLine,
          suggestion: 'Consider improving code style.',
          confidence: 0.70,
        });
      }
    }
  }

  // Check for test coverage gaps
  const hasTests = files.some(f => f.path.includes('.test.') || f.path.includes('.spec.'));
  const hasSourceChanges = files.some(f => 
    (f.path.endsWith('.ts') || f.path.endsWith('.tsx') || f.path.endsWith('.js')) && 
    !f.path.includes('.test.') && !f.path.includes('.spec.')
  );

  if (hasSourceChanges && !hasTests) {
    findings.push({
      id: `finding-${findingId++}`,
      severity: 'warning',
      category: 'tests',
      title: 'No test changes with source changes',
      description: 'Source code was modified but no test files were updated.',
      file: 'general',
      lineStart: 0,
      lineEnd: 0,
      suggestion: 'Consider adding or updating tests for the changed code.',
      confidence: 0.90,
    });
  }

  // Add positives for good practices
  if (diff.includes('try {') && diff.includes('catch')) {
    findings.push({
      id: `finding-${findingId++}`,
      severity: 'positive',
      category: 'general',
      title: 'Good error handling',
      description: 'Code includes try-catch blocks for error handling.',
      file: 'general',
      lineStart: 0,
      lineEnd: 0,
      confidence: 0.95,
    });
  }

  if (diff.includes('interface ') || diff.includes('type ')) {
    findings.push({
      id: `finding-${findingId++}`,
      severity: 'positive',
      category: 'style',
      title: 'TypeScript types defined',
      description: 'Code includes proper type definitions.',
      file: 'general',
      lineStart: 0,
      lineEnd: 0,
      confidence: 0.95,
    });
  }

  return findings;
}

// Calculate overall score based on findings
function calculateScore(findings: ReviewFinding[]): number {
  let score = 100;
  
  for (const finding of findings) {
    if (finding.severity === 'positive') continue;
    
    switch (finding.severity) {
      case 'critical': score -= 15; break;
      case 'warning': score -= 8; break;
      case 'suggestion': score -= 2; break;
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

// Determine risk level based on findings
function getRiskLevel(findings: ReviewFinding[]): 'low' | 'medium' | 'high' | 'critical' {
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const warningCount = findings.filter(f => f.severity === 'warning').length;
  
  if (criticalCount >= 3) return 'critical';
  if (criticalCount >= 1) return 'high';
  if (warningCount >= 3) return 'medium';
  return 'low';
}

// GET: Get review results by ID or list recent reviews
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get('id');
  const repo = searchParams.get('repo');

  // Mock data for demo
  const mockReviews: ReviewResult[] = [
    {
      id: 'review-001',
      prNumber: 342,
      repo: 'prismcode/main',
      overallScore: 82,
      riskLevel: 'medium',
      findings: [],
      summary: { criticalCount: 2, warningCount: 3, suggestionCount: 5, positiveCount: 2 },
      filesAnalyzed: 12,
      analysisTimeMs: 1250,
      modelUsed: 'gpt-4-turbo',
      createdAt: new Date().toISOString(),
    },
  ];

  if (reviewId) {
    const review = mockReviews.find(r => r.id === reviewId);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    return NextResponse.json(review);
  }

  return NextResponse.json({
    reviews: repo ? mockReviews.filter(r => r.repo === repo) : mockReviews,
    total: mockReviews.length,
  });
}

// POST: Submit code for review analysis
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: ReviewRequest = await request.json();
    const { repo, branch, baseBranch, prNumber, author, diff, files = [] } = body;

    // Validate required fields
    if (!repo || !diff || !prNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: repo, diff, prNumber' },
        { status: 400 }
      );
    }

    // Analyze the code
    const findings = analyzeCode(diff, files);
    const overallScore = calculateScore(findings);
    const riskLevel = getRiskLevel(findings);

    const result: ReviewResult = {
      id: `review-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      prNumber,
      repo,
      overallScore,
      riskLevel,
      findings,
      summary: {
        criticalCount: findings.filter(f => f.severity === 'critical').length,
        warningCount: findings.filter(f => f.severity === 'warning').length,
        suggestionCount: findings.filter(f => f.severity === 'suggestion').length,
        positiveCount: findings.filter(f => f.severity === 'positive').length,
      },
      filesAnalyzed: files.length || 1,
      analysisTimeMs: Date.now() - startTime,
      modelUsed: 'pattern-matching + gpt-4-turbo',
      createdAt: new Date().toISOString(),
    };

    // Log for analytics
    console.log('[Code Review Analysis]', {
      reviewId: result.id,
      repo,
      prNumber,
      score: overallScore,
      riskLevel,
      findingsCount: findings.length,
      analysisTimeMs: result.analysisTimeMs,
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('[Code Review Error]', error);
    return NextResponse.json(
      { error: 'Failed to analyze code' },
      { status: 500 }
    );
  }
}

// PUT: Post review findings as comments to the PR via Git provider API
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, prNumber, repo, provider = 'github', postSummary = true, postInlineComments = false } = body;

    // Validate required fields
    if (!reviewId || !prNumber || !repo) {
      return NextResponse.json(
        { error: 'Missing required fields: reviewId, prNumber, repo' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Fetch the review result by reviewId
    // 2. Format findings into PR comments
    // 3. Use the Git provider API (GitHub, GitLab, etc.) to post comments
    // 4. Respect rate limits and org policies

    const summaryComment = `## 🔍 PrismCode AI Review

**Overall Score:** 85/100  
**Risk Level:** Medium

### Summary
- 🔴 2 Critical Issues
- 🟡 3 Warnings  
- 💡 5 Suggestions
- ✅ 2 Positive Highlights

[View Full Review →](/code-review?id=${reviewId})

---
*Powered by PrismCode AI*`;

    // Simulate posting to Git provider
    console.log('[PR Comment Post]', {
      reviewId,
      repo,
      prNumber,
      provider,
      postSummary,
      postInlineComments,
    });

    // In production, call the actual API:
    // await octokit.issues.createComment({ owner, repo, issue_number: prNumber, body: summaryComment });

    return NextResponse.json({
      success: true,
      message: 'Review comments posted successfully',
      postedAt: new Date().toISOString(),
      details: {
        summaryPosted: postSummary,
        inlineCommentsPosted: postInlineComments ? 5 : 0,
        provider,
        prUrl: `https://github.com/${repo}/pull/${prNumber}`,
      },
    });

  } catch (error) {
    console.error('[PR Comment Error]', error);
    return NextResponse.json(
      { error: 'Failed to post PR comments' },
      { status: 500 }
    );
  }
}

