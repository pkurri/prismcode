/**
 * Error Tracking Dashboard Service
 * Issue #130: Error Tracking Dashboard
 *
 * Centralized error visualization and tracking
 */

import logger from '../utils/logger';

export interface TrackedError {
  id: string;
  message: string;
  stack?: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  context?: Record<string, unknown>;
  timestamp: Date;
  resolved: boolean;
  occurrences: number;
  firstSeen: Date;
  lastSeen: Date;
}

export interface ErrorGroup {
  fingerprint: string;
  message: string;
  type: string;
  count: number;
  errors: TrackedError[];
  firstSeen: Date;
  lastSeen: Date;
  resolved: boolean;
}

export interface ErrorStats {
  total: number;
  resolved: number;
  unresolved: number;
  bySeverity: Record<TrackedError['severity'], number>;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  last24Hours: number;
  last7Days: number;
}

export interface ErrorTrend {
  date: string;
  count: number;
  resolved: number;
  critical: number;
}

/**
 * Error Tracking Service
 * Tracks, groups, and reports on application errors
 */
export class ErrorTracker {
  private errors: TrackedError[] = [];
  private errorGroups: Map<string, ErrorGroup> = new Map();
  private maxErrors: number = 10000;

  constructor() {
    logger.info('ErrorTracker initialized');
  }

  /**
   * Track an error
   */
  trackError(
    error: Error | string,
    source: string,
    severity: TrackedError['severity'] = 'medium',
    context?: Record<string, unknown>
  ): TrackedError {
    const message = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : undefined;
    const type = error instanceof Error ? error.constructor.name : 'Error';
    const fingerprint = this.generateFingerprint(message, type, source);

    const trackedError: TrackedError = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      stack,
      type,
      severity,
      source,
      context,
      timestamp: new Date(),
      resolved: false,
      occurrences: 1,
      firstSeen: new Date(),
      lastSeen: new Date(),
    };

    this.errors.push(trackedError);
    this.updateErrorGroup(trackedError, fingerprint);

    // Trim old errors if limit exceeded
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    logger.error('Error tracked', {
      id: trackedError.id,
      message: trackedError.message,
      severity,
      source,
    });

    return trackedError;
  }

  /**
   * Generate a fingerprint for error grouping
   */
  private generateFingerprint(message: string, type: string, source: string): string {
    // Simple fingerprint based on message pattern, type, and source
    const normalizedMessage = message.replace(/\d+/g, 'N').substring(0, 100);
    return `${type}:${source}:${normalizedMessage}`;
  }

  /**
   * Update or create error group
   */
  private updateErrorGroup(error: TrackedError, fingerprint: string): void {
    const existing = this.errorGroups.get(fingerprint);

    if (existing) {
      existing.count++;
      existing.lastSeen = error.timestamp;
      existing.errors.push(error);
      // Keep only last 50 errors per group
      if (existing.errors.length > 50) {
        existing.errors = existing.errors.slice(-50);
      }
    } else {
      this.errorGroups.set(fingerprint, {
        fingerprint,
        message: error.message,
        type: error.type,
        count: 1,
        errors: [error],
        firstSeen: error.timestamp,
        lastSeen: error.timestamp,
        resolved: false,
      });
    }
  }

  /**
   * Get all tracked errors
   */
  getErrors(limit: number = 100): TrackedError[] {
    return this.errors.slice(-limit);
  }

  /**
   * Get unresolved errors
   */
  getUnresolvedErrors(): TrackedError[] {
    return this.errors.filter((e) => !e.resolved);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: TrackedError['severity']): TrackedError[] {
    return this.errors.filter((e) => e.severity === severity);
  }

  /**
   * Get error groups
   */
  getErrorGroups(): ErrorGroup[] {
    return Array.from(this.errorGroups.values());
  }

  /**
   * Get top error groups by count
   */
  getTopErrorGroups(limit: number = 10): ErrorGroup[] {
    return Array.from(this.errorGroups.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Resolve an error
   */
  resolveError(errorId: string): boolean {
    const error = this.errors.find((e) => e.id === errorId);
    if (error) {
      error.resolved = true;
      return true;
    }
    return false;
  }

  /**
   * Resolve an error group
   */
  resolveErrorGroup(fingerprint: string): boolean {
    const group = this.errorGroups.get(fingerprint);
    if (group) {
      group.resolved = true;
      group.errors.forEach((e) => (e.resolved = true));
      return true;
    }
    return false;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): ErrorStats {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const bySeverity: Record<TrackedError['severity'], number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    let resolved = 0;
    let last24Hours = 0;
    let last7Days = 0;

    this.errors.forEach((error) => {
      bySeverity[error.severity]++;
      byType[error.type] = (byType[error.type] || 0) + 1;
      bySource[error.source] = (bySource[error.source] || 0) + 1;

      if (error.resolved) resolved++;
      if (error.timestamp >= oneDayAgo) last24Hours++;
      if (error.timestamp >= sevenDaysAgo) last7Days++;
    });

    return {
      total: this.errors.length,
      resolved,
      unresolved: this.errors.length - resolved,
      bySeverity,
      byType,
      bySource,
      last24Hours,
      last7Days,
    };
  }

  /**
   * Get error trends
   */
  getErrorTrends(days: number = 7): ErrorTrend[] {
    const trends: ErrorTrend[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayErrors = this.errors.filter((e) => {
        const errorDate = e.timestamp.toISOString().split('T')[0];
        return errorDate === dateStr;
      });

      trends.push({
        date: dateStr,
        count: dayErrors.length,
        resolved: dayErrors.filter((e) => e.resolved).length,
        critical: dayErrors.filter((e) => e.severity === 'critical').length,
      });
    }

    return trends;
  }

  /**
   * Search errors
   */
  searchErrors(query: string): TrackedError[] {
    const lowerQuery = query.toLowerCase();
    return this.errors.filter(
      (e) =>
        e.message.toLowerCase().includes(lowerQuery) ||
        e.source.toLowerCase().includes(lowerQuery) ||
        e.type.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get error by ID
   */
  getError(id: string): TrackedError | undefined {
    return this.errors.find((e) => e.id === id);
  }

  /**
   * Clear resolved errors
   */
  clearResolvedErrors(): number {
    const before = this.errors.length;
    this.errors = this.errors.filter((e) => !e.resolved);

    // Update groups
    this.errorGroups.forEach((group, key) => {
      group.errors = group.errors.filter((e) => !e.resolved);
      if (group.errors.length === 0) {
        this.errorGroups.delete(key);
      }
    });

    return before - this.errors.length;
  }

  /**
   * Reset all tracking
   */
  reset(): void {
    this.errors = [];
    this.errorGroups.clear();
    logger.info('ErrorTracker reset');
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();
