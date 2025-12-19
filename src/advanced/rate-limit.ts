/**
 * Rate Limit Dashboard Service
 * Issue #133: Rate Limit Dashboard
 *
 * Visualize and manage rate limits
 */

import logger from '../utils/logger';

export interface RateLimitRule {
  id: string;
  name: string;
  scope: 'global' | 'user' | 'ip' | 'api_key';
  limit: number;
  windowMs: number;
  currentUsage: Map<string, number>;
  lastReset: Map<string, Date>;
  isActive: boolean;
}

export interface RateLimitStatus {
  identifier: string;
  rule: string;
  limit: number;
  remaining: number;
  resetAt: Date;
  isLimited: boolean;
}

export interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  blockRate: number;
  byRule: Record<string, { total: number; blocked: number }>;
  topLimited: Array<{ identifier: string; count: number }>;
}

/**
 * Rate Limit Manager
 * Manages rate limiting rules and tracking
 */
export class RateLimitManager {
  private rules: Map<string, RateLimitRule> = new Map();
  private blockedCount: Map<string, number> = new Map();
  private totalRequests: number = 0;
  private totalBlocked: number = 0;

  constructor() {
    this.initializeDefaultRules();
    logger.info('RateLimitManager initialized');
  }

  /**
   * Initialize default rate limit rules
   */
  private initializeDefaultRules(): void {
    this.addRule('global', 'global', 1000, 60000); // 1000 per minute globally
    this.addRule('user', 'user', 100, 60000); // 100 per minute per user
    this.addRule('api', 'api_key', 500, 60000); // 500 per minute per API key
  }

  /**
   * Add a rate limit rule
   */
  addRule(
    name: string,
    scope: RateLimitRule['scope'],
    limit: number,
    windowMs: number
  ): RateLimitRule {
    const id = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const rule: RateLimitRule = {
      id,
      name,
      scope,
      limit,
      windowMs,
      currentUsage: new Map(),
      lastReset: new Map(),
      isActive: true,
    };

    this.rules.set(id, rule);
    logger.info('Rate limit rule added', { id, name, scope, limit });

    return rule;
  }

  /**
   * Check and consume rate limit
   */
  checkLimit(ruleName: string, identifier: string): RateLimitStatus {
    const rule = this.findRuleByName(ruleName);
    if (!rule || !rule.isActive) {
      return {
        identifier,
        rule: ruleName,
        limit: Infinity,
        remaining: Infinity,
        resetAt: new Date(),
        isLimited: false,
      };
    }

    const now = Date.now();
    const lastReset = rule.lastReset.get(identifier) || new Date(0);
    const timeSinceReset = now - lastReset.getTime();

    // Reset if window has passed
    if (timeSinceReset >= rule.windowMs) {
      rule.currentUsage.set(identifier, 0);
      rule.lastReset.set(identifier, new Date());
    }

    const currentUsage = rule.currentUsage.get(identifier) || 0;
    const remaining = Math.max(0, rule.limit - currentUsage);
    const isLimited = remaining === 0;

    this.totalRequests++;

    if (isLimited) {
      this.totalBlocked++;
      this.blockedCount.set(identifier, (this.blockedCount.get(identifier) || 0) + 1);
    } else {
      rule.currentUsage.set(identifier, currentUsage + 1);
    }

    const resetTime = new Date((rule.lastReset.get(identifier)?.getTime() || now) + rule.windowMs);

    return {
      identifier,
      rule: ruleName,
      limit: rule.limit,
      remaining: isLimited ? 0 : remaining - 1,
      resetAt: resetTime,
      isLimited,
    };
  }

  /**
   * Find rule by name
   */
  private findRuleByName(name: string): RateLimitRule | undefined {
    for (const [, rule] of this.rules) {
      if (rule.name === name) return rule;
    }
    return undefined;
  }

  /**
   * Get all rules
   */
  getRules(): Array<Omit<RateLimitRule, 'currentUsage' | 'lastReset'> & { activeUsers: number }> {
    return Array.from(this.rules.values()).map((rule) => ({
      id: rule.id,
      name: rule.name,
      scope: rule.scope,
      limit: rule.limit,
      windowMs: rule.windowMs,
      isActive: rule.isActive,
      activeUsers: rule.currentUsage.size,
    }));
  }

  /**
   * Get rate limit status for identifier
   */
  getStatus(identifier: string): RateLimitStatus[] {
    const statuses: RateLimitStatus[] = [];

    for (const [, rule] of this.rules) {
      if (!rule.isActive) continue;

      const currentUsage = rule.currentUsage.get(identifier) || 0;
      const remaining = Math.max(0, rule.limit - currentUsage);
      const resetAt = new Date(
        (rule.lastReset.get(identifier)?.getTime() || Date.now()) + rule.windowMs
      );

      statuses.push({
        identifier,
        rule: rule.name,
        limit: rule.limit,
        remaining,
        resetAt,
        isLimited: remaining === 0,
      });
    }

    return statuses;
  }

  /**
   * Get statistics
   */
  getStats(): RateLimitStats {
    const byRule: Record<string, { total: number; blocked: number }> = {};

    for (const [, rule] of this.rules) {
      let total = 0;
      for (const count of rule.currentUsage.values()) {
        total += count;
      }
      byRule[rule.name] = { total, blocked: 0 };
    }

    // Get top limited
    const topLimited = Array.from(this.blockedCount.entries())
      .map(([identifier, count]) => ({ identifier, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalRequests: this.totalRequests,
      blockedRequests: this.totalBlocked,
      blockRate:
        this.totalRequests > 0
          ? Math.round((this.totalBlocked / this.totalRequests) * 100) / 100
          : 0,
      byRule,
      topLimited,
    };
  }

  /**
   * Update rule limit
   */
  updateRule(
    id: string,
    updates: Partial<Pick<RateLimitRule, 'limit' | 'windowMs' | 'isActive'>>
  ): boolean {
    const rule = this.rules.get(id);
    if (rule) {
      Object.assign(rule, updates);
      logger.info('Rate limit rule updated', { id, updates });
      return true;
    }
    return false;
  }

  /**
   * Delete a rule
   */
  deleteRule(id: string): boolean {
    const deleted = this.rules.delete(id);
    if (deleted) {
      logger.info('Rate limit rule deleted', { id });
    }
    return deleted;
  }

  /**
   * Reset usage for identifier
   */
  resetUsage(identifier: string): void {
    for (const [, rule] of this.rules) {
      rule.currentUsage.delete(identifier);
      rule.lastReset.delete(identifier);
    }
  }

  /**
   * Reset all
   */
  reset(): void {
    this.rules.clear();
    this.blockedCount.clear();
    this.totalRequests = 0;
    this.totalBlocked = 0;
    this.initializeDefaultRules();
    logger.info('RateLimitManager reset');
  }
}

// Export singleton
export const rateLimitManager = new RateLimitManager();
