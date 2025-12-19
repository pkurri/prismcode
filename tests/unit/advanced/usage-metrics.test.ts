/**
 * Usage Metrics Tests
 * Tests for Issue #128
 */

import {
  UsageMetricsService,
  APIUsageMetrics,
  FeatureUsageMetrics,
  UserSessionMetrics,
} from '../../../src/advanced/usage-metrics';

describe('UsageMetricsService', () => {
  let service: UsageMetricsService;

  beforeEach(() => {
    service = new UsageMetricsService();
    service.reset();
  });

  describe('recordAPICall', () => {
    it('should record a new API call', () => {
      service.recordAPICall('/api/users', 'GET', 150, true);

      const metrics = service.getAPIMetrics();
      expect(metrics.length).toBe(1);
      expect(metrics[0].endpoint).toBe('/api/users');
      expect(metrics[0].calls).toBe(1);
      expect(metrics[0].successCount).toBe(1);
    });

    it('should aggregate multiple calls to same endpoint', () => {
      service.recordAPICall('/api/users', 'GET', 100, true);
      service.recordAPICall('/api/users', 'GET', 200, true);
      service.recordAPICall('/api/users', 'GET', 300, false);

      const metrics = service.getAPIMetrics();
      expect(metrics.length).toBe(1);
      expect(metrics[0].calls).toBe(3);
      expect(metrics[0].successCount).toBe(2);
      expect(metrics[0].errorCount).toBe(1);
      expect(metrics[0].avgResponseTime).toBe(200);
    });

    it('should track different endpoints separately', () => {
      service.recordAPICall('/api/users', 'GET', 100, true);
      service.recordAPICall('/api/posts', 'GET', 200, true);
      service.recordAPICall('/api/users', 'POST', 150, true);

      const metrics = service.getAPIMetrics();
      expect(metrics.length).toBe(3);
    });
  });

  describe('recordFeatureUsage', () => {
    it('should record feature usage', () => {
      service.recordFeatureUsage('code-generation');

      const metrics = service.getFeatureMetrics();
      expect(metrics.length).toBe(1);
      expect(metrics[0].featureName).toBe('code-generation');
      expect(metrics[0].usageCount).toBe(1);
    });

    it('should track unique users', () => {
      service.recordFeatureUsage('code-generation', 'user1');
      service.recordFeatureUsage('code-generation', 'user2');
      service.recordFeatureUsage('code-generation', 'user1');

      const metrics = service.getFeatureMetrics();
      expect(metrics[0].usageCount).toBe(3);
    });
  });

  describe('user sessions', () => {
    it('should start a session', () => {
      service.startSession('user1');

      const sessions = service.getUserSessionMetrics();
      expect(sessions.length).toBe(1);
      expect(sessions[0].userId).toBe('user1');
      expect(sessions[0].sessionsCount).toBe(1);
    });

    it('should end a session and track duration', () => {
      service.startSession('user1');
      service.endSession('user1', 30);

      const sessions = service.getUserSessionMetrics();
      expect(sessions[0].totalDuration).toBe(30);
      expect(sessions[0].avgSessionDuration).toBe(30);
    });

    it('should calculate average session duration', () => {
      service.startSession('user1');
      service.endSession('user1', 30);
      service.startSession('user1');
      service.endSession('user1', 60);

      const sessions = service.getUserSessionMetrics();
      expect(sessions[0].sessionsCount).toBe(2);
      expect(sessions[0].totalDuration).toBe(90);
      expect(sessions[0].avgSessionDuration).toBe(45);
    });
  });

  describe('getTopEndpoints', () => {
    it('should return top endpoints by usage', () => {
      service.recordAPICall('/api/popular', 'GET', 100, true);
      service.recordAPICall('/api/popular', 'GET', 100, true);
      service.recordAPICall('/api/popular', 'GET', 100, true);
      service.recordAPICall('/api/rare', 'GET', 100, true);

      const top = service.getTopEndpoints(2);
      expect(top.length).toBe(2);
      expect(top[0].endpoint).toBe('/api/popular');
      expect(top[0].calls).toBe(3);
    });
  });

  describe('getTopFeatures', () => {
    it('should return top features by usage', () => {
      service.recordFeatureUsage('popular-feature');
      service.recordFeatureUsage('popular-feature');
      service.recordFeatureUsage('popular-feature');
      service.recordFeatureUsage('rare-feature');

      const top = service.getTopFeatures(2);
      expect(top.length).toBe(2);
      expect(top[0].featureName).toBe('popular-feature');
      expect(top[0].usageCount).toBe(3);
    });
  });

  describe('getActiveUsers', () => {
    it('should return recently active users', () => {
      service.startSession('user1');
      service.startSession('user2');

      const active = service.getActiveUsers(24);
      expect(active.length).toBe(2);
    });
  });

  describe('getUsageSummary', () => {
    it('should return complete usage summary', () => {
      service.recordAPICall('/api/test', 'GET', 100, true);
      service.recordFeatureUsage('test-feature');
      service.startSession('user1');

      const summary = service.getUsageSummary(7);

      expect(summary.totalAPICalls).toBe(1);
      expect(summary.totalFeatureUsage).toBe(1);
      expect(summary.activeUsers).toBe(1);
      expect(summary.topEndpoints.length).toBeGreaterThan(0);
      expect(summary.topFeatures.length).toBeGreaterThan(0);
    });
  });

  describe('getEndpointErrorRate', () => {
    it('should calculate error rate correctly', () => {
      service.recordAPICall('/api/test', 'GET', 100, true);
      service.recordAPICall('/api/test', 'GET', 100, false);

      const rate = service.getEndpointErrorRate('/api/test', 'GET');
      expect(rate).toBe(0.5);
    });

    it('should return 0 for unknown endpoint', () => {
      const rate = service.getEndpointErrorRate('/api/unknown', 'GET');
      expect(rate).toBe(0);
    });
  });

  describe('calculateAdoptionRate', () => {
    it('should calculate adoption rate correctly', () => {
      service.recordFeatureUsage('test-feature', 'user1');
      service.recordFeatureUsage('test-feature', 'user2');

      const rate = service.calculateAdoptionRate('test-feature', 10);
      expect(rate).toBeGreaterThan(0);
    });
  });

  describe('exportMetrics', () => {
    it('should export all metrics', () => {
      service.recordAPICall('/api/test', 'GET', 100, true);
      service.recordFeatureUsage('test-feature');
      service.startSession('user1');

      const exported = service.exportMetrics();

      expect(exported.api.length).toBe(1);
      expect(exported.features.length).toBe(1);
      expect(exported.users.length).toBe(1);
      expect(exported.exportedAt).toBeInstanceOf(Date);
    });
  });

  describe('reset', () => {
    it('should clear all metrics', () => {
      service.recordAPICall('/api/test', 'GET', 100, true);
      service.recordFeatureUsage('test-feature');
      service.startSession('user1');

      service.reset();

      expect(service.getAPIMetrics().length).toBe(0);
      expect(service.getFeatureMetrics().length).toBe(0);
      expect(service.getUserSessionMetrics().length).toBe(0);
    });
  });
});
