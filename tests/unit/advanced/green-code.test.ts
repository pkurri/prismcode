import { greenCodeEngine } from '../../../src/advanced/green-code';

describe('GreenCodeEngine', () => {
  const sampleCode = `
    const users = new Array(1000).fill(0);
    const result = users.map(u => {
      // CPU intensive
      for (let i = 0; i < 100; i++) {}
      return u + 1;
    });
    fetch('https://api.example.com');
  `;

  describe('analyzeCode', () => {
    it('should generate a sustainability report', () => {
      const report = greenCodeEngine.analyzeCode('test.ts', sampleCode);

      expect(report).toBeDefined();
      expect(report.file).toBe('test.ts');
      expect(report.metrics).toBeDefined();
      expect(report.usage).toBeDefined();
      expect(report.suggestions).toBeDefined();
    });

    it('should detect CPU intensive patterns', () => {
      const report = greenCodeEngine.analyzeCode('cpu.ts', 'for(let i=0; i<100; i++) {}');
      expect(report.usage.cpuCycles).toBeGreaterThan(1000);
    });

    it('should detect memory intensive patterns', () => {
      const report = greenCodeEngine.analyzeCode('mem.ts', 'new Array(1000)');
      expect(report.usage.memoryMB).toBeGreaterThan(10);
    });

    it('should provide suggestions', () => {
      const suggestions = greenCodeEngine.analyzeCode(
        'sugg.ts',
        `
        for(let i=0; i<10; i++) { for(let j=0; j<10; j++) {} }
      `
      ).suggestions;

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].category).toBe('efficiency');
    });

    it('should calculate carbon footprint', () => {
      const report = greenCodeEngine.analyzeCode('carbon.ts', sampleCode);
      expect(report.metrics.estimatedCO2g).toBeGreaterThan(0);
      expect(['A', 'B', 'C', 'D', 'F']).toContain(report.metrics.rating);
    });
  });
});
