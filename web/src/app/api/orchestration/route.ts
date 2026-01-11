import { NextRequest, NextResponse } from 'next/server';

// Multi-Model Orchestration API - implements #309
interface ModelRequest {
  taskId: string;
  prompt: string;
  taskType: 'code' | 'chat' | 'analysis' | 'creative';
  constraints?: {
    maxCost?: number;
    maxLatency?: number;
    minContext?: number;
  };
  preferredModel?: string;
}

interface ModelResponse {
  taskId: string;
  selectedModel: string;
  reasoning: string;
  completion: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
    latencyMs: number;
  };
}

// Mock model registry details
const models = {
  'gpt-4-turbo': { costInput: 10, costOutput: 30, speed: 50, quality: 0.95, context: 128000 },
  'claude-3-opus': { costInput: 15, costOutput: 75, speed: 30, quality: 0.98, context: 200000 },
  'claude-3-haiku': { costInput: 0.25, costOutput: 1.25, speed: 95, quality: 0.80, context: 200000 },
  'gpt-3.5-turbo': { costInput: 0.5, costOutput: 1.5, speed: 90, quality: 0.75, context: 16000 },
  'gemini-1.5-pro': { costInput: 3.5, costOutput: 10.5, speed: 60, quality: 0.90, context: 1000000 },
};

function selectModel(req: ModelRequest): { id: string; reason: string } {
  // 1. Explicit preference override
  if (req.preferredModel && models[req.preferredModel as keyof typeof models]) {
    return { id: req.preferredModel, reason: 'User preference' };
  }

  // 2. Task-based heuristic
  if (req.taskType === 'code') {
    // For code, prefer capability unless strict constraints
    if (req.constraints?.maxCost && req.constraints.maxCost < 0.01) {
      return { id: 'claude-3-haiku', reason: 'Cost constraint on code task' };
    }
    return { id: 'claude-3-opus', reason: 'Complex coding task requires highest reasoning' };
  }

  if (req.taskType === 'analysis' && req.prompt.length > 50000) {
    return { id: 'gemini-1.5-pro', reason: 'Large context window required for analysis' };
  }

  if (req.taskType === 'chat' || req.taskType === 'creative') {
    return { id: 'gpt-3.5-turbo', reason: 'Balanced chat model' };
  }

  // Default fallback
  return { id: 'gpt-4-turbo', reason: 'Default high-performance fallback' };
}

export async function POST(request: NextRequest) {
  try {
    const body: ModelRequest = await request.json();
    
    if (!body.prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const selection = selectModel(body);
    const selectedModelData = models[selection.id as keyof typeof models];

    // Mock completion (in real app, would call provider API)
    const mockLatency = Math.random() * 1000 + (100 - selectedModelData.speed) * 10;
    
    // Simulate thinking...
    // await new Promise(r => setTimeout(r, mockLatency));

    const response: ModelResponse = {
      taskId: body.taskId || `task-${Date.now()}`,
      selectedModel: selection.id,
      reasoning: selection.reason,
      completion: `[Simulated response from ${selection.id}] Based on your prompt "${body.prompt.substring(0, 20)}...", here is the solution...`,
      usage: {
        inputTokens: body.prompt.length / 4,
        outputTokens: 150,
        cost: 0.002, // simplified
        latencyMs: Math.round(mockLatency),
      },
    };

    return NextResponse.json({ success: true, data: response });

  } catch (error) {
    return NextResponse.json({ error: 'Orchestration failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'ai-orchestrator',
    models: Object.keys(models).map(id => ({
      id,
      ...models[id as keyof typeof models]
    })),
    strategy: 'adaptive-heuristic',
  });
}
