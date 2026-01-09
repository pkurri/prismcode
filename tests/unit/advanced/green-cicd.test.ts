import { GreenCICDOptimizer } from '../../../src/advanced/green-cicd';

describe('GreenCICDOptimizer', () => {
  let optimizer: GreenCICDOptimizer;

  beforeEach(() => {
    optimizer = new GreenCICDOptimizer();
  });

  describe('analyzePipeline', () => {
    it('should analyze pipeline carbon footprint', async () => {
      const analysis = await optimizer.analyzePipeline('build-1', 300, 'us-west-2', 0.5);

      expect(analysis.metrics.totalEmissions).toBeGreaterThan(0);
      expect(analysis.score).toBeGreaterThanOrEqual(0);
      expect(analysis.score).toBeLessThanOrEqual(100);
    });

    it('should suggest region switch for high intensity regions', async () => {
      const analysis = await optimizer.analyzePipeline('build-2', 300, 'ap-south-1', 0.5);

      expect(analysis.suggestions.some((s) => s.type === 'region-switch')).toBe(true);
    });

    it('should suggest cache optimization for long builds', async () => {
      const analysis = await optimizer.analyzePipeline('build-3', 600, 'us-west-2', 1);

      expect(analysis.suggestions.some((s) => s.type === 'cache-optimization')).toBe(true);
    });
  });

  describe('getScheduleRecommendation', () => {
    it('should recommend cleaner region', () => {
      const recommendation = optimizer.getScheduleRecommendation('us-east-1');

      expect(recommendation.region).toBe('eu-north-1');
      expect(recommendation.savingsPercent).toBeGreaterThan(0);
    });
  });

  describe('calculateSavings', () => {
    it('should calculate carbon savings', () => {
      const before = {
        totalEmissions: 100,
        energyConsumed: 1,
        runTime: 300,
        region: 'us-east-1',
        gridIntensity: 420,
      };
      const after = {
        totalEmissions: 50,
        energyConsumed: 0.5,
        runTime: 150,
        region: 'eu-north-1',
        gridIntensity: 30,
      };

      const savings = optimizer.calculateSavings(before, after);

      expect(savings.saved).toBe(50);
      expect(savings.percentage).toBe(50);
    });
  });

  describe('getAnalysis', () => {
    it('should retrieve stored analysis', async () => {
      await optimizer.analyzePipeline('test-pipeline', 120, 'eu-west-1', 0.25);
      const analysis = optimizer.getAnalysis('test-pipeline');

      expect(analysis).not.toBeNull();
      expect(analysis?.pipelineId).toBe('test-pipeline');
    });
  });
});
