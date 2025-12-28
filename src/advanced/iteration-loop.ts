/**
 * Iteration Loop Controller
 * Issue #192: Iteration Loop Controller
 *
 * Enables autonomous task completion with automatic retries
 * and intelligent error handling
 */

import logger from '../utils/logger';

export type ErrorType = 'transient' | 'permanent' | 'unknown';

export interface IterationConfig {
  maxIterations: number;
  initialBackoffMs: number;
  maxBackoffMs: number;
  backoffMultiplier: number;
  onIteration?: (iteration: IterationRecord) => void;
  onError?: (error: Error, errorType: ErrorType) => void;
  shouldRetry?: (error: Error, iteration: number) => boolean;
}

export interface IterationRecord {
  iteration: number;
  startTime: Date;
  endTime?: Date;
  success: boolean;
  error?: Error;
  errorType?: ErrorType;
  backoffMs?: number;
}

export interface IterationResult<T> {
  success: boolean;
  result?: T;
  totalIterations: number;
  history: IterationRecord[];
  finalError?: Error;
  cancelled: boolean;
}

export type BreakCondition = 'success' | 'max_iterations' | 'permanent_error' | 'cancelled';

const DEFAULT_CONFIG: IterationConfig = {
  maxIterations: 10,
  initialBackoffMs: 100,
  maxBackoffMs: 30000,
  backoffMultiplier: 2,
};

// Known transient error patterns
const TRANSIENT_ERROR_PATTERNS = [
  /ECONNRESET/i,
  /ETIMEDOUT/i,
  /ENOTFOUND/i,
  /rate limit/i,
  /429/,
  /503/,
  /502/,
  /504/,
  /network/i,
  /timeout/i,
  /temporary/i,
];

// Known permanent error patterns
const PERMANENT_ERROR_PATTERNS = [
  /syntax error/i,
  /undefined is not/i,
  /cannot read property/i,
  /type error/i,
  /permission denied/i,
  /access denied/i,
  /not found.*404/i,
  /invalid.*parameter/i,
  /missing.*required/i,
];

/**
 * Iteration Loop Controller
 * Manages autonomous task execution with intelligent retries
 */
export class IterationLoopController {
  private config: IterationConfig;
  private history: IterationRecord[] = [];
  private cancelled = false;
  private currentIteration = 0;

  constructor(config: Partial<IterationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('IterationLoopController initialized', {
      maxIterations: this.config.maxIterations,
      initialBackoffMs: this.config.initialBackoffMs,
    });
  }

  /**
   * Execute a task with automatic retries
   */
  async execute<T>(
    task: () => Promise<T>,
    taskName: string = 'unnamed'
  ): Promise<IterationResult<T>> {
    this.reset();

    logger.info('Starting iteration loop', { taskName, maxIterations: this.config.maxIterations });

    let lastError: Error | undefined;
    let result: T | undefined;

    while (this.currentIteration < this.config.maxIterations && !this.cancelled) {
      this.currentIteration++;
      const record: IterationRecord = {
        iteration: this.currentIteration,
        startTime: new Date(),
        success: false,
      };

      try {
        result = await task();
        record.success = true;
        record.endTime = new Date();
        this.history.push(record);

        if (this.config.onIteration) {
          this.config.onIteration(record);
        }

        logger.info('Iteration succeeded', {
          taskName,
          iteration: this.currentIteration,
          durationMs: record.endTime.getTime() - record.startTime.getTime(),
        });

        return {
          success: true,
          result,
          totalIterations: this.currentIteration,
          history: this.history,
          cancelled: false,
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        lastError = err;
        const errorType = this.classifyError(err);

        record.endTime = new Date();
        record.error = err;
        record.errorType = errorType;
        this.history.push(record);

        if (this.config.onError) {
          this.config.onError(err, errorType);
        }

        logger.warn('Iteration failed', {
          taskName,
          iteration: this.currentIteration,
          errorType,
          error: err.message,
        });

        // Check if we should retry
        if (errorType === 'permanent') {
          logger.info('Permanent error detected, stopping iterations', { taskName });
          break;
        }

        if (this.config.shouldRetry && !this.config.shouldRetry(err, this.currentIteration)) {
          logger.info('Custom retry check returned false, stopping iterations', { taskName });
          break;
        }

        // Apply backoff before next iteration
        if (this.currentIteration < this.config.maxIterations && !this.cancelled) {
          const backoffMs = this.calculateBackoff(this.currentIteration);
          record.backoffMs = backoffMs;

          logger.debug('Applying backoff', {
            taskName,
            backoffMs,
            nextIteration: this.currentIteration + 1,
          });
          await this.sleep(backoffMs);
        }
      }
    }

    const breakCondition = this.determineBreakCondition(lastError);

    logger.info('Iteration loop completed', {
      taskName,
      totalIterations: this.currentIteration,
      success: false,
      breakCondition,
    });

    return {
      success: false,
      totalIterations: this.currentIteration,
      history: this.history,
      finalError: lastError,
      cancelled: this.cancelled,
    };
  }

  /**
   * Cancel the current iteration loop
   */
  cancel(): void {
    this.cancelled = true;
    logger.info('Iteration loop cancelled', { currentIteration: this.currentIteration });
  }

  /**
   * Get the current iteration number
   */
  getCurrentIteration(): number {
    return this.currentIteration;
  }

  /**
   * Get the iteration history
   */
  getHistory(): IterationRecord[] {
    return [...this.history];
  }

  /**
   * Check if the loop is cancelled
   */
  isCancelled(): boolean {
    return this.cancelled;
  }

  /**
   * Reset the controller state
   */
  reset(): void {
    this.history = [];
    this.cancelled = false;
    this.currentIteration = 0;
  }

  /**
   * Classify an error as transient or permanent
   */
  classifyError(error: Error): ErrorType {
    const message = error.message || '';
    const stack = error.stack || '';
    const combined = `${message} ${stack}`;

    // Check for permanent errors first
    for (const pattern of PERMANENT_ERROR_PATTERNS) {
      if (pattern.test(combined)) {
        return 'permanent';
      }
    }

    // Check for transient errors
    for (const pattern of TRANSIENT_ERROR_PATTERNS) {
      if (pattern.test(combined)) {
        return 'transient';
      }
    }

    // Default to transient for unknown errors (favor retrying)
    return 'unknown';
  }

  /**
   * Calculate backoff duration with exponential increase
   */
  private calculateBackoff(iteration: number): number {
    const backoff = Math.min(
      this.config.initialBackoffMs * Math.pow(this.config.backoffMultiplier, iteration - 1),
      this.config.maxBackoffMs
    );

    // Add jitter (±10%)
    const jitter = backoff * 0.1 * (Math.random() * 2 - 1);
    return Math.round(backoff + jitter);
  }

  /**
   * Determine why the loop stopped
   */
  private determineBreakCondition(lastError?: Error): BreakCondition {
    if (this.cancelled) {
      return 'cancelled';
    }

    if (this.currentIteration >= this.config.maxIterations) {
      return 'max_iterations';
    }

    if (lastError && this.classifyError(lastError) === 'permanent') {
      return 'permanent_error';
    }

    return 'success';
  }

  /**
   * Sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance for convenience
export const iterationLoop = new IterationLoopController();

/**
 * Helper function to run a task with iterations
 */
export async function withRetries<T>(
  task: () => Promise<T>,
  options: Partial<IterationConfig> = {}
): Promise<T> {
  const controller = new IterationLoopController(options);
  const result = await controller.execute(task);

  if (!result.success) {
    throw result.finalError || new Error('Task failed after max iterations');
  }

  return result.result as T;
}
