/**
 * Analytics Dashboard Tests
 * Tests for Issue #117
 */

import {
  AnalyticsDashboard,
  AnalyticsMetrics,
  AgentMetrics,
  TimeSeriesData,
} from '../../../src/advanced/analytics';

describe('AnalyticsDashboard', () => {
  let dashboard: AnalyticsDashboard;

  beforeEach(() => {
    dashboard = new AnalyticsDashboard();
    dashboard.reset();
  });

  describe('getMetrics', () => {
    it('should return initial metrics with zeros', async () => {
      const metrics = await dashboard.getMetrics();

      expect(metrics.totalIssues).toBe(0);
      expect(metrics.issuesClosed).toBe(0);
      expect(metrics.pullRequests).toBe(0);
    });

    it('should return updated metrics after updateMetrics', async () => {
      dashboard.updateMetrics({
        totalIssues: 10,
        issuesClosed: 5,
        pullRequests: 3,
      });

      const metrics = await dashboard.getMetrics();

      expect(metrics.totalIssues).toBe(10);
      expect(metrics.issuesClosed).toBe(5);
      expect(metrics.pullRequests).toBe(3);
    });
  });

  describe('getTimeSeries', () => {
    it('should return time series data for specified days', async () => {
      const data = await dashboard.getTimeSeries(7);

      expect(data).toHaveLength(7);
      expect(data[0]).toHaveProperty('date');
      expect(data[0]).toHaveProperty('issues');
      expect(data[0]).toHaveProperty('prs');
      expect(data[0]).toHaveProperty('commits');
    });

    it('should return stored data after recordDailyActivity', async () => {
      dashboard.recordDailyActivity(5, 2, 10);

      const data = await dashboard.getTimeSeries(30);
      const today = new Date().toISOString().split('T')[0];
      const todayData = data.find((d) => d.date === today);

      expect(todayData).toBeDefined();
      expect(todayData?.issues).toBe(5);
      expect(todayData?.prs).toBe(2);
      expect(todayData?.commits).toBe(10);
    });
  });

  describe('getAgentMetrics', () => {
    it('should return metrics for all agents', async () => {
      const metrics = await dashboard.getAgentMetrics();

      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics.find((m) => m.agentName === 'PM Agent')).toBeDefined();
      expect(metrics.find((m) => m.agentName === 'Architect')).toBeDefined();
      expect(metrics.find((m) => m.agentName === 'Coder')).toBeDefined();
    });
  });

  describe('recordAgentActivity', () => {
    it('should update agent metrics correctly', async () => {
      dashboard.recordAgentActivity('PM Agent', 2.5, true, 1000);
      dashboard.recordAgentActivity('PM Agent', 3.5, true, 1500);

      const metrics = await dashboard.getAgentMetrics();
      const pmAgent = metrics.find((m) => m.agentName === 'PM Agent');

      expect(pmAgent).toBeDefined();
      expect(pmAgent?.tasksCompleted).toBe(2);
      expect(pmAgent?.tokensUsed).toBe(2500);
      expect(pmAgent?.successRate).toBe(1);
    });

    it('should calculate success rate correctly', async () => {
      dashboard.recordAgentActivity('Coder', 5.0, true, 1000);
      dashboard.recordAgentActivity('Coder', 5.0, false, 1000);

      const metrics = await dashboard.getAgentMetrics();
      const coder = metrics.find((m) => m.agentName === 'Coder');

      expect(coder?.successRate).toBe(0.5);
    });
  });

  describe('incrementMetric', () => {
    it('should increment a metric by 1', async () => {
      dashboard.incrementMetric('commits');
      dashboard.incrementMetric('commits');

      const metrics = await dashboard.getMetrics();
      expect(metrics.commits).toBe(2);
    });

    it('should increment a metric by specified amount', async () => {
      dashboard.incrementMetric('linesAdded', 100);

      const metrics = await dashboard.getMetrics();
      expect(metrics.linesAdded).toBe(100);
    });
  });

  describe('getDashboardSummary', () => {
    it('should return complete dashboard summary', async () => {
      dashboard.updateMetrics({ totalIssues: 5 });
      dashboard.recordAgentActivity('PM Agent', 2.0, true, 500);
      dashboard.recordDailyActivity(1, 0, 3);

      const summary = await dashboard.getDashboardSummary(7);

      expect(summary.metrics.totalIssues).toBe(5);
      expect(summary.agentMetrics.length).toBeGreaterThan(0);
      expect(summary.timeSeries.length).toBeGreaterThanOrEqual(1);
      expect(summary.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('getEventLog', () => {
    it('should return event log entries', () => {
      dashboard.updateMetrics({ commits: 1 });

      const log = dashboard.getEventLog();

      expect(log.length).toBeGreaterThan(0);
      expect(log[0]).toHaveProperty('id');
      expect(log[0]).toHaveProperty('timestamp');
      expect(log[0]).toHaveProperty('type');
    });

    it('should limit returned entries', () => {
      for (let i = 0; i < 10; i++) {
        dashboard.updateMetrics({ commits: i });
      }

      const log = dashboard.getEventLog(5);
      expect(log.length).toBe(5);
    });
  });

  describe('getReport', () => {
    it('should return filtered report for date range', async () => {
      dashboard.recordDailyActivity(5, 2, 10);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();

      const report = await dashboard.getReport(startDate, endDate);

      expect(report.metrics).toBeDefined();
      expect(report.timeSeries).toBeDefined();
      expect(report.agentPerformance).toBeDefined();
      expect(report.eventCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('reset', () => {
    it('should reset all metrics to initial state', async () => {
      dashboard.updateMetrics({ totalIssues: 100, commits: 50 });
      dashboard.recordAgentActivity('PM Agent', 2.0, true, 1000);

      dashboard.reset();

      const metrics = await dashboard.getMetrics();
      const agentMetrics = await dashboard.getAgentMetrics();
      const pmAgent = agentMetrics.find((m) => m.agentName === 'PM Agent');

      expect(metrics.totalIssues).toBe(0);
      expect(metrics.commits).toBe(0);
      expect(pmAgent?.tasksCompleted).toBe(0);
    });
  });
});
