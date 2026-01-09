import { NextResponse } from 'next/server';

// Mock data - connects to model-router, usage-analytics backend modules
const modelsData = {
  models: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      provider: 'OpenAI',
      status: 'active',
      calls: 1234,
      tokens: 2450000,
      cost: 45.67,
    },
    {
      id: 'claude-3.5-sonnet',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      status: 'active',
      calls: 892,
      tokens: 1890000,
      cost: 28.35,
    },
    {
      id: 'gemini-pro',
      name: 'Gemini 1.5 Pro',
      provider: 'Google',
      status: 'active',
      calls: 456,
      tokens: 980000,
      cost: 12.4,
    },
    {
      id: 'codestral',
      name: 'Codestral',
      provider: 'Mistral',
      status: 'active',
      calls: 678,
      tokens: 1230000,
      cost: 8.9,
    },
  ],
  usage: {
    today: { calls: 234, tokens: 1200000, cost: 4.56 },
    week: { calls: 1245, tokens: 6800000, cost: 23.45 },
    month: { calls: 4567, tokens: 24000000, cost: 89.12 },
  },
  routing: {
    policy: 'balanced',
    defaults: {
      codeGeneration: 'claude-3.5-sonnet',
      codeReview: 'gpt-4o',
      documentation: 'gpt-4-turbo',
      testGeneration: 'codestral',
      chat: 'claude-3.5-sonnet',
    },
  },
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: modelsData,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, modelId, task, policy } = body;

  switch (action) {
    case 'setDefault':
      return NextResponse.json({
        success: true,
        message: `Default model for ${task} set to ${modelId}`,
      });
    case 'setPolicy':
      return NextResponse.json({
        success: true,
        message: `Routing policy set to ${policy}`,
      });
    case 'test':
      return NextResponse.json({
        success: true,
        message: `Testing model ${modelId}`,
        latency: '245ms',
        status: 'healthy',
      });
    default:
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  }
}
