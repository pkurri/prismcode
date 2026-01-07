import { predictiveQuality } from '../../../src/advanced/predictive-quality';

describe('PredictiveQuality', () => {
  describe('assessFileRisk', () => {
    it('should calculate risk score correctly', () => {
      // High complexity, high churn, previous bugs, low coverage
      const risk = predictiveQuality.assessFileRisk('risky.ts', 20, 10, 5, 20);

      expect(risk.riskScore).toBeGreaterThan(60);
      expect(['High Risk', 'Critical']).toContain(risk.classification);
    });

    it('should classify safe files correctly', () => {
      // Low complexity, low churn, no bugs, high coverage
      const risk = predictiveQuality.assessFileRisk('safe.ts', 2, 0, 0, 95);

      expect(risk.riskScore).toBeLessThan(20);
      expect(risk.classification).toBe('Safe');
    });
  });

  describe('assessReleaseRisk', () => {
    it('should generate release report', () => {
      const risks = [
        predictiveQuality.assessFileRisk('a.ts', 20, 10, 5, 20), // Risky
        predictiveQuality.assessFileRisk('b.ts', 2, 0, 0, 90), // Safe
        predictiveQuality.assessFileRisk('c.ts', 5, 2, 1, 80), // Low Risk
      ];

      const report = predictiveQuality.assessReleaseRisk('v1.0.0', risks);

      expect(report.version).toBe('v1.0.0');
      expect(report.hotspots.length).toBeGreaterThan(0);
      expect(report.predictedBugs).toBeGreaterThan(0);
      expect(['Go', 'Caution', 'No Go']).toContain(report.recommendation);
    });
  });

  describe('identifyHotspots', () => {
    it('should identify files with high churn and complexity', () => {
      const files = [
        { path: 'hot.ts', complexity: 20, churn: 10 },
        { path: 'cold.ts', complexity: 5, churn: 1 },
      ];

      const hotspots = predictiveQuality.identifyHotspots(files);

      expect(hotspots).toContain('hot.ts');
      expect(hotspots).not.toContain('cold.ts');
    });
  });
});
