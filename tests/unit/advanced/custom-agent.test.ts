/**
 * Custom Agent Tests
 * Tests for Issue #122
 */

import { CustomAgentManager } from '../../../src/advanced/custom-agent';

describe('CustomAgentManager', () => {
  let manager: CustomAgentManager;

  beforeEach(() => {
    manager = new CustomAgentManager();
    manager.reset();
  });

  describe('createAgent', () => {
    it('should create custom agent', () => {
      const agent = manager.createAgent({
        name: 'Code Reviewer',
        description: 'Reviews code for quality',
        role: 'reviewer',
        systemPrompt: 'You are a code reviewer...',
        capabilities: ['review', 'suggest'],
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 2000,
      });

      expect(agent.id).toBeDefined();
      expect(agent.isActive).toBe(true);
    });
  });

  describe('listAgents', () => {
    it('should list all agents', () => {
      manager.createAgent({
        name: 'A1',
        description: '',
        role: 'r',
        systemPrompt: '',
        capabilities: [],
        model: 'm',
        temperature: 0,
        maxTokens: 100,
      });
      manager.createAgent({
        name: 'A2',
        description: '',
        role: 'r',
        systemPrompt: '',
        capabilities: [],
        model: 'm',
        temperature: 0,
        maxTokens: 100,
      });

      expect(manager.listAgents().length).toBe(2);
    });
  });

  describe('updateAgent', () => {
    it('should update agent', () => {
      const agent = manager.createAgent({
        name: 'Agent',
        description: '',
        role: 'r',
        systemPrompt: '',
        capabilities: [],
        model: 'm',
        temperature: 0,
        maxTokens: 100,
      });

      manager.updateAgent(agent.id, { name: 'Updated Agent' });

      expect(manager.getAgent(agent.id)!.name).toBe('Updated Agent');
    });
  });

  describe('executeAgent', () => {
    it('should execute agent', () => {
      const agent = manager.createAgent({
        name: 'Agent',
        description: '',
        role: 'r',
        systemPrompt: '',
        capabilities: [],
        model: 'm',
        temperature: 0,
        maxTokens: 100,
      });

      const result = manager.executeAgent(agent.id, 'Hello');

      expect(result).toBeDefined();
      expect(result!.output).toContain('Agent');
    });
  });

  describe('getExecutions', () => {
    it('should get executions for agent', () => {
      const agent = manager.createAgent({
        name: 'Agent',
        description: '',
        role: 'r',
        systemPrompt: '',
        capabilities: [],
        model: 'm',
        temperature: 0,
        maxTokens: 100,
      });

      manager.executeAgent(agent.id, 'Input 1');
      manager.executeAgent(agent.id, 'Input 2');

      expect(manager.getExecutions(agent.id).length).toBe(2);
    });
  });

  describe('cloneAgent', () => {
    it('should clone agent', () => {
      const original = manager.createAgent({
        name: 'Original',
        description: 'Desc',
        role: 'r',
        systemPrompt: 'Prompt',
        capabilities: ['cap'],
        model: 'm',
        temperature: 0.5,
        maxTokens: 100,
      });

      const clone = manager.cloneAgent(original.id, 'Cloned');

      expect(clone).toBeDefined();
      expect(clone!.name).toBe('Cloned');
      expect(clone!.description).toBe('Desc');
    });
  });
});
