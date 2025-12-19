/**
 * Usage Analytics Service
 * Issue #214: Usage Tracking & Analytics
 *
 * Track and analyze AI API usage with detailed reporting
 */

import logger from '../utils/logger';
import { costTracker, type APICallCost } from './cost-tracking';

export interface UsageReport {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  totalCost: number;
  totalTokens: number;
  totalCalls: number;
  byUser: Map<string, UserUsage>;
  byProject: Map<string, ProjectUsage>;
  byModel: Map<string, ModelUsage>;
  byAgent: Map<string, AgentUsage>;
}

export interface UserUsage {
  userId: string;
  email?: string;
  cost: number;
  tokens: number;
  calls: number;
  topModels: string[];
}

export interface ProjectUsage {
  projectId: string;
  name: string;
  cost: number;
  tokens: number;
  calls: number;
  users: string[];
}

export interface ModelUsage {
  model: string;
  provider: string;
  cost: number;
  inputTokens: number;
  outputTokens: number;
  calls: number;
  avgCostPerCall: number;
  avgTokensPerCall: number;
}

export interface AgentUsage {
  agent: string;
  cost: number;
  tokens: number;
  calls: number;
  operations: string[];
}

export interface UsageAlert {
  id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'unusual_spike' | 'quota_approaching';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  threshold: number;
  currentValue: number;
  createdAt: Date;
}

export interface ExportConfig {
  format: 'json' | 'csv' | 'pdf';
  includeBreakdown: boolean;
  includeTrends: boolean;
  dateRange?: { start: Date; end: Date };
}

/**
 * Usage Analytics Manager
 * Provides detailed usage reports and analytics
 */
export class UsageAnalytics {
  private userCosts: Map<string, APICallCost[]> = new Map();
  private projectCosts: Map<string, APICallCost[]> = new Map();
  private alerts: UsageAlert[] = [];
  private alertThresholds = {
    budgetWarning: 0.8, // 80% of budget
    budgetExceeded: 1.0, // 100% of budget
    spikeMultiplier: 3.0, // 3x average
  };

  constructor() {
    logger.info('UsageAnalytics initialized');
  }

  /**
   * Record usage for a user
   */
  recordUserUsage(userId: string, cost: APICallCost): void {
    const userCosts = this.userCosts.get(userId) || [];
    userCosts.push(cost);
    this.userCosts.set(userId, userCosts);

    this.checkForAlerts(userId, cost);
    logger.debug('User usage recorded', { userId, cost: cost.cost });
  }

  /**
   * Record usage for a project
   */
  recordProjectUsage(projectId: string, cost: APICallCost): void {
    const projectCosts = this.projectCosts.get(projectId) || [];
    projectCosts.push(cost);
    this.projectCosts.set(projectId, projectCosts);

    logger.debug('Project usage recorded', { projectId, cost: cost.cost });
  }

  /**
   * Generate usage report for a period
   */
  generateReport(period: 'daily' | 'weekly' | 'monthly'): UsageReport {
    const now = new Date();
    const startDate = this.getStartDate(period, now);

    const allCosts = costTracker.getCostsForPeriod(startDate, now);

    const report: UsageReport = {
      period,
      startDate,
      endDate: now,
      totalCost: 0,
      totalTokens: 0,
      totalCalls: allCosts.length,
      byUser: new Map(),
      byProject: new Map(),
      byModel: new Map(),
      byAgent: new Map(),
    };

    for (const cost of allCosts) {
      report.totalCost += cost.cost;
      report.totalTokens += cost.totalTokens;

      // Aggregate by model
      const modelKey = `${cost.provider}/${cost.model}`;
      const modelUsage = report.byModel.get(modelKey) || {
        model: cost.model,
        provider: cost.provider,
        cost: 0,
        inputTokens: 0,
        outputTokens: 0,
        calls: 0,
        avgCostPerCall: 0,
        avgTokensPerCall: 0,
      };
      modelUsage.cost += cost.cost;
      modelUsage.inputTokens += cost.inputTokens;
      modelUsage.outputTokens += cost.outputTokens;
      modelUsage.calls += 1;
      modelUsage.avgCostPerCall = modelUsage.cost / modelUsage.calls;
      modelUsage.avgTokensPerCall =
        (modelUsage.inputTokens + modelUsage.outputTokens) / modelUsage.calls;
      report.byModel.set(modelKey, modelUsage);

      // Aggregate by agent
      const agentUsage = report.byAgent.get(cost.agentName) || {
        agent: cost.agentName,
        cost: 0,
        tokens: 0,
        calls: 0,
        operations: [],
      };
      agentUsage.cost += cost.cost;
      agentUsage.tokens += cost.totalTokens;
      agentUsage.calls += 1;
      if (!agentUsage.operations.includes(cost.operation)) {
        agentUsage.operations.push(cost.operation);
      }
      report.byAgent.set(cost.agentName, agentUsage);
    }

    logger.info('Usage report generated', { period, totalCost: report.totalCost });
    return report;
  }

  /**
   * Get user usage summary
   */
  getUserUsage(userId: string, period: 'daily' | 'weekly' | 'monthly'): UserUsage | null {
    const costs = this.userCosts.get(userId);
    if (!costs) return null;

    const startDate = this.getStartDate(period, new Date());
    const periodCosts = costs.filter((c) => c.timestamp >= startDate);

    const modelCounts: Record<string, number> = {};
    let totalCost = 0;
    let totalTokens = 0;

    for (const cost of periodCosts) {
      totalCost += cost.cost;
      totalTokens += cost.totalTokens;
      modelCounts[cost.model] = (modelCounts[cost.model] || 0) + 1;
    }

    const topModels = Object.entries(modelCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([model]) => model);

    return {
      userId,
      cost: totalCost,
      tokens: totalTokens,
      calls: periodCosts.length,
      topModels,
    };
  }

  /**
   * Export usage data
   */
  exportData(config: ExportConfig): string {
    const report = this.generateReport('monthly');

    if (config.format === 'json') {
      return JSON.stringify(this.reportToObject(report), null, 2);
    }

    if (config.format === 'csv') {
      return this.reportToCsv(report);
    }

    // PDF would require external library
    return JSON.stringify(this.reportToObject(report), null, 2);
  }

  /**
   * Get active alerts
   */
  getAlerts(): UsageAlert[] {
    return [...this.alerts];
  }

  /**
   * Dismiss an alert
   */
  dismissAlert(alertId: string): boolean {
    const index = this.alerts.findIndex((a) => a.id === alertId);
    if (index >= 0) {
      this.alerts.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Set alert thresholds
   */
  setAlertThresholds(thresholds: Partial<typeof this.alertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
    logger.info('Alert thresholds updated', thresholds);
  }

  // Private helpers

  private getStartDate(period: 'daily' | 'weekly' | 'monthly', from: Date): Date {
    const date = new Date(from);
    switch (period) {
      case 'daily':
        date.setDate(date.getDate() - 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() - 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() - 1);
        break;
    }
    return date;
  }

  private checkForAlerts(_userId: string, _cost: APICallCost): void {
    const budget = costTracker.getBudget();
    const summary = costTracker.getCostSummary();

    // Check budget warning
    if (
      summary.budgetUsed.daily >= this.alertThresholds.budgetWarning &&
      summary.budgetUsed.daily < this.alertThresholds.budgetExceeded
    ) {
      this.createAlert(
        'budget_warning',
        'warning',
        `Daily budget ${Math.round(summary.budgetUsed.daily * 100)}% used`,
        budget.daily * this.alertThresholds.budgetWarning,
        summary.totalCost
      );
    }

    // Check budget exceeded
    if (summary.budgetUsed.daily >= this.alertThresholds.budgetExceeded) {
      this.createAlert(
        'budget_exceeded',
        'critical',
        `Daily budget exceeded: $${summary.totalCost.toFixed(2)} / $${budget.daily}`,
        budget.daily,
        summary.totalCost
      );
    }
  }

  private createAlert(
    type: UsageAlert['type'],
    severity: UsageAlert['severity'],
    message: string,
    threshold: number,
    currentValue: number
  ): void {
    // Avoid duplicate alerts
    if (this.alerts.some((a) => a.type === type && a.severity === severity)) {
      return;
    }

    const alert: UsageAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      threshold,
      currentValue,
      createdAt: new Date(),
    };

    this.alerts.push(alert);
    logger.warn('Usage alert created', { type, severity, message });
  }

  private reportToObject(report: UsageReport): object {
    return {
      period: report.period,
      startDate: report.startDate.toISOString(),
      endDate: report.endDate.toISOString(),
      summary: {
        totalCost: report.totalCost,
        totalTokens: report.totalTokens,
        totalCalls: report.totalCalls,
      },
      byModel: Object.fromEntries(report.byModel),
      byAgent: Object.fromEntries(report.byAgent),
    };
  }

  private reportToCsv(report: UsageReport): string {
    const lines: string[] = [];
    lines.push('Type,Name,Cost,Tokens,Calls');

    for (const [key, model] of report.byModel) {
      lines.push(
        `model,${key},${model.cost},${model.inputTokens + model.outputTokens},${model.calls}`
      );
    }

    for (const [key, agent] of report.byAgent) {
      lines.push(`agent,${key},${agent.cost},${agent.tokens},${agent.calls}`);
    }

    return lines.join('\n');
  }

  /**
   * Reset analytics
   */
  reset(): void {
    this.userCosts.clear();
    this.projectCosts.clear();
    this.alerts = [];
    logger.info('UsageAnalytics reset');
  }
}

export const usageAnalytics = new UsageAnalytics();
