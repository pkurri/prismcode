import { NextResponse } from 'next/server';

// Mock data - connects to code review backend
const reviewData = {
  prs: [
    {
      id: 1,
      title: 'feat: Add user authentication flow',
      author: 'alice',
      branch: 'feature/auth',
      score: 82,
      risk: 'medium',
      findings: [
        {
          type: 'critical',
          category: 'security',
          message: 'Potential SQL injection',
          file: 'src/auth/user.ts',
          line: 45,
        },
        {
          type: 'warning',
          category: 'performance',
          message: 'Consider caching',
          file: 'src/auth/session.ts',
          line: 23,
        },
      ],
    },
    {
      id: 2,
      title: 'fix: Resolve memory leak',
      author: 'bob',
      branch: 'bugfix/memory-leak',
      score: 94,
      risk: 'low',
      findings: [
        {
          type: 'positive',
          category: 'quality',
          message: 'Good cleanup patterns',
          file: 'src/processing/stream.ts',
          line: 78,
        },
      ],
    },
  ],
  stats: {
    reviewed: 234,
    approved: 189,
    avgScore: 85,
    criticalFound: 12,
  },
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: reviewData,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, prId, findingId, suggestion } = body;

  switch (action) {
    case 'analyze':
      return NextResponse.json({
        success: true,
        jobId: `review_${Date.now()}`,
        message: `Review started for PR #${prId}`,
      });
    case 'apply':
      return NextResponse.json({
        success: true,
        message: `Applied suggestion for finding ${findingId}`,
      });
    case 'ignore':
      return NextResponse.json({
        success: true,
        message: `Ignored finding ${findingId}`,
      });
    case 'comment':
      return NextResponse.json({
        success: true,
        message: 'Comment added to PR',
        commentId: `comment_${Date.now()}`,
      });
    default:
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  }
}
