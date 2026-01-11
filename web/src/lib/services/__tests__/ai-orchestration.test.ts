import { selectModel, executeAIRequest, getAvailableModels } from '../ai-orchestration';

describe('AI Orchestration Service', () => {
  describe('selectModel', () => {
    it('selects cheapest model for cost strategy', () => {
      const model = selectModel('cost');
      expect(model.costPer1kTokens).toBeLessThanOrEqual(0.01);
    });

    it('selects fastest model for speed strategy', () => {
      const model = selectModel('speed');
      expect(model.latencyMs).toBeLessThanOrEqual(500);
    });

    it('returns a model for quality strategy', () => {
      const model = selectModel('quality');
      expect(model).toBeDefined();
      expect(model.id).toBeTruthy();
    });
  });

  describe('getAvailableModels', () => {
    it('returns available models', () => {
      const models = getAvailableModels();
      expect(models.length).toBeGreaterThan(0);
      expect(models[0]).toHaveProperty('id');
      expect(models[0]).toHaveProperty('name');
    });
  });

  describe('executeAIRequest', () => {
    it('executes request and returns response', async () => {
      const response = await executeAIRequest({
        id: 'test-1',
        prompt: 'Hello world',
      });
      expect(response.requestId).toBe('test-1');
      expect(response.content).toBeTruthy();
      expect(response.model).toBeTruthy();
    });
  });
});
