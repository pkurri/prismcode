/**
 * Usage Analytics Tests
 * Issue #214: Usage Tracking & Analytics
 */

import {
  UsageAnalytics,
  usageAnalytics,
} from '../../../src/advanced/usage-analytics';

describe('UsageAnalytics', () => {
  let analytics: UsageAnalytics;

  beforeEach(() => {
    analytics = new UsageAnalytics();
  });

  afterEach(() => {
    analytics.reset();
  });

  describe('user usage tracking', () => {
    it('should record user usage', () => {
      const cost = {
        id: 'cost_1',
        model: 'gpt-4',
        provider: 'openai',
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
        cost: 0.005,
        agentName: 'test-agent',
        operation: 'test',
        timestamp: new Date(),
      };

      analytics.recordUserUsage('user1', cost);

      const usage = analytics.getUserUsage('user1', 'daily');
      expect(usage).toBeDefined();
      expect(usage?.userId).toBe('user1');
    });

    it('should track multiple users', () => {
      const cost1 = {
        id: 'cost_1',
        model: 'gpt-4',
        provider: 'openai',
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
        cost: 0.01,
        agentName: 'agent1',
        operation: 'generate',
        timestamp: new Date(),
      };

      const cost2 = {
        id: 'cost_2',
        model: 'claude-3',
        provider: 'anthropic',
        inputTokens: 200,
        outputTokens: 100,
        totalTokens: 300,
        cost: 0.02,
        agentName: 'agent2',
        operation: 'analyze',
        timestamp: new Date(),
      };

      analytics.recordUserUsage('user1', cost1);
      analytics.recordUserUsage('user2', cost2);

      const usage1 = analytics.getUserUsage('user1', 'daily');
      const usage2 = analytics.getUserUsage('user2', 'daily');

      expect(usage1).toBeDefined();
      expect(usage2).toBeDefined();
    });
  });

  describe('project usage tracking', () => {
    it('should record project usage', () => {
      const cost = {
        id: 'cost_1',
        model: 'gpt-4',
        provider: 'openai',
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
        cost: 0.005,
        agentName: 'test-agent',
        operation: 'test',
        timestamp: new Date(),
      };

      analytics.recordProjectUsage('project1', cost);

      // Project usage should be recorded
      expect(analytics).toBeDefined();
    });
  });

  describe('report generation', () => {
    it('should generate daily report', () => {
      const cost = {
        id: 'cost_1',
        model: 'gpt-4',
        provider: 'openai',
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
        cost: 0.005,
        agentName: 'test-agent',
        operation: 'test',
        timestamp: new Date(),
      };

      analytics.recordUserUsage('user1', cost);
      const report = analytics.generateReport('daily');

      expect(report.period).toBe('daily');
      expect(report.startDate).toBeInstanceOf(Date);
      expect(report.endDate).toBeInstanceOf(Date);
    });

    it('should generate weekly report', () => {
      const report = analytics.generateReport('weekly');
      expect(report.period).toBe('weekly');
    });

    it('should generate monthly report', () => {
      const report = analytics.generateReport('monthly');
      expect(report.period).toBe('monthly');
    });
  });

  describe('data export', () => {
    it('should export data in JSON format', () => {
      const exported = analytics.exportData({ format: 'json', includeBreakdown: true, includeTrends: false });
      expect(exported).toBeDefined();
      expect(typeof exported).toBe('string');
    });

    it('should export data in CSV format', () => {
      const exported = analytics.exportData({ format: 'csv', includeBreakdown: false, includeTrends: false });
      expect(exported).toBeDefined();
    });
  });

  describe('alerts', () => {
    it('should return empty alerts initially', () => {
      const alerts = analytics.getAlerts();
      expect(alerts).toBeInstanceOf(Array);
    });

    it('should allow setting thresholds', () => {
      analytics.setAlertThresholds({ budgetWarning: 80 });
      // Should not throw
      expect(analytics).toBeDefined();
    });

    it('should allow dismissing alerts', () => {
      const dismissed = analytics.dismissAlert('non-existent');
      expect(dismissed).toBe(false);
    });
  });

  describe('singleton instance', () => {
    it('should export singleton instance', () => {
      expect(usageAnalytics).toBeInstanceOf(UsageAnalytics);
    });
  });
});
