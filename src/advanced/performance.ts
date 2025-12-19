/**
 * Performance Monitoring Service
 * Issue #129: Performance Monitoring
 *
 * Tracks response times, bottlenecks, and system performance
 */

import logger from '../utils/logger';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface OperationTiming {
  operation: string;
  count: number;
  totalDuration: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  p95Duration: number;
  lastRecorded: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  lastCheck: Date;
}

export interface PerformanceAlert {
  id: string;
  type: 'slow_response' | 'high_memory' | 'error_rate' | 'bottleneck';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  operation?: string;
  threshold: number;
  actual: number;
  timestamp: Date;
  resolved: boolean;
}

export interface PerformanceSummary {
  avgResponseTime: number;
  p95ResponseTime: number;
  slowestOperations: OperationTiming[];
  alerts: PerformanceAlert[];
  health: SystemHealth;
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Performance Monitoring Service
 * Tracks and analyzes system performance
 */
export class PerformanceMonitor {
  private timings: Map<string, number[]> = new Map();
  private operationStats: Map<string, OperationTiming> = new Map();
  private alerts: PerformanceAlert[] = [];
  private startTime: Date = new Date();

  // Thresholds for alerts
  private thresholds = {
    slowResponse: 1000, // ms
    highMemory: 0.9, // 90%
    errorRateHigh: 0.1, // 10%
  };

  constructor() {
    logger.info('PerformanceMonitor initialized');
  }

  /**
   * Record an operation timing
   */
  recordTiming(operation: string, duration: number): void {
    // Store individual timing
    const timings = this.timings.get(operation) || [];
    timings.push(duration);
    // Keep only last 1000 timings per operation
    if (timings.length > 1000) {
      timings.shift();
    }
    this.timings.set(operation, timings);

    // Update operation stats
    this.updateOperationStats(operation, duration);

    // Check for slow response alert
    if (duration > this.thresholds.slowResponse) {
      this.createAlert(
        'slow_response',
        'medium',
        operation,
        this.thresholds.slowResponse,
        duration
      );
    }
  }

  /**
   * Update operation statistics
   */
  private updateOperationStats(operation: string, duration: number): void {
    const existing = this.operationStats.get(operation);

    if (existing) {
      const count = existing.count + 1;
      const totalDuration = existing.totalDuration + duration;
      const timings = this.timings.get(operation) || [duration];

      this.operationStats.set(operation, {
        operation,
        count,
        totalDuration,
        avgDuration: Math.round((totalDuration / count) * 100) / 100,
        minDuration: Math.min(existing.minDuration, duration),
        maxDuration: Math.max(existing.maxDuration, duration),
        p95Duration: this.calculatePercentile(timings, 95),
        lastRecorded: new Date(),
      });
    } else {
      this.operationStats.set(operation, {
        operation,
        count: 1,
        totalDuration: duration,
        avgDuration: duration,
        minDuration: duration,
        maxDuration: duration,
        p95Duration: duration,
        lastRecorded: new Date(),
      });
    }
  }

  /**
   * Calculate percentile from array of values
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Create a performance alert
   */
  private createAlert(
    type: PerformanceAlert['type'],
    severity: PerformanceAlert['severity'],
    operation: string | undefined,
    threshold: number,
    actual: number
  ): void {
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message: this.getAlertMessage(type, operation, actual),
      operation,
      threshold,
      actual,
      timestamp: new Date(),
      resolved: false,
    };

    this.alerts.push(alert);

    // Keep only last 500 alerts
    if (this.alerts.length > 500) {
      this.alerts = this.alerts.slice(-500);
    }

    logger.warn('Performance alert created', { alert });
  }

  /**
   * Get alert message
   */
  private getAlertMessage(
    type: PerformanceAlert['type'],
    operation: string | undefined,
    actual: number
  ): string {
    switch (type) {
      case 'slow_response':
        return `Slow response detected for ${operation}: ${actual}ms`;
      case 'high_memory':
        return `High memory usage: ${(actual * 100).toFixed(1)}%`;
      case 'error_rate':
        return `High error rate for ${operation}: ${(actual * 100).toFixed(1)}%`;
      case 'bottleneck':
        return `Bottleneck detected in ${operation}`;
      default:
        return `Performance issue detected`;
    }
  }

  /**
   * Start a timer for an operation
   */
  startTimer(operation: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.recordTiming(operation, duration);
    };
  }

  /**
   * Get operation statistics
   */
  getOperationStats(): OperationTiming[] {
    return Array.from(this.operationStats.values());
  }

  /**
   * Get slowest operations
   */
  getSlowestOperations(limit: number = 10): OperationTiming[] {
    return Array.from(this.operationStats.values())
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter((a) => !a.resolved);
  }

  /**
   * Get all alerts
   */
  getAllAlerts(limit: number = 100): PerformanceAlert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  /**
   * Get system health status
   */
  getSystemHealth(): SystemHealth {
    const uptime = Date.now() - this.startTime.getTime();
    const memoryUsage = process.memoryUsage
      ? process.memoryUsage().heapUsed / process.memoryUsage().heapTotal
      : 0;

    let status: SystemHealth['status'] = 'healthy';
    if (memoryUsage > 0.9 || this.getActiveAlerts().some((a) => a.severity === 'critical')) {
      status = 'unhealthy';
    } else if (memoryUsage > 0.7 || this.getActiveAlerts().some((a) => a.severity === 'high')) {
      status = 'degraded';
    }

    return {
      status,
      uptime,
      memoryUsage: Math.round(memoryUsage * 100) / 100,
      cpuUsage: 0, // Would need OS-level access
      activeConnections: 0, // Would need server context
      lastCheck: new Date(),
    };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): PerformanceSummary {
    const allTimings = Array.from(this.timings.values()).flat();

    const avgResponseTime =
      allTimings.length > 0 ? allTimings.reduce((sum, t) => sum + t, 0) / allTimings.length : 0;

    return {
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      p95ResponseTime: this.calculatePercentile(allTimings, 95),
      slowestOperations: this.getSlowestOperations(5),
      alerts: this.getActiveAlerts(),
      health: this.getSystemHealth(),
      periodStart: this.startTime,
      periodEnd: new Date(),
    };
  }

  /**
   * Set custom thresholds
   */
  setThresholds(thresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.timings.clear();
    this.operationStats.clear();
    this.alerts = [];
    this.startTime = new Date();
    logger.info('PerformanceMonitor reset');
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
