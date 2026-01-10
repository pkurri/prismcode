import { NextRequest, NextResponse } from 'next/server';

// Model Registry with supported models
const modelRegistry = [
  {
    id: 'gpt-4-turbo',
    provider: 'openai',
    name: 'GPT-4 Turbo',
    contextWindow: 128000,
    pricing: { input: 0.01, output: 0.03 },
    latencyMs: 800,
    capabilities: ['code-generation', 'code-review', 'docs', 'tests', 'chat'],
    quality: 'high',
    status: 'available',
  },
  {
    id: 'gpt-4o',
    provider: 'openai',
    name: 'GPT-4o',
    contextWindow: 128000,
    pricing: { input: 0.005, output: 0.015 },
    latencyMs: 500,
    capabilities: ['code-generation', 'code-review', 'docs', 'tests', 'chat', 'multimodal'],
    quality: 'high',
    status: 'available',
  },
  {
    id: 'gpt-3.5-turbo',
    provider: 'openai',
    name: 'GPT-3.5 Turbo',
    contextWindow: 16000,
    pricing: { input: 0.0005, output: 0.0015 },
    latencyMs: 200,
    capabilities: ['code-generation', 'docs', 'chat'],
    quality: 'medium',
    status: 'available',
  },
  {
    id: 'claude-3-opus',
    provider: 'anthropic',
    name: 'Claude 3 Opus',
    contextWindow: 200000,
    pricing: { input: 0.015, output: 0.075 },
    latencyMs: 1200,
    capabilities: ['code-generation', 'code-review', 'docs', 'tests', 'chat'],
    quality: 'highest',
    status: 'available',
  },
  {
    id: 'claude-3-sonnet',
    provider: 'anthropic',
    name: 'Claude 3.5 Sonnet',
    contextWindow: 200000,
    pricing: { input: 0.003, output: 0.015 },
    latencyMs: 600,
    capabilities: ['code-generation', 'code-review', 'docs', 'tests', 'chat'],
    quality: 'high',
    status: 'available',
  },
  {
    id: 'gemini-pro',
    provider: 'google',
    name: 'Gemini 1.5 Pro',
    contextWindow: 1000000,
    pricing: { input: 0.00125, output: 0.005 },
    latencyMs: 400,
    capabilities: ['code-generation', 'code-review', 'docs', 'chat', 'multimodal'],
    quality: 'high',
    status: 'available',
  },
  {
    id: 'deepseek-coder',
    provider: 'deepseek',
    name: 'DeepSeek Coder V2',
    contextWindow: 128000,
    pricing: { input: 0.00014, output: 0.00028 },
    latencyMs: 300,
    capabilities: ['code-generation', 'code-review', 'tests'],
    quality: 'high',
    status: 'available',
  },
];

// Routing policies per task type
const routingPolicies = {
  'code-generation': {
    cost: ['deepseek-coder', 'gpt-3.5-turbo', 'claude-3-sonnet'],
    speed: ['gpt-3.5-turbo', 'deepseek-coder', 'gemini-pro'],
    quality: ['claude-3-opus', 'gpt-4-turbo', 'claude-3-sonnet'],
  },
  'code-review': {
    cost: ['deepseek-coder', 'claude-3-sonnet', 'gpt-4-turbo'],
    speed: ['claude-3-sonnet', 'gpt-4o', 'gemini-pro'],
    quality: ['claude-3-opus', 'gpt-4-turbo', 'claude-3-sonnet'],
  },
  'docs': {
    cost: ['gpt-3.5-turbo', 'gemini-pro', 'claude-3-sonnet'],
    speed: ['gpt-3.5-turbo', 'gemini-pro', 'gpt-4o'],
    quality: ['claude-3-opus', 'gpt-4-turbo', 'claude-3-sonnet'],
  },
  'tests': {
    cost: ['deepseek-coder', 'claude-3-sonnet', 'gpt-4-turbo'],
    speed: ['deepseek-coder', 'claude-3-sonnet', 'gpt-4o'],
    quality: ['claude-3-opus', 'gpt-4-turbo', 'deepseek-coder'],
  },
  'chat': {
    cost: ['gpt-3.5-turbo', 'gemini-pro', 'claude-3-sonnet'],
    speed: ['gpt-3.5-turbo', 'gemini-pro', 'gpt-4o'],
    quality: ['claude-3-sonnet', 'gpt-4o', 'claude-3-opus'],
  },
};

type TaskType = keyof typeof routingPolicies;
type RoutingStrategy = 'cost' | 'speed' | 'quality';

interface OrchestrationRequest {
  task: TaskType;
  strategy?: RoutingStrategy;
  prompt: string;
  context?: string;
  preferredModel?: string;
  maxTokens?: number;
  temperature?: number;
}

interface OrchestrationResponse {
  id: string;
  model: string;
  provider: string;
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
  };
  latencyMs: number;
  fallbackUsed: boolean;
}

// Select the best model based on task and strategy
function selectModel(task: TaskType, strategy: RoutingStrategy = 'quality', preferredModel?: string) {
  // If preferred model is specified and available, use it
  if (preferredModel) {
    const model = modelRegistry.find(m => m.id === preferredModel && m.status === 'available');
    if (model) return model;
  }

  // Get the ranking for the task and strategy
  const ranking = routingPolicies[task]?.[strategy] || routingPolicies['chat'][strategy];
  
  // Find the first available model in the ranking
  for (const modelId of ranking) {
    const model = modelRegistry.find(m => m.id === modelId && m.status === 'available');
    if (model) return model;
  }

  // Fallback to first available model
  return modelRegistry.find(m => m.status === 'available') || modelRegistry[0];
}

// GET: List available models and their capabilities
export async function GET() {
  return NextResponse.json({
    models: modelRegistry,
    routingPolicies,
    taskTypes: Object.keys(routingPolicies),
    strategies: ['cost', 'speed', 'quality'],
  });
}

// POST: Execute AI request with intelligent routing
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: OrchestrationRequest = await request.json();
    const { task, strategy = 'quality', prompt, context, preferredModel, maxTokens = 2048, temperature = 0.7 } = body;

    // Validate task type
    if (!Object.keys(routingPolicies).includes(task)) {
      return NextResponse.json(
        { error: `Invalid task type. Supported: ${Object.keys(routingPolicies).join(', ')}` },
        { status: 400 }
      );
    }

    // Select the best model
    const selectedModel = selectModel(task as TaskType, strategy as RoutingStrategy, preferredModel);
    
    // Build the full prompt with context
    const fullPrompt = context ? `Context:\n${context}\n\nTask:\n${prompt}` : prompt;

    // In a real implementation, this would call the actual AI provider API
    // For now, we simulate a response
    const simulatedResponse = {
      content: `[Simulated ${selectedModel.name} response for ${task}]\n\nBased on your request: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"\n\nThis is a placeholder response. In production, this would call the ${selectedModel.provider} API.`,
      inputTokens: Math.ceil(fullPrompt.length / 4),
      outputTokens: Math.ceil(200 + Math.random() * 300),
    };

    const estimatedCost = 
      (simulatedResponse.inputTokens / 1000) * selectedModel.pricing.input +
      (simulatedResponse.outputTokens / 1000) * selectedModel.pricing.output;

    const response: OrchestrationResponse = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      model: selectedModel.id,
      provider: selectedModel.provider,
      content: simulatedResponse.content,
      usage: {
        inputTokens: simulatedResponse.inputTokens,
        outputTokens: simulatedResponse.outputTokens,
        estimatedCost: Math.round(estimatedCost * 10000) / 10000,
      },
      latencyMs: Date.now() - startTime,
      fallbackUsed: preferredModel !== undefined && preferredModel !== selectedModel.id,
    };

    // Log the request for analytics (in production, this would go to a database)
    console.log('[AI Orchestration]', {
      requestId: response.id,
      task,
      strategy,
      model: selectedModel.id,
      tokens: response.usage,
      latencyMs: response.latencyMs,
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('[AI Orchestration Error]', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
