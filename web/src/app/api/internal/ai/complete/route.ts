import { NextRequest, NextResponse } from 'next/server';

// Internal AI Complete API - for other services
// This is an alias/shortcut to the main orchestration endpoint optimized for code completion

interface CompleteRequest {
  code: string;
  language: string;
  cursorPosition?: { line: number; column: number };
  context?: string;
  maxTokens?: number;
}

interface CompleteResponse {
  id: string;
  completion: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CompleteRequest = await request.json();
    const { code, language, cursorPosition, context, maxTokens = 256 } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: 'code and language are required' },
        { status: 400 }
      );
    }

    // Build prompt for code completion
    const prompt = cursorPosition 
      ? `Complete the following ${language} code at line ${cursorPosition.line}, column ${cursorPosition.column}:\n\n${code}`
      : `Complete the following ${language} code:\n\n${code}`;

    // Call the main orchestration endpoint internally
    const orchestrationResponse = await fetch(new URL('/api/ai/orchestration', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: 'code-generation',
        strategy: 'speed', // Prioritize speed for completions
        prompt,
        context,
        maxTokens,
      }),
    });

    if (!orchestrationResponse.ok) {
      throw new Error('Orchestration request failed');
    }

    const result = await orchestrationResponse.json();

    const response: CompleteResponse = {
      id: result.id,
      completion: result.content,
      model: result.model,
      usage: {
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[AI Complete Error]', error);
    return NextResponse.json(
      { error: 'Failed to complete code' },
      { status: 500 }
    );
  }
}
