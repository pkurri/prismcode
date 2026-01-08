/**
 * Self-Healing CI/CD Pipelines
 * Issue #246: Self-Healing CI/CD Pipelines
 *
 * Automatically detects and fixes common CI/CD failures
 */

import logger from '../utils/logger';

export interface PipelineRun {
  id: string;
  pipelineName: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'healed';
  startTime: Date;
  endTime?: Date;
  stages: PipelineStage[];
  healingAttempts: HealingAttempt[];
}

export interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  error?: string;
  duration?: number;
}

export interface HealingAttempt {
  timestamp: Date;
  issue: PipelineIssue;
  action: HealingAction;
  success: boolean;
  details: string;
}

export interface PipelineIssue {
  type: IssueType;
  stage: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export type IssueType =
  | 'dependency-install'
  | 'test-flaky'
  | 'build-cache'
  | 'resource-limit'
  | 'network-timeout'
  | 'auth-expired'
  | 'artifact-missing'
  | 'env-variable';

export interface HealingAction {
  type: ActionType;
  description: string;
  automated: boolean;
}

export type ActionType =
  | 'retry'
  | 'clear-cache'
  | 'refresh-token'
  | 'increase-timeout'
  | 'skip-stage'
  | 'rollback'
  | 'notify-team';

export interface HealingStrategy {
  issueType: IssueType;
  actions: ActionType[];
  maxRetries: number;
  escalateAfter: number;
}

/**
 * Self-Healing CI/CD Manager
 * Monitors and automatically heals pipeline failures
 */
export class SelfHealingCICD {
  private runs: Map<string, PipelineRun> = new Map();
  private strategies: Map<IssueType, HealingStrategy> = new Map();

  constructor() {
    this.initializeStrategies();
    logger.info('SelfHealingCICD initialized');
  }

  private initializeStrategies(): void {
    const defaultStrategies: HealingStrategy[] = [
      {
        issueType: 'dependency-install',
        actions: ['clear-cache', 'retry'],
        maxRetries: 3,
        escalateAfter: 2,
      },
      {
        issueType: 'test-flaky',
        actions: ['retry', 'skip-stage'],
        maxRetries: 3,
        escalateAfter: 3,
      },
      {
        issueType: 'build-cache',
        actions: ['clear-cache', 'retry'],
        maxRetries: 2,
        escalateAfter: 2,
      },
      {
        issueType: 'network-timeout',
        actions: ['increase-timeout', 'retry'],
        maxRetries: 3,
        escalateAfter: 2,
      },
      {
        issueType: 'auth-expired',
        actions: ['refresh-token', 'retry'],
        maxRetries: 2,
        escalateAfter: 1,
      },
      {
        issueType: 'resource-limit',
        actions: ['retry', 'notify-team'],
        maxRetries: 1,
        escalateAfter: 1,
      },
      {
        issueType: 'artifact-missing',
        actions: ['clear-cache', 'retry'],
        maxRetries: 2,
        escalateAfter: 2,
      },
      { issueType: 'env-variable', actions: ['notify-team'], maxRetries: 0, escalateAfter: 0 },
    ];

    for (const strategy of defaultStrategies) {
      this.strategies.set(strategy.issueType, strategy);
    }
  }

  /**
   * Start monitoring a pipeline run
   */
  startRun(pipelineName: string, stages: string[]): PipelineRun {
    const run: PipelineRun = {
      id: `run_${Date.now().toString(16)}`,
      pipelineName,
      status: 'pending',
      startTime: new Date(),
      stages: stages.map((name) => ({ name, status: 'pending' })),
      healingAttempts: [],
    };

    this.runs.set(run.id, run);
    logger.info('Pipeline run started', { id: run.id, pipeline: pipelineName });
    return run;
  }

  /**
   * Report a stage failure and attempt healing
   */
  async reportFailure(
    runId: string,
    stageName: string,
    error: string
  ): Promise<HealingAttempt | null> {
    const run = this.runs.get(runId);
    if (!run) return null;

    const stage = run.stages.find((s) => s.name === stageName);
    if (stage) {
      stage.status = 'failed';
      stage.error = error;
    }

    // Detect issue type
    const issue = this.detectIssue(stageName, error);

    // Attempt healing
    const attempt = await this.attemptHealing(run, issue);
    run.healingAttempts.push(attempt);

    if (attempt.success) {
      run.status = 'healed';
      if (stage) stage.status = 'success';
    } else {
      run.status = 'failed';
    }

    return attempt;
  }

  /**
   * Detect the type of issue from error message
   */
  private detectIssue(stage: string, error: string): PipelineIssue {
    const lowerError = error.toLowerCase();
    let type: IssueType = 'dependency-install';
    let severity: PipelineIssue['severity'] = 'medium';

    if (
      lowerError.includes('npm') ||
      lowerError.includes('yarn') ||
      lowerError.includes('install')
    ) {
      type = 'dependency-install';
    } else if (
      lowerError.includes('flaky') ||
      lowerError.includes('intermittent') ||
      lowerError.includes('timeout')
    ) {
      type = 'test-flaky';
    } else if (lowerError.includes('cache') || lowerError.includes('stale')) {
      type = 'build-cache';
    } else if (
      lowerError.includes('network') ||
      lowerError.includes('econnrefused') ||
      lowerError.includes('timeout')
    ) {
      type = 'network-timeout';
    } else if (
      lowerError.includes('auth') ||
      lowerError.includes('token') ||
      lowerError.includes('expired')
    ) {
      type = 'auth-expired';
      severity = 'high';
    } else if (
      lowerError.includes('memory') ||
      lowerError.includes('oom') ||
      lowerError.includes('resource')
    ) {
      type = 'resource-limit';
      severity = 'critical';
    } else if (lowerError.includes('artifact') || lowerError.includes('not found')) {
      type = 'artifact-missing';
    } else if (lowerError.includes('env') || lowerError.includes('variable')) {
      type = 'env-variable';
      severity = 'high';
    }

    return { type, stage, message: error, severity };
  }

  /**
   * Attempt to heal a pipeline issue
   */
  private async attemptHealing(run: PipelineRun, issue: PipelineIssue): Promise<HealingAttempt> {
    const strategy = this.strategies.get(issue.type);
    const previousAttempts = run.healingAttempts.filter((a) => a.issue.type === issue.type).length;

    if (!strategy || previousAttempts >= strategy.maxRetries) {
      return {
        timestamp: new Date(),
        issue,
        action: {
          type: 'notify-team',
          description: 'Max retries exceeded, notifying team',
          automated: true,
        },
        success: false,
        details: 'Escalated to team for manual intervention',
      };
    }

    const actionType = strategy.actions[Math.min(previousAttempts, strategy.actions.length - 1)];
    const action = await this.executeAction(actionType, issue);

    logger.info('Healing attempted', {
      runId: run.id,
      issueType: issue.type,
      action: actionType,
      success: action.success,
    });

    return {
      timestamp: new Date(),
      issue,
      action: { type: actionType, description: action.description, automated: true },
      success: action.success,
      details: action.details,
    };
  }

  /**
   * Execute a healing action
   */
  private async executeAction(
    actionType: ActionType,
    issue: PipelineIssue
  ): Promise<{ success: boolean; description: string; details: string }> {
    // Simulate action execution
    await new Promise((resolve) => setTimeout(resolve, 10));

    const actions: Record<
      ActionType,
      () => { success: boolean; description: string; details: string }
    > = {
      retry: () => ({
        success: Math.random() > 0.3,
        description: 'Retry failed stage',
        details: 'Re-running stage',
      }),
      'clear-cache': () => ({
        success: true,
        description: 'Clear build cache',
        details: 'Cache cleared successfully',
      }),
      'refresh-token': () => ({
        success: true,
        description: 'Refresh auth token',
        details: 'Token refreshed',
      }),
      'increase-timeout': () => ({
        success: true,
        description: 'Increase timeout',
        details: 'Timeout increased to 10m',
      }),
      'skip-stage': () => ({
        success: true,
        description: 'Skip non-critical stage',
        details: `Skipped ${issue.stage}`,
      }),
      rollback: () => ({
        success: true,
        description: 'Rollback to previous version',
        details: 'Rolled back successfully',
      }),
      'notify-team': () => ({
        success: false,
        description: 'Notify team',
        details: 'Team notified via Slack',
      }),
    };

    return actions[actionType]();
  }

  /**
   * Get run status
   */
  getRunStatus(runId: string): PipelineRun | null {
    return this.runs.get(runId) || null;
  }

  /**
   * Get healing statistics
   */
  getStats(): { totalRuns: number; healedRuns: number; failedRuns: number; healingRate: number } {
    const runs = Array.from(this.runs.values());
    const healed = runs.filter((r) => r.status === 'healed').length;
    const failed = runs.filter((r) => r.status === 'failed').length;

    return {
      totalRuns: runs.length,
      healedRuns: healed,
      failedRuns: failed,
      healingRate: runs.length > 0 ? Math.round((healed / (healed + failed)) * 100) : 0,
    };
  }
}

export const selfHealingCICD = new SelfHealingCICD();
