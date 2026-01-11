import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    const cleanQuery = query.toLowerCase();

    let answer = '';
    let sources = [];

    // Mock RAG logic
    if (cleanQuery.includes('auth') || cleanQuery.includes('login') || cleanQuery.includes('guard')) {
      answer = "Authentication is handled via **NextAuth.js** (v4). The configuration is located in `web/src/app/api/auth/[...nextauth]/route.ts`. We support GitHub and Google providers. Protected routes are managed by the middleware in `web/src/middleware.ts` which checks for the `next-auth.session-token`.";
      sources = ['web/src/app/api/auth/[...nextauth]/route.ts', 'web/src/middleware.ts', 'web/src/components/auth-provider.tsx'];
    } else if (cleanQuery.includes('agent') || cleanQuery.includes('orchestrator')) {
      answer = "The Agent System is designed around a central **Orchestrator** that delegates tasks to specialized agents (Architect, Coder, QA). The core definitions are in `packages/agents/src/core`. Agents communicate via a customized event bus using the **Actor Model**. Each agent has a specific `systemPrompt` defining its persona and capabilities.";
      sources = ['packages/agents/src/core/orchestrator.ts', 'packages/agents/src/types/agent.ts', 'packages/agents/src/prompts/system.ts'];
    } else if (cleanQuery.includes('architecture') || cleanQuery.includes('stack')) {
      answer = "PrismCode uses a **modulith** architecture. \n\n- **Frontend**: Next.js 14 (App Router), TailwindCSS, Shadcn/ui.\n- **Backend**: Next.js API Routes (Serverless).\n- **Database**: PostgreSQL (Prisma ORM).\n- **AI**: OpenAI GPT-4 for logic, local embeddings for RAG.\n- **Infrastructure**: Docker for local dev, Vercel/AWS for deployment.";
      sources = ['README.md', 'web/package.json', 'prisma/schema.prisma'];
    } else if (cleanQuery.includes('test') || cleanQuery.includes('e2e')) {
        answer = "Testing is split into:\n1. **Unit Tests**: Jest for utility logic.\n2. **E2E Tests**: Playwright for full-stack verification.\n\nE2E tests are located in `web/e2e/` and cover Navigation, Core Features, and the Sandbox. You can run them with `npx playwright test`.";
        sources = ['web/playwright.config.ts', 'web/e2e/core-features.spec.ts', 'web/package.json'];
    } else {
      answer = "I found some relevant files but couldn't generate a specific answer for that. Here is a general summary of the project structure:\n\nThe project is a monorepo with `web` containing the Next.js application and `packages` containing shared logic. Key directories include `src/app` for routes and `src/components` for UI.";
      sources = ['STRUCTURE.md', 'web/src/app/page.tsx'];
    }

    // Simulate RAG latency
    await new Promise(resolve => setTimeout(resolve, 1200));

    return NextResponse.json({
      answer,
      sources,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    );
  }
}
