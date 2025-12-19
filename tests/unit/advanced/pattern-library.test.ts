/**
 * Pattern Library Tests
 * Tests for Issue #123
 */

import { PatternLibrary } from '../../../src/advanced/pattern-library';

describe('PatternLibrary', () => {
  let library: PatternLibrary;

  beforeEach(() => {
    library = new PatternLibrary();
    library.reset();
  });

  describe('createPattern', () => {
    it('should create a pattern', () => {
      const pattern = library.createPattern({
        name: 'React Component',
        description: 'Basic React component',
        category: 'components',
        language: 'typescript',
        template: 'export const {{name}} = () => { return <div>{{name}}</div>; }',
        variables: [
          {
            name: 'name',
            description: 'Component name',
            defaultValue: 'MyComponent',
            required: true,
          },
        ],
        tags: ['react', 'component'],
      });

      expect(pattern.id).toBeDefined();
      expect(pattern.usageCount).toBe(0);
    });
  });

  describe('listPatterns', () => {
    it('should list all patterns', () => {
      library.createPattern({
        name: 'P1',
        description: 'D1',
        category: 'components',
        language: 'ts',
        template: '',
        variables: [],
        tags: [],
      });
      library.createPattern({
        name: 'P2',
        description: 'D2',
        category: 'hooks',
        language: 'ts',
        template: '',
        variables: [],
        tags: [],
      });

      expect(library.listPatterns().length).toBe(2);
    });

    it('should filter by category', () => {
      library.createPattern({
        name: 'P1',
        description: 'D1',
        category: 'components',
        language: 'ts',
        template: '',
        variables: [],
        tags: [],
      });
      library.createPattern({
        name: 'P2',
        description: 'D2',
        category: 'hooks',
        language: 'ts',
        template: '',
        variables: [],
        tags: [],
      });

      expect(library.listPatterns('hooks').length).toBe(1);
    });
  });

  describe('applyPattern', () => {
    it('should apply variables to pattern', () => {
      const pattern = library.createPattern({
        name: 'Component',
        description: 'Test',
        category: 'components',
        language: 'ts',
        template: 'const {{name}} = "{{value}}";',
        variables: [],
        tags: [],
      });

      const result = library.applyPattern(pattern.id, { name: 'foo', value: 'bar' });
      expect(result).toBe('const foo = "bar";');
    });

    it('should increment usage count', () => {
      const pattern = library.createPattern({
        name: 'P',
        description: 'D',
        category: 'c',
        language: 'ts',
        template: '',
        variables: [],
        tags: [],
      });

      library.applyPattern(pattern.id, {});
      library.applyPattern(pattern.id, {});

      expect(library.getPattern(pattern.id)!.usageCount).toBe(2);
    });
  });

  describe('searchPatterns', () => {
    it('should search by name', () => {
      library.createPattern({
        name: 'React Hook',
        description: '',
        category: 'hooks',
        language: 'ts',
        template: '',
        variables: [],
        tags: [],
      });

      const results = library.searchPatterns('react');
      expect(results.length).toBe(1);
    });
  });

  describe('getCategories', () => {
    it('should return categories', () => {
      const categories = library.getCategories();
      expect(categories.length).toBeGreaterThan(0);
    });
  });
});
