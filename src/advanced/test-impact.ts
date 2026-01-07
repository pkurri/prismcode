/**
 * Test Impact Analysis System
 * Issue #249 - Determine minimal test set for code changes
 */

/**
 * Test priority for execution ordering
 */
export type TestPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Change type in source code
 */
export type ChangeType = 'add' | 'modify' | 'delete' | 'rename';

/**
 * Mapping between code and test files
 */
export interface TestFileMapping {
  sourceFile: string;
  testFiles: string[];
  coverage: number; // 0-100
  lastUpdated: Date;
}

/**
 * Code change for impact analysis
 */
export interface CodeChange {
  filePath: string;
  changeType: ChangeType;
  linesChanged: number[];
  functionsChanged: string[];
  classesChanged: string[];
}

/**
 * Impact analysis result
 */
export interface ImpactAnalysis {
  changes: CodeChange[];
  affectedTests: AffectedTest[];
  totalTestsAffected: number;
  estimatedReduction: number; // Percentage of tests skipped
  analyzedAt: Date;
}

/**
 * Test affected by changes
 */
export interface AffectedTest {
  testFile: string;
  testName?: string;
  priority: TestPriority;
  failureLikelihood: number; // 0-1
  affectedBy: string[]; // Source files affecting this test
  estimatedDurationMs: number;
}

/**
 * Test dependency graph node
 */
export interface TestDependency {
  testFile: string;
  directDependencies: string[];
  transitiveDependencies: string[];
  dependentTests: string[];
}

/**
 * Test execution recommendation
 */
export interface TestRecommendation {
  mustRun: AffectedTest[];
  shouldRun: AffectedTest[];
  canSkip: string[];
  estimatedSavings: {
    testsSkipped: number;
    timeReducedMs: number;
    percentageReduction: number;
  };
}

/**
 * Historical test data for prioritization
 */
export interface TestHistory {
  testFile: string;
  totalRuns: number;
  failures: number;
  averageDurationMs: number;
  lastFailure?: Date;
  flakiness: number; // 0-1
}

/**
 * Test Impact Analyzer for CI optimization
 * Determines minimal test set and prioritizes by failure likelihood
 */
export class TestImpactAnalyzer {
  private mappings: Map<string, TestFileMapping> = new Map();
  private dependencies: Map<string, TestDependency> = new Map();
  private history: Map<string, TestHistory> = new Map();

  /**
   * Register a source-to-test mapping
   */
  registerMapping(sourceFile: string, testFiles: string[], coverage: number = 100): void {
    this.mappings.set(sourceFile, {
      sourceFile,
      testFiles,
      coverage,
      lastUpdated: new Date(),
    });
  }

  /**
   * Register test dependency information
   */
  registerDependency(
    testFile: string,
    directDependencies: string[],
    transitiveDependencies: string[] = []
  ): void {
    this.dependencies.set(testFile, {
      testFile,
      directDependencies,
      transitiveDependencies,
      dependentTests: [],
    });

    // Update reverse dependencies
    for (const dep of directDependencies) {
      const existing = this.dependencies.get(dep);
      if (existing) {
        existing.dependentTests.push(testFile);
      }
    }
  }

  /**
   * Record test history for prioritization
   */
  recordTestRun(testFile: string, passed: boolean, durationMs: number): void {
    const existing = this.history.get(testFile) || {
      testFile,
      totalRuns: 0,
      failures: 0,
      averageDurationMs: 0,
      flakiness: 0,
    };

    existing.totalRuns++;
    if (!passed) {
      existing.failures++;
      existing.lastFailure = new Date();
    }

    // Update running average
    existing.averageDurationMs =
      (existing.averageDurationMs * (existing.totalRuns - 1) + durationMs) / existing.totalRuns;

    // Calculate flakiness (failures / runs, weighted towards recent)
    existing.flakiness = existing.failures / existing.totalRuns;

    this.history.set(testFile, existing);
  }

  /**
   * Analyze impact of code changes
   */
  analyzeImpact(changes: CodeChange[]): ImpactAnalysis {
    const affectedTests: Map<string, AffectedTest> = new Map();

    for (const change of changes) {
      const mapping = this.mappings.get(change.filePath);
      if (!mapping) continue;

      for (const testFile of mapping.testFiles) {
        if (!affectedTests.has(testFile)) {
          const history = this.history.get(testFile);
          affectedTests.set(testFile, {
            testFile,
            priority: this.calculatePriority(change, history),
            failureLikelihood: this.calculateFailureLikelihood(change, history),
            affectedBy: [change.filePath],
            estimatedDurationMs: history?.averageDurationMs || 1000,
          });
        } else {
          affectedTests.get(testFile)!.affectedBy.push(change.filePath);
        }
      }
    }

    // Add transitively affected tests
    this.addTransitiveTests(affectedTests);

    const allTests = this.getAllTestFiles();
    const affected = Array.from(affectedTests.values());

    return {
      changes,
      affectedTests: affected.sort((a, b) => b.failureLikelihood - a.failureLikelihood),
      totalTestsAffected: affected.length,
      estimatedReduction:
        allTests.length > 0 ? ((allTests.length - affected.length) / allTests.length) * 100 : 0,
      analyzedAt: new Date(),
    };
  }

  /**
   * Get minimal test set for changes
   */
  getMinimalTestSet(changes: CodeChange[]): TestRecommendation {
    const impact = this.analyzeImpact(changes);

    const mustRun = impact.affectedTests.filter(
      (t) => t.priority === 'critical' || t.priority === 'high'
    );
    const shouldRun = impact.affectedTests.filter((t) => t.priority === 'medium');
    // Low priority tests are included in canSkip calculation via affectedSet

    const allTests = this.getAllTestFiles();
    const affectedSet = new Set(impact.affectedTests.map((t) => t.testFile));
    const canSkip = allTests.filter((t) => !affectedSet.has(t));

    const timeReducedMs = this.calculateSkippedTime(canSkip);
    const totalTime = this.calculateTotalTime(allTests);

    return {
      mustRun,
      shouldRun,
      canSkip,
      estimatedSavings: {
        testsSkipped: canSkip.length,
        timeReducedMs,
        percentageReduction: totalTime > 0 ? (timeReducedMs / totalTime) * 100 : 0,
      },
    };
  }

  /**
   * Prioritize tests by failure likelihood
   */
  prioritizeTests(tests: string[]): AffectedTest[] {
    return tests
      .map((testFile) => {
        const history = this.history.get(testFile);
        return {
          testFile,
          priority: this.getPriorityFromHistory(history),
          failureLikelihood: history ? history.failures / history.totalRuns : 0.5,
          affectedBy: [],
          estimatedDurationMs: history?.averageDurationMs || 1000,
        };
      })
      .sort((a, b) => b.failureLikelihood - a.failureLikelihood);
  }

  /**
   * Get test dependency graph for visualization
   */
  getDependencyGraph(): Map<string, TestDependency> {
    return new Map(this.dependencies);
  }

  /**
   * Get all test files registered
   */
  getAllTestFiles(): string[] {
    const tests = new Set<string>();
    for (const mapping of this.mappings.values()) {
      mapping.testFiles.forEach((t) => tests.add(t));
    }
    return Array.from(tests);
  }

  /**
   * Get mapping for a source file
   */
  getMapping(sourceFile: string): TestFileMapping | undefined {
    return this.mappings.get(sourceFile);
  }

  /**
   * Get history for a test file
   */
  getHistory(testFile: string): TestHistory | undefined {
    return this.history.get(testFile);
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.mappings.clear();
    this.dependencies.clear();
    this.history.clear();
  }

  // Private helpers

  private calculatePriority(change: CodeChange, history?: TestHistory): TestPriority {
    // Critical changes
    if (change.changeType === 'delete' || change.linesChanged.length > 50) {
      return 'critical';
    }

    // High priority if test has recent failures
    if (history?.lastFailure) {
      const daysSinceFailure = (Date.now() - history.lastFailure.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceFailure < 7) return 'high';
    }

    // Medium for significant changes
    if (change.linesChanged.length > 10 || change.functionsChanged.length > 2) {
      return 'medium';
    }

    return 'low';
  }

  private calculateFailureLikelihood(change: CodeChange, history?: TestHistory): number {
    let likelihood = 0.1; // Base likelihood

    // Increase for delete/rename operations
    if (change.changeType === 'delete' || change.changeType === 'rename') {
      likelihood += 0.3;
    }

    // Increase for larger changes
    likelihood += Math.min(change.linesChanged.length / 100, 0.3);

    // Consider historical failure rate
    if (history) {
      likelihood += (history.failures / history.totalRuns) * 0.3;
    }

    return Math.min(likelihood, 1);
  }

  private addTransitiveTests(affectedTests: Map<string, AffectedTest>): void {
    const toAdd: AffectedTest[] = [];

    for (const affected of affectedTests.values()) {
      const dep = this.dependencies.get(affected.testFile);
      if (!dep) continue;

      for (const dependent of dep.dependentTests) {
        if (!affectedTests.has(dependent)) {
          const history = this.history.get(dependent);
          toAdd.push({
            testFile: dependent,
            priority: 'low', // Transitive deps are lower priority
            failureLikelihood: 0.1,
            affectedBy: [affected.testFile],
            estimatedDurationMs: history?.averageDurationMs || 1000,
          });
        }
      }
    }

    toAdd.forEach((t) => affectedTests.set(t.testFile, t));
  }

  private getPriorityFromHistory(history?: TestHistory): TestPriority {
    if (!history) return 'medium';
    const failureRate = history.failures / history.totalRuns;
    if (failureRate > 0.3) return 'critical';
    if (failureRate > 0.1) return 'high';
    if (failureRate > 0.05) return 'medium';
    return 'low';
  }

  private calculateSkippedTime(testFiles: string[]): number {
    return testFiles.reduce((sum, t) => {
      const history = this.history.get(t);
      return sum + (history?.averageDurationMs || 1000);
    }, 0);
  }

  private calculateTotalTime(testFiles: string[]): number {
    return testFiles.reduce((sum, t) => {
      const history = this.history.get(t);
      return sum + (history?.averageDurationMs || 1000);
    }, 0);
  }
}

/**
 * Singleton instance
 */
export const testImpactAnalyzer = new TestImpactAnalyzer();
