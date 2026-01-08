import { orchestrationEngine } from '../../../src/advanced/orchestration';

describe('OrchestrationEngine', () => {
  describe('createPlan', () => {
    it('should create plan for refactoring task', () => {
      const plan = orchestrationEngine.createPlan('Refactor the authentication module');

      expect(plan).toBeDefined();
      expect(plan.id).toMatch(/^plan_/);
      expect(plan.steps.length).toBeGreaterThan(0);
      expect(plan.steps.some((s) => s.name.includes('refactoring'))).toBe(true);
    });

    it('should create plan for documentation task', () => {
      const plan = orchestrationEngine.createPlan('Document the API endpoints');

      expect(plan.steps.some((s) => s.type === 'generation')).toBe(true);
    });

    it('should create generic plan for unknown tasks', () => {
      const plan = orchestrationEngine.createPlan('Do something complex');

      expect(plan.steps.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('executePlan', () => {
    it('should execute a plan and return results', async () => {
      const plan = orchestrationEngine.createPlan('Generate test cases');
      const result = await orchestrationEngine.executePlan(plan.id);

      expect(result.planId).toBe(plan.id);
      expect(result.stepResults.length).toBe(plan.steps.length);
      expect(result.finalOutput).toContain('Orchestration Result');
    });

    it('should throw error for unknown plan', async () => {
      await expect(orchestrationEngine.executePlan('unknown_id')).rejects.toThrow('Plan not found');
    });
  });

  describe('synthesizeResults', () => {
    it('should combine successful results', () => {
      const results = [
        {
          stepId: '1',
          success: true,
          output: 'Step 1 done',
          model: 'gpt-4',
          cost: 0.01,
          duration: 100,
        },
        {
          stepId: '2',
          success: true,
          output: 'Step 2 done',
          model: 'gpt-4',
          cost: 0.01,
          duration: 100,
        },
      ];

      const output = orchestrationEngine.synthesizeResults(results, 'Test objective');

      expect(output).toContain('Step 1 done');
      expect(output).toContain('Step 2 done');
    });
  });
});
