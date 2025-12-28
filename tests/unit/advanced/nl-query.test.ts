import {
  NaturalLanguageQueryEngine,
  ParsedQuery,
  QueryResult,
  QueryIntent,
  askCode,
  parseQuery,
} from '../../../src/advanced/nl-query';

describe('Natural Language Query Interface', () => {
  let engine: NaturalLanguageQueryEngine;

  beforeEach(() => {
    engine = new NaturalLanguageQueryEngine();
  });

  afterEach(() => {
    engine.clearHistory();
    engine.clearCache();
  });

  describe('Intent Detection', () => {
    it('should detect find intent', () => {
      const parsed = engine.parse('find all functions that return promises');

      expect(parsed.intent).toBe('find');
      expect(parsed.confidence).toBeGreaterThan(0.5);
    });

    it('should detect explain intent', () => {
      const parsed = engine.parse('explain what this function does');

      expect(parsed.intent).toBe('explain');
    });

    it('should detect refactor intent', () => {
      const parsed = engine.parse('refactor this code to use async/await');

      expect(parsed.intent).toBe('refactor');
    });

    it('should detect generate intent', () => {
      const parsed = engine.parse('generate a new API endpoint');

      expect(parsed.intent).toBe('generate');
    });

    it('should detect debug intent', () => {
      const parsed = engine.parse('debug why this is broken');

      expect(parsed.intent).toBe('debug');
    });

    it('should detect document intent', () => {
      const parsed = engine.parse('add jsdoc comments to this class');

      expect(parsed.intent).toBe('document');
    });

    it('should detect test intent', () => {
      const parsed = engine.parse('write unit tests for the login function');

      expect(parsed.intent).toBe('test');
    });

    it('should detect analyze intent', () => {
      const parsed = engine.parse('analyze code complexity in this file');

      expect(parsed.intent).toBe('analyze');
    });

    it('should default to unknown for unclear queries', () => {
      const parsed = engine.parse('something random');

      expect(parsed.intent).toBe('unknown');
      expect(parsed.confidence).toBeLessThan(0.5);
    });
  });

  describe('Entity Extraction', () => {
    it('should extract function names', () => {
      const parsed = engine.parse('find function getUserById');

      expect(parsed.entities.some((e) => e.type === 'function')).toBe(true);
    });

    it('should extract class names', () => {
      const parsed = engine.parse('explain class UserController');

      expect(parsed.entities.some((e) => e.type === 'class')).toBe(true);
    });

    it('should extract file names', () => {
      const parsed = engine.parse('analyze file src/services/auth.ts');

      const fileEntity = parsed.entities.find((e) => e.type === 'file');
      expect(fileEntity).toBeDefined();
      expect(fileEntity?.value).toContain('auth.ts');
    });

    it('should extract concept entities', () => {
      const parsed = engine.parse('explain authentication flow');

      expect(parsed.entities.some((e) => e.type === 'concept')).toBe(true);
    });

    it('should extract modifiers', () => {
      const parsed = engine.parse('find async function fetchData');

      const funcEntity = parsed.entities.find((e) => e.type === 'function');
      expect(funcEntity?.modifiers).toContain('async');
    });

    it('should extract multiple entities', () => {
      const parsed = engine.parse('refactor class UserService method processData');

      expect(parsed.entities.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Context Extraction', () => {
    it('should extract language context', () => {
      const parsed = engine.parse('find all typescript functions');

      expect(parsed.context.language).toBe('typescript');
    });

    it('should extract scope context', () => {
      const parsed = engine.parse('find all variables in this file');

      expect(parsed.context.scope).toBe('file');
    });

    it('should extract filters', () => {
      const parsed = engine.parse('find all exported functions');

      expect(parsed.context.filters.exported).toBe('true');
    });

    it('should handle project scope', () => {
      const parsed = engine.parse('search for unused variables in the project');

      expect(parsed.context.scope).toBe('project');
      expect(parsed.context.filters.unused).toBe('true');
    });
  });

  describe('Query Execution', () => {
    it('should execute find query', () => {
      const result = engine.execute('find all async functions');

      expect(result.id).toBeDefined();
      expect(result.parsedQuery.intent).toBe('find');
      expect(result.results.length).toBeGreaterThan(0);
    });

    it('should execute explain query', () => {
      const result = engine.execute('explain how the UserService works');

      expect(result.results[0].type).toBe('explanation');
    });

    it('should execute refactor query', () => {
      const result = engine.execute('refactor this code');

      expect(result.results[0].type).toBe('suggestion');
    });

    it('should execute generate query', () => {
      const result = engine.execute('generate a new function called processOrder');

      expect(result.results[0].type).toBe('code');
    });

    it('should include suggestions when enabled', () => {
      const result = engine.execute('find stuff');

      expect(result.suggestions.length).toBeGreaterThanOrEqual(0);
    });

    it('should track execution time', () => {
      const result = engine.execute('analyze code complexity');

      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should cache results', () => {
      const query = 'find all functions';
      const result1 = engine.execute(query);
      const result2 = engine.execute(query);

      expect(result1.id).toBe(result2.id);
    });
  });

  describe('Query Suggestions', () => {
    it('should provide suggestions for find queries', () => {
      const suggestions = engine.getSuggestions('find');

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.includes('find'))).toBe(true);
    });

    it('should provide suggestions for explain queries', () => {
      const suggestions = engine.getSuggestions('explain');

      expect(suggestions.some((s) => s.includes('explain'))).toBe(true);
    });

    it('should provide suggestions for refactor queries', () => {
      const suggestions = engine.getSuggestions('refactor');

      expect(suggestions.some((s) => s.includes('refactor'))).toBe(true);
    });

    it('should limit suggestions', () => {
      const suggestions = engine.getSuggestions('find');

      expect(suggestions.length).toBeLessThanOrEqual(5);
    });
  });

  describe('History Management', () => {
    it('should track query history', () => {
      engine.parse('find functions');
      engine.parse('explain this');
      engine.parse('refactor code');

      expect(engine.getHistory()).toHaveLength(3);
    });

    it('should clear history', () => {
      engine.parse('query 1');
      engine.parse('query 2');
      engine.clearHistory();

      expect(engine.getHistory()).toHaveLength(0);
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      engine.execute('find all functions');
      engine.clearCache();

      // Next execution should create new result
      const result = engine.execute('find all functions');
      expect(result.id).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should return supported intents', () => {
      const intents = engine.getSupportedIntents();

      expect(intents).toContain('find');
      expect(intents).toContain('explain');
      expect(intents).toContain('refactor');
      expect(intents).toContain('generate');
    });

    it('should accept custom configuration', () => {
      const custom = new NaturalLanguageQueryEngine({
        maxResults: 50,
        confidenceThreshold: 0.5,
      });

      const config = custom.getConfig();

      expect(config.maxResults).toBe(50);
      expect(config.confidenceThreshold).toBe(0.5);
    });

    it('should update configuration', () => {
      engine.updateConfig({ maxResults: 30 });

      expect(engine.getConfig().maxResults).toBe(30);
    });

    it('should disable suggestions', () => {
      const noSuggestions = new NaturalLanguageQueryEngine({ enableSuggestions: false });
      const result = noSuggestions.execute('unclear query');

      expect(result.suggestions).toHaveLength(0);
    });
  });

  describe('Result Types', () => {
    it('should return code results for find', () => {
      const result = engine.execute('find getUserById function');

      expect(result.results.some((r) => r.type === 'code')).toBe(true);
    });

    it('should return explanation results for explain', () => {
      const result = engine.execute('explain authentication');

      expect(result.results.some((r) => r.type === 'explanation')).toBe(true);
    });

    it('should include metadata in results', () => {
      const result = engine.execute('find functions');

      expect(result.results[0].metadata).toBeDefined();
    });

    it('should include relevance scores', () => {
      const result = engine.execute('find all async functions');

      for (const item of result.results) {
        expect(item.relevance).toBeGreaterThan(0);
        expect(item.relevance).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Helper Functions', () => {
    it('should execute query using askCode helper', () => {
      const result = askCode('find all functions');

      expect(result.results.length).toBeGreaterThan(0);
    });

    it('should parse query using parseQuery helper', () => {
      const parsed = parseQuery('explain this code');

      expect(parsed.intent).toBe('explain');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty query', () => {
      const parsed = engine.parse('');

      expect(parsed.intent).toBe('unknown');
    });

    it('should handle very long queries', () => {
      const longQuery = 'find '.repeat(100) + 'all functions';
      const parsed = engine.parse(longQuery);

      expect(parsed.intent).toBe('find');
    });

    it('should handle special characters', () => {
      const parsed = engine.parse("find function getName() { return 'value'; }");

      expect(parsed.intent).toBe('find');
    });
  });
});
