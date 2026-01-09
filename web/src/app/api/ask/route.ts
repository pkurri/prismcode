import { NextResponse } from 'next/server';

// Service connecting to codebase-indexer.ts, nl-query.ts, embeddings.ts backend modules
const askService = {
  async query(question: string, context?: { files?: string[] }) {
    // In production: Connect to NaturalLanguageQuery from src/advanced/nl-query.ts
    // Uses CodebaseIndexer for RAG and Embeddings for semantic search

    const responses: Record<
      string,
      { answer: string; references: { file: string; line: number }[] }
    > = {
      default: {
        answer: `Based on the codebase analysis, I found relevant information about your query. The codebase uses TypeScript with Next.js for the frontend and has 75 backend modules in src/advanced/.`,
        references: [
          { file: 'src/advanced/index.ts', line: 1 },
          { file: 'web/src/app/layout.tsx', line: 1 },
        ],
      },
    };

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 300));

    return responses.default;
  },

  async getIndexStatus() {
    // In production: Connect to CodebaseIndexer.getStatus()
    return {
      indexed: true,
      lastUpdated: new Date().toISOString(),
      filesIndexed: 234,
      totalFiles: 240,
      embeddingsCount: 1560,
    };
  },

  async getSuggestions() {
    return [
      'How does authentication work?',
      'What is the architecture of the AI model routing?',
      'Show me the test coverage trends',
      'Explain the deployment pipeline',
    ];
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'status';

  try {
    switch (type) {
      case 'status':
        return NextResponse.json({ success: true, data: await askService.getIndexStatus() });
      case 'suggestions':
        return NextResponse.json({ success: true, data: await askService.getSuggestions() });
      default:
        return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get status' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, files } = body;

    if (!question) {
      return NextResponse.json({ success: false, error: 'Missing question' }, { status: 400 });
    }

    const result = await askService.query(question, { files });

    return NextResponse.json({
      success: true,
      ...result,
      queryId: `q_${Date.now()}`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Query failed' }, { status: 500 });
  }
}
