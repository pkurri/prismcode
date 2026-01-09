/**
 * Sustainability Dashboard
 * Issue #230: Sustainability Dashboard UI
 *
 * Dashboard for tracking and visualizing carbon footprint metrics
 */

import logger from '../utils/logger';

export interface DashboardMetrics {
  totalEmissions: number;
  dailyTrend: number[];
  weeklyAverage: number;
  monthlyTotal: number;
  savingsPercent: number;
}

export interface ProjectMetrics {
  projectId: string;
  name: string;
  emissions: number;
  runs: number;
  efficiency: number;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  data: unknown;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export type WidgetType =
  | 'emissions-chart'
  | 'trend-line'
  | 'savings-gauge'
  | 'project-table'
  | 'region-map'
  | 'recommendations';

export interface DashboardConfig {
  refreshInterval: number;
  dateRange: 'day' | 'week' | 'month' | 'year';
  showComparison: boolean;
  widgets: DashboardWidget[];
}

/**
 * Sustainability Dashboard Manager
 * Manages dashboard state and metrics
 */
export class SustainabilityDashboard {
  private config: DashboardConfig;
  private metrics: DashboardMetrics;
  private projects: Map<string, ProjectMetrics> = new Map();

  constructor() {
    this.config = {
      refreshInterval: 60000,
      dateRange: 'week',
      showComparison: true,
      widgets: this.getDefaultWidgets(),
    };
    this.metrics = this.initializeMetrics();
    logger.info('SustainabilityDashboard initialized');
  }

  private getDefaultWidgets(): DashboardWidget[] {
    return [
      {
        id: 'w1',
        type: 'emissions-chart',
        title: 'Total Emissions',
        data: null,
        position: { x: 0, y: 0 },
        size: { width: 6, height: 4 },
      },
      {
        id: 'w2',
        type: 'trend-line',
        title: 'Weekly Trend',
        data: null,
        position: { x: 6, y: 0 },
        size: { width: 6, height: 4 },
      },
      {
        id: 'w3',
        type: 'savings-gauge',
        title: 'Carbon Saved',
        data: null,
        position: { x: 0, y: 4 },
        size: { width: 4, height: 3 },
      },
      {
        id: 'w4',
        type: 'project-table',
        title: 'Project Breakdown',
        data: null,
        position: { x: 4, y: 4 },
        size: { width: 8, height: 3 },
      },
    ];
  }

  private initializeMetrics(): DashboardMetrics {
    return {
      totalEmissions: 0,
      dailyTrend: [],
      weeklyAverage: 0,
      monthlyTotal: 0,
      savingsPercent: 0,
    };
  }

  /**
   * Record emissions for a pipeline run
   */
  recordEmissions(projectId: string, projectName: string, emissions: number): void {
    let project = this.projects.get(projectId);
    if (!project) {
      project = { projectId, name: projectName, emissions: 0, runs: 0, efficiency: 100 };
      this.projects.set(projectId, project);
    }

    project.emissions += emissions;
    project.runs++;
    project.efficiency = this.calculateEfficiency(project);

    this.metrics.totalEmissions += emissions;
    this.metrics.dailyTrend.push(emissions);
    if (this.metrics.dailyTrend.length > 30) {
      this.metrics.dailyTrend.shift();
    }

    this.updateAverages();
    logger.debug('Emissions recorded', { projectId, emissions });
  }

  /**
   * Get dashboard metrics
   */
  getMetrics(): DashboardMetrics {
    return { ...this.metrics };
  }

  /**
   * Get project breakdown
   */
  getProjects(): ProjectMetrics[] {
    return Array.from(this.projects.values()).sort((a, b) => b.emissions - a.emissions);
  }

  /**
   * Get widget data
   */
  getWidgetData(widgetId: string): unknown {
    const widget = this.config.widgets.find((w) => w.id === widgetId);
    if (!widget) return null;

    switch (widget.type) {
      case 'emissions-chart':
        return { total: this.metrics.totalEmissions, trend: this.metrics.dailyTrend };
      case 'trend-line':
        return this.metrics.dailyTrend;
      case 'savings-gauge':
        return { percent: this.metrics.savingsPercent };
      case 'project-table':
        return this.getProjects();
      default:
        return null;
    }
  }

  /**
   * Configure dashboard
   */
  configure(config: Partial<DashboardConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Dashboard configured', { dateRange: this.config.dateRange });
  }

  /**
   * Add custom widget
   */
  addWidget(widget: Omit<DashboardWidget, 'id'>): DashboardWidget {
    const newWidget: DashboardWidget = {
      ...widget,
      id: `w_${Date.now().toString(16)}`,
    };
    this.config.widgets.push(newWidget);
    return newWidget;
  }

  /**
   * Export dashboard data
   */
  exportData(): { metrics: DashboardMetrics; projects: ProjectMetrics[] } {
    return {
      metrics: this.getMetrics(),
      projects: this.getProjects(),
    };
  }

  private updateAverages(): void {
    const trend = this.metrics.dailyTrend;
    if (trend.length > 0) {
      this.metrics.weeklyAverage =
        trend.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, trend.length);
      this.metrics.monthlyTotal = trend.slice(-30).reduce((a, b) => a + b, 0);
    }
  }

  private calculateEfficiency(project: ProjectMetrics): number {
    if (project.runs === 0) return 100;
    const avgPerRun = project.emissions / project.runs;
    return Math.max(0, Math.min(100, 100 - avgPerRun * 10));
  }

  /**
   * Calculate savings compared to baseline
   */
  setSavings(baselineEmissions: number): void {
    if (baselineEmissions > 0) {
      this.metrics.savingsPercent = Math.round(
        ((baselineEmissions - this.metrics.totalEmissions) / baselineEmissions) * 100
      );
    }
  }
}

export const sustainabilityDashboard = new SustainabilityDashboard();
