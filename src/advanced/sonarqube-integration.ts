/**
 * SonarQube Quality Gate Integration
 * Issue #217: SonarQube Quality Gate
 *
 * Integrate with SonarQube for code quality checks
 */

import logger from '../utils/logger';

export interface SonarQubeConfig {
  serverUrl: string;
  token: string;
  projectKey: string;
  organization?: string;
  qualityGate?: string;
}

export interface QualityMetric {
  key: string;
  name: string;
  value: number | string;
  status: 'OK' | 'WARN' | 'ERROR';
  threshold?: number;
}

export interface CodeSmell {
  key: string;
  rule: string;
  severity: 'INFO' | 'MINOR' | 'MAJOR' | 'CRITICAL' | 'BLOCKER';
  message: string;
  file: string;
  line: number;
  effort: string;
  type: 'CODE_SMELL' | 'BUG' | 'VULNERABILITY' | 'SECURITY_HOTSPOT';
}

export interface QualityGateResult {
  status: 'OK' | 'WARN' | 'ERROR';
  projectKey: string;
  analysisDate: Date;
  metrics: QualityMetric[];
  issues: CodeSmell[];
  coverage: number;
  duplications: number;
  rating: {
    reliability: 'A' | 'B' | 'C' | 'D' | 'E';
    security: 'A' | 'B' | 'C' | 'D' | 'E';
    maintainability: 'A' | 'B' | 'C' | 'D' | 'E';
  };
}

export interface PRAnalysisResult {
  passed: boolean;
  newIssues: number;
  fixedIssues: number;
  newCoverage: number;
  coverageDiff: number;
  blockers: CodeSmell[];
  criticals: CodeSmell[];
}

/**
 * SonarQube Quality Gate Service
 * Provides code quality analysis and gate checks
 */
export class SonarQubeIntegration {
  private config: SonarQubeConfig | null = null;
  private analysisHistory: QualityGateResult[] = [];

  constructor() {
    logger.info('SonarQubeIntegration initialized');
  }

  /**
   * Configure SonarQube connection
   */
  configure(config: SonarQubeConfig): void {
    this.config = config;
    logger.info('SonarQube configured', { 
      serverUrl: config.serverUrl,
      projectKey: config.projectKey,
    });
  }

  /**
   * Run quality analysis on project
   */
  async analyze(branch?: string): Promise<QualityGateResult> {
    if (!this.config) {
      throw new Error('SonarQube not configured. Call configure() first.');
    }

    logger.info('Starting SonarQube analysis', { 
      projectKey: this.config.projectKey,
      branch,
    });

    // Simulate analysis
    const result = await this.performAnalysis(branch);
    this.analysisHistory.push(result);

    logger.info('SonarQube analysis complete', {
      status: result.status,
      coverage: result.coverage,
      issues: result.issues.length,
    });

    return result;
  }

  /**
   * Analyze a pull request
   */
  async analyzePR(prNumber: number, baseBranch: string): Promise<PRAnalysisResult> {
    if (!this.config) {
      throw new Error('SonarQube not configured');
    }

    logger.info('Analyzing PR', { prNumber, baseBranch });

    // Get base branch analysis
    const baseAnalysis = await this.analyze(baseBranch);
    
    // Get PR analysis
    const prAnalysis = await this.analyze(`pr-${prNumber}`);

    const blockers = prAnalysis.issues.filter(i => i.severity === 'BLOCKER');
    const criticals = prAnalysis.issues.filter(i => i.severity === 'CRITICAL');

    const result: PRAnalysisResult = {
      passed: blockers.length === 0 && criticals.length === 0,
      newIssues: Math.max(0, prAnalysis.issues.length - baseAnalysis.issues.length),
      fixedIssues: Math.max(0, baseAnalysis.issues.length - prAnalysis.issues.length),
      newCoverage: prAnalysis.coverage,
      coverageDiff: prAnalysis.coverage - baseAnalysis.coverage,
      blockers,
      criticals,
    };

    logger.info('PR analysis complete', {
      passed: result.passed,
      newIssues: result.newIssues,
      coverageDiff: result.coverageDiff,
    });

    return result;
  }

  /**
   * Check if quality gate passes
   */
  checkQualityGate(result: QualityGateResult): { passed: boolean; failures: string[] } {
    const failures: string[] = [];

    if (result.status === 'ERROR') {
      failures.push('Quality gate status: ERROR');
    }

    if (result.coverage < 80) {
      failures.push(`Coverage ${result.coverage}% is below 80% threshold`);
    }

    if (result.duplications > 3) {
      failures.push(`Duplications ${result.duplications}% exceeds 3% threshold`);
    }

    if (result.rating.reliability !== 'A' && result.rating.reliability !== 'B') {
      failures.push(`Reliability rating ${result.rating.reliability} is below B`);
    }

    const blockers = result.issues.filter(i => i.severity === 'BLOCKER');
    if (blockers.length > 0) {
      failures.push(`${blockers.length} blocker issues found`);
    }

    return {
      passed: failures.length === 0,
      failures,
    };
  }

  /**
   * Get issues by file
   */
  getIssuesByFile(result: QualityGateResult): Map<string, CodeSmell[]> {
    const fileMap = new Map<string, CodeSmell[]>();

    for (const issue of result.issues) {
      const issues = fileMap.get(issue.file) || [];
      issues.push(issue);
      fileMap.set(issue.file, issues);
    }

    return fileMap;
  }

  /**
   * Generate quality report for PR comment
   */
  generatePRComment(prResult: PRAnalysisResult): string {
    const emoji = prResult.passed ? '✅' : '❌';
    const status = prResult.passed ? 'Passed' : 'Failed';

    const lines = [
      `## ${emoji} SonarQube Quality Gate: ${status}`,
      '',
      '| Metric | Value |',
      '|--------|-------|',
      `| New Issues | ${prResult.newIssues} |`,
      `| Fixed Issues | ${prResult.fixedIssues} |`,
      `| Coverage | ${prResult.newCoverage.toFixed(1)}% (${prResult.coverageDiff >= 0 ? '+' : ''}${prResult.coverageDiff.toFixed(1)}%) |`,
      `| Blockers | ${prResult.blockers.length} |`,
      `| Critical | ${prResult.criticals.length} |`,
    ];

    if (prResult.blockers.length > 0) {
      lines.push('', '### ⛔ Blocker Issues');
      for (const issue of prResult.blockers) {
        lines.push(`- **${issue.file}:${issue.line}**: ${issue.message}`);
      }
    }

    if (prResult.criticals.length > 0) {
      lines.push('', '### 🔴 Critical Issues');
      for (const issue of prResult.criticals) {
        lines.push(`- **${issue.file}:${issue.line}**: ${issue.message}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Get analysis history
   */
  getHistory(limit: number = 10): QualityGateResult[] {
    return this.analysisHistory.slice(-limit);
  }

  // Private helpers

  private async performAnalysis(_branch?: string): Promise<QualityGateResult> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));

    const mockIssues: CodeSmell[] = [
      {
        key: 'issue-1',
        rule: 'typescript:S1186',
        severity: 'MAJOR',
        message: 'Add a nested comment explaining why this method is empty',
        file: 'src/utils/helper.ts',
        line: 42,
        effort: '5min',
        type: 'CODE_SMELL',
      },
    ];

    return {
      status: 'OK',
      projectKey: this.config?.projectKey || 'unknown',
      analysisDate: new Date(),
      metrics: [
        { key: 'coverage', name: 'Coverage', value: 85.5, status: 'OK', threshold: 80 },
        { key: 'bugs', name: 'Bugs', value: 0, status: 'OK' },
        { key: 'vulnerabilities', name: 'Vulnerabilities', value: 0, status: 'OK' },
        { key: 'code_smells', name: 'Code Smells', value: mockIssues.length, status: 'WARN' },
      ],
      issues: mockIssues,
      coverage: 85.5,
      duplications: 1.2,
      rating: {
        reliability: 'A',
        security: 'A',
        maintainability: 'B',
      },
    };
  }

  /**
   * Reset integration
   */
  reset(): void {
    this.config = null;
    this.analysisHistory = [];
    logger.info('SonarQubeIntegration reset');
  }
}

export const sonarQubeIntegration = new SonarQubeIntegration();
