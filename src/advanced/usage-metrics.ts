/**
 * Usage Metrics Service
 * Issue #128: Usage Metrics
 *
 * Tracks API usage, feature adoption, and usage patterns
 */

import logger from '../utils/logger';

export interface APIUsageMetrics {
  endpoint: string;
  method: string;
  calls: number;
  successCount: number;
  errorCount: number;
  avgResponseTime: number;
  lastCalled: Date;
}

export interface FeatureUsageMetrics {
  featureName: string;
  usageCount: number;
  uniqueUsers: number;
  firstUsed: Date;
  lastUsed: Date;
  adoptionRate: number;
}

export interface UserSessionMetrics {
  userId: string;
  sessionsCount: number;
  totalDuration: number;
  avgSessionDuration: number;
  lastActive: Date;
  featuresUsed: string[];
}

export interface UsageSummary {
  totalAPICalls: number;
  totalFeatureUsage: number;
  activeUsers: number;
  topEndpoints: APIUsageMetrics[];
  topFeatures: FeatureUsageMetrics[];
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Usage Metrics Service
 * Tracks and reports on system usage patterns
 */
export class UsageMetricsService {
  private apiMetrics: Map<string, APIUsageMetrics> = new Map();
  private featureMetrics: Map<string, FeatureUsageMetrics> = new Map();
  private userSessions: Map<string, UserSessionMetrics> = new Map();
  private initialized: Date = new Date();

  constructor() {
    logger.info('UsageMetricsService initialized');
  }

  /**
   * Record an API call
   */
  recordAPICall(endpoint: string, method: string, responseTime: number, success: boolean): void {
    const key = `${method}:${endpoint}`;
    const existing = this.apiMetrics.get(key);

    if (existing) {
      const newCalls = existing.calls + 1;
      const newAvgTime = (existing.avgResponseTime * existing.calls + responseTime) / newCalls;

      this.apiMetrics.set(key, {
        ...existing,
        calls: newCalls,
        successCount: existing.successCount + (success ? 1 : 0),
        errorCount: existing.errorCount + (success ? 0 : 1),
        avgResponseTime: Math.round(newAvgTime * 100) / 100,
        lastCalled: new Date(),
      });
    } else {
      this.apiMetrics.set(key, {
        endpoint,
        method,
        calls: 1,
        successCount: success ? 1 : 0,
        errorCount: success ? 0 : 1,
        avgResponseTime: responseTime,
        lastCalled: new Date(),
      });
    }
  }

  /**
   * Record feature usage
   */
  recordFeatureUsage(featureName: string, userId?: string): void {
    const existing = this.featureMetrics.get(featureName);
    const now = new Date();

    if (existing) {
      const uniqueUsers = userId
        ? new Set([...Array(existing.uniqueUsers).keys()].map(String))
        : new Set<string>();
      if (userId) uniqueUsers.add(userId);

      this.featureMetrics.set(featureName, {
        ...existing,
        usageCount: existing.usageCount + 1,
        uniqueUsers: userId ? uniqueUsers.size : existing.uniqueUsers,
        lastUsed: now,
      });
    } else {
      this.featureMetrics.set(featureName, {
        featureName,
        usageCount: 1,
        uniqueUsers: userId ? 1 : 0,
        firstUsed: now,
        lastUsed: now,
        adoptionRate: 0,
      });
    }

    // Update user session if userId provided
    if (userId) {
      this.updateUserSession(userId, featureName);
    }
  }

  /**
   * Update user session metrics
   */
  private updateUserSession(userId: string, featureName: string): void {
    const existing = this.userSessions.get(userId);
    const now = new Date();

    if (existing) {
      const featuresUsed = new Set(existing.featuresUsed);
      featuresUsed.add(featureName);

      this.userSessions.set(userId, {
        ...existing,
        lastActive: now,
        featuresUsed: Array.from(featuresUsed),
      });
    } else {
      this.userSessions.set(userId, {
        userId,
        sessionsCount: 1,
        totalDuration: 0,
        avgSessionDuration: 0,
        lastActive: now,
        featuresUsed: [featureName],
      });
    }
  }

  /**
   * Start a user session
   */
  startSession(userId: string): void {
    const existing = this.userSessions.get(userId);
    const now = new Date();

    if (existing) {
      this.userSessions.set(userId, {
        ...existing,
        sessionsCount: existing.sessionsCount + 1,
        lastActive: now,
      });
    } else {
      this.userSessions.set(userId, {
        userId,
        sessionsCount: 1,
        totalDuration: 0,
        avgSessionDuration: 0,
        lastActive: now,
        featuresUsed: [],
      });
    }
  }

  /**
   * End a user session
   */
  endSession(userId: string, durationMinutes: number): void {
    const existing = this.userSessions.get(userId);

    if (existing) {
      const newTotal = existing.totalDuration + durationMinutes;
      const newAvg = newTotal / existing.sessionsCount;

      this.userSessions.set(userId, {
        ...existing,
        totalDuration: newTotal,
        avgSessionDuration: Math.round(newAvg * 100) / 100,
      });
    }
  }

  /**
   * Get API usage metrics
   */
  getAPIMetrics(): APIUsageMetrics[] {
    return Array.from(this.apiMetrics.values());
  }

  /**
   * Get feature usage metrics
   */
  getFeatureMetrics(): FeatureUsageMetrics[] {
    return Array.from(this.featureMetrics.values());
  }

  /**
   * Get user session metrics
   */
  getUserSessionMetrics(): UserSessionMetrics[] {
    return Array.from(this.userSessions.values());
  }

  /**
   * Get top N endpoints by usage
   */
  getTopEndpoints(limit: number = 10): APIUsageMetrics[] {
    return Array.from(this.apiMetrics.values())
      .sort((a, b) => b.calls - a.calls)
      .slice(0, limit);
  }

  /**
   * Get top N features by usage
   */
  getTopFeatures(limit: number = 10): FeatureUsageMetrics[] {
    return Array.from(this.featureMetrics.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * Get active users (last 24 hours)
   */
  getActiveUsers(hoursAgo: number = 24): UserSessionMetrics[] {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hoursAgo);

    return Array.from(this.userSessions.values()).filter((u) => u.lastActive >= cutoff);
  }

  /**
   * Get usage summary
   */
  getUsageSummary(days: number = 7): UsageSummary {
    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - days);

    const apiMetrics = this.getAPIMetrics();
    const featureMetrics = this.getFeatureMetrics();

    return {
      totalAPICalls: apiMetrics.reduce((sum, m) => sum + m.calls, 0),
      totalFeatureUsage: featureMetrics.reduce((sum, m) => sum + m.usageCount, 0),
      activeUsers: this.getActiveUsers(days * 24).length,
      topEndpoints: this.getTopEndpoints(5),
      topFeatures: this.getTopFeatures(5),
      periodStart,
      periodEnd,
    };
  }

  /**
   * Get endpoint error rate
   */
  getEndpointErrorRate(endpoint: string, method: string): number {
    const key = `${method}:${endpoint}`;
    const metrics = this.apiMetrics.get(key);

    if (!metrics || metrics.calls === 0) return 0;
    return Math.round((metrics.errorCount / metrics.calls) * 100) / 100;
  }

  /**
   * Calculate feature adoption rate
   */
  calculateAdoptionRate(featureName: string, totalUsers: number): number {
    const feature = this.featureMetrics.get(featureName);
    if (!feature || totalUsers === 0) return 0;

    const rate = feature.uniqueUsers / totalUsers;
    return Math.round(rate * 100) / 100;
  }

  /**
   * Reset all metrics (for testing)
   */
  reset(): void {
    this.apiMetrics.clear();
    this.featureMetrics.clear();
    this.userSessions.clear();
    this.initialized = new Date();
    logger.info('UsageMetricsService reset');
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): {
    api: APIUsageMetrics[];
    features: FeatureUsageMetrics[];
    users: UserSessionMetrics[];
    exportedAt: Date;
  } {
    return {
      api: this.getAPIMetrics(),
      features: this.getFeatureMetrics(),
      users: this.getUserSessionMetrics(),
      exportedAt: new Date(),
    };
  }
}

// Export singleton instance
export const usageMetrics = new UsageMetricsService();
