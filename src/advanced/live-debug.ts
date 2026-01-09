/**
 * Live Debug Assistant
 * Issue #240: Live Debug Assistant - VS Code Extension
 *
 * Real-time debugging assistance with AI-powered suggestions
 */

import logger from '../utils/logger';

export interface DebugContext {
  file: string;
  line: number;
  code: string;
  stackTrace?: string;
  variables: Record<string, unknown>;
  breakpoints: number[];
}

export interface DebugSuggestion {
  id: string;
  type: SuggestionType;
  message: string;
  action: string;
  confidence: number;
  codeSnippet?: string;
}

export type SuggestionType =
  | 'fix'
  | 'inspect'
  | 'watch'
  | 'conditional-breakpoint'
  | 'step-suggestion'
  | 'variable-insight';

export interface WatchExpression {
  expression: string;
  value: unknown;
  type: string;
  changed: boolean;
}

export interface DebugSession {
  id: string;
  startTime: Date;
  context: DebugContext;
  suggestions: DebugSuggestion[];
  watches: WatchExpression[];
  isActive: boolean;
}

/**
 * Live Debug Assistant
 * Provides real-time debugging assistance
 */
export class LiveDebugAssistant {
  private sessions: Map<string, DebugSession> = new Map();
  private activeSession: string | null = null;

  constructor() {
    logger.info('LiveDebugAssistant initialized');
  }

  /**
   * Start a debug session
   */
  startSession(context: DebugContext): DebugSession {
    const session: DebugSession = {
      id: `debug_${Date.now().toString(16)}`,
      startTime: new Date(),
      context,
      suggestions: [],
      watches: [],
      isActive: true,
    };

    this.sessions.set(session.id, session);
    this.activeSession = session.id;

    // Generate initial suggestions
    session.suggestions = this.analyzeProblem(context);

    logger.info('Debug session started', { id: session.id });
    return session;
  }

  /**
   * Update debug context
   */
  updateContext(sessionId: string, context: Partial<DebugContext>): DebugSuggestion[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    session.context = { ...session.context, ...context };
    session.suggestions = this.analyzeProblem(session.context);

    return session.suggestions;
  }

  /**
   * Add watch expression
   */
  addWatch(sessionId: string, expression: string): WatchExpression {
    const session = this.sessions.get(sessionId);
    const watch: WatchExpression = {
      expression,
      value: this.evaluateExpression(expression, session?.context.variables || {}),
      type: 'unknown',
      changed: false,
    };

    if (session) {
      session.watches.push(watch);
    }

    return watch;
  }

  /**
   * Get suggestions for current context
   */
  getSuggestions(sessionId: string): DebugSuggestion[] {
    const session = this.sessions.get(sessionId);
    return session?.suggestions || [];
  }

  /**
   * End debug session
   */
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      if (this.activeSession === sessionId) {
        this.activeSession = null;
      }
      logger.info('Debug session ended', { id: sessionId });
    }
  }

  /**
   * Analyze problem and generate suggestions
   */
  private analyzeProblem(context: DebugContext): DebugSuggestion[] {
    const suggestions: DebugSuggestion[] = [];

    // Check for null/undefined in variables
    for (const [name, value] of Object.entries(context.variables)) {
      if (value === null || value === undefined) {
        suggestions.push({
          id: `sug_${Date.now().toString(16)}_1`,
          type: 'variable-insight',
          message: `Variable '${name}' is ${value === null ? 'null' : 'undefined'}`,
          action: `Add null check before using '${name}'`,
          confidence: 0.9,
        });
      }
    }

    // Analyze stack trace
    if (context.stackTrace) {
      if (context.stackTrace.includes('TypeError')) {
        suggestions.push({
          id: `sug_${Date.now().toString(16)}_2`,
          type: 'fix',
          message: 'TypeError detected - likely null/undefined access',
          action: 'Add optional chaining or null check',
          confidence: 0.85,
          codeSnippet: 'object?.property ?? defaultValue',
        });
      }
    }

    // Suggest breakpoints based on code
    if (context.code.includes('if') || context.code.includes('for')) {
      suggestions.push({
        id: `sug_${Date.now().toString(16)}_3`,
        type: 'conditional-breakpoint',
        message: 'Consider adding conditional breakpoint',
        action: 'Set breakpoint with condition to catch specific case',
        confidence: 0.7,
      });
    }

    return suggestions;
  }

  private evaluateExpression(expression: string, variables: Record<string, unknown>): unknown {
    // Simple expression evaluation
    if (expression in variables) {
      return variables[expression];
    }
    return undefined;
  }

  getActiveSession(): DebugSession | null {
    if (!this.activeSession) return null;
    return this.sessions.get(this.activeSession) || null;
  }
}

export const liveDebugAssistant = new LiveDebugAssistant();
