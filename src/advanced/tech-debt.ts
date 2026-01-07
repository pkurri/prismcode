/**
 * Technical Debt Forecasting System
 * Issue #243: Technical Debt Forecasting System
 *
 * Analyzes codebase for technical debt and predicts future maintenance costs
 */

import logger from '../utils/logger';

export interface DebtItem {
  id: string;
  file: string;
  type: DebtType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  estimatedHours: number;
  createdAt: Date;
  lineRange?: { start: number; end: number };
}

export type DebtType =
  | 'code-smell'
  | 'complexity'
  | 'duplication'
  | 'outdated-dependency'
  | 'missing-tests'
  | 'poor-documentation'
  | 'security-vulnerability'
  | 'performance-issue';

export interface DebtTrend {
  date: Date;
  totalItems: number;
  totalHours: number;
  byType: Record<DebtType, number>;
  bySeverity: Record<string, number>;
}

export interface RemediationPlan {
  id: string;
  items: DebtItem[];
  priorityOrder: string[];
  estimatedTotalHours: number;
  estimatedROI: number;
  suggestedSprint: number;
}

export interface DebtForecast {
  currentDebt: number;
  projectedDebt: number;
  growthRate: number;
  breakEvenPoint: Date | null;
  recommendations: string[];
}

export interface DebtAnalysisResult {
  totalItems: number;
  totalEstimatedHours: number;
  debtScore: number;
  items: DebtItem[];
  trend: DebtTrend[];
  forecast: DebtForecast;
}

/**
 * Technical Debt Forecaster
 * Analyzes and forecasts technical debt in codebases
 */
export class TechnicalDebtForecaster {
  private debtItems: Map<string, DebtItem> = new Map();
  private historicalTrends: DebtTrend[] = [];

  constructor() {
    logger.info('TechnicalDebtForecaster initialized');
  }

  /**
   * Analyze code for technical debt
   */
  analyzeCode(filePath: string, content: string): DebtItem[] {
    const items: DebtItem[] = [];
    const lines = content.split('\n');

    // Check for complexity (long functions)
    let functionStart = -1;
    let braceCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.match(/function\s+\w+|=>\s*{|{\s*$/)) {
        if (functionStart === -1) functionStart = i;
      }
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;

      if (functionStart !== -1 && braceCount === 0 && i - functionStart > 50) {
        items.push(
          this.createDebtItem(
            filePath,
            'complexity',
            'high',
            `Long function (${i - functionStart} lines)`,
            2,
            { start: functionStart, end: i }
          )
        );
        functionStart = -1;
      }
    }

    // Check for TODO/FIXME comments
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/\/\/\s*(TODO|FIXME|HACK|XXX)/i)) {
        items.push(
          this.createDebtItem(
            filePath,
            'code-smell',
            'low',
            `Unresolved ${lines[i].match(/(TODO|FIXME|HACK|XXX)/i)?.[0]} comment`,
            0.5,
            { start: i, end: i }
          )
        );
      }
    }

    // Check for console.log statements (should use logger)
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/console\.(log|warn|error)/)) {
        items.push(
          this.createDebtItem(
            filePath,
            'code-smell',
            'low',
            'Console statement should use structured logger',
            0.25,
            { start: i, end: i }
          )
        );
      }
    }

    // Check for any type usage
    const anyMatches = content.match(/:\s*any\b/g);
    if (anyMatches && anyMatches.length > 3) {
      items.push(
        this.createDebtItem(
          filePath,
          'code-smell',
          'medium',
          `Excessive use of 'any' type (${anyMatches.length} occurrences)`,
          1
        )
      );
    }

    // Check for missing error handling
    if (content.includes('async') && !content.includes('catch') && !content.includes('try')) {
      items.push(
        this.createDebtItem(
          filePath,
          'code-smell',
          'medium',
          'Async code without error handling',
          1
        )
      );
    }

    // Store items
    for (const item of items) {
      this.debtItems.set(item.id, item);
    }

    logger.info('Code analyzed for debt', { file: filePath, itemsFound: items.length });
    return items;
  }

  /**
   * Generate remediation plan
   */
  generateRemediationPlan(maxHours?: number): RemediationPlan {
    const items = Array.from(this.debtItems.values());

    // Sort by severity and ROI
    const prioritized = items.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return a.estimatedHours - b.estimatedHours; // Prefer quick wins
    });

    const selectedItems: DebtItem[] = [];
    let totalHours = 0;

    for (const item of prioritized) {
      if (maxHours && totalHours + item.estimatedHours > maxHours) break;
      selectedItems.push(item);
      totalHours += item.estimatedHours;
    }

    const plan: RemediationPlan = {
      id: `plan_${Date.now().toString(16)}`,
      items: selectedItems,
      priorityOrder: selectedItems.map((i) => i.id),
      estimatedTotalHours: totalHours,
      estimatedROI: this.calculateROI(selectedItems),
      suggestedSprint: Math.ceil(totalHours / 20), // Assuming 20 hours per sprint for debt
    };

    logger.info('Remediation plan generated', {
      itemCount: selectedItems.length,
      hours: totalHours,
    });

    return plan;
  }

  /**
   * Forecast debt growth
   */
  forecastDebt(monthsAhead: number = 6): DebtForecast {
    const currentDebt = this.calculateTotalDebt();
    const growthRate = this.calculateGrowthRate();
    const projectedDebt = currentDebt * Math.pow(1 + growthRate, monthsAhead);

    const recommendations: string[] = [];
    if (growthRate > 0.1) {
      recommendations.push(
        'High debt growth rate detected. Consider dedicating sprint time to debt reduction.'
      );
    }
    if (currentDebt > 100) {
      recommendations.push(
        'Total debt exceeds 100 hours. Prioritize critical and high severity items.'
      );
    }

    const breakEvenPoint =
      growthRate > 0
        ? null
        : new Date(Date.now() + (currentDebt / Math.abs(growthRate)) * 30 * 24 * 60 * 60 * 1000);

    return {
      currentDebt,
      projectedDebt: Math.round(projectedDebt * 10) / 10,
      growthRate: Math.round(growthRate * 1000) / 10,
      breakEvenPoint,
      recommendations,
    };
  }

  /**
   * Get full analysis report
   */
  getAnalysisReport(): DebtAnalysisResult {
    const items = Array.from(this.debtItems.values());
    const totalHours = items.reduce((sum, i) => sum + i.estimatedHours, 0);

    return {
      totalItems: items.length,
      totalEstimatedHours: Math.round(totalHours * 10) / 10,
      debtScore: this.calculateDebtScore(),
      items,
      trend: this.historicalTrends,
      forecast: this.forecastDebt(),
    };
  }

  /**
   * Record current state as trend point
   */
  recordTrendPoint(): void {
    const items = Array.from(this.debtItems.values());
    const byType: Record<DebtType, number> = {} as Record<DebtType, number>;
    const bySeverity: Record<string, number> = {};

    for (const item of items) {
      byType[item.type] = (byType[item.type] || 0) + 1;
      bySeverity[item.severity] = (bySeverity[item.severity] || 0) + 1;
    }

    this.historicalTrends.push({
      date: new Date(),
      totalItems: items.length,
      totalHours: items.reduce((sum, i) => sum + i.estimatedHours, 0),
      byType,
      bySeverity,
    });
  }

  private createDebtItem(
    file: string,
    type: DebtType,
    severity: DebtItem['severity'],
    description: string,
    hours: number,
    lineRange?: { start: number; end: number }
  ): DebtItem {
    return {
      id: `debt_${Date.now().toString(16)}_${Math.random().toString(36).substr(2, 4)}`,
      file,
      type,
      severity,
      description,
      estimatedHours: hours,
      createdAt: new Date(),
      lineRange,
    };
  }

  private calculateTotalDebt(): number {
    return Array.from(this.debtItems.values()).reduce((sum, item) => sum + item.estimatedHours, 0);
  }

  private calculateGrowthRate(): number {
    if (this.historicalTrends.length < 2) return 0.05; // Default 5% monthly growth
    const recent = this.historicalTrends.slice(-2);
    return (recent[1].totalHours - recent[0].totalHours) / recent[0].totalHours;
  }

  private calculateDebtScore(): number {
    const total = this.calculateTotalDebt();
    // Score from 0-100 where lower is better
    return Math.max(0, Math.min(100, Math.round(total / 2)));
  }

  private calculateROI(items: DebtItem[]): number {
    // Simplified ROI: severity-weighted benefit vs hours
    const benefitMap = { critical: 10, high: 5, medium: 2, low: 1 };
    const benefit = items.reduce((sum, i) => sum + benefitMap[i.severity], 0);
    const cost = items.reduce((sum, i) => sum + i.estimatedHours, 0);
    return cost > 0 ? Math.round((benefit / cost) * 100) / 100 : 0;
  }

  /**
   * Clear all debt items
   */
  clear(): void {
    this.debtItems.clear();
    this.historicalTrends = [];
  }
}

export const technicalDebtForecaster = new TechnicalDebtForecaster();
