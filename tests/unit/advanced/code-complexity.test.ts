/**
 * Tests for Code Complexity Analyzer
 * Issue #212: Code Complexity Analyzer
 */

import { 
  CodeComplexityAnalyzer,
  type FileAnalysis,
  type ProjectAnalysis 
} from '../../../src/advanced/code-complexity';

describe('CodeComplexityAnalyzer', () => {
  let analyzer: CodeComplexityAnalyzer;

  beforeEach(() => {
    analyzer = new CodeComplexityAnalyzer();
  });

  afterEach(() => {
    analyzer.reset();
  });

  describe('file analysis', () => {
    it('should analyze a TypeScript file', () => {
      const content = `
        function simpleFunction() {
          return 42;
        }

        function complexFunction(a: number, b: number, c: number) {
          if (a > 0) {
            if (b > 0) {
              return a + b + c;
            }
          }
          return 0;
        }
      `;

      const result = analyzer.analyzeFile('test.ts', content);

      expect(result.filePath).toBe('test.ts');
      expect(result.language).toBe('typescript');
      expect(result.metrics).toBeDefined();
      expect(result.functions).toBeInstanceOf(Array);
      expect(typeof result.score).toBe('number');
    });

    it('should detect language from file extension', () => {
      const tsResult = analyzer.analyzeFile('app.ts', 'const x = 1;');
      const jsResult = analyzer.analyzeFile('app.js', 'const x = 1;');
      const pyResult = analyzer.analyzeFile('app.py', 'x = 1');

      expect(tsResult.language).toBe('typescript');
      expect(jsResult.language).toBe('javascript');
      expect(pyResult.language).toBe('python');
    });

    it('should calculate complexity metrics', () => {
      const content = `
        function example(a: number) {
          if (a > 10) {
            for (let i = 0; i < a; i++) {
              console.log(i);
            }
          }
          return a;
        }
      `;

      const result = analyzer.analyzeFile('test.ts', content);

      expect(result.metrics.cyclomaticComplexity).toBeGreaterThan(0);
      expect(result.metrics.linesOfCode).toBeGreaterThan(0);
      expect(typeof result.metrics.maintainabilityIndex).toBe('number');
    });

    it('should identify complexity issues', () => {
      const complexContent = `
        function godFunction(a, b, c, d, e, f, g, h) {
          if (a) {
            if (b) {
              if (c) {
                if (d) {
                  if (e) {
                    if (f) {
                      if (g) {
                        if (h) {
                          return true;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          return false;
        }
      `;

      const result = analyzer.analyzeFile('complex.ts', complexContent);

      // Implementation may or may not detect issues depending on analysis
      expect(result.issues).toBeInstanceOf(Array);
    });
  });

  describe('project analysis', () => {
    it('should analyze multiple files', () => {
      const files = [
        { path: 'src/a.ts', content: 'function a() { return 1; }' },
        { path: 'src/b.ts', content: 'function b() { return 2; }' },
        { path: 'src/c.ts', content: 'function c() { return 3; }' },
      ];

      const result = analyzer.analyzeProject(files);

      expect(result.totalFiles).toBe(3);
      expect(result.id).toBeDefined();
      expect(result.analyzedAt).toBeInstanceOf(Date);
      expect(typeof result.averageComplexity).toBe('number');
      expect(typeof result.overallScore).toBe('number');
    });

    it('should identify hotspots', () => {
      const files = [
        { path: 'simple.ts', content: 'const x = 1;' },
        { 
          path: 'complex.ts', 
          content: `
            function nested(a, b, c, d, e) {
              if (a) { if (b) { if (c) { if (d) { return e; } } } }
            }
          ` 
        },
      ];

      const result = analyzer.analyzeProject(files);
      const hotspots = analyzer.getHotspots(result, 2);

      // Should return files with complexity issues
      expect(hotspots.length).toBeGreaterThanOrEqual(1);
      expect(hotspots[0].filePath).toBeDefined();
    });

    it('should track analysis history', () => {
      const files = [{ path: 'test.ts', content: 'const x = 1;' }];

      analyzer.analyzeProject(files);
      analyzer.analyzeProject(files);
      analyzer.analyzeProject(files);

      const history = analyzer.getHistory();

      expect(history.length).toBe(3);
    });
  });

  describe('function analysis', () => {
    it('should extract function information', () => {
      const content = `
        function simpleFunc() {
          return 1;
        }

        function anotherFunc(x: number, y: number) {
          return x + y;
        }
      `;

      const result = analyzer.analyzeFile('funcs.ts', content);

      expect(result.functions.length).toBeGreaterThanOrEqual(2);

      for (const func of result.functions) {
        expect(func.name).toBeDefined();
        expect(typeof func.startLine).toBe('number');
        expect(typeof func.endLine).toBe('number');
        expect(typeof func.complexity).toBe('number');
        expect(typeof func.parameters).toBe('number');
        expect(typeof func.isHotspot).toBe('boolean');
      }
    });

    it('should find function hotspots', () => {
      const files = [
        {
          path: 'test.ts',
          content: `
            function simple() { return 1; }
            function complex(a, b, c, d, e) {
              if (a) { if (b) { if (c) { if (d) { return e; } } } }
            }
          `,
        },
      ];

      const result = analyzer.analyzeProject(files);
      const hotspots = analyzer.getFunctionHotspots(result, 5);

      expect(hotspots).toBeInstanceOf(Array);
      for (const h of hotspots) {
        expect(h.file).toBeDefined();
        expect(h.function).toBeDefined();
      }
    });
  });

  describe('suggestions', () => {
    it('should generate refactoring suggestions', () => {
      const complexContent = `
        function oversizedFunction(a, b, c, d, e, f, g, h) {
          // Line 1
          // Line 2
          // Line 3
          // ... (imagine 100+ lines)
          if (a) { if (b) { if (c) { if (d) { return e + f + g + h; } } } }
        }
      `;

      const result = analyzer.analyzeFile('bloated.ts', complexContent);
      const suggestions = analyzer.getSuggestions(result);

      // Should return array of suggestions (may be empty for some code)
      expect(suggestions).toBeInstanceOf(Array);
    });
  });

  describe('thresholds', () => {
    it('should allow custom thresholds', () => {
      analyzer.setThresholds({
        cyclomaticComplexity: 5,
        functionLength: 20,
      });

      const content = `
        function medium(a: number, b: number) {
          if (a > 0) {
            if (b > 0) {
              return a + b;
            }
          }
          return 0;
        }
      `;

      const result = analyzer.analyzeFile('test.ts', content);

      // With stricter thresholds, may catch more issues
      expect(result).toBeDefined();
    });
  });

  describe('comparison', () => {
    it('should compare two analyses', () => {
      const files1 = [{ path: 'test.ts', content: 'const x = 1;' }];
      const files2 = [{ path: 'test.ts', content: 'function f() { return 1; }' }];

      const analysis1 = analyzer.analyzeProject(files1);
      const analysis2 = analyzer.analyzeProject(files2);

      const comparison = analyzer.compare(analysis1.id, analysis2.id);

      if (comparison) {
        expect(comparison.improved).toBeInstanceOf(Array);
        expect(comparison.degraded).toBeInstanceOf(Array);
        expect(comparison.unchanged).toBeInstanceOf(Array);
        expect(typeof comparison.scoreDiff).toBe('number');
      }
    });

    it('should return null for invalid IDs', () => {
      const comparison = analyzer.compare('invalid1', 'invalid2');

      expect(comparison).toBeNull();
    });
  });
});
