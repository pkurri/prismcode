/**
 * Rate Limit Dashboard Tests
 * Tests for Issue #133
 */

import { RateLimitManager } from '../../../src/advanced/rate-limit';

describe('RateLimitManager', () => {
  let manager: RateLimitManager;

  beforeEach(() => {
    manager = new RateLimitManager();
    manager.reset();
  });

  describe('addRule', () => {
    it('should add a new rate limit rule', () => {
      const rule = manager.addRule('custom', 'user', 50, 30000);

      expect(rule.id).toBeDefined();
      expect(rule.name).toBe('custom');
      expect(rule.limit).toBe(50);
      expect(rule.windowMs).toBe(30000);
    });
  });

  describe('checkLimit', () => {
    it('should allow requests within limit', () => {
      manager.addRule('test', 'user', 5, 60000);

      const result = manager.checkLimit('test', 'user1');

      expect(result.isLimited).toBe(false);
      expect(result.remaining).toBe(4);
    });

    it('should block requests exceeding limit', () => {
      manager.addRule('test', 'user', 2, 60000);

      manager.checkLimit('test', 'user1');
      manager.checkLimit('test', 'user1');
      const result = manager.checkLimit('test', 'user1');

      expect(result.isLimited).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('should track different identifiers separately', () => {
      manager.addRule('test', 'user', 2, 60000);

      manager.checkLimit('test', 'user1');
      manager.checkLimit('test', 'user1');
      const result = manager.checkLimit('test', 'user2');

      expect(result.isLimited).toBe(false);
    });
  });

  describe('getRules', () => {
    it('should return all rules', () => {
      const rules = manager.getRules();

      // Should have default rules
      expect(rules.length).toBeGreaterThan(0);
    });
  });

  describe('getStatus', () => {
    it('should return status for identifier', () => {
      manager.checkLimit('user', 'test-user');

      const status = manager.getStatus('test-user');

      expect(status.length).toBeGreaterThan(0);
      expect(status[0].identifier).toBe('test-user');
    });
  });

  describe('getStats', () => {
    it('should return statistics', () => {
      manager.addRule('test', 'user', 2, 60000);
      manager.checkLimit('test', 'user1');
      manager.checkLimit('test', 'user1');
      manager.checkLimit('test', 'user1'); // blocked

      const stats = manager.getStats();

      expect(stats.totalRequests).toBeGreaterThan(0);
      expect(stats.blockedRequests).toBeGreaterThan(0);
    });
  });

  describe('updateRule', () => {
    it('should update rule settings', () => {
      const rule = manager.addRule('test', 'user', 10, 60000);
      const result = manager.updateRule(rule.id, { limit: 20 });

      expect(result).toBe(true);

      const rules = manager.getRules();
      const updated = rules.find((r) => r.id === rule.id);
      expect(updated?.limit).toBe(20);
    });
  });

  describe('deleteRule', () => {
    it('should delete a rule', () => {
      const rule = manager.addRule('test', 'user', 10, 60000);
      const beforeCount = manager.getRules().length;

      manager.deleteRule(rule.id);

      expect(manager.getRules().length).toBe(beforeCount - 1);
    });
  });

  describe('resetUsage', () => {
    it('should reset usage for identifier', () => {
      manager.addRule('test', 'user', 5, 60000);
      manager.checkLimit('test', 'user1');
      manager.checkLimit('test', 'user1');

      manager.resetUsage('user1');

      const status = manager.getStatus('user1');
      const testRule = status.find((s) => s.rule === 'test');
      expect(testRule?.remaining).toBe(5);
    });
  });
});
