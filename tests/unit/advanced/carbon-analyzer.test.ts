import { CarbonFootprintAnalyzer } from '../../../src/advanced/carbon-analyzer';

describe('CarbonFootprintAnalyzer', () => {
  let analyzer: CarbonFootprintAnalyzer;

  beforeEach(() => {
    analyzer = new CarbonFootprintAnalyzer();
  });

  describe('calculate', () => {
    it('should calculate carbon footprint', () => {
      const result = analyzer.calculate({
        cpuSeconds: 100,
        memoryMB: 512,
        networkMB: 50,
        storageMB: 100,
      });

      expect(result.totalGrams).toBeGreaterThan(0);
      expect(result.breakdown.compute).toBeGreaterThan(0);
    });

    it('should track history', () => {
      analyzer.calculate({ cpuSeconds: 10, memoryMB: 100, networkMB: 5, storageMB: 10 });
      analyzer.calculate({ cpuSeconds: 20, memoryMB: 200, networkMB: 10, storageMB: 20 });

      const history = analyzer.getHistory();
      expect(history.length).toBe(2);
    });
  });

  describe('setGridIntensity', () => {
    it('should adjust calculations based on grid intensity', () => {
      const usage = { cpuSeconds: 100, memoryMB: 100, networkMB: 10, storageMB: 10 };

      analyzer.setGridIntensity(200);
      const low = analyzer.calculate(usage);

      analyzer.setGridIntensity(800);
      const high = analyzer.calculate(usage);

      expect(high.breakdown.compute).toBeGreaterThan(low.breakdown.compute);
    });
  });

  describe('generateReport', () => {
    it('should generate carbon report', () => {
      analyzer.calculate({ cpuSeconds: 50, memoryMB: 256, networkMB: 25, storageMB: 50 });
      const report = analyzer.generateReport('day');

      expect(report.totalEmissions).toBeGreaterThan(0);
      expect(report.topContributors.length).toBeGreaterThan(0);
    });
  });

  describe('compare', () => {
    it('should compare two footprints', () => {
      const before = analyzer.calculate({
        cpuSeconds: 100,
        memoryMB: 512,
        networkMB: 50,
        storageMB: 100,
      });
      const after = analyzer.calculate({
        cpuSeconds: 50,
        memoryMB: 256,
        networkMB: 25,
        storageMB: 50,
      });

      const comparison = analyzer.compare(before, after);
      expect(comparison.improved).toBe(true);
    });
  });
});
