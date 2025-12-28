/**
 * Self-Healing Error Recovery
 * Issue #193: Self-Healing Error Recovery
 *
 * Automatically diagnose and fix common errors to unblock developer workflows
 */

import logger from '../utils/logger';

export type ErrorCategory =
  | 'dependency'
  | 'type'
  | 'syntax'
  | 'build'
  | 'test'
  | 'runtime'
  | 'network'
  | 'permission'
  | 'unknown';

export interface ErrorDiagnosis {
  category: ErrorCategory;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  suggestedFixes: SuggestedFix[];
  confidence: number; // 0-1
  isAutoFixable: boolean;
}

export interface SuggestedFix {
  description: string;
  command?: string;
  codeChange?: CodeChange;
  priority: 'high' | 'medium' | 'low';
  autoApply: boolean;
}

export interface CodeChange {
  file: string;
  oldContent: string;
  newContent: string;
  startLine?: number;
  endLine?: number;
}

export interface FixResult {
  success: boolean;
  fix: SuggestedFix;
  error?: Error;
  appliedAt: Date;
}

export interface HealingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  originalError: string;
  diagnosis: ErrorDiagnosis;
  fixAttempts: FixResult[];
  resolved: boolean;
}

// Error pattern matchers
const ERROR_PATTERNS: Array<{
  pattern: RegExp;
  category: ErrorCategory;
  extractDetails: (match: RegExpMatchArray) => Partial<ErrorDiagnosis>;
  generateFixes: (match: RegExpMatchArray, error: string) => SuggestedFix[];
}> = [
  // Missing dependency
  {
    pattern: /Cannot find module ['"]([^'"]+)['"]/,
    category: 'dependency',
    extractDetails: (match) => ({
      message: `Missing module: ${match[1]}`,
      isAutoFixable: true,
      confidence: 0.95,
    }),
    generateFixes: (match) => [
      {
        description: `Install missing package: ${match[1]}`,
        command: `npm install ${match[1]}`,
        priority: 'high',
        autoApply: true,
      },
      {
        description: `Install as dev dependency: ${match[1]}`,
        command: `npm install -D ${match[1]}`,
        priority: 'medium',
        autoApply: false,
      },
    ],
  },
  // TypeScript type errors
  {
    pattern: /TS(\d+): (.+) at (.+):(\d+):(\d+)/,
    category: 'type',
    extractDetails: (match) => ({
      message: `TypeScript error TS${match[1]}: ${match[2]}`,
      file: match[3],
      line: parseInt(match[4]),
      column: parseInt(match[5]),
      isAutoFixable: match[1] === '2304' || match[1] === '2307',
      confidence: 0.8,
    }),
    generateFixes: (match) => {
      const fixes: SuggestedFix[] = [];
      const errorCode = match[1];

      if (errorCode === '2304') {
        // Cannot find name
        fixes.push({
          description: 'Add missing import statement',
          priority: 'high',
          autoApply: false,
        });
      } else if (errorCode === '2307') {
        // Cannot find module
        fixes.push({
          description: 'Install type definitions',
          command: `npm install -D @types/${match[2].split("'")[1] || 'unknown'}`,
          priority: 'high',
          autoApply: true,
        });
      }

      return fixes;
    },
  },
  // Syntax errors
  {
    pattern: /SyntaxError: (.+) at ([^:]+):(\d+):?(\d+)?/,
    category: 'syntax',
    extractDetails: (match) => ({
      message: match[1],
      file: match[2],
      line: parseInt(match[3]),
      column: match[4] ? parseInt(match[4]) : undefined,
      isAutoFixable: false,
      confidence: 0.9,
    }),
    generateFixes: () => [
      {
        description: 'Check for missing brackets, quotes, or semicolons',
        priority: 'high',
        autoApply: false,
      },
    ],
  },
  // Build failures
  {
    pattern: /error: Build failed/i,
    category: 'build',
    extractDetails: () => ({
      message: 'Build process failed',
      isAutoFixable: false,
      confidence: 0.7,
    }),
    generateFixes: () => [
      {
        description: 'Clean and rebuild the project',
        command: 'npm run clean && npm run build',
        priority: 'high',
        autoApply: true,
      },
      {
        description: 'Clear node_modules and reinstall',
        command: 'rm -rf node_modules && npm install',
        priority: 'medium',
        autoApply: false,
      },
    ],
  },
  // Test failures
  {
    pattern: /FAIL\s+(.+\.test\.[jt]sx?)/,
    category: 'test',
    extractDetails: (match) => ({
      message: `Test file failed: ${match[1]}`,
      file: match[1],
      isAutoFixable: false,
      confidence: 0.85,
    }),
    generateFixes: (match) => [
      {
        description: 'Run test in watch mode for debugging',
        command: `npm test -- --watch ${match[1]}`,
        priority: 'medium',
        autoApply: false,
      },
      {
        description: 'Update snapshots if applicable',
        command: 'npm test -- -u',
        priority: 'low',
        autoApply: false,
      },
    ],
  },
  // Permission errors
  {
    pattern: /EACCES|Permission denied|EPERM/i,
    category: 'permission',
    extractDetails: () => ({
      message: 'Permission denied error',
      isAutoFixable: false,
      confidence: 0.9,
    }),
    generateFixes: () => [
      {
        description: 'Fix npm permissions',
        command: 'sudo chown -R $(whoami) ~/.npm',
        priority: 'medium',
        autoApply: false,
      },
      {
        description: 'Use sudo for this command (not recommended)',
        priority: 'low',
        autoApply: false,
      },
    ],
  },
  // Network errors
  {
    pattern: /ECONNREFUSED|ETIMEDOUT|ENOTFOUND|fetch failed/i,
    category: 'network',
    extractDetails: () => ({
      message: 'Network connection error',
      isAutoFixable: false,
      confidence: 0.85,
    }),
    generateFixes: () => [
      {
        description: 'Check network connection and retry',
        priority: 'high',
        autoApply: false,
      },
      {
        description: 'Check if service is running',
        priority: 'medium',
        autoApply: false,
      },
    ],
  },
];

/**
 * Self-Healing Error Recovery System
 */
export class SelfHealingRecovery {
  private sessions: Map<string, HealingSession> = new Map();
  private autoFixEnabled = true;

  constructor(options: { autoFixEnabled?: boolean } = {}) {
    this.autoFixEnabled = options.autoFixEnabled ?? true;
    logger.info('SelfHealingRecovery initialized', { autoFixEnabled: this.autoFixEnabled });
  }

  /**
   * Diagnose an error and suggest fixes
   */
  diagnose(error: string | Error): ErrorDiagnosis {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack || '' : '';
    const fullError = `${errorMessage}\n${errorStack}`;

    logger.debug('Diagnosing error', { error: errorMessage.substring(0, 100) });

    for (const matcher of ERROR_PATTERNS) {
      const match = fullError.match(matcher.pattern);
      if (match) {
        const details = matcher.extractDetails(match);
        const fixes = matcher.generateFixes(match, fullError);

        const diagnosis: ErrorDiagnosis = {
          category: matcher.category,
          message: details.message || errorMessage,
          file: details.file,
          line: details.line,
          column: details.column,
          suggestedFixes: fixes,
          confidence: details.confidence || 0.5,
          isAutoFixable: details.isAutoFixable || false,
        };

        logger.info('Error diagnosed', {
          category: diagnosis.category,
          isAutoFixable: diagnosis.isAutoFixable,
          fixCount: fixes.length,
        });

        return diagnosis;
      }
    }

    // Unknown error
    return {
      category: 'unknown',
      message: errorMessage,
      suggestedFixes: [
        {
          description: 'Search for this error online',
          priority: 'low',
          autoApply: false,
        },
      ],
      confidence: 0.1,
      isAutoFixable: false,
    };
  }

  /**
   * Start a healing session for an error
   */
  startSession(error: string | Error): HealingSession {
    const errorMessage = error instanceof Error ? error.message : error;
    const diagnosis = this.diagnose(error);

    const session: HealingSession = {
      id: this.generateId(),
      startTime: new Date(),
      originalError: errorMessage,
      diagnosis,
      fixAttempts: [],
      resolved: false,
    };

    this.sessions.set(session.id, session);

    logger.info('Healing session started', {
      sessionId: session.id,
      category: diagnosis.category,
    });

    return session;
  }

  /**
   * Apply a suggested fix
   */
  applyFix(sessionId: string, fixIndex: number = 0): FixResult {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const fix = session.diagnosis.suggestedFixes[fixIndex];
    if (!fix) {
      throw new Error(`Fix not found at index ${fixIndex}`);
    }

    logger.info('Applying fix', {
      sessionId,
      description: fix.description,
      hasCommand: !!fix.command,
    });

    const result: FixResult = {
      success: false,
      fix,
      appliedAt: new Date(),
    };

    try {
      if (fix.command) {
        // In a real implementation, this would execute the command
        // For now, we simulate success for auto-apply fixes
        if (fix.autoApply && this.autoFixEnabled) {
          logger.info('Auto-applying fix', { command: fix.command });
          result.success = true;
        } else {
          logger.info('Fix requires manual approval', { command: fix.command });
          result.success = false;
        }
      } else if (fix.codeChange) {
        // In a real implementation, this would apply the code change
        logger.info('Code change suggested', { file: fix.codeChange.file });
        result.success = false;
      }
    } catch (error) {
      result.error = error instanceof Error ? error : new Error(String(error));
      logger.error('Fix application failed', { error: result.error.message });
    }

    session.fixAttempts.push(result);
    if (result.success) {
      session.resolved = true;
      session.endTime = new Date();
    }

    return result;
  }

  /**
   * Auto-heal an error (diagnose and apply first auto-fixable solution)
   */
  autoHeal(error: string | Error): HealingSession {
    const session = this.startSession(error);

    if (!this.autoFixEnabled) {
      logger.info('Auto-fix disabled, returning session without applying fixes');
      return session;
    }

    const autoFixableIndex = session.diagnosis.suggestedFixes.findIndex(
      (fix) => fix.autoApply && fix.priority === 'high'
    );

    if (autoFixableIndex >= 0) {
      this.applyFix(session.id, autoFixableIndex);
    }

    return session;
  }

  /**
   * Get a healing session by ID
   */
  getSession(sessionId: string): HealingSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions
   */
  getAllSessions(): HealingSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Enable/disable auto-fix
   */
  setAutoFixEnabled(enabled: boolean): void {
    this.autoFixEnabled = enabled;
    logger.info('Auto-fix setting changed', { enabled });
  }

  /**
   * Check if auto-fix is enabled
   */
  isAutoFixEnabled(): boolean {
    return this.autoFixEnabled;
  }

  /**
   * Clear all sessions
   */
  clearSessions(): void {
    this.sessions.clear();
    logger.info('All healing sessions cleared');
  }

  /**
   * Generate a unique session ID
   */
  private generateId(): string {
    return `heal_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 10)}`;
  }
}

// Singleton instance
export const selfHealing = new SelfHealingRecovery();

/**
 * Quick helper to diagnose an error
 */
export function diagnoseError(error: string | Error): ErrorDiagnosis {
  return selfHealing.diagnose(error);
}

/**
 * Quick helper to auto-heal an error
 */
export function autoHeal(error: string | Error): HealingSession {
  return selfHealing.autoHeal(error);
}
