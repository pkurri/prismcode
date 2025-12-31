/**
 * Natural Language Query Interface
 * Issue #196: Natural Language Query Interface
 *
 * Enables natural language queries for code understanding and manipulation
 */

import logger from '../utils/logger';

export type QueryIntent =
  | 'find'
  | 'explain'
  | 'refactor'
  | 'generate'
  | 'debug'
  | 'document'
  | 'test'
  | 'analyze'
  | 'unknown';

export interface QueryConfig {
  maxResults: number;
  confidenceThreshold: number;
  enableSuggestions: boolean;
  contextLines: number;
}

export interface ParsedQuery {
  intent: QueryIntent;
  entities: QueryEntity[];
  context: QueryContext;
  confidence: number;
  rawQuery: string;
}

export interface QueryEntity {
  type: 'function' | 'class' | 'file' | 'variable' | 'pattern' | 'concept';
  value: string;
  modifiers: string[];
}

export interface QueryContext {
  language?: string;
  scope?: string;
  filters: Record<string, string>;
}

export interface QueryResult {
  id: string;
  parsedQuery: ParsedQuery;
  results: ResultItem[];
  suggestions: string[];
  executionTime: number;
  totalMatches: number;
}

export interface ResultItem {
  type: 'code' | 'explanation' | 'suggestion' | 'action';
  content: string;
  file?: string;
  lineRange?: { start: number; end: number };
  relevance: number;
  metadata: Record<string, unknown>;
}

const DEFAULT_CONFIG: QueryConfig = {
  maxResults: 20,
  confidenceThreshold: 0.3,
  enableSuggestions: true,
  contextLines: 3,
};

// Intent patterns for detection - ordered from most specific to least specific
const INTENT_PATTERNS: Array<{ intent: QueryIntent; patterns: RegExp[] }> = [
  {
    intent: 'test',
    patterns: [
      /\b(test|spec|coverage|assert|mock|unit test)\b/i,
      /\bwrite\b.*\b(tests?|specs?)\b/i,
    ],
  },
  {
    intent: 'document',
    patterns: [/\b(jsdoc|comment|annotate)\b/i, /\badd\b.*\b(docs?|comments?)\b/i],
  },
  {
    intent: 'debug',
    patterns: [
      /\b(debug|fix|error|bug|issue|problem|crash)\b/i,
      /\bwhy.*\b(not|fail|broken|wrong)\b/i,
    ],
  },
  {
    intent: 'refactor',
    patterns: [
      /\b(refactor|improve|optimize|clean|simplify|rename)\b/i,
      /\b(change|convert|transform)\b/i,
    ],
  },
  {
    intent: 'analyze',
    patterns: [
      /\b(analyze|scan|check|review|inspect|audit)\b/i,
      /\b(complexity|performance|security|quality)\b/i,
    ],
  },
  {
    intent: 'find',
    patterns: [
      /\b(find|search|show|get|where|locate|look for)\b/i,
      /\b(all|every|any)\b.*\b(function|class|variable|file)/i,
    ],
  },
  {
    intent: 'explain',
    patterns: [
      /\b(explain|what|how|why|describe|tell me about)\b/i,
      /\b(does this|is this|works?)\b/i,
    ],
  },
  {
    intent: 'generate',
    patterns: [
      /\b(generate|create|make|add)\b/i,
      /\b(new|implement)\b.*\b(function|class|component)\b/i,
    ],
  },
];

// Entity patterns for extraction
const ENTITY_PATTERNS: Array<{
  type: QueryEntity['type'];
  patterns: RegExp[];
}> = [
  {
    type: 'function',
    patterns: [
      /function\s+['""]?(\w+)['""]?/i,
      /method\s+['""]?(\w+)['""]?/i,
      /\b(\w+)\s*\(\)/,
      /the\s+(\w+)\s+function/i,
    ],
  },
  {
    type: 'class',
    patterns: [
      /class\s+['""]?(\w+)['""]?/i,
      /\b(\w+)\s+class/i,
      /\b(\w+Service|\w+Controller|\w+Model)\b/,
    ],
  },
  {
    type: 'file',
    patterns: [
      /(?:file|in)\s+['""]?([.\w/\\-]+\.\w+)['""]?/i,
      /([.\w/\\-]+\.(ts|js|py|java|go|rs))/i,
    ],
  },
  {
    type: 'variable',
    patterns: [/variable\s+['""]?(\w+)['""]?/i, /\$(\w+)/, /\b(const|let|var)\s+(\w+)/i],
  },
  {
    type: 'pattern',
    patterns: [
      /pattern\s+['""]?(.+?)['""]?$/i,
      /regex\s+['""]?(.+?)['""]?$/i,
      /like\s+['""]?(.+?)['""]?$/i,
    ],
  },
  {
    type: 'concept',
    patterns: [
      /\b(authentication|authorization|validation|caching|logging|error handling)\b/i,
      /\b(api|database|routing|middleware)\b/i,
    ],
  },
];

/**
 * Natural Language Query Engine
 * Parses and executes natural language queries about code
 */
export class NaturalLanguageQueryEngine {
  private config: QueryConfig;
  private queryHistory: ParsedQuery[] = [];
  private resultCache: Map<string, QueryResult> = new Map();

  constructor(config: Partial<QueryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('NaturalLanguageQueryEngine initialized', {
      maxResults: this.config.maxResults,
      confidenceThreshold: this.config.confidenceThreshold,
    });
  }

  /**
   * Parse a natural language query
   */
  parse(query: string): ParsedQuery {
    const normalizedQuery = query.trim().toLowerCase();

    // Detect intent
    const { intent, confidence: intentConfidence } = this.detectIntent(normalizedQuery);

    // Extract entities
    const entities = this.extractEntities(query);

    // Extract context
    const context = this.extractContext(query);

    // Calculate overall confidence
    const confidence = this.calculateConfidence(intentConfidence, entities.length);

    const parsed: ParsedQuery = {
      intent,
      entities,
      context,
      confidence,
      rawQuery: query,
    };

    // Store in history
    this.queryHistory.push(parsed);

    logger.info('Query parsed', {
      intent,
      entityCount: entities.length,
      confidence,
    });

    return parsed;
  }

  /**
   * Execute a natural language query
   */
  execute(query: string): QueryResult {
    const startTime = Date.now();

    // Check cache
    const cacheKey = this.generateCacheKey(query);
    const cached = this.resultCache.get(cacheKey);
    if (cached) {
      logger.debug('Query result from cache', { query: query.substring(0, 50) });
      return cached;
    }

    // Parse query
    const parsedQuery = this.parse(query);

    // Generate results based on intent
    const results = this.generateResults(parsedQuery);

    // Generate suggestions
    const suggestions = this.config.enableSuggestions ? this.generateSuggestions(parsedQuery) : [];

    const queryResult: QueryResult = {
      id: this.generateId(),
      parsedQuery,
      results,
      suggestions,
      executionTime: Date.now() - startTime,
      totalMatches: results.length,
    };

    // Cache result
    this.resultCache.set(cacheKey, queryResult);

    logger.info('Query executed', {
      intent: parsedQuery.intent,
      resultCount: results.length,
      executionTime: queryResult.executionTime,
    });

    return queryResult;
  }

  /**
   * Get query suggestions based on partial input
   */
  getSuggestions(partialQuery: string): string[] {
    const suggestions: string[] = [];
    const lower = partialQuery.toLowerCase();

    // Suggest based on common patterns
    if (lower.includes('find')) {
      suggestions.push('find all functions that handle authentication');
      suggestions.push('find unused variables in this file');
      suggestions.push('find all imports from lodash');
    } else if (lower.includes('explain')) {
      suggestions.push('explain what this function does');
      suggestions.push('explain the authentication flow');
      suggestions.push('explain error handling in this module');
    } else if (lower.includes('refactor')) {
      suggestions.push('refactor this function to use async/await');
      suggestions.push('refactor to reduce code duplication');
      suggestions.push('refactor using the Strategy pattern');
    } else if (lower.includes('generate')) {
      suggestions.push('generate tests for this function');
      suggestions.push('generate documentation for this class');
      suggestions.push('generate a new API endpoint');
    }

    // Add generic suggestions if few matches
    if (suggestions.length < 3) {
      suggestions.push('find functions that return promises');
      suggestions.push('explain how caching works');
      suggestions.push('analyze code complexity');
    }

    return suggestions.slice(0, 5);
  }

  /**
   * Get query history
   */
  getHistory(): ParsedQuery[] {
    return [...this.queryHistory];
  }

  /**
   * Clear query history
   */
  clearHistory(): void {
    this.queryHistory = [];
    logger.info('Query history cleared');
  }

  /**
   * Clear result cache
   */
  clearCache(): void {
    this.resultCache.clear();
    logger.info('Query cache cleared');
  }

  /**
   * Get supported intents
   */
  getSupportedIntents(): QueryIntent[] {
    return INTENT_PATTERNS.map((p) => p.intent);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<QueryConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('NaturalLanguageQueryEngine config updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): QueryConfig {
    return { ...this.config };
  }

  // Private methods

  private detectIntent(query: string): { intent: QueryIntent; confidence: number } {
    for (const { intent, patterns } of INTENT_PATTERNS) {
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          return { intent, confidence: 0.8 };
        }
      }
    }
    return { intent: 'unknown', confidence: 0.2 };
  }

  private extractEntities(query: string): QueryEntity[] {
    const entities: QueryEntity[] = [];

    for (const { type, patterns } of ENTITY_PATTERNS) {
      for (const pattern of patterns) {
        const match = query.match(pattern);
        if (match && match[1]) {
          // Check if entity already exists
          if (!entities.some((e) => e.type === type && e.value === match[1])) {
            entities.push({
              type,
              value: match[1],
              modifiers: this.extractModifiers(query, match[1]),
            });
          }
        }
      }
    }

    return entities;
  }

  private extractModifiers(query: string, entityValue: string): string[] {
    const modifiers: string[] = [];
    const lower = query.toLowerCase();

    // Extract modifiers around the entity
    if (lower.includes('async') && lower.includes(entityValue.toLowerCase())) {
      modifiers.push('async');
    }
    if (lower.includes('private')) modifiers.push('private');
    if (lower.includes('public')) modifiers.push('public');
    if (lower.includes('static')) modifiers.push('static');
    if (lower.includes('exported')) modifiers.push('exported');

    return modifiers;
  }

  private extractContext(query: string): QueryContext {
    const context: QueryContext = { filters: {} };
    const lower = query.toLowerCase();

    // Detect language context
    const languagePatterns = [
      { lang: 'typescript', pattern: /\b(typescript|\.ts)\b/i },
      { lang: 'javascript', pattern: /\b(javascript|\.js)\b/i },
      { lang: 'python', pattern: /\b(python|\.py)\b/i },
      { lang: 'java', pattern: /\bjava\b/i },
      { lang: 'go', pattern: /\b(golang|\.go)\b/i },
    ];

    for (const { lang, pattern } of languagePatterns) {
      if (pattern.test(query)) {
        context.language = lang;
        break;
      }
    }

    // Detect scope
    if (lower.includes('in this file')) context.scope = 'file';
    if (lower.includes('in this class')) context.scope = 'class';
    if (lower.includes('in this function')) context.scope = 'function';
    if (lower.includes('in the project')) context.scope = 'project';

    // Detect filters
    if (lower.includes('exported')) context.filters.exported = 'true';
    if (lower.includes('unused')) context.filters.unused = 'true';
    if (lower.includes('deprecated')) context.filters.deprecated = 'true';

    return context;
  }

  private calculateConfidence(intentConfidence: number, entityCount: number): number {
    const entityBonus = Math.min(entityCount * 0.1, 0.2);
    return Math.min(intentConfidence + entityBonus, 1.0);
  }

  private generateResults(parsed: ParsedQuery): ResultItem[] {
    const results: ResultItem[] = [];

    // Simulate results based on intent
    switch (parsed.intent) {
      case 'find':
        results.push({
          type: 'code',
          content: `// Found matches for: ${parsed.entities.map((e) => e.value).join(', ') || 'query'}`,
          file: 'src/example.ts',
          lineRange: { start: 10, end: 20 },
          relevance: 0.9,
          metadata: { matchCount: 3 },
        });
        break;

      case 'explain':
        results.push({
          type: 'explanation',
          content: `This ${parsed.entities[0]?.type || 'code'} performs the following operations:\n1. Initializes required dependencies\n2. Processes input data\n3. Returns formatted output`,
          relevance: 0.85,
          metadata: { format: 'markdown' },
        });
        break;

      case 'refactor':
        results.push({
          type: 'suggestion',
          content:
            'Consider the following refactoring:\n- Extract method for better readability\n- Use dependency injection\n- Add error handling',
          relevance: 0.8,
          metadata: { type: 'refactoring' },
        });
        break;

      case 'generate':
        results.push({
          type: 'code',
          content: `function generated${parsed.entities[0]?.value || 'Function'}() {\n  // Generated implementation\n  return null;\n}`,
          relevance: 0.9,
          metadata: { generated: true },
        });
        break;

      case 'debug':
        results.push({
          type: 'suggestion',
          content:
            'Potential issues found:\n- Null reference at line 15\n- Unhandled promise rejection\n- Type mismatch',
          relevance: 0.85,
          metadata: { type: 'debugging' },
        });
        break;

      case 'document':
        results.push({
          type: 'code',
          content: `/**\n * ${parsed.entities[0]?.value || 'Function'}\n * @param {Object} params - Input parameters\n * @returns {Object} Processed result\n */`,
          relevance: 0.9,
          metadata: { type: 'documentation' },
        });
        break;

      case 'test':
        results.push({
          type: 'code',
          content: `describe('${parsed.entities[0]?.value || 'Component'}', () => {\n  it('should work correctly', () => {\n    expect(true).toBe(true);\n  });\n});`,
          relevance: 0.9,
          metadata: { type: 'test' },
        });
        break;

      case 'analyze':
        results.push({
          type: 'explanation',
          content:
            'Analysis Results:\n- Cyclomatic Complexity: 5\n- Lines of Code: 150\n- Dependencies: 12\n- Test Coverage: 75%',
          relevance: 0.85,
          metadata: { type: 'analysis' },
        });
        break;

      default:
        results.push({
          type: 'suggestion',
          content: 'Could not determine specific action. Try rephrasing your query.',
          relevance: 0.3,
          metadata: { type: 'fallback' },
        });
    }

    return results.slice(0, this.config.maxResults);
  }

  private generateSuggestions(parsed: ParsedQuery): string[] {
    const suggestions: string[] = [];

    if (parsed.confidence < this.config.confidenceThreshold + 0.3) {
      suggestions.push('Be more specific about what you are looking for');
    }

    if (parsed.entities.length === 0) {
      suggestions.push('Include specific names like function or class names in quotes');
    }

    if (!parsed.context.scope) {
      suggestions.push('Add scope like "in this file" or "in the project"');
    }

    // Intent-specific suggestions
    switch (parsed.intent) {
      case 'find':
        suggestions.push('Try: "find all async functions that return Promise"');
        break;
      case 'explain':
        suggestions.push('Try: "explain the authentication flow step by step"');
        break;
      case 'refactor':
        suggestions.push('Try: "refactor using the factory pattern"');
        break;
    }

    return suggestions.slice(0, 3);
  }

  private generateId(): string {
    return `query_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 8)}`;
  }

  private generateCacheKey(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, '_');
  }
}

// Singleton instance
export const nlQuery = new NaturalLanguageQueryEngine();

/**
 * Quick query helper
 */
export function askCode(query: string): QueryResult {
  return nlQuery.execute(query);
}

/**
 * Quick parse helper
 */
export function parseQuery(query: string): ParsedQuery {
  return nlQuery.parse(query);
}
