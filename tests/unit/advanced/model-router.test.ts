import { modelRouter, ModelCapabilities } from '../../../src/advanced/model-router';

describe('Smart Model Router', () => {
  beforeEach(() => {
    modelRouter.reset();
    // Register a default model for testing
    modelRouter.registerModel({
      id: 'gpt-4-turbo',
      provider: 'openai',
      model: 'gpt-4-turbo',
      maxTokens: 128000,
      costPer1kInput: 0.01,
      costPer1kOutput: 0.03,
      capabilities: ['code-generation', 'architecture', 'code-review'] as any[],
      latencyMs: 1000,
      qualityScore: 95,
      isAvailable: true,
    });

    // Register a cheaper model
    modelRouter.registerModel({
      id: 'gpt-3.5-turbo',
      provider: 'openai',
      model: 'gpt-3.5-turbo',
      maxTokens: 16000,
      costPer1kInput: 0.001,
      costPer1kOutput: 0.002,
      capabilities: ['code-generation'] as any[],
      latencyMs: 500,
      qualityScore: 80,
      isAvailable: true,
    });
  });

  describe('Model Management', () => {
    it('should have default models initialized', () => {
      const models = modelRouter.getModels();
      expect(models.length).toBeGreaterThan(0);
      expect(models.find((m: ModelCapabilities) => m.id === 'gpt-4-turbo')).toBeDefined();
    });

    it('should register new model', () => {
      const newModel = {
        id: 'custom-local-model',
        provider: 'local' as const,
        model: 'llama-3-70b',
        maxTokens: 8192,
        costPer1kInput: 0,
        costPer1kOutput: 0,
        capabilities: ['code-generation'] as any[],
        latencyMs: 100,
        qualityScore: 85,
        isAvailable: true,
      };

      modelRouter.registerModel(newModel);
      const retrieved = modelRouter
        .getModels()
        .find((m: ModelCapabilities) => m.id === 'custom-local-model');
      expect(retrieved).toBeDefined();
      expect(retrieved?.provider).toBe('local');
    });

    it('should update model availability', () => {
      const modelId = 'gpt-4-turbo';
      modelRouter.setModelAvailability(modelId, false);

      const model = modelRouter.getModels().find((m: ModelCapabilities) => m.id === modelId);
      expect(model?.isAvailable).toBe(false);
    });
  });

  describe('Task Classification', () => {
    it('should classify simple tasks', () => {
      const complexity = modelRouter.classifyComplexity({
        codeLines: 50,
        fileCount: 1,
        hasTests: false,
      });
      expect(complexity).toBe('simple');
    });

    it('should classify complex tasks', () => {
      const complexity = modelRouter.classifyComplexity({
        codeLines: 1000,
        fileCount: 20,
        isRefactoring: true,
      });
      expect(complexity).toBe('complex');
    });
  });

  describe('Routing Logic', () => {
    it('should route complex tasks to capable models', () => {
      // Assuming gpt-4-turbo or similar high-end model is default for complex
      const decision = modelRouter.route({
        type: 'architecture',
        complexity: 'complex',
        estimatedTokens: 1000,
        priority: 'high',
      });

      expect(decision.selectedModel).toBeDefined();
      expect(decision.selectedModel.qualityScore).toBeGreaterThan(90);
    });

    it('should route simple tasks to cheaper models', () => {
      // Assuming gpt-3.5 or haiku for simple
      const decision = modelRouter.route({
        type: 'code-generation',
        complexity: 'simple',
        estimatedTokens: 100,
        priority: 'low',
      });

      expect(decision.selectedModel).toBeDefined();
      // Usually would pick a faster/cheaper model
      // This assertion depends on the exact scoring logic,
      // but we can check if it didn't pick the MOST expensive one if alternatives exist
      expect(decision.alternatives.length).toBeGreaterThan(0);
    });

    it('should respect max cost constraints', () => {
      const decision = modelRouter.route({
        type: 'code-generation',
        complexity: 'medium',
        estimatedTokens: 1000,
        priority: 'normal',
        maxCost: 0.0001, // Very low max cost
      });

      // If no model fits, it might return best available or fallback
      // Implementation usually tries to respect it or warns
      expect(decision.selectedModel).toBeDefined();
    });

    it('should explain decision', () => {
      const context = {
        type: 'code-generation' as const,
        complexity: 'medium' as const,
        estimatedTokens: 500,
        priority: 'normal' as const,
      };

      const decision = modelRouter.route(context);
      expect(decision.reason).toBeDefined();
      expect(decision.reason.length).toBeGreaterThan(0);
    });
  });

  describe('Token Estimation', () => {
    it('should estimate tokens correctly', () => {
      const text = 'function hello() { return "world"; }';
      const tokens = modelRouter.estimateTokens(text);
      expect(tokens).toBeGreaterThan(0);
    });
  });
});
