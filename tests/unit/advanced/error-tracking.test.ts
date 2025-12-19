/**
 * Error Tracking Tests
 * Tests for Issue #130
 */

import { ErrorTracker, TrackedError, ErrorGroup } from '../../../src/advanced/error-tracking';

describe('ErrorTracker', () => {
  let tracker: ErrorTracker;

  beforeEach(() => {
    tracker = new ErrorTracker();
    tracker.reset();
  });

  describe('trackError', () => {
    it('should track an error from Error object', () => {
      const error = new Error('Test error');
      const tracked = tracker.trackError(error, 'test-source');

      expect(tracked.message).toBe('Test error');
      expect(tracked.type).toBe('Error');
      expect(tracked.source).toBe('test-source');
      expect(tracked.resolved).toBe(false);
    });

    it('should track an error from string', () => {
      const tracked = tracker.trackError('String error', 'test-source');

      expect(tracked.message).toBe('String error');
      expect(tracked.type).toBe('Error');
    });

    it('should track with custom severity', () => {
      const tracked = tracker.trackError(new Error('Critical error'), 'api', 'critical');

      expect(tracked.severity).toBe('critical');
    });

    it('should include context', () => {
      const tracked = tracker.trackError(new Error('Context error'), 'api', 'medium', {
        userId: '123',
        action: 'save',
      });

      expect(tracked.context).toEqual({ userId: '123', action: 'save' });
    });
  });

  describe('getErrors', () => {
    it('should return tracked errors', () => {
      tracker.trackError('Error 1', 'source1');
      tracker.trackError('Error 2', 'source2');

      const errors = tracker.getErrors();
      expect(errors.length).toBe(2);
    });

    it('should limit returned errors', () => {
      for (let i = 0; i < 10; i++) {
        tracker.trackError(`Error ${i}`, 'source');
      }

      const errors = tracker.getErrors(5);
      expect(errors.length).toBe(5);
    });
  });

  describe('getUnresolvedErrors', () => {
    it('should return only unresolved errors', () => {
      const e1 = tracker.trackError('Error 1', 'source');
      tracker.trackError('Error 2', 'source');

      tracker.resolveError(e1.id);

      const unresolved = tracker.getUnresolvedErrors();
      expect(unresolved.length).toBe(1);
    });
  });

  describe('getErrorsBySeverity', () => {
    it('should filter by severity', () => {
      tracker.trackError('Low error', 'source', 'low');
      tracker.trackError('Critical error', 'source', 'critical');
      tracker.trackError('Another low', 'source', 'low');

      const lowErrors = tracker.getErrorsBySeverity('low');
      expect(lowErrors.length).toBe(2);
    });
  });

  describe('error groups', () => {
    it('should group similar errors', () => {
      tracker.trackError('Connection failed', 'api');
      tracker.trackError('Connection failed', 'api');
      tracker.trackError('Connection failed', 'api');

      const groups = tracker.getErrorGroups();
      expect(groups.length).toBe(1);
      expect(groups[0].count).toBe(3);
    });

    it('should separate different errors into groups', () => {
      tracker.trackError('Error A', 'source1');
      tracker.trackError('Error B', 'source2');

      const groups = tracker.getErrorGroups();
      expect(groups.length).toBe(2);
    });

    it('should return top groups by count', () => {
      for (let i = 0; i < 5; i++) {
        tracker.trackError('Common error', 'api');
      }
      tracker.trackError('Rare error', 'api');

      const top = tracker.getTopErrorGroups(1);
      expect(top.length).toBe(1);
      expect(top[0].message).toBe('Common error');
    });
  });

  describe('resolveError', () => {
    it('should resolve an error', () => {
      const tracked = tracker.trackError('Error', 'source');
      const result = tracker.resolveError(tracked.id);

      expect(result).toBe(true);
      expect(tracker.getUnresolvedErrors().length).toBe(0);
    });

    it('should return false for unknown error', () => {
      const result = tracker.resolveError('unknown-id');
      expect(result).toBe(false);
    });
  });

  describe('resolveErrorGroup', () => {
    it('should resolve all errors in group', () => {
      tracker.trackError('Same error', 'api');
      tracker.trackError('Same error', 'api');

      const groups = tracker.getErrorGroups();
      tracker.resolveErrorGroup(groups[0].fingerprint);

      expect(tracker.getUnresolvedErrors().length).toBe(0);
    });
  });

  describe('getErrorStats', () => {
    it('should return error statistics', () => {
      tracker.trackError('Error 1', 'api', 'low');
      tracker.trackError('Error 2', 'db', 'critical');

      const stats = tracker.getErrorStats();

      expect(stats.total).toBe(2);
      expect(stats.bySeverity.low).toBe(1);
      expect(stats.bySeverity.critical).toBe(1);
      expect(stats.bySource['api']).toBe(1);
      expect(stats.bySource['db']).toBe(1);
    });
  });

  describe('getErrorTrends', () => {
    it('should return trends for specified days', () => {
      tracker.trackError('Today error', 'api');

      const trends = tracker.getErrorTrends(7);

      expect(trends.length).toBe(7);
      expect(trends[6].count).toBeGreaterThan(0); // Today
    });
  });

  describe('searchErrors', () => {
    it('should search errors by message', () => {
      tracker.trackError('Connection timeout', 'api');
      tracker.trackError('Database error', 'db');

      const results = tracker.searchErrors('connection');
      expect(results.length).toBe(1);
    });

    it('should search by source', () => {
      tracker.trackError('Error 1', 'payment-api');
      tracker.trackError('Error 2', 'user-api');

      const results = tracker.searchErrors('payment');
      expect(results.length).toBe(1);
    });
  });

  describe('clearResolvedErrors', () => {
    it('should clear resolved errors', () => {
      const e1 = tracker.trackError('Error 1', 'source');
      tracker.trackError('Error 2', 'source');

      tracker.resolveError(e1.id);
      const cleared = tracker.clearResolvedErrors();

      expect(cleared).toBe(1);
      expect(tracker.getErrors().length).toBe(1);
    });
  });

  describe('reset', () => {
    it('should clear all tracking data', () => {
      tracker.trackError('Error', 'source');
      tracker.reset();

      expect(tracker.getErrors().length).toBe(0);
      expect(tracker.getErrorGroups().length).toBe(0);
    });
  });
});
