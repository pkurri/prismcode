import { testGenerationEngine, FunctionSignature } from '../../../src/advanced/test-generation';

describe('TestGenerationEngine', () => {
  describe('generateTests', () => {
    it('should generate tests for a function', async () => {
      const signature: FunctionSignature = {
        name: 'calculateSum',
        params: [
          { name: 'a', type: 'number' },
          { name: 'b', type: 'number' },
        ],
        returnType: 'number',
        isAsync: false,
      };

      const result = await testGenerationEngine.generateTests(
        'function calculateSum(a, b) { return a + b; }',
        signature
      );

      expect(result.tests.length).toBeGreaterThan(0);
      expect(result.edgeCasesDetected).toBeGreaterThanOrEqual(0);
    });

    it('should generate async tests for async functions', async () => {
      const signature: FunctionSignature = {
        name: 'fetchData',
        params: [{ name: 'url', type: 'string' }],
        returnType: 'Promise<any>',
        isAsync: true,
      };

      const result = await testGenerationEngine.generateTests(
        'async function fetchData(url) {}',
        signature
      );

      expect(result.tests.some((t) => t.generatedCode.includes('await'))).toBe(true);
    });
  });

  describe('analyzeCoverageGaps', () => {
    it('should identify low coverage functions', () => {
      const coverageData = [
        {
          file: 'utils.ts',
          functions: [
            { name: 'helper1', coverage: 90 },
            { name: 'helper2', coverage: 50 },
          ],
        },
      ];

      const gaps = testGenerationEngine.analyzeCoverageGaps(coverageData);

      expect(gaps.length).toBe(1);
      expect(gaps[0].function).toBe('helper2');
    });
  });

  describe('generateTestCode', () => {
    it('should generate jest test code', async () => {
      const signature: FunctionSignature = {
        name: 'test',
        params: [],
        returnType: 'void',
        isAsync: false,
      };

      await testGenerationEngine.generateTests('function test() {}', signature);
      const tests = testGenerationEngine.getGeneratedTests('test');
      const code = testGenerationEngine.generateTestCode(tests, 'jest');

      expect(code).toContain("describe('Generated Tests'");
    });
  });
});
