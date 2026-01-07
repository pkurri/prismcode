/**
 * Code Complexity Analyzer
 * Issue #212 - Technical debt visualization and metrics
 */

/**
 * Complexity metric types
 */
export type MetricType = 'cyclomatic' | 'cognitive' | 'halstead' | 'loc' | 'coupling' | 'cohesion';

/**
 * Complexity metrics for a code unit
 */
export interface ComplexityMetrics {
  filePath: string;
  functionName?: string;
  className?: string;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  linesOfCode: number;
  logicalLines: number;
  commentLines: number;
  maintainabilityIndex: number;
  halsteadMetrics: HalsteadMetrics;
}

/**
 * Halstead complexity metrics
 */
export interface HalsteadMetrics {
  operators: number;
  operands: number;
  uniqueOperators: number;
  uniqueOperands: number;
  programLength: number;
  vocabulary: number;
  volume: number;
  difficulty: number;
  effort: number;
  estimatedBugs: number;
}

/**
 * Coupling analysis for a module
 */
export interface CouplingAnalysis {
  modulePath: string;
  afferentCoupling: number; // Incoming dependencies (Ca)
  efferentCoupling: number; // Outgoing dependencies (Ce)
  instability: number; // Ce / (Ca + Ce)
  dependencies: string[];
  dependents: string[];
}

/**
 * Cohesion metrics (LCOM variants)
 */
export interface CohesionMetrics {
  modulePath: string;
  lcom1: number; // Lack of Cohesion of Methods (original)
  lcom2: number; // Modified LCOM
  lcom3: number; // Henderson-Sellers LCOM
  lcom4: number; // Connection-based LCOM
  tightClassCohesion: number; // TCC
}

/**
 * Code hotspot identified by complexity + change frequency
 */
export interface Hotspot {
  filePath: string;
  complexity: number;
  changeFrequency: number;
  hotspotScore: number;
  lastModified: Date;
  contributors: string[];
  recommendations: string[];
}

/**
 * Historical trend data point
 */
export interface TrendDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
}

/**
 * Complexity trends over time
 */
export interface ComplexityTrend {
  metricType: MetricType;
  filePath?: string;
  dataPoints: TrendDataPoint[];
  trend: 'improving' | 'stable' | 'degrading';
  changeRate: number;
}

/**
 * Analysis summary for a codebase
 */
export interface AnalysisSummary {
  analyzedAt: Date;
  totalFiles: number;
  totalFunctions: number;
  totalClasses: number;
  averageComplexity: number;
  maxComplexity: number;
  hotspotCount: number;
  technicalDebtHours: number;
  healthScore: number; // 0-100
  topHotspots: Hotspot[];
}

/**
 * Thresholds for complexity ratings
 */
export interface ComplexityThresholds {
  cyclomatic: { low: number; medium: number; high: number };
  cognitive: { low: number; medium: number; high: number };
  linesOfCode: { low: number; medium: number; high: number };
  couplingWarning: number;
  cohesionWarning: number;
}

/**
 * Default thresholds
 */
const DEFAULT_THRESHOLDS: ComplexityThresholds = {
  cyclomatic: { low: 5, medium: 10, high: 20 },
  cognitive: { low: 8, medium: 15, high: 25 },
  linesOfCode: { low: 50, medium: 100, high: 200 },
  couplingWarning: 10,
  cohesionWarning: 0.5,
};

/**
 * Code Complexity Analyzer for technical debt visualization
 * Provides cyclomatic complexity, coupling/cohesion metrics, and trend tracking
 */
export class CodeComplexityAnalyzer {
  private thresholds: ComplexityThresholds;
  private metricsCache: Map<string, ComplexityMetrics> = new Map();
  private couplingCache: Map<string, CouplingAnalysis> = new Map();
  private trends: Map<string, ComplexityTrend> = new Map();
  private hotspots: Hotspot[] = [];

  constructor(thresholds: Partial<ComplexityThresholds> = {}) {
    this.thresholds = {
      cyclomatic: { ...DEFAULT_THRESHOLDS.cyclomatic, ...thresholds.cyclomatic },
      cognitive: { ...DEFAULT_THRESHOLDS.cognitive, ...thresholds.cognitive },
      linesOfCode: { ...DEFAULT_THRESHOLDS.linesOfCode, ...thresholds.linesOfCode },
      couplingWarning: thresholds.couplingWarning ?? DEFAULT_THRESHOLDS.couplingWarning,
      cohesionWarning: thresholds.cohesionWarning ?? DEFAULT_THRESHOLDS.cohesionWarning,
    };
  }

  /**
   * Analyze code complexity from source
   */
  analyzeCode(source: string, filePath: string, functionName?: string): ComplexityMetrics {
    const lines = source.split('\n');
    const linesOfCode = lines.length;
    const logicalLines = this.countLogicalLines(lines);
    const commentLines = this.countCommentLines(lines);

    const cyclomaticComplexity = this.calculateCyclomaticComplexity(source);
    const cognitiveComplexity = this.calculateCognitiveComplexity(source);
    const halsteadMetrics = this.calculateHalsteadMetrics(source);

    const maintainabilityIndex = this.calculateMaintainabilityIndex(
      halsteadMetrics.volume,
      cyclomaticComplexity,
      logicalLines
    );

    const metrics: ComplexityMetrics = {
      filePath,
      functionName,
      cyclomaticComplexity,
      cognitiveComplexity,
      linesOfCode,
      logicalLines,
      commentLines,
      maintainabilityIndex,
      halsteadMetrics,
    };

    this.metricsCache.set(`${filePath}:${functionName || 'module'}`, metrics);
    return metrics;
  }

  /**
   * Count logical lines (non-empty, non-comment)
   */
  private countLogicalLines(lines: string[]): number {
    return lines.filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed.length > 0 &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('/*') &&
        !trimmed.startsWith('*')
      );
    }).length;
  }

  /**
   * Count comment lines
   */
  private countCommentLines(lines: string[]): number {
    let inBlockComment = false;
    let count = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      if (inBlockComment) {
        count++;
        if (trimmed.includes('*/')) {
          inBlockComment = false;
        }
      } else if (trimmed.startsWith('//')) {
        count++;
      } else if (trimmed.startsWith('/*')) {
        count++;
        inBlockComment = !trimmed.includes('*/');
      }
    }

    return count;
  }

  /**
   * Calculate cyclomatic complexity (decision points + 1)
   */
  private calculateCyclomaticComplexity(source: string): number {
    const decisionPatterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bswitch\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\?/g, // ternary
      /&&/g,
      /\|\|/g,
    ];

    let complexity = 1; // Base complexity

    for (const pattern of decisionPatterns) {
      const matches = source.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  /**
   * Calculate cognitive complexity (nesting-aware)
   */
  private calculateCognitiveComplexity(source: string): number {
    let complexity = 0;
    let nestingLevel = 0;

    const lines = source.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();

      // Track nesting
      if (/\{/.test(trimmed)) {
        nestingLevel += (trimmed.match(/\{/g) || []).length;
      }

      // Decision points add (1 + nesting) to cognitive complexity
      const decisionKeywords = ['if', 'else if', 'for', 'while', 'switch', 'catch'];
      for (const keyword of decisionKeywords) {
        if (new RegExp(`\\b${keyword}\\b`).test(trimmed)) {
          complexity += 1 + Math.floor(nestingLevel / 2);
        }
      }

      // Ternaries and logical operators
      if (/\?.*:/.test(trimmed)) {
        complexity += 1;
      }
      complexity += (trimmed.match(/&&|\|\|/g) || []).length;

      if (/\}/.test(trimmed)) {
        nestingLevel -= (trimmed.match(/\}/g) || []).length;
        nestingLevel = Math.max(0, nestingLevel);
      }
    }

    return complexity;
  }

  /**
   * Calculate Halstead metrics
   */
  private calculateHalsteadMetrics(source: string): HalsteadMetrics {
    // Simplified operator/operand detection
    const operatorPatterns = /[+\-*/%=<>!&|^~?:;,.()[\]{}]/g;
    const operandPatterns = /\b[a-zA-Z_][a-zA-Z0-9_]*\b|\b\d+\.?\d*\b|"[^"]*"|'[^']*'/g;

    const operators = source.match(operatorPatterns) || [];
    const operands = source.match(operandPatterns) || [];

    const uniqueOperators = new Set(operators).size;
    const uniqueOperands = new Set(operands).size;

    const n1 = uniqueOperators;
    const n2 = uniqueOperands;
    const N1 = operators.length;
    const N2 = operands.length;

    const programLength = N1 + N2;
    const vocabulary = n1 + n2;
    const volume = programLength * Math.log2(Math.max(vocabulary, 1));
    const difficulty = vocabulary > 0 ? (n1 / 2) * (N2 / Math.max(n2, 1)) : 0;
    const effort = difficulty * volume;
    const estimatedBugs = volume / 3000;

    return {
      operators: N1,
      operands: N2,
      uniqueOperators: n1,
      uniqueOperands: n2,
      programLength,
      vocabulary,
      volume,
      difficulty,
      effort,
      estimatedBugs,
    };
  }

  /**
   * Calculate maintainability index (0-100 scale)
   */
  private calculateMaintainabilityIndex(
    halsteadVolume: number,
    cyclomaticComplexity: number,
    loc: number
  ): number {
    // Microsoft's maintainability index formula
    const mi =
      171 -
      5.2 * Math.log(Math.max(halsteadVolume, 1)) -
      0.23 * cyclomaticComplexity -
      16.2 * Math.log(Math.max(loc, 1));

    // Normalize to 0-100
    return Math.max(0, Math.min(100, mi * (100 / 171)));
  }

  /**
   * Analyze coupling for a module
   */
  analyzeCoupling(modulePath: string, imports: string[], importedBy: string[]): CouplingAnalysis {
    const afferentCoupling = importedBy.length; // Ca
    const efferentCoupling = imports.length; // Ce
    const total = afferentCoupling + efferentCoupling;
    const instability = total > 0 ? efferentCoupling / total : 0;

    const analysis: CouplingAnalysis = {
      modulePath,
      afferentCoupling,
      efferentCoupling,
      instability,
      dependencies: imports,
      dependents: importedBy,
    };

    this.couplingCache.set(modulePath, analysis);
    return analysis;
  }

  /**
   * Identify code hotspots
   */
  identifyHotspots(
    files: Array<{
      path: string;
      complexity: number;
      changeCount: number;
      lastModified: Date;
      contributors: string[];
    }>
  ): Hotspot[] {
    this.hotspots = files.map((file) => {
      // Hotspot score: complexity * changeFrequency (both normalized)
      const maxComplexity = Math.max(...files.map((f) => f.complexity), 1);
      const maxChanges = Math.max(...files.map((f) => f.changeCount), 1);

      const normalizedComplexity = file.complexity / maxComplexity;
      const normalizedChanges = file.changeCount / maxChanges;
      const hotspotScore = normalizedComplexity * normalizedChanges * 100;

      return {
        filePath: file.path,
        complexity: file.complexity,
        changeFrequency: file.changeCount,
        hotspotScore,
        lastModified: file.lastModified,
        contributors: file.contributors,
        recommendations: this.generateRecommendations(file.complexity, file.changeCount),
      };
    });

    // Sort by hotspot score descending
    this.hotspots.sort((a, b) => b.hotspotScore - a.hotspotScore);
    return this.hotspots;
  }

  /**
   * Generate recommendations for hotspots
   */
  private generateRecommendations(complexity: number, changeCount: number): string[] {
    const recommendations: string[] = [];

    if (complexity > this.thresholds.cyclomatic.high) {
      recommendations.push('High cyclomatic complexity - consider breaking into smaller functions');
    } else if (complexity > this.thresholds.cyclomatic.medium) {
      recommendations.push('Moderate complexity - review for potential simplification');
    }

    if (changeCount > 20) {
      recommendations.push('Frequently modified - may indicate unstable design');
    }

    if (complexity > this.thresholds.cyclomatic.medium && changeCount > 10) {
      recommendations.push(
        'Priority refactoring candidate - high complexity with frequent changes'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('No immediate concerns');
    }

    return recommendations;
  }

  /**
   * Record metrics for trend tracking
   */
  recordTrendDataPoint(
    metricType: MetricType,
    value: number,
    filePath?: string,
    label?: string
  ): void {
    const key = `${metricType}:${filePath || 'global'}`;
    let trend = this.trends.get(key);

    if (!trend) {
      trend = {
        metricType,
        filePath,
        dataPoints: [],
        trend: 'stable',
        changeRate: 0,
      };
      this.trends.set(key, trend);
    }

    trend.dataPoints.push({
      timestamp: new Date(),
      value,
      label,
    });

    this.calculateTrend(trend);
  }

  /**
   * Calculate trend direction
   */
  private calculateTrend(trend: ComplexityTrend): void {
    if (trend.dataPoints.length < 2) {
      trend.trend = 'stable';
      trend.changeRate = 0;
      return;
    }

    const recent = trend.dataPoints.slice(-10);
    const firstValue = recent[0].value;
    const lastValue = recent[recent.length - 1].value;
    const change = lastValue - firstValue;
    const changeRate = (change / Math.max(firstValue, 1)) * 100;

    trend.changeRate = changeRate;

    if (changeRate < -5) {
      trend.trend = 'improving';
    } else if (changeRate > 5) {
      trend.trend = 'degrading';
    } else {
      trend.trend = 'stable';
    }
  }

  /**
   * Get complexity trends
   */
  getTrends(filePath?: string): ComplexityTrend[] {
    const trends = Array.from(this.trends.values());
    if (filePath) {
      return trends.filter((t) => t.filePath === filePath);
    }
    return trends;
  }

  /**
   * Generate analysis summary
   */
  generateSummary(): AnalysisSummary {
    const metrics = Array.from(this.metricsCache.values());
    const complexities = metrics.map((m) => m.cyclomaticComplexity);

    const totalComplexity = complexities.reduce((sum, c) => sum + c, 0);
    const avgComplexity = metrics.length > 0 ? totalComplexity / metrics.length : 0;
    const maxComplexity = Math.max(...complexities, 0);

    // Technical debt estimate: 30 min per complexity point above threshold
    const debtMinutes = metrics.reduce((sum, m) => {
      const excess = Math.max(0, m.cyclomaticComplexity - this.thresholds.cyclomatic.low);
      return sum + excess * 30;
    }, 0);

    const healthScore = this.calculateHealthScore(avgComplexity, this.hotspots);

    return {
      analyzedAt: new Date(),
      totalFiles: new Set(metrics.map((m) => m.filePath)).size,
      totalFunctions: metrics.filter((m) => m.functionName).length,
      totalClasses: metrics.filter((m) => m.className).length,
      averageComplexity: avgComplexity,
      maxComplexity,
      hotspotCount: this.hotspots.filter((h) => h.hotspotScore > 50).length,
      technicalDebtHours: debtMinutes / 60,
      healthScore,
      topHotspots: this.hotspots.slice(0, 10),
    };
  }

  /**
   * Calculate overall health score
   */
  private calculateHealthScore(avgComplexity: number, hotspots: Hotspot[]): number {
    let score = 100;

    // Penalize for average complexity
    if (avgComplexity > this.thresholds.cyclomatic.high) {
      score -= 30;
    } else if (avgComplexity > this.thresholds.cyclomatic.medium) {
      score -= 15;
    } else if (avgComplexity > this.thresholds.cyclomatic.low) {
      score -= 5;
    }

    // Penalize for hotspots
    const criticalHotspots = hotspots.filter((h) => h.hotspotScore > 75).length;
    score -= criticalHotspots * 5;

    const degradingTrends = Array.from(this.trends.values()).filter(
      (t) => t.trend === 'degrading'
    ).length;
    score -= degradingTrends * 3;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get rating for a complexity value
   */
  getComplexityRating(
    value: number,
    metricType: 'cyclomatic' | 'cognitive' | 'linesOfCode'
  ): 'low' | 'medium' | 'high' | 'critical' {
    const t = this.thresholds[metricType];

    if (value <= t.low) return 'low';
    if (value <= t.medium) return 'medium';
    if (value <= t.high) return 'high';
    return 'critical';
  }

  /**
   * Clear caches
   */
  clearCache(): void {
    this.metricsCache.clear();
    this.couplingCache.clear();
    this.trends.clear();
    this.hotspots = [];
  }
}

/**
 * Singleton instance for convenience
 */
export const codeComplexityAnalyzer = new CodeComplexityAnalyzer();
