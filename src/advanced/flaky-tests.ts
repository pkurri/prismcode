/**
 * Flaky Test Detection and Remediation
 * Issue #250 - Identify and fix unreliable tests
 */

export type FlakinessRootCause =
  | 'timing'
  | 'state'
  | 'network'
  | 'resource'
  | 'race_condition'
  | 'environment'
  | 'unknown';
export type FlakinessSeverity = 'critical' | 'high' | 'medium' | 'low';
export type QuarantineStatus = 'active' | 'monitoring' | 'healed' | 'permanent';

export interface TestRunResult {
  testId: string;
  testFile: string;
  testName: string;
  passed: boolean;
  durationMs: number;
  timestamp: Date;
  errorMessage?: string;
  retryCount: number;
  environment: string;
}

export interface FlakyTest {
  testId: string;
  testFile: string;
  testName: string;
  flakinessScore: number;
  severity: FlakinessSeverity;
  rootCause: FlakinessRootCause;
  firstDetected: Date;
  lastFlake: Date;
  totalRuns: number;
  failures: number;
  consecutiveFailures: number;
  quarantineStatus: QuarantineStatus;
  suggestedFixes: FixSuggestion[];
}

export interface FixSuggestion {
  id: string;
  description: string;
  confidence: number;
  codeExample?: string;
  effort: 'low' | 'medium' | 'high';
  category: 'wait' | 'mock' | 'isolation' | 'retry' | 'environment';
}

export interface RootCauseAnalysis {
  testId: string;
  primaryCause: FlakinessRootCause;
  secondaryCauses: FlakinessRootCause[];
  confidence: number;
  evidence: string[];
}

export interface QuarantineConfig {
  autoQuarantineThreshold: number;
  monitoringPeriodDays: number;
  healingThreshold: number;
  maxRetries: number;
}

export interface HealingStats {
  totalFlaky: number;
  quarantined: number;
  healed: number;
  monitoring: number;
  averageTimeToHealDays: number;
}

const DEFAULT_CONFIG: QuarantineConfig = {
  autoQuarantineThreshold: 0.3,
  monitoringPeriodDays: 7,
  healingThreshold: 10,
  maxRetries: 3,
};

export class FlakyTestDetector {
  private config: QuarantineConfig;
  private testHistory: Map<string, TestRunResult[]> = new Map();
  private flakyTests: Map<string, FlakyTest> = new Map();
  private rootCauseCache: Map<string, RootCauseAnalysis> = new Map();

  constructor(config: Partial<QuarantineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  recordTestRun(result: TestRunResult): void {
    const history = this.testHistory.get(result.testId) || [];
    history.push(result);
    if (history.length > 100) history.shift();
    this.testHistory.set(result.testId, history);
    this.detectFlakiness(result.testId);
  }

  detectFlakiness(testId: string): FlakyTest | null {
    const history = this.testHistory.get(testId);
    if (!history || history.length < 5) return null;

    const score = this.calculateFlakinessScore(history);
    if (score < 0.1) {
      this.flakyTests.delete(testId);
      return null;
    }

    const existing = this.flakyTests.get(testId);
    const rootCause = this.analyzeRootCause(testId);

    const flaky: FlakyTest = {
      testId,
      testFile: history[0].testFile,
      testName: history[0].testName,
      flakinessScore: score,
      severity: this.getSeverity(score),
      rootCause: rootCause.primaryCause,
      firstDetected: existing?.firstDetected || new Date(),
      lastFlake: this.getLastFlake(history) || new Date(),
      totalRuns: history.length,
      failures: history.filter((r) => !r.passed).length,
      consecutiveFailures: this.countConsecutiveFailures(history),
      quarantineStatus: this.determineQuarantineStatus(score, existing),
      suggestedFixes: this.generateFixSuggestions(rootCause),
    };

    this.flakyTests.set(testId, flaky);
    return flaky;
  }

  analyzeRootCause(testId: string): RootCauseAnalysis {
    const cached = this.rootCauseCache.get(testId);
    if (cached) return cached;

    const history = this.testHistory.get(testId) || [];
    const causes = this.determineCauses(history);

    const analysis: RootCauseAnalysis = {
      testId,
      primaryCause: causes[0] || 'unknown',
      secondaryCauses: causes.slice(1),
      confidence: Math.min(history.length / 20, 0.9),
      evidence: this.gatherEvidence(history),
    };

    this.rootCauseCache.set(testId, analysis);
    return analysis;
  }

  suggestFixes(testId: string): FixSuggestion[] {
    return this.flakyTests.get(testId)?.suggestedFixes || [];
  }

  quarantine(testId: string): boolean {
    const flaky = this.flakyTests.get(testId);
    if (!flaky) return false;
    flaky.quarantineStatus = 'active';
    return true;
  }

  releaseToMonitoring(testId: string): boolean {
    const flaky = this.flakyTests.get(testId);
    if (!flaky || flaky.quarantineStatus !== 'active') return false;
    flaky.quarantineStatus = 'monitoring';
    return true;
  }

  markHealed(testId: string): boolean {
    const flaky = this.flakyTests.get(testId);
    if (!flaky) return false;
    flaky.quarantineStatus = 'healed';
    return true;
  }

  getFlakyTests(): FlakyTest[] {
    return Array.from(this.flakyTests.values());
  }

  getQuarantinedTests(): FlakyTest[] {
    return this.getFlakyTests().filter((t) => t.quarantineStatus === 'active');
  }

  getHealingStats(): HealingStats {
    const tests = this.getFlakyTests();
    return {
      totalFlaky: tests.length,
      quarantined: tests.filter((t) => t.quarantineStatus === 'active').length,
      healed: tests.filter((t) => t.quarantineStatus === 'healed').length,
      monitoring: tests.filter((t) => t.quarantineStatus === 'monitoring').length,
      averageTimeToHealDays: 0,
    };
  }

  shouldSkip(testId: string): boolean {
    return this.flakyTests.get(testId)?.quarantineStatus === 'active';
  }

  shouldRetry(testId: string, currentRetries: number): boolean {
    return currentRetries < this.config.maxRetries;
  }

  clear(): void {
    this.testHistory.clear();
    this.flakyTests.clear();
    this.rootCauseCache.clear();
  }

  private calculateFlakinessScore(history: TestRunResult[]): number {
    if (history.length < 2) return 0;
    let stateChanges = 0;
    for (let i = 1; i < history.length; i++) {
      if (history[i].passed !== history[i - 1].passed) stateChanges++;
    }
    const ratio = stateChanges / (history.length - 1);
    const failureRate = history.filter((r) => !r.passed).length / history.length;
    return Math.min(ratio * (1 - Math.abs(failureRate - 0.5) * 2) * 2, 1);
  }

  private getSeverity(score: number): FlakinessSeverity {
    if (score >= 0.7) return 'critical';
    if (score >= 0.5) return 'high';
    if (score >= 0.3) return 'medium';
    return 'low';
  }

  private getLastFlake(history: TestRunResult[]): Date | null {
    for (let i = history.length - 1; i > 0; i--) {
      if (history[i].passed !== history[i - 1].passed) return history[i].timestamp;
    }
    return null;
  }

  private countConsecutiveFailures(history: TestRunResult[]): number {
    let count = 0;
    for (let i = history.length - 1; i >= 0 && !history[i].passed; i--) count++;
    return count;
  }

  private determineQuarantineStatus(score: number, existing?: FlakyTest): QuarantineStatus {
    if (existing?.quarantineStatus === 'healed') return score < 0.1 ? 'healed' : 'monitoring';
    if (score >= this.config.autoQuarantineThreshold) return 'active';
    return 'monitoring';
  }

  private determineCauses(history: TestRunResult[]): FlakinessRootCause[] {
    const causes: FlakinessRootCause[] = [];
    const failed = history.filter((r) => !r.passed);
    if (failed.some((r) => r.errorMessage?.includes('timeout'))) causes.push('timing');
    if (failed.some((r) => r.errorMessage?.includes('undefined'))) causes.push('state');
    if (failed.some((r) => r.errorMessage?.includes('network'))) causes.push('network');
    if (causes.length === 0) causes.push('unknown');
    return causes;
  }

  private gatherEvidence(history: TestRunResult[]): string[] {
    const failures = history.filter((r) => !r.passed);
    return [`${failures.length}/${history.length} runs failed`];
  }

  private generateFixSuggestions(analysis: RootCauseAnalysis): FixSuggestion[] {
    const fixes: FixSuggestion[] = [];
    switch (analysis.primaryCause) {
      case 'timing':
        fixes.push({
          id: 'fix-1',
          description: 'Add explicit waits',
          confidence: 0.8,
          effort: 'low',
          category: 'wait',
        });
        break;
      case 'state':
        fixes.push({
          id: 'fix-2',
          description: 'Ensure test isolation',
          confidence: 0.85,
          effort: 'medium',
          category: 'isolation',
        });
        break;
      case 'network':
        fixes.push({
          id: 'fix-3',
          description: 'Mock network calls',
          confidence: 0.9,
          effort: 'medium',
          category: 'mock',
        });
        break;
      default:
        fixes.push({
          id: 'fix-4',
          description: 'Add retry logic',
          confidence: 0.5,
          effort: 'low',
          category: 'retry',
        });
    }
    return fixes;
  }
}

export const flakyTestDetector = new FlakyTestDetector();
