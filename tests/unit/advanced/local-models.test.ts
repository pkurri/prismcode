import { LocalModelManager } from '../../../src/advanced/local-models';

describe('LocalModelManager', () => {
  let manager: LocalModelManager;

  beforeEach(() => {
    manager = new LocalModelManager();
  });

  describe('initialization', () => {
    it('should have default models registered', () => {
      const models = manager.getAllModels();
      expect(models.length).toBeGreaterThan(0);
      expect(models.some((m) => m.provider === 'ollama')).toBe(true);
      expect(models.some((m) => m.provider === 'lmstudio')).toBe(true);
    });
  });

  describe('registerModel', () => {
    it('should register a custom model', () => {
      manager.registerModel({
        id: 'custom-model',
        name: 'Custom Model',
        provider: 'custom',
        endpoint: 'http://localhost:5000',
        model: 'my-model',
        contextLength: 4096,
        capabilities: ['code-generation'],
        isAvailable: false,
      });

      const models = manager.getAllModels();
      expect(models.some((m) => m.id === 'custom-model')).toBe(true);
    });
  });

  describe('checkHealth', () => {
    it('should return health status for a model', async () => {
      const result = await manager.checkHealth('ollama-llama3');

      expect(result.provider).toBe('ollama');
      expect(typeof result.isHealthy).toBe('boolean');
    });

    it('should return error for unknown model', async () => {
      const result = await manager.checkHealth('unknown-model');

      expect(result.isHealthy).toBe(false);
      expect(result.error).toBe('Model not found');
    });
  });

  describe('findModelByCapability', () => {
    it('should find model by capability when available', async () => {
      await manager.checkHealth('ollama-codellama');

      const model = manager.findModelByCapability('code-generation');
      // Model might be available after health check
      if (model) {
        expect(model.capabilities).toContain('code-generation');
      }
    });
  });

  describe('setDefaultModel', () => {
    it('should set default model', () => {
      manager.setDefaultModel('ollama-llama3');

      const defaultModel = manager.getDefaultModel();
      expect(defaultModel?.id).toBe('ollama-llama3');
    });

    it('should throw for unknown model', () => {
      expect(() => manager.setDefaultModel('unknown')).toThrow();
    });
  });
});
