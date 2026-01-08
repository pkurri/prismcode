/**
 * Debugging Memory & Pattern Database
 * Issue #239: Debugging Memory & Pattern Database
 *
 * Stores and retrieves debugging patterns for faster issue resolution
 */

import logger from '../utils/logger';

export interface DebugPattern {
  id: string;
  errorSignature: string;
  symptom: string;
  rootCause: string;
  solution: string;
  confidence: number;
  occurrences: number;
  lastSeen: Date;
  tags: string[];
  codeContext?: string;
}

export interface DebugSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  issueDescription: string;
  steps: DebugStep[];
  resolution?: string;
  patterns: string[];
}

export interface DebugStep {
  timestamp: Date;
  action: string;
  observation: string;
  hypothesis?: string;
}

export interface PatternMatch {
  pattern: DebugPattern;
  matchScore: number;
  suggestedFix: string;
}

/**
 * Debug Memory Manager
 * Stores debugging patterns and learns from past sessions
 */
export class DebugMemoryManager {
  private patterns: Map<string, DebugPattern> = new Map();
  private sessions: Map<string, DebugSession> = new Map();

  constructor() {
    this.initializeCommonPatterns();
    logger.info('DebugMemoryManager initialized');
  }

  private initializeCommonPatterns(): void {
    const commonPatterns: Omit<DebugPattern, 'id'>[] = [
      {
        errorSignature: 'Cannot read property .* of undefined',
        symptom: 'TypeError when accessing object property',
        rootCause: 'Variable is undefined when accessed',
        solution: 'Add null check or optional chaining (?.) before property access',
        confidence: 0.95,
        occurrences: 0,
        lastSeen: new Date(),
        tags: ['null-check', 'typescript', 'runtime'],
      },
      {
        errorSignature: 'Module not found',
        symptom: 'Import statement fails',
        rootCause: 'Module path is incorrect or package not installed',
        solution: 'Verify import path or run npm install',
        confidence: 0.9,
        occurrences: 0,
        lastSeen: new Date(),
        tags: ['import', 'module', 'dependency'],
      },
      {
        errorSignature: 'ECONNREFUSED',
        symptom: 'Network connection refused',
        rootCause: 'Target service not running or wrong port',
        solution: 'Start the target service or check port configuration',
        confidence: 0.85,
        occurrences: 0,
        lastSeen: new Date(),
        tags: ['network', 'connection', 'service'],
      },
      {
        errorSignature: 'Maximum call stack size exceeded',
        symptom: 'Stack overflow error',
        rootCause: 'Infinite recursion or deeply nested calls',
        solution: 'Check for circular dependencies or add base case to recursion',
        confidence: 0.92,
        occurrences: 0,
        lastSeen: new Date(),
        tags: ['recursion', 'stack', 'performance'],
      },
    ];

    for (const p of commonPatterns) {
      const id = `pattern_${Date.now().toString(16)}_${Math.random().toString(36).substr(2, 4)}`;
      this.patterns.set(id, { ...p, id });
    }
  }

  /**
   * Find matching patterns for an error
   */
  findMatches(errorMessage: string, context?: string): PatternMatch[] {
    const matches: PatternMatch[] = [];

    for (const pattern of this.patterns.values()) {
      const regex = new RegExp(pattern.errorSignature, 'i');
      if (regex.test(errorMessage)) {
        const matchScore = this.calculateMatchScore(pattern, errorMessage, context);
        matches.push({
          pattern,
          matchScore,
          suggestedFix: pattern.solution,
        });
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Record a new pattern
   */
  recordPattern(pattern: Omit<DebugPattern, 'id' | 'occurrences' | 'lastSeen'>): DebugPattern {
    const id = `pattern_${Date.now().toString(16)}`;
    const newPattern: DebugPattern = {
      ...pattern,
      id,
      occurrences: 1,
      lastSeen: new Date(),
    };

    this.patterns.set(id, newPattern);
    logger.info('Debug pattern recorded', { id, signature: pattern.errorSignature });
    return newPattern;
  }

  /**
   * Start a debug session
   */
  startSession(issueDescription: string): DebugSession {
    const session: DebugSession = {
      id: `session_${Date.now().toString(16)}`,
      startTime: new Date(),
      issueDescription,
      steps: [],
      patterns: [],
    };

    this.sessions.set(session.id, session);
    logger.info('Debug session started', { id: session.id });
    return session;
  }

  /**
   * Record a debug step
   */
  recordStep(sessionId: string, action: string, observation: string, hypothesis?: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.steps.push({
      timestamp: new Date(),
      action,
      observation,
      hypothesis,
    });
  }

  /**
   * End a debug session with resolution
   */
  endSession(sessionId: string, resolution: string, usedPatterns: string[]): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.endTime = new Date();
    session.resolution = resolution;
    session.patterns = usedPatterns;

    // Update pattern occurrences
    for (const patternId of usedPatterns) {
      const pattern = this.patterns.get(patternId);
      if (pattern) {
        pattern.occurrences++;
        pattern.lastSeen = new Date();
      }
    }

    logger.info('Debug session ended', {
      id: sessionId,
      duration: session.endTime.getTime() - session.startTime.getTime(),
    });
  }

  /**
   * Get all patterns
   */
  getPatterns(): DebugPattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * Get pattern statistics
   */
  getStats(): { totalPatterns: number; totalSessions: number; topPatterns: DebugPattern[] } {
    const patterns = Array.from(this.patterns.values());
    return {
      totalPatterns: patterns.length,
      totalSessions: this.sessions.size,
      topPatterns: patterns.sort((a, b) => b.occurrences - a.occurrences).slice(0, 5),
    };
  }

  private calculateMatchScore(pattern: DebugPattern, error: string, context?: string): number {
    let score = pattern.confidence;

    // Boost score based on occurrences
    score += Math.min(0.1, pattern.occurrences * 0.01);

    // Context matching
    if (context && pattern.codeContext) {
      if (context.includes(pattern.codeContext)) {
        score += 0.1;
      }
    }

    return Math.min(1, score);
  }
}

export const debugMemoryManager = new DebugMemoryManager();
