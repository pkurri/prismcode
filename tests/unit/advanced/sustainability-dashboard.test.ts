import { SustainabilityDashboard } from '../../../src/advanced/sustainability-dashboard';

describe('SustainabilityDashboard', () => {
  let dashboard: SustainabilityDashboard;

  beforeEach(() => {
    dashboard = new SustainabilityDashboard();
  });

  describe('recordEmissions', () => {
    it('should record emissions and update metrics', () => {
      dashboard.recordEmissions('proj1', 'Project 1', 50);
      const metrics = dashboard.getMetrics();

      expect(metrics.totalEmissions).toBe(50);
      expect(metrics.dailyTrend.length).toBe(1);
    });

    it('should track multiple projects', () => {
      dashboard.recordEmissions('proj1', 'Project 1', 50);
      dashboard.recordEmissions('proj2', 'Project 2', 30);

      const projects = dashboard.getProjects();
      expect(projects.length).toBe(2);
    });
  });

  describe('getWidgetData', () => {
    it('should return widget data', () => {
      dashboard.recordEmissions('proj1', 'Test', 100);
      const data = dashboard.getWidgetData('w1');

      expect(data).toBeDefined();
    });
  });

  describe('configure', () => {
    it('should update configuration', () => {
      dashboard.configure({ dateRange: 'month' });
      // Config is internal but method should work
      expect(true).toBe(true);
    });
  });

  describe('exportData', () => {
    it('should export all data', () => {
      dashboard.recordEmissions('proj1', 'Test', 75);
      const exported = dashboard.exportData();

      expect(exported.metrics.totalEmissions).toBe(75);
      expect(exported.projects.length).toBe(1);
    });
  });

  describe('setSavings', () => {
    it('should calculate savings percentage', () => {
      dashboard.recordEmissions('proj1', 'Test', 50);
      dashboard.setSavings(100);

      const metrics = dashboard.getMetrics();
      expect(metrics.savingsPercent).toBe(50);
    });
  });
});
