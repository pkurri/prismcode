/**
 * Code Complexity Analyzer Tests
 * Issue #212
 */

import { CodeComplexityAnalyzer } from '../../../src/advanced/code-complexity';

describe('CodeComplexityAnalyzer', () => {
  let analyzer: CodeComplexityAnalyzer;

  beforeEach(() => {
    analyzer = new CodeComplexityAnalyzer();
  });

  afterEach(() => {
    analyzer.clearCache();
  });

  describe('cyclomatic complexity', () => {
    it('should calculate complexity of simple function', () => {
      const source = `
        function add(a, b) {
          return a + b;
        }
      `;
      const metrics = analyzer.analyzeCode(source, '/test/simple.ts', 'add');
      expect(metrics.cyclomaticComplexity).toBe(1);
    });

    it('should count if statements', () => {
      const source = `
        function check(x) {
          if (x > 0) {
            return 'positive';
          } else if (x < 0) {
            return 'negative';
          }
          return 'zero';
        }
      `;
      const metrics = analyzer.analyzeCode(source, '/test/if.ts', 'check');
      expect(metrics.cyclomaticComplexity).toBeGreaterThan(1);
    });

    it('should count loops', () => {
      const source = `
        function loop(arr) {
          for (let i = 0; i < arr.length; i++) {
            while (arr[i] > 0) {
              arr[i]--;
            }
          }
        }
      `;
      const metrics = analyzer.analyzeCode(source, '/test/loop.ts', 'loop');
      expect(metrics.cyclomaticComplexity).toBeGreaterThan(2);
    });

    it('should count logical operators', () => {
      const source = `
        function validate(x, y, z) {
          return x > 0 && y > 0 || z === 0;
        }
      `;
      const metrics = analyzer.analyzeCode(source, '/test/logical.ts', 'validate');
      expect(metrics.cyclomaticComplexity).toBeGreaterThan(1);
    });

    it('should count ternary operators', () => {
      const source = `
        const result = x > 0 ? 'yes' : 'no';
      `;
      const metrics = analyzer.analyzeCode(source, '/test/ternary.ts');
      expect(metrics.cyclomaticComplexity).toBe(2);
    });
  });

  describe('cognitive complexity', () => {
    it('should calculate cognitive complexity with nesting penalty', () => {
      const shallowSource = `
        function shallow(x) {
          if (x > 0) return true;
          return false;
        }
      `;
      const deepSource = `
        function deep(x) {
          if (x > 0) {
            if (x > 10) {
              if (x > 100) {
                return 'big';
              }
            }
          }
        }
      `;

      const shallowMetrics = analyzer.analyzeCode(shallowSource, '/test/shallow.ts', 'shallow');
      const deepMetrics = analyzer.analyzeCode(deepSource, '/test/deep.ts', 'deep');

      expect(deepMetrics.cognitiveComplexity).toBeGreaterThan(shallowMetrics.cognitiveComplexity);
    });
  });

  describe('lines of code', () => {
    it('should count total lines', () => {
      const source = `line1
        line2
        line3
        line4
        line5`;
      const metrics = analyzer.analyzeCode(source, '/test/lines.ts');
      expect(metrics.linesOfCode).toBe(5);
    });

    it('should count logical lines (non-empty, non-comment)', () => {
      const source = `
        // Comment
        const x = 1;

        /* Block comment */
        const y = 2;
      `;
      const metrics = analyzer.analyzeCode(source, '/test/logical.ts');
      expect(metrics.logicalLines).toBeLessThan(metrics.linesOfCode);
    });

    it('should count comment lines', () => {
      const source = `
        // Single line comment
        const x = 1;
        /* Multi
         * line
         * comment */
        const y = 2;
      `;
      const metrics = analyzer.analyzeCode(source, '/test/comments.ts');
      expect(metrics.commentLines).toBeGreaterThan(0);
    });
  });

  describe('Halstead metrics', () => {
    it('should calculate Halstead metrics', () => {
      const source = `
        const sum = a + b;
        const product = a * b;
      `;
      const metrics = analyzer.analyzeCode(source, '/test/halstead.ts');

      expect(metrics.halsteadMetrics.operators).toBeGreaterThan(0);
      expect(metrics.halsteadMetrics.operands).toBeGreaterThan(0);
      expect(metrics.halsteadMetrics.volume).toBeGreaterThan(0);
      expect(metrics.halsteadMetrics.difficulty).toBeGreaterThanOrEqual(0);
    });
  });

  describe('maintainability index', () => {
    it('should calculate maintainability index between 0-100', () => {
      const source = `
        function simple(x) {
          return x * 2;
        }
      `;
      const metrics = analyzer.analyzeCode(source, '/test/maintainable.ts', 'simple');

      expect(metrics.maintainabilityIndex).toBeGreaterThanOrEqual(0);
      expect(metrics.maintainabilityIndex).toBeLessThanOrEqual(100);
    });
  });

  describe('coupling analysis', () => {
    it('should analyze coupling', () => {
      const analysis = analyzer.analyzeCoupling(
        '/src/module.ts',
        ['./utils', './helpers', 'lodash'],
        ['./consumer1', './consumer2']
      );

      expect(analysis.efferentCoupling).toBe(3);
      expect(analysis.afferentCoupling).toBe(2);
      expect(analysis.instability).toBeCloseTo(0.6, 1);
    });

    it('should calculate instability correctly', () => {
      // High instability (many dependencies, few dependents)
      const unstable = analyzer.analyzeCoupling('/unstable.ts', ['a', 'b', 'c', 'd'], []);
      expect(unstable.instability).toBe(1);

      // Low instability (few dependencies, many dependents)
      const stable = analyzer.analyzeCoupling('/stable.ts', [], ['a', 'b', 'c']);
      expect(stable.instability).toBe(0);
    });
  });

  describe('hotspot identification', () => {
    it('should identify hotspots', () => {
      const files = [
        {
          path: '/src/complex.ts',
          complexity: 50,
          changeCount: 30,
          lastModified: new Date(),
          contributors: ['dev1', 'dev2'],
        },
        {
          path: '/src/simple.ts',
          complexity: 5,
          changeCount: 2,
          lastModified: new Date(),
          contributors: ['dev1'],
        },
      ];

      const hotspots = analyzer.identifyHotspots(files);

      expect(hotspots.length).toBe(2);
      expect(hotspots[0].filePath).toBe('/src/complex.ts');
      expect(hotspots[0].hotspotScore).toBeGreaterThan(hotspots[1].hotspotScore);
    });

    it('should generate recommendations for hotspots', () => {
      const files = [
        {
          path: '/src/complex.ts',
          complexity: 50,
          changeCount: 30,
          lastModified: new Date(),
          contributors: ['dev1'],
        },
      ];

      const hotspots = analyzer.identifyHotspots(files);

      expect(hotspots[0].recommendations.length).toBeGreaterThan(0);
      expect(hotspots[0].recommendations.some((r) => r.includes('complexity'))).toBe(true);
    });
  });

  describe('trend tracking', () => {
    it('should record trend data points', () => {
      analyzer.recordTrendDataPoint('cyclomatic', 10, '/src/file.ts');
      analyzer.recordTrendDataPoint('cyclomatic', 12, '/src/file.ts');
      analyzer.recordTrendDataPoint('cyclomatic', 15, '/src/file.ts');

      const trends = analyzer.getTrends('/src/file.ts');
      expect(trends.length).toBeGreaterThan(0);
      expect(trends[0].dataPoints.length).toBe(3);
    });

    it('should calculate trend direction', () => {
      // Record degrading trend
      for (let i = 0; i < 10; i++) {
        analyzer.recordTrendDataPoint('cyclomatic', 5 + i * 2, '/src/degrading.ts');
      }

      const trends = analyzer.getTrends('/src/degrading.ts');
      expect(trends[0].trend).toBe('degrading');
      expect(trends[0].changeRate).toBeGreaterThan(0);
    });
  });

  describe('analysis summary', () => {
    it('should generate analysis summary', () => {
      // Analyze some code
      analyzer.analyzeCode('function a() { if (x) return y; }', '/src/a.ts', 'a');
      analyzer.analyzeCode('function b() { return x + y; }', '/src/b.ts', 'b');

      const summary = analyzer.generateSummary();

      expect(summary.analyzedAt).toBeDefined();
      expect(summary.totalFiles).toBe(2);
      expect(summary.averageComplexity).toBeGreaterThan(0);
      expect(summary.healthScore).toBeGreaterThanOrEqual(0);
      expect(summary.healthScore).toBeLessThanOrEqual(100);
    });
  });

  describe('complexity ratings', () => {
    it('should rate complexity levels', () => {
      expect(analyzer.getComplexityRating(3, 'cyclomatic')).toBe('low');
      expect(analyzer.getComplexityRating(8, 'cyclomatic')).toBe('medium');
      expect(analyzer.getComplexityRating(15, 'cyclomatic')).toBe('high');
      expect(analyzer.getComplexityRating(25, 'cyclomatic')).toBe('critical');
    });
  });
});
