/**
 * Smart Model Router
 * Issue #215: Smart Model Routing
 *
 * Automatically route tasks to optimal models based on complexity and cost
 */

import logger from '../utils/logger';

export interface ModelCapabilities {
  id: string;
  provider: 'openai' | 'anthropic' | 'google' | 'local';
  model: string;
  maxTokens: number;
  costPer1kInput: number;
  costPer1kOutput: number;
  capabilities: ModelCapability[];
  latencyMs: number; // Average latency
  qualityScore: number; // 0-100 quality rating
  isAvailable: boolean;
  endpoint?: string; // For local models
  supportsVision?: boolean; // Vision/multimodal capability
}

export type ModelCapability =
  | 'code-generation'
  | 'code-review'
  | 'documentation'
  | 'testing'
  | 'refactoring'
  | 'architecture'
  | 'debugging'
  | 'explanation'
  | 'translation'
  | 'summarization'
  | 'vision'
  | 'multimodal';

export interface TaskContext {
  type: ModelCapability;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTokens: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  requiresLatestContext?: boolean;
  preferredProvider?: string;
  maxCost?: number;
}

export interface RoutingDecision {
  selectedModel: ModelCapabilities;
  reason: string;
  estimatedCost: number;
  alternatives: ModelCapabilities[];
  confidence: number; // 0-1
}

export interface RoutingPolicy {
  name: string;
  costWeight: number; // 0-1, how much to prioritize cost
  qualityWeight: number; // 0-1, how much to prioritize quality
  latencyWeight: number; // 0-1, how much to prioritize speed
  fallbackModels: string[];
  blockedModels: string[];
}

// Default model configurations
const DEFAULT_MODELS: ModelCapabilities[] = [
  {
    id: 'gpt-4-turbo',
    provider: 'openai',
    model: 'gpt-4-turbo',
    maxTokens: 128000,
    costPer1kInput: 0.01,
    costPer1kOutput: 0.03,
    capabilities: ['code-generation', 'code-review', 'architecture', 'debugging', 'explanation'],
    latencyMs: 2000,
    qualityScore: 95,
    isAvailable: true,
  },
  {
    id: 'gpt-4o',
    provider: 'openai',
    model: 'gpt-4o',
    maxTokens: 128000,
    costPer1kInput: 0.005,
    costPer1kOutput: 0.015,
    capabilities: [
      'code-generation',
      'code-review',
      'documentation',
      'testing',
      'explanation',
      'vision',
      'multimodal',
    ],
    latencyMs: 1500,
    qualityScore: 92,
    isAvailable: true,
    supportsVision: true,
  },
  {
    id: 'gpt-3.5-turbo',
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    maxTokens: 16384,
    costPer1kInput: 0.0005,
    costPer1kOutput: 0.0015,
    capabilities: ['documentation', 'explanation', 'summarization', 'translation'],
    latencyMs: 500,
    qualityScore: 75,
    isAvailable: true,
  },
  {
    id: 'claude-3-opus',
    provider: 'anthropic',
    model: 'claude-3-opus-20240229',
    maxTokens: 200000,
    costPer1kInput: 0.015,
    costPer1kOutput: 0.075,
    capabilities: ['code-generation', 'architecture', 'code-review', 'debugging', 'explanation'],
    latencyMs: 3000,
    qualityScore: 97,
    isAvailable: true,
  },
  {
    id: 'claude-3-sonnet',
    provider: 'anthropic',
    model: 'claude-3-sonnet-20240229',
    maxTokens: 200000,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    capabilities: ['code-generation', 'code-review', 'testing', 'refactoring', 'documentation'],
    latencyMs: 1500,
    qualityScore: 88,
    isAvailable: true,
  },
  {
    id: 'claude-3-haiku',
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    maxTokens: 200000,
    costPer1kInput: 0.00025,
    costPer1kOutput: 0.00125,
    capabilities: ['documentation', 'summarization', 'translation', 'explanation'],
    latencyMs: 400,
    qualityScore: 70,
    isAvailable: true,
  },
];

/**
 * Smart Model Router
 * Routes tasks to optimal models based on cost/quality tradeoffs
 */
export class ModelRouter {
  private models: Map<string, ModelCapabilities> = new Map();
  private policy: RoutingPolicy = {
    name: 'balanced',
    costWeight: 0.4,
    qualityWeight: 0.4,
    latencyWeight: 0.2,
    fallbackModels: ['gpt-3.5-turbo', 'claude-3-haiku'],
    blockedModels: [],
  };
  private usageHistory: Map<string, number> = new Map();

  constructor() {
    // Load default models
    for (const model of DEFAULT_MODELS) {
      this.models.set(model.id, model);
    }
    logger.info('ModelRouter initialized', { modelCount: this.models.size });
  }

  /**
   * Route a task to the optimal model
   */
  route(context: TaskContext): RoutingDecision {
    const candidates = this.getCandidates(context);

    if (candidates.length === 0) {
      throw new Error('No suitable models available for this task');
    }

    // Score each candidate
    const scored = candidates.map((model) => ({
      model,
      score: this.scoreModel(model, context),
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    const selected = scored[0].model;
    const estimatedCost = this.estimateCost(selected, context.estimatedTokens);

    const decision: RoutingDecision = {
      selectedModel: selected,
      reason: this.explainDecision(selected, context),
      estimatedCost,
      alternatives: scored.slice(1, 4).map((s) => s.model),
      confidence: scored[0].score / 100,
    };

    // Track usage
    this.usageHistory.set(selected.id, (this.usageHistory.get(selected.id) || 0) + 1);

    logger.info('Model routed', {
      task: context.type,
      complexity: context.complexity,
      selected: selected.id,
      cost: estimatedCost,
    });

    return decision;
  }

  /**
   * Set routing policy
   */
  setPolicy(policy: Partial<RoutingPolicy>): void {
    this.policy = { ...this.policy, ...policy };

    // Normalize weights
    const totalWeight =
      this.policy.costWeight + this.policy.qualityWeight + this.policy.latencyWeight;
    if (totalWeight > 0) {
      this.policy.costWeight /= totalWeight;
      this.policy.qualityWeight /= totalWeight;
      this.policy.latencyWeight /= totalWeight;
    }

    logger.info('Routing policy updated', { policy: this.policy.name });
  }

  /**
   * Add or update a model
   */
  registerModel(model: ModelCapabilities): void {
    this.models.set(model.id, model);
    logger.info('Model registered', { id: model.id, provider: model.provider });
  }

  /**
   * Set model availability
   */
  setModelAvailability(modelId: string, isAvailable: boolean): void {
    const model = this.models.get(modelId);
    if (model) {
      model.isAvailable = isAvailable;
      logger.info('Model availability updated', { modelId, isAvailable });
    }
  }

  /**
   * Get all models
   */
  getModels(): ModelCapabilities[] {
    return Array.from(this.models.values());
  }

  /**
   * Get usage stats
   */
  getUsageStats(): Record<string, number> {
    return Object.fromEntries(this.usageHistory);
  }

  /**
   * Classify task complexity
   */
  classifyComplexity(context: {
    codeLines?: number;
    fileCount?: number;
    hasTests?: boolean;
    isRefactoring?: boolean;
  }): 'simple' | 'medium' | 'complex' {
    const lines = context.codeLines || 0;
    const files = context.fileCount || 1;

    if (context.isRefactoring || files > 5 || lines > 500) {
      return 'complex';
    }

    if (files > 2 || lines > 100 || context.hasTests) {
      return 'medium';
    }

    return 'simple';
  }

  /**
   * Estimate tokens for a task
   */
  estimateTokens(input: string, expectedOutputMultiplier: number = 1.5): number {
    // Rough estimation: 1 token ≈ 4 characters
    const inputTokens = Math.ceil(input.length / 4);
    const outputTokens = Math.ceil(inputTokens * expectedOutputMultiplier);
    return inputTokens + outputTokens;
  }

  // Private helpers

  private getCandidates(context: TaskContext): ModelCapabilities[] {
    return Array.from(this.models.values()).filter((model) => {
      // Must be available
      if (!model.isAvailable) return false;

      // Must not be blocked
      if (this.policy.blockedModels.includes(model.id)) return false;

      // Must have required capability
      if (!model.capabilities.includes(context.type)) return false;

      // Must fit token requirements
      if (model.maxTokens < context.estimatedTokens) return false;

      // Check max cost if specified
      if (context.maxCost) {
        const cost = this.estimateCost(model, context.estimatedTokens);
        if (cost > context.maxCost) return false;
      }

      // Check preferred provider
      if (context.preferredProvider && model.provider !== context.preferredProvider) {
        return false;
      }

      return true;
    });
  }

  private scoreModel(model: ModelCapabilities, context: TaskContext): number {
    // Normalize cost (inverse, lower is better)
    const cost = this.estimateCost(model, context.estimatedTokens);
    const maxCost = 1; // $1 as reference
    const costScore = Math.max(0, 100 - (cost / maxCost) * 100);

    // Quality score (already 0-100)
    const qualityScore = model.qualityScore;

    // Latency score (inverse, lower is better)
    const maxLatency = 5000; // 5s as reference
    const latencyScore = Math.max(0, 100 - (model.latencyMs / maxLatency) * 100);

    // Complexity bonus
    let complexityBonus = 0;
    if (context.complexity === 'complex' && model.qualityScore > 90) {
      complexityBonus = 10;
    } else if (context.complexity === 'simple' && model.costPer1kInput < 0.001) {
      complexityBonus = 15; // Prefer cheap models for simple tasks
    }

    // Priority bonus
    let priorityBonus = 0;
    if (context.priority === 'urgent' && model.latencyMs < 1000) {
      priorityBonus = 10;
    }

    // Calculate weighted score
    const baseScore =
      costScore * this.policy.costWeight +
      qualityScore * this.policy.qualityWeight +
      latencyScore * this.policy.latencyWeight;

    return baseScore + complexityBonus + priorityBonus;
  }

  private estimateCost(model: ModelCapabilities, estimatedTokens: number): number {
    // Assume 40% input, 60% output
    const inputTokens = estimatedTokens * 0.4;
    const outputTokens = estimatedTokens * 0.6;

    return (
      (inputTokens / 1000) * model.costPer1kInput + (outputTokens / 1000) * model.costPer1kOutput
    );
  }

  private explainDecision(model: ModelCapabilities, context: TaskContext): string {
    const reasons: string[] = [];

    if (context.complexity === 'complex') {
      reasons.push(`High quality (${model.qualityScore}/100) for complex ${context.type}`);
    } else if (context.complexity === 'simple') {
      reasons.push(`Cost-effective for simple ${context.type}`);
    }

    if (context.priority === 'urgent' && model.latencyMs < 1000) {
      reasons.push('Low latency for urgent task');
    }

    if (model.costPer1kInput < 0.001) {
      reasons.push('Budget-friendly option');
    }

    return reasons.join('; ') || `Best match for ${context.type}`;
  }

  /**
   * Reset router state
   */
  reset(): void {
    this.usageHistory.clear();
    logger.info('ModelRouter reset');
  }
}

export const modelRouter = new ModelRouter();
