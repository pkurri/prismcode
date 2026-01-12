import { 
  qaAgent, 
  generateTestsTool, 
  runTestsTool, 
  analyzeCoverageTool, 
  reportBugTool 
} from '../qa';

describe('QA Agent Tools', () => {
  it('has correct agent configuration', () => {
    expect(qaAgent.role).toBe('qa');
    expect(qaAgent.tools).toHaveLength(4);
  });

  describe('generateTestsTool', () => {
    it('generates test code', async () => {
      const result = await generateTestsTool.execute({ componentPath: 'src/components/Button.tsx' });
      expect(result.success).toBe(true);
      const data = result.data as Record<string, any>;
      expect(data.testFile).toContain('src/components/Button.test.tsx');
      expect(data.testCode).toContain('import Component from');
    });
  });

  describe('runTestsTool', () => {
    it('returns test results', async () => {
      const result = await runTestsTool.execute({});
      expect(result.success).toBe(true);
      const data = result.data as Record<string, any>;
      expect(data.passed).toBeGreaterThan(0);
      expect(data.coverage).toBeDefined();
    });
  });

  describe('analyzeCoverageTool', () => {
    it('analyzes coverage gaps', async () => {
      const result = await analyzeCoverageTool.execute({ threshold: 80 });
      expect(result.success).toBe(true);
      const data = result.data as Record<string, any>;
      expect(data.gap).toBeDefined();
      expect(data.uncoveredFiles).toBeInstanceOf(Array);
    });
  });

  describe('reportBugTool', () => {
    it('creates bug report', async () => {
      const result = await reportBugTool.execute({ 
        testName: 'Login Test', 
        error: 'Timeout' 
      });
      expect(result.success).toBe(true);
      const data = result.data as Record<string, any>;
      expect(data.bugId).toContain('BUG-');
      expect(data.title).toContain('Login Test');
    });
  });
});
