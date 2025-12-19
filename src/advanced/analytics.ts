/**
 * Analytics Dashboard
 * Issue #117: Analytics Dashboard
 *
 * Provides metrics and insights for project activity
 */

import logger from '../utils/logger';

export interface AnalyticsMetrics {
  totalIssues: number;
  issuesClosed: number;
  issuesOpen: number;
  pullRequests: number;
  prsMerged: number;
  commits: number;
  contributors: number;
  linesAdded: number;
  linesRemoved: number;
  avgTimeToClose: number;
  avgTimeToMerge: number;
}

export interface TimeSeriesData {
  date: string;
  issues: number;
  prs: number;
  commits: number;
}

export interface AgentMetrics {
  agentName: string;
  tasksCompleted: number;
  avgProcessingTime: number;
  successRate: number;
  tokensUsed: number;
  lastActive: Date;
}

export interface DashboardSummary {
  metrics: AnalyticsMetrics;
  agentMetrics: AgentMetrics[];
  timeSeries: TimeSeriesData[];
  lastUpdated: Date;
}

export interface EventLog {
  id: string;
  timestamp: Date;
  type: 'issue' | 'pr' | 'commit' | 'agent' | 'error';
  action: string;
  details: Record<string, unknown>;
}

/**
 * Analytics Dashboard Service
 * Provides comprehensive metrics and insights
 */
export class AnalyticsDashboard {
  private metrics: AnalyticsMetrics = {
    totalIssues: 0,
    issuesClosed: 0,
    issuesOpen: 0,
    pullRequests: 0,
    prsMerged: 0,
    commits: 0,
    contributors: 0,
    linesAdded: 0,
    linesRemoved: 0,
    avgTimeToClose: 0,
    avgTimeToMerge: 0,
  };

  private agentMetricsMap: Map<string, AgentMetrics> = new Map();
  private timeSeriesData: TimeSeriesData[] = [];
  private eventLog: EventLog[] = [];
  private lastUpdated: Date = new Date();

  constructor() {
    this.initializeAgentMetrics();
    logger.info('AnalyticsDashboard initialized');
  }

  /**
   * Initialize default agent metrics
   */
  private initializeAgentMetrics(): void {
    const agents = ['PM Agent', 'Architect', 'Coder', 'QA Agent', 'DevOps'];
    agents.forEach((name) => {
      this.agentMetricsMap.set(name, {
        agentName: name,
        tasksCompleted: 0,
        avgProcessingTime: 0,
        successRate: 1.0,
        tokensUsed: 0,
        lastActive: new Date(),
      });
    });
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): Promise<AnalyticsMetrics> {
    return Promise.resolve({ ...this.metrics });
  }

  /**
   * Get time series data for charts
   */
  getTimeSeries(days: number = 30): Promise<TimeSeriesData[]> {
    // Return stored data or generate placeholder if empty
    if (this.timeSeriesData.length > 0) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return Promise.resolve(this.timeSeriesData.filter((d) => new Date(d.date) >= cutoff));
    }

    // Generate placeholder data for empty state
    const data: TimeSeriesData[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        issues: 0,
        prs: 0,
        commits: 0,
      });
    }
    return Promise.resolve(data);
  }

  /**
   * Get all agent metrics
   */
  getAgentMetrics(): Promise<AgentMetrics[]> {
    return Promise.resolve(Array.from(this.agentMetricsMap.values()));
  }

  /**
   * Get complete dashboard summary
   */
  async getDashboardSummary(days: number = 30): Promise<DashboardSummary> {
    return {
      metrics: await this.getMetrics(),
      agentMetrics: await this.getAgentMetrics(),
      timeSeries: await this.getTimeSeries(days),
      lastUpdated: this.lastUpdated,
    };
  }

  /**
   * Update metrics
   */
  updateMetrics(partial: Partial<AnalyticsMetrics>): void {
    this.metrics = { ...this.metrics, ...partial };
    this.lastUpdated = new Date();
    this.logEvent('issue', 'metrics_updated', partial);
  }

  /**
   * Record agent activity
   */
  recordAgentActivity(
    agentName: string,
    processingTime: number,
    success: boolean,
    tokensUsed: number
  ): void {
    const existing = this.agentMetricsMap.get(agentName);
    if (existing) {
      const totalTasks = existing.tasksCompleted + 1;
      const newAvgTime =
        (existing.avgProcessingTime * existing.tasksCompleted + processingTime) / totalTasks;
      const successCount = existing.successRate * existing.tasksCompleted;
      const newSuccessRate = (successCount + (success ? 1 : 0)) / totalTasks;

      this.agentMetricsMap.set(agentName, {
        ...existing,
        tasksCompleted: totalTasks,
        avgProcessingTime: Math.round(newAvgTime * 100) / 100,
        successRate: Math.round(newSuccessRate * 100) / 100,
        tokensUsed: existing.tokensUsed + tokensUsed,
        lastActive: new Date(),
      });

      this.logEvent('agent', 'task_completed', {
        agentName,
        processingTime,
        success,
        tokensUsed,
      });
    }
  }

  /**
   * Record daily activity for time series
   */
  recordDailyActivity(issues: number, prs: number, commits: number): void {
    const today = new Date().toISOString().split('T')[0];
    const existing = this.timeSeriesData.find((d) => d.date === today);

    if (existing) {
      existing.issues += issues;
      existing.prs += prs;
      existing.commits += commits;
    } else {
      this.timeSeriesData.push({ date: today, issues, prs, commits });
    }

    // Keep only last 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    this.timeSeriesData = this.timeSeriesData.filter((d) => new Date(d.date) >= cutoff);
  }

  /**
   * Increment specific metric
   */
  incrementMetric(key: keyof AnalyticsMetrics, amount: number = 1): void {
    const currentValue = this.metrics[key];
    if (typeof currentValue === 'number') {
      // Use Object.assign for type-safe update
      Object.assign(this.metrics, { [key]: currentValue + amount });
      this.lastUpdated = new Date();
    }
  }

  /**
   * Get event log
   */
  getEventLog(limit: number = 100): EventLog[] {
    return this.eventLog.slice(-limit);
  }

  /**
   * Log an event
   */
  private logEvent(type: EventLog['type'], action: string, details: Record<string, unknown>): void {
    this.eventLog.push({
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      action,
      details,
    });

    // Keep only last 1000 events
    if (this.eventLog.length > 1000) {
      this.eventLog = this.eventLog.slice(-1000);
    }
  }

  /**
   * Get analytics report for a date range
   */
  async getReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    metrics: AnalyticsMetrics;
    timeSeries: TimeSeriesData[];
    agentPerformance: AgentMetrics[];
    eventCount: number;
  }> {
    const filteredTimeSeries = this.timeSeriesData.filter((d) => {
      const date = new Date(d.date);
      return date >= startDate && date <= endDate;
    });

    const filteredEvents = this.eventLog.filter(
      (e) => e.timestamp >= startDate && e.timestamp <= endDate
    );

    return {
      metrics: await this.getMetrics(),
      timeSeries: filteredTimeSeries,
      agentPerformance: await this.getAgentMetrics(),
      eventCount: filteredEvents.length,
    };
  }

  /**
   * Reset all metrics (for testing)
   */
  reset(): void {
    this.metrics = {
      totalIssues: 0,
      issuesClosed: 0,
      issuesOpen: 0,
      pullRequests: 0,
      prsMerged: 0,
      commits: 0,
      contributors: 0,
      linesAdded: 0,
      linesRemoved: 0,
      avgTimeToClose: 0,
      avgTimeToMerge: 0,
    };
    this.initializeAgentMetrics();
    this.timeSeriesData = [];
    this.eventLog = [];
    this.lastUpdated = new Date();
    logger.info('AnalyticsDashboard reset');
  }
}

// Export singleton instance
export const analyticsDashboard = new AnalyticsDashboard();
