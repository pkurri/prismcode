/**
 * Predictive Quality Intelligence
 * Issue #256: Predictive Quality Intelligence
 *
 * Forecast bugs, identify hotspots, and score release risk
 */

import logger from '../utils/logger';

export interface FileRisk {
  filePath: string;
  riskScore: number; // 0-100
  factors: {
    complexity: number;
    churn: number;
    bugHistory: number;
    coverage: number;
  };
  classification: 'Safe' | 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical';
}

export interface CommitAnalysis {
  commitHash: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
  riskScore: number;
}

export interface ReleaseRisk {
  version: string;
  totalRiskScore: number;
  hotspots: FileRisk[];
  predictedBugs: number;
  recommendation: 'Go' | 'Caution' | 'No Go';
}

/**
 * Predictive Quality
 * Analyzes historical data to predict future quality issues
 */
export class PredictiveQuality {
  constructor() {
    logger.info('PredictiveQuality initialized');
  }

  /**
   * Assess risk for a single file
   */
  assessFileRisk(
    filePath: string,
    complexity: number, // Cyclomatic complexity
    churn: number, // Commits in last 30 days
    bugs: number, // Previous bugs in file
    coverage: number // Test coverage %
  ): FileRisk {
    // Risk Formula:
    // Base risk on complexity (30%)
    // Multiplied by churn frequency (40%)
    // Penalized by historical bugs (20%)
    // Mitigated by test coverage (10%)

    const complexityFactor = Math.min(100, complexity * 5) * 0.3;
    const churnFactor = Math.min(100, churn * 10) * 0.4;
    const bugFactor = Math.min(100, bugs * 20) * 0.2;
    const coverageMitigation = (coverage / 100) * 10; // Max 10 points reduction

    const rawRisk = complexityFactor + churnFactor + bugFactor - coverageMitigation;
    const riskScore = Math.max(0, Math.min(100, Math.round(rawRisk)));

    let classification: FileRisk['classification'] = 'Safe';
    if (riskScore >= 80) classification = 'Critical';
    else if (riskScore >= 60) classification = 'High Risk';
    else if (riskScore >= 40) classification = 'Medium Risk';
    else if (riskScore >= 20) classification = 'Low Risk';

    const analysis: FileRisk = {
      filePath,
      riskScore,
      factors: {
        complexity,
        churn,
        bugHistory: bugs,
        coverage,
      },
      classification,
    };

    logger.info('File risk assessed', { file: filePath, score: riskScore, class: classification });
    return analysis;
  }

  /**
   * Forecast release risk based on a set of changed files
   */
  assessReleaseRisk(version: string, fileRisks: FileRisk[]): ReleaseRisk {
    // Average risk of changed files
    const avgRisk = fileRisks.reduce((sum, f) => sum + f.riskScore, 0) / (fileRisks.length || 1);

    // Determine critical hotspots
    const hotspots = fileRisks
      .filter((f) => f.riskScore >= 60)
      .sort((a, b) => b.riskScore - a.riskScore);

    // Simple linear regression model for bug prediction (Simulation)
    // Assume 1 bug per 50 units of total risk score across files
    const totalRisk = avgRisk * fileRisks.length;
    const predictedBugs = Math.round(totalRisk / 50);

    let recommendation: ReleaseRisk['recommendation'] = 'Go';
    if (avgRisk > 60 || hotspots.length > 3) recommendation = 'No Go';
    else if (avgRisk > 40 || hotspots.length > 0) recommendation = 'Caution';

    const report: ReleaseRisk = {
      version,
      totalRiskScore: parseFloat(avgRisk.toFixed(1)),
      hotspots,
      predictedBugs,
      recommendation,
    };

    logger.info('Release risk assessed', { version, recommendation, predictedBugs });
    return report;
  }

  /**
   * Analyze churn vs complexity to identify refactoring candidates
   * (Google's hotspot algorithm)
   */
  identifyHotspots(files: { path: string; complexity: number; churn: number }[]): string[] {
    return files
      .filter((f) => f.churn > 5 && f.complexity > 10) // Thresholds
      .map((f) => f.path);
  }
}

export const predictiveQuality = new PredictiveQuality();
