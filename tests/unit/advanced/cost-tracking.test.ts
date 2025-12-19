/**
 * Cost Tracking Tests
 * Tests for Issue #119
 */

import { CostTracker, APICallCost, CostSummary } from '../../../src/advanced/cost-tracking';

describe('CostTracker', () => {
  let tracker: CostTracker;

  beforeEach(() => {
    tracker = new CostTracker();
    tracker.reset();
  });

  describe('recordCost', () => {
    it('should record an API call cost', () => {
      const cost = tracker.recordCost('openai', 'gpt-4', 1000, 500, 'PM Agent', 'generate_stories');

      expect(cost.provider).toBe('openai');
      expect(cost.model).toBe('gpt-4');
      expect(cost.inputTokens).toBe(1000);
      expect(cost.outputTokens).toBe(500);
      expect(cost.totalTokens).toBe(1500);
      expect(cost.cost).toBeGreaterThan(0);
    });

    it('should calculate cost correctly for gpt-4', () => {
      const cost = tracker.recordCost(
        'openai',
        'gpt-4',
        1000, // 1K tokens * $0.03 = $0.03
        1000, // 1K tokens * $0.06 = $0.06
        'Agent',
        'operation'
      );

      expect(cost.cost).toBeCloseTo(0.09, 2);
    });
  });

  describe('getCosts', () => {
    it('should return recorded costs', () => {
      tracker.recordCost('openai', 'gpt-4', 100, 50, 'Agent', 'op1');
      tracker.recordCost('anthropic', 'claude-3-sonnet', 200, 100, 'Agent', 'op2');

      const costs = tracker.getCosts();
      expect(costs.length).toBe(2);
    });

    it('should limit returned costs', () => {
      for (let i = 0; i < 10; i++) {
        tracker.recordCost('openai', 'gpt-4', 100, 50, 'Agent', `op${i}`);
      }

      const costs = tracker.getCosts(5);
      expect(costs.length).toBe(5);
    });
  });

  describe('getCostSummary', () => {
    it('should return cost summary', () => {
      tracker.recordCost('openai', 'gpt-4', 1000, 500, 'PM Agent', 'op1');
      tracker.recordCost('anthropic', 'claude-3-sonnet', 2000, 1000, 'Coder', 'op2');

      const summary = tracker.getCostSummary();

      expect(summary.totalCost).toBeGreaterThan(0);
      expect(summary.totalTokens).toBe(4500);
      expect(summary.callCount).toBe(2);
      expect(summary.byProvider['openai']).toBeDefined();
      expect(summary.byAgent['PM Agent']).toBeDefined();
    });

    it('should track budget usage', () => {
      tracker.setBudget({ daily: 1, weekly: 5, monthly: 20 });
      tracker.recordCost('openai', 'gpt-4', 1000, 500, 'Agent', 'op');

      const summary = tracker.getCostSummary();

      expect(summary.budgetUsed.daily).toBeGreaterThan(0);
    });
  });

  describe('getCostTrends', () => {
    it('should return trends for specified days', () => {
      tracker.recordCost('openai', 'gpt-4', 1000, 500, 'Agent', 'op');

      const trends = tracker.getCostTrends(7);

      expect(trends.length).toBe(7);
      expect(trends[6].cost).toBeGreaterThan(0); // Today
    });
  });

  describe('budget management', () => {
    it('should set and get budget', () => {
      tracker.setBudget({ daily: 50, weekly: 200 });

      const budget = tracker.getBudget();
      expect(budget.daily).toBe(50);
      expect(budget.weekly).toBe(200);
    });

    it('should check budget status', () => {
      tracker.setBudget({ daily: 1000, weekly: 5000, monthly: 20000 });

      const status = tracker.isWithinBudget();
      expect(status.daily).toBe(true);
      expect(status.weekly).toBe(true);
      expect(status.monthly).toBe(true);
    });
  });

  describe('getTopSpendersByAgent', () => {
    it('should return top spending agents', () => {
      tracker.recordCost('openai', 'gpt-4', 5000, 2000, 'Big Spender', 'op1');
      tracker.recordCost('openai', 'gpt-3.5-turbo', 100, 50, 'Small Spender', 'op2');

      const top = tracker.getTopSpendersByAgent(2);

      expect(top.length).toBe(2);
      expect(top[0].agent).toBe('Big Spender');
    });
  });

  describe('setPricing', () => {
    it('should allow custom pricing', () => {
      tracker.setPricing('custom-model', 0.1, 0.2);
      const cost = tracker.recordCost('custom', 'custom-model', 1000, 1000, 'Agent', 'op');

      expect(cost.cost).toBeCloseTo(0.3, 2);
    });
  });

  describe('reset', () => {
    it('should clear all costs', () => {
      tracker.recordCost('openai', 'gpt-4', 1000, 500, 'Agent', 'op');
      tracker.reset();

      expect(tracker.getCosts().length).toBe(0);
    });
  });
});
