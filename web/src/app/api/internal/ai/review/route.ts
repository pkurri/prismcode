import { NextRequest, NextResponse } from 'next/server';

// Internal AI Review API - for other services
// This is an alias/shortcut to the orchestration endpoint optimized for code review

interface ReviewRequest {
  diff: string;
  prNumber?: number;
  repo?: string;
  files?: { path: string; content: string }[];
  focusAreas?: ('security' | 'performance' | 'style' | 'tests')[];
}

interface ReviewResponse {
  id: string;
  summary: string;
  score: number;
  findings: ReviewFinding[];
  model: string;
}

interface ReviewFinding {
  severity: 'critical' | 'warning' | 'suggestion' | 'positive';
  category: string;
  title: string;
  description: string;
  file?: string;
  line?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ReviewRequest = await request.json();
    const { diff, prNumber, repo, files, focusAreas } = body;

    if (!diff) {
      return NextResponse.json(
        { error: 'diff is required' },
        { status: 400 }
      );
    }

    // Build prompt for code review
    const focusAreaText = focusAreas?.length 
      ? `Focus on: ${focusAreas.join(', ')}\n\n` 
      : '';
    
    const prompt = `${focusAreaText}Review the following code changes and provide structured feedback:\n\n${diff}`;

    // Call the main orchestration endpoint internally
    const orchestrationResponse = await fetch(new URL('/api/ai/orchestration', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'code-review',
        strategy: 'quality', // Prioritize quality for reviews
        prompt,
        context: `PR: ${prNumber || 'N/A'}, Repo: ${repo || 'N/A'}`,
      }),
    });

    if (!orchestrationResponse.ok) {
      throw new Error('Orchestration request failed');
    }

    const result = await orchestrationResponse.json();

    // Parse AI response into structured findings (simulated)
    const response: ReviewResponse = {
      id: result.id,
      summary: 'AI review completed successfully',
      score: Math.floor(75 + Math.random() * 20),
      findings: [
        {
          severity: 'suggestion',
          category: 'style',
          title: 'Consider adding type annotations',
          description: 'Adding explicit type annotations improves code readability and maintainability.',
        },
      ],
      model: result.model,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[AI Review Error]', error);
    return NextResponse.json(
      { error: 'Failed to review code' },
      { status: 500 }
    );
  }
}
