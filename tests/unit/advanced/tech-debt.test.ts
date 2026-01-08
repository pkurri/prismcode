import { TechnicalDebtForecaster } from '../../../src/advanced/tech-debt';

describe('TechnicalDebtForecaster', () => {
  let forecaster: TechnicalDebtForecaster;

  beforeEach(() => {
    forecaster = new TechnicalDebtForecaster();
  });

  describe('analyzeCode', () => {
    it('should detect TODO comments as debt', () => {
      const code = `
        function test() {
          // TODO: fix this later
          return true;
        }
      `;

      const items = forecaster.analyzeCode('test.ts', code);
      expect(items.some((i) => i.description.includes('TODO'))).toBe(true);
    });

    it('should detect console.log statements', () => {
      const code = 'console.log("debug");\nconsole.error("error");';

      const items = forecaster.analyzeCode('test.ts', code);
      expect(items.some((i) => i.description.includes('Console'))).toBe(true);
    });

    it('should detect excessive use of any type', () => {
      const code = 'let a: any; let b: any; let c: any; let d: any;';

      const items = forecaster.analyzeCode('test.ts', code);
      expect(items.some((i) => i.description.includes('any'))).toBe(true);
    });
  });

  describe('generateRemediationPlan', () => {
    it('should prioritize high severity items', () => {
      forecaster.analyzeCode('test.ts', '// TODO: critical\n// FIXME: also fix');

      const plan = forecaster.generateRemediationPlan();
      expect(plan.items.length).toBeGreaterThan(0);
      expect(plan.estimatedROI).toBeGreaterThan(0);
    });

    it('should respect maxHours limit', () => {
      forecaster.analyzeCode('test.ts', '// TODO: 1\n// TODO: 2\n// TODO: 3');

      const plan = forecaster.generateRemediationPlan(1);
      expect(plan.estimatedTotalHours).toBeLessThanOrEqual(1);
    });
  });

  describe('forecastDebt', () => {
    it('should return growth projections', () => {
      forecaster.analyzeCode('test.ts', '// TODO: fix');

      const forecast = forecaster.forecastDebt(6);
      expect(forecast.currentDebt).toBeGreaterThan(0);
      expect(typeof forecast.growthRate).toBe('number');
    });
  });

  describe('getAnalysisReport', () => {
    it('should return complete report', () => {
      forecaster.analyzeCode('test.ts', '// FIXME: broken');

      const report = forecaster.getAnalysisReport();
      expect(report.totalItems).toBeGreaterThan(0);
      expect(report.debtScore).toBeGreaterThanOrEqual(0);
    });
  });
});
