/**
 * Performance Monitoring Tests
 * Tests for Issue #129
 */

import {
  PerformanceMonitor,
  OperationTiming,
  PerformanceAlert,
} from '../../../src/advanced/performance';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
    monitor.reset();
  });

  describe('recordTiming', () => {
    it('should record operation timing', () => {
      monitor.recordTiming('api-call', 100);

      const stats = monitor.getOperationStats();
      expect(stats.length).toBe(1);
      expect(stats[0].operation).toBe('api-call');
      expect(stats[0].count).toBe(1);
      expect(stats[0].avgDuration).toBe(100);
    });

    it('should aggregate multiple timings', () => {
      monitor.recordTiming('api-call', 100);
      monitor.recordTiming('api-call', 200);
      monitor.recordTiming('api-call', 300);

      const stats = monitor.getOperationStats();
      expect(stats[0].count).toBe(3);
      expect(stats[0].avgDuration).toBe(200);
      expect(stats[0].minDuration).toBe(100);
      expect(stats[0].maxDuration).toBe(300);
    });

    it('should create alert for slow response', () => {
      monitor.recordTiming('slow-api', 2000);

      const alerts = monitor.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].type).toBe('slow_response');
    });
  });

  describe('startTimer', () => {
    it('should measure elapsed time', async () => {
      const stopTimer = monitor.startTimer('timed-operation');

      await new Promise((resolve) => setTimeout(resolve, 50));
      stopTimer();

      const stats = monitor.getOperationStats();
      expect(stats.length).toBe(1);
      expect(stats[0].avgDuration).toBeGreaterThanOrEqual(40);
    });
  });

  describe('getSlowestOperations', () => {
    it('should return operations sorted by duration', () => {
      monitor.recordTiming('fast', 50);
      monitor.recordTiming('medium', 100);
      monitor.recordTiming('slow', 200);

      const slowest = monitor.getSlowestOperations(2);

      expect(slowest.length).toBe(2);
      expect(slowest[0].operation).toBe('slow');
      expect(slowest[1].operation).toBe('medium');
    });
  });

  describe('alerts', () => {
    it('should track active alerts', () => {
      monitor.recordTiming('slow-op', 2000);

      const active = monitor.getActiveAlerts();
      expect(active.length).toBeGreaterThan(0);
      expect(active.every((a) => !a.resolved)).toBe(true);
    });

    it('should resolve alerts', () => {
      monitor.recordTiming('slow-op', 2000);

      const alerts = monitor.getActiveAlerts();
      const alertId = alerts[0].id;

      const resolved = monitor.resolveAlert(alertId);
      expect(resolved).toBe(true);

      const activeAfter = monitor.getActiveAlerts();
      expect(activeAfter.find((a) => a.id === alertId)).toBeUndefined();
    });

    it('should return false for unknown alert', () => {
      const resolved = monitor.resolveAlert('unknown-id');
      expect(resolved).toBe(false);
    });
  });

  describe('getSystemHealth', () => {
    it('should return system health status', () => {
      const health = monitor.getSystemHealth();

      expect(health.status).toBeDefined();
      expect(health.uptime).toBeGreaterThanOrEqual(0);
      expect(health.lastCheck).toBeInstanceOf(Date);
    });

    it('should report healthy status normally', () => {
      const health = monitor.getSystemHealth();
      expect(health.status).toBe('healthy');
    });
  });

  describe('getPerformanceSummary', () => {
    it('should return complete performance summary', () => {
      monitor.recordTiming('op1', 100);
      monitor.recordTiming('op2', 200);

      const summary = monitor.getPerformanceSummary();

      expect(summary.avgResponseTime).toBe(150);
      expect(summary.slowestOperations.length).toBe(2);
      expect(summary.health).toBeDefined();
      expect(summary.periodStart).toBeInstanceOf(Date);
      expect(summary.periodEnd).toBeInstanceOf(Date);
    });
  });

  describe('setThresholds', () => {
    it('should update thresholds', () => {
      monitor.setThresholds({ slowResponse: 500 });

      // Now 600ms should trigger alert (threshold is 500)
      monitor.recordTiming('op', 600);

      const alerts = monitor.getActiveAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  describe('reset', () => {
    it('should clear all data', () => {
      monitor.recordTiming('op', 2000);

      monitor.reset();

      expect(monitor.getOperationStats().length).toBe(0);
      expect(monitor.getActiveAlerts().length).toBe(0);
    });
  });
});
