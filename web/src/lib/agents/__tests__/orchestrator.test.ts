import { registerAgent, getAgent, getAllAgents, executeAgentRun } from '../orchestrator';
import { productManagerAgent } from '../product-manager';

describe('Agent Orchestrator', () => {
  describe('registerAgent', () => {
    it('registers an agent', () => {
      registerAgent(productManagerAgent);
      const agent = getAgent(productManagerAgent.id);
      expect(agent).toBeDefined();
      expect(agent?.name).toBe(productManagerAgent.name);
    });
  });

  describe('getAllAgents', () => {
    it('returns all registered agents', () => {
      const agents = getAllAgents();
      expect(agents.length).toBeGreaterThan(0);
    });
  });

  describe('executeAgentRun', () => {
    it('executes a run with context', async () => {
      const context = {
        userId: 'user-1',
        projectId: 'proj-1',
        task: 'Generate requirements',
        input: { description: 'Build auth system' },
      };
      const result = await executeAgentRun(productManagerAgent.id, context);
      expect(result.status).toBe('success');
      expect(result.agentId).toBe(productManagerAgent.id);
    });
  });
});
