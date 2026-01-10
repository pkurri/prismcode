import { NextRequest, NextResponse } from 'next/server';

// Multi-Model AI Orchestration API
// Route tasks to optimal models with fallback and cost optimization

interface ModelProvider {
  id: string;
  name: string;
  type: 'cloud' | 'local';
  models: Model[];
  status: 'active' | 'degraded' | 'offline';
  latencyMs: number;
}

interface Model {
  id: string;
  name: string;
  capabilities: string[];
  costPer1kTokens: number;
  speedRating: number;
  qualityRating: number;
  contextWindow: number;
}

interface RoutingDecision {
  selectedModel: string;
  provider: string;
  reason: string;
  estimatedCost: number;
  estimatedLatency: number;
  fallbackOptions: string[];
}

// Mock provider configurations
const providers: ModelProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'cloud',
    status: 'active',
    latencyMs: 150,
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', capabilities: ['chat', 'code', 'vision', 'function-calling'], costPer1kTokens: 0.005, speedRating: 9, qualityRating: 10, contextWindow: 128000 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', capabilities: ['chat', 'code', 'function-calling'], costPer1kTokens: 0.00015, speedRating: 10, qualityRating: 8, contextWindow: 128000 },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'cloud',
    status: 'active',
    latencyMs: 180,
    models: [
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', capabilities: ['chat', 'code', 'vision'], costPer1kTokens: 0.003, speedRating: 8, qualityRating: 10, contextWindow: 200000 },
      { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', capabilities: ['chat', 'code'], costPer1kTokens: 0.0003, speedRating: 10, qualityRating: 7, contextWindow: 200000 },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    type: 'cloud',
    status: 'active',
    latencyMs: 200,
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', capabilities: ['chat', 'code', 'vision', 'function-calling'], costPer1kTokens: 0.0001, speedRating: 10, qualityRating: 8, contextWindow: 1000000 },
    ],
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    type: 'local',
    status: 'active',
    latencyMs: 50,
    models: [
      { id: 'codellama:13b', name: 'CodeLlama 13B', capabilities: ['code'], costPer1kTokens: 0, speedRating: 7, qualityRating: 7, contextWindow: 16384 },
      { id: 'deepseek-coder:6.7b', name: 'DeepSeek Coder', capabilities: ['code'], costPer1kTokens: 0, speedRating: 8, qualityRating: 6, contextWindow: 16384 },
    ],
  },
];

// Task routing policies
const routingPolicies: Record<string, { preferredModels: string[], strategy: 'cost' | 'speed' | 'quality' }> = {
  'code-completion': { preferredModels: ['gpt-4o-mini', 'claude-3-5-haiku', 'gemini-2.0-flash'], strategy: 'speed' },
  'code-review': { preferredModels: ['claude-3-5-sonnet', 'gpt-4o'], strategy: 'quality' },
  'debugging': { preferredModels: ['gpt-4o', 'claude-3-5-sonnet'], strategy: 'quality' },
  'chat': { preferredModels: ['gemini-2.0-flash', 'gpt-4o-mini', 'claude-3-5-haiku'], strategy: 'cost' },
  'vision': { preferredModels: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-2.0-flash'], strategy: 'quality' },
};

// Usage tracking
const usageStats: Map<string, { requests: number, tokens: number, cost: number }> = new Map();

function selectOptimalModel(task: string, forceLocal: boolean = false): RoutingDecision {
  const policy = routingPolicies[task] || routingPolicies['chat'];
  
  const availableModels = providers
    .filter(p => p.status !== 'offline' && (!forceLocal || p.type === 'local'))
    .flatMap(p => p.models.filter(m => m.capabilities.includes(task.split('-')[0]) || task === 'chat')
      .map(m => ({ ...m, provider: p.name, latency: p.latencyMs })));

  if (availableModels.length === 0) {
    throw new Error('No available models for task');
  }

  // Sort based on strategy
  let sorted = availableModels;
  if (policy.strategy === 'cost') {
    sorted = availableModels.sort((a, b) => a.costPer1kTokens - b.costPer1kTokens);
  } else if (policy.strategy === 'speed') {
    sorted = availableModels.sort((a, b) => b.speedRating - a.speedRating);
  } else {
    sorted = availableModels.sort((a, b) => b.qualityRating - a.qualityRating);
  }

  const selected = sorted[0];
  const fallbacks = sorted.slice(1, 4).map(m => m.id);

  return {
    selectedModel: selected.id,
    provider: selected.provider,
    reason: `Selected for ${policy.strategy}: ${selected.name}`,
    estimatedCost: selected.costPer1kTokens,
    estimatedLatency: selected.latency,
    fallbackOptions: fallbacks,
  };
}

// GET: Get providers, models, or routing decision
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view');
  const task = searchParams.get('task');
  const forceLocal = searchParams.get('forceLocal') === 'true';

  // Get routing decision for task
  if (task) {
    try {
      const decision = selectOptimalModel(task, forceLocal);
      return NextResponse.json(decision);
    } catch (error) {
      return NextResponse.json({ error: 'No available models' }, { status: 503 });
    }
  }

  // Get usage stats
  if (view === 'usage') {
    return NextResponse.json({
      usage: Object.fromEntries(usageStats),
      totalRequests: Array.from(usageStats.values()).reduce((s, u) => s + u.requests, 0),
      totalTokens: Array.from(usageStats.values()).reduce((s, u) => s + u.tokens, 0),
      totalCost: Array.from(usageStats.values()).reduce((s, u) => s + u.cost, 0),
    });
  }

  // Get policies
  if (view === 'policies') {
    return NextResponse.json({ policies: routingPolicies });
  }

  // Default: list providers
  return NextResponse.json({
    providers: providers.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      status: p.status,
      modelCount: p.models.length,
    })),
    models: providers.flatMap(p => p.models.map(m => ({ ...m, provider: p.id }))),
  });
}

// POST: Make AI request with orchestration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task, prompt, forceLocal, forceModel, maxTokens = 1000 } = body;

    if (!task || !prompt) {
      return NextResponse.json({ error: 'task and prompt required' }, { status: 400 });
    }

    // Get routing decision
    let decision: RoutingDecision;
    if (forceModel) {
      const allModels = providers.flatMap(p => p.models);
      const model = allModels.find(m => m.id === forceModel);
      if (!model) {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });
      }
      decision = {
        selectedModel: forceModel,
        provider: providers.find(p => p.models.some(m => m.id === forceModel))?.name || 'Unknown',
        reason: 'Forced model selection',
        estimatedCost: model.costPer1kTokens,
        estimatedLatency: 100,
        fallbackOptions: [],
      };
    } else {
      decision = selectOptimalModel(task, forceLocal);
    }

    // Track usage
    const existing = usageStats.get(decision.selectedModel) || { requests: 0, tokens: 0, cost: 0 };
    usageStats.set(decision.selectedModel, {
      requests: existing.requests + 1,
      tokens: existing.tokens + maxTokens,
      cost: existing.cost + (decision.estimatedCost * maxTokens / 1000),
    });

    console.log('[AI Orchestration]', { task, model: decision.selectedModel, provider: decision.provider });

    // Mock response (in production, call actual API)
    return NextResponse.json({
      routing: decision,
      response: {
        id: `resp-${Date.now()}`,
        model: decision.selectedModel,
        content: `[Mock response from ${decision.selectedModel}] Your ${task} request has been processed.`,
        tokens: { prompt: 50, completion: maxTokens },
        latencyMs: decision.estimatedLatency + Math.random() * 50,
      },
    });

  } catch (error) {
    console.error('[AI Orchestration Error]', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
