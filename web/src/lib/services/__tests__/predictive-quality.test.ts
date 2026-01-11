import { predictBugs, forecastTechDebt } from '../predictive-quality';

describe('Predictive Quality Service', () => {
  describe('predictBugs', () => {
    it('predicts bugs in files', async () => {
      const predictions = await predictBugs(['src/a.ts', 'src/b.ts', 'src/c.ts']);
      expect(predictions.length).toBe(3);
      predictions.forEach(p => {
        expect(p.probability).toBeGreaterThanOrEqual(0);
        expect(p.probability).toBeLessThanOrEqual(1);
        expect(p.factors).toBeInstanceOf(Array);
      });
    });
  });

  describe('forecastTechDebt', () => {
    it('forecasts tech debt for component', async () => {
      const forecast = await forecastTechDebt('auth-module');
      expect(forecast.component).toBe('auth-module');
      expect(forecast.currentDebt).toBeDefined();
      expect(forecast.projectedDebt).toBeGreaterThanOrEqual(forecast.currentDebt);
      expect(['high', 'medium', 'low']).toContain(forecast.priority);
    });
  });
});
