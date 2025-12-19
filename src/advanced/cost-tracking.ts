/**
 * Cost Tracking Service
 * Issue #119: Cost Tracking (API Usage)
 *
 * Monitor and track LLM API costs across agents
 */

import logger from '../utils/logger';

export interface APICallCost {
  id: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  agentName: string;
  operation: string;
  timestamp: Date;
}

export interface CostBudget {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface CostSummary {
  totalCost: number;
  totalTokens: number;
  callCount: number;
  byProvider: Record<string, { cost: number; tokens: number; calls: number }>;
  byAgent: Record<string, { cost: number; tokens: number; calls: number }>;
  byModel: Record<string, { cost: number; tokens: number; calls: number }>;
  budgetUsed: { daily: number; weekly: number; monthly: number };
  periodStart: Date;
  periodEnd: Date;
}

export interface CostTrend {
  date: string;
  cost: number;
  tokens: number;
  calls: number;
}

// Default pricing per 1K tokens (can be customized)
const DEFAULT_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  default: { input: 0.001, output: 0.002 },
};

/**
 * Cost Tracking Service
 * Tracks API usage costs and enforces budgets
 */
export class CostTracker {
  private costs: APICallCost[] = [];
  private budget: CostBudget = { daily: 100, weekly: 500, monthly: 2000 };
  private pricing: Record<string, { input: number; output: number }> = DEFAULT_PRICING;
  private maxRecords: number = 50000;

  constructor() {
    logger.info('CostTracker initialized');
  }

  /**
   * Record an API call cost
   */
  recordCost(
    provider: string,
    model: string,
    inputTokens: number,
    outputTokens: number,
    agentName: string,
    operation: string
  ): APICallCost {
    const totalTokens = inputTokens + outputTokens;
    const cost = this.calculateCost(model, inputTokens, outputTokens);

    const record: APICallCost = {
      id: `cost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      provider,
      model,
      inputTokens,
      outputTokens,
      totalTokens,
      cost,
      agentName,
      operation,
      timestamp: new Date(),
    };

    this.costs.push(record);

    // Trim old records
    if (this.costs.length > this.maxRecords) {
      this.costs = this.costs.slice(-this.maxRecords);
    }

    logger.debug('Cost recorded', {
      cost,
      totalTokens,
      model,
      agentName,
    });

    return record;
  }

  /**
   * Calculate cost based on model pricing
   */
  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing = this.pricing[model] || this.pricing['default'];
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    return Math.round((inputCost + outputCost) * 10000) / 10000;
  }

  /**
   * Set budget limits
   */
  setBudget(budget: Partial<CostBudget>): void {
    this.budget = { ...this.budget, ...budget };
    logger.info('Budget updated', { budget: this.budget });
  }

  /**
   * Set custom pricing
   */
  setPricing(model: string, input: number, output: number): void {
    this.pricing[model] = { input, output };
  }

  /**
   * Get all costs
   */
  getCosts(limit: number = 100): APICallCost[] {
    return this.costs.slice(-limit);
  }

  /**
   * Get costs for a specific period
   */
  getCostsForPeriod(startDate: Date, endDate: Date): APICallCost[] {
    return this.costs.filter((c) => c.timestamp >= startDate && c.timestamp <= endDate);
  }

  /**
   * Get cost summary
   */
  getCostSummary(): CostSummary {
    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now);
    monthStart.setMonth(monthStart.getMonth() - 1);

    const byProvider: Record<string, { cost: number; tokens: number; calls: number }> = {};
    const byAgent: Record<string, { cost: number; tokens: number; calls: number }> = {};
    const byModel: Record<string, { cost: number; tokens: number; calls: number }> = {};

    let totalCost = 0;
    let totalTokens = 0;
    let dailyCost = 0;
    let weeklyCost = 0;
    let monthlyCost = 0;

    this.costs.forEach((c) => {
      totalCost += c.cost;
      totalTokens += c.totalTokens;

      // By provider
      if (!byProvider[c.provider]) {
        byProvider[c.provider] = { cost: 0, tokens: 0, calls: 0 };
      }
      byProvider[c.provider].cost += c.cost;
      byProvider[c.provider].tokens += c.totalTokens;
      byProvider[c.provider].calls++;

      // By agent
      if (!byAgent[c.agentName]) {
        byAgent[c.agentName] = { cost: 0, tokens: 0, calls: 0 };
      }
      byAgent[c.agentName].cost += c.cost;
      byAgent[c.agentName].tokens += c.totalTokens;
      byAgent[c.agentName].calls++;

      // By model
      if (!byModel[c.model]) {
        byModel[c.model] = { cost: 0, tokens: 0, calls: 0 };
      }
      byModel[c.model].cost += c.cost;
      byModel[c.model].tokens += c.totalTokens;
      byModel[c.model].calls++;

      // Period costs
      if (c.timestamp >= dayStart) dailyCost += c.cost;
      if (c.timestamp >= weekStart) weeklyCost += c.cost;
      if (c.timestamp >= monthStart) monthlyCost += c.cost;
    });

    return {
      totalCost: Math.round(totalCost * 100) / 100,
      totalTokens,
      callCount: this.costs.length,
      byProvider,
      byAgent,
      byModel,
      budgetUsed: {
        daily: Math.round((dailyCost / this.budget.daily) * 100) / 100,
        weekly: Math.round((weeklyCost / this.budget.weekly) * 100) / 100,
        monthly: Math.round((monthlyCost / this.budget.monthly) * 100) / 100,
      },
      periodStart: this.costs.length > 0 ? this.costs[0].timestamp : new Date(),
      periodEnd: new Date(),
    };
  }

  /**
   * Get cost trends
   */
  getCostTrends(days: number = 7): CostTrend[] {
    const trends: CostTrend[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayCosts = this.costs.filter((c) => {
        const costDate = c.timestamp.toISOString().split('T')[0];
        return costDate === dateStr;
      });

      trends.push({
        date: dateStr,
        cost: Math.round(dayCosts.reduce((sum, c) => sum + c.cost, 0) * 100) / 100,
        tokens: dayCosts.reduce((sum, c) => sum + c.totalTokens, 0),
        calls: dayCosts.length,
      });
    }

    return trends;
  }

  /**
   * Check if within budget
   */
  isWithinBudget(): { daily: boolean; weekly: boolean; monthly: boolean } {
    const summary = this.getCostSummary();
    return {
      daily: summary.budgetUsed.daily <= 1,
      weekly: summary.budgetUsed.weekly <= 1,
      monthly: summary.budgetUsed.monthly <= 1,
    };
  }

  /**
   * Get top spenders by agent
   */
  getTopSpendersByAgent(limit: number = 5): Array<{ agent: string; cost: number; tokens: number }> {
    const summary = this.getCostSummary();
    return Object.entries(summary.byAgent)
      .map(([agent, data]) => ({ agent, cost: data.cost, tokens: data.tokens }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, limit);
  }

  /**
   * Get budget status
   */
  getBudget(): CostBudget {
    return { ...this.budget };
  }

  /**
   * Reset all tracking
   */
  reset(): void {
    this.costs = [];
    logger.info('CostTracker reset');
  }
}

// Export singleton instance
export const costTracker = new CostTracker();
