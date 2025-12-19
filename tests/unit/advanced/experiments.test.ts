/**
 * Feature Flags & A/B Testing Tests
 * Tests for Issues #131, #132
 */

import { FeatureFlagService, ABTestingService } from '../../../src/advanced/experiments';

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;

  beforeEach(() => {
    service = new FeatureFlagService();
  });

  describe('create', () => {
    it('should create a feature flag', () => {
      const flag = service.create({
        key: 'new_feature',
        name: 'New Feature',
        enabled: true,
        rolloutPercentage: 100,
      });

      expect(flag.key).toBe('new_feature');
      expect(flag.createdAt).toBeDefined();
    });
  });

  describe('isEnabled', () => {
    it('should return true for enabled flag', () => {
      service.create({
        key: 'feature',
        name: 'Feature',
        enabled: true,
        rolloutPercentage: 100,
      });

      expect(service.isEnabled('feature')).toBe(true);
    });

    it('should return false for disabled flag', () => {
      service.create({
        key: 'feature',
        name: 'Feature',
        enabled: false,
        rolloutPercentage: 100,
      });

      expect(service.isEnabled('feature')).toBe(false);
    });

    it('should return true for targeted user', () => {
      service.create({
        key: 'feature',
        name: 'Feature',
        enabled: true,
        rolloutPercentage: 0,
        targetUsers: ['user1'],
      });

      expect(service.isEnabled('feature', 'user1')).toBe(true);
    });
  });

  describe('toggle', () => {
    it('should toggle flag state', () => {
      service.create({
        key: 'feature',
        name: 'Feature',
        enabled: true,
        rolloutPercentage: 100,
      });

      service.toggle('feature', false);
      expect(service.isEnabled('feature')).toBe(false);
    });
  });

  describe('list', () => {
    it('should list all flags', () => {
      service.create({ key: 'f1', name: 'F1', enabled: true, rolloutPercentage: 100 });
      service.create({ key: 'f2', name: 'F2', enabled: false, rolloutPercentage: 50 });

      const flags = service.list();
      expect(flags.length).toBe(2);
    });
  });
});

describe('ABTestingService', () => {
  let service: ABTestingService;

  beforeEach(() => {
    service = new ABTestingService();
  });

  describe('createExperiment', () => {
    it('should create experiment with ID', () => {
      const experiment = service.createExperiment({
        name: 'Button Color Test',
        variants: [
          { id: 'control', name: 'Control', weight: 50, config: { color: 'blue' } },
          { id: 'variant', name: 'Variant', weight: 50, config: { color: 'green' } },
        ],
        status: 'running',
        metrics: ['clicks'],
      });

      expect(experiment.id).toBeDefined();
      expect(experiment.name).toBe('Button Color Test');
    });
  });

  describe('getVariant', () => {
    it('should return variant for user', () => {
      const experiment = service.createExperiment({
        name: 'Test',
        variants: [
          { id: 'a', name: 'A', weight: 50, config: {} },
          { id: 'b', name: 'B', weight: 50, config: {} },
        ],
        status: 'running',
        metrics: [],
      });

      const variant = service.getVariant(experiment.id, 'user1');
      expect(variant).toBeDefined();
      expect(['a', 'b']).toContain(variant!.id);
    });

    it('should return consistent variant for same user', () => {
      const experiment = service.createExperiment({
        name: 'Test',
        variants: [
          { id: 'a', name: 'A', weight: 50, config: {} },
          { id: 'b', name: 'B', weight: 50, config: {} },
        ],
        status: 'running',
        metrics: [],
      });

      const v1 = service.getVariant(experiment.id, 'user1');
      const v2 = service.getVariant(experiment.id, 'user1');

      expect(v1!.id).toBe(v2!.id);
    });
  });

  describe('recordMetric', () => {
    it('should record metric for user', () => {
      const experiment = service.createExperiment({
        name: 'Test',
        variants: [{ id: 'a', name: 'A', weight: 100, config: {} }],
        status: 'running',
        metrics: ['clicks'],
      });

      service.getVariant(experiment.id, 'user1');
      service.recordMetric(experiment.id, 'user1', 'clicks', 1);

      const results = service.getResults(experiment.id);
      expect(results.length).toBe(1);
    });
  });
});
