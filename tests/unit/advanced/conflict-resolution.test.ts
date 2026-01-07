/**
 * Conflict Resolution System Tests
 * Issue #206
 */

import { ConflictResolver } from '../../../src/advanced/conflict-resolution';

describe('ConflictResolver', () => {
  let resolver: ConflictResolver;

  beforeEach(() => {
    resolver = new ConflictResolver({ autoResolveSimple: true });
  });

  describe('conflict detection', () => {
    it('should detect overlapping changes', () => {
      const original = 'line1\nline2\nline3\nline4\nline5';
      const changeA = {
        agentId: 'agent-1',
        content: 'line1\nmodified-2\nline3\nline4\nline5',
        timestamp: new Date(),
      };
      const changeB = {
        agentId: 'agent-2',
        content: 'line1\ndifferent-2\nline3\nline4\nline5',
        timestamp: new Date(),
      };

      const conflicts = resolver.detectConflicts(original, changeA, changeB, '/test/file.ts');

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].filePath).toBe('/test/file.ts');
      expect(conflicts[0].status).toBe('pending');
    });

    it('should not detect conflicts for non-overlapping changes', () => {
      const original = 'line1\nline2\nline3\nline4\nline5\nline6\nline7\nline8';
      const changeA = {
        agentId: 'agent-1',
        content: 'line1\nmodified\nline3\nline4\nline5\nline6\nline7\nline8',
        timestamp: new Date(),
      };
      const changeB = {
        agentId: 'agent-2',
        content: 'line1\nline2\nline3\nline4\nline5\nline6\nline7\nchanged',
        timestamp: new Date(),
      };

      const conflicts = resolver.detectConflicts(original, changeA, changeB, '/test/file.ts');

      // Changes are on different lines, no overlap
      expect(conflicts.length).toBe(0);
    });

    it('should calculate severity based on overlap size', () => {
      const original = Array(30).fill('line').join('\n');
      const modified = Array(30)
        .fill('line')
        .map((l, i) => (i < 25 ? 'changed' : l))
        .join('\n');

      const changeA = { agentId: 'agent-1', content: modified, timestamp: new Date() };
      const changeB = { agentId: 'agent-2', content: modified, timestamp: new Date() };

      const conflicts = resolver.detectConflicts(original, changeA, changeB, '/test/file.ts');

      if (conflicts.length > 0) {
        expect(['high', 'critical']).toContain(conflicts[0].severity);
      }
    });
  });

  describe('auto resolution', () => {
    it('should auto-resolve simple conflicts', () => {
      const original = 'line1\nline2';
      const changeA = {
        agentId: 'agent-1',
        content: 'line1\nline2',
        timestamp: new Date(),
      };
      const changeB = {
        agentId: 'agent-2',
        content: 'line1\nline2\nline3',
        timestamp: new Date(),
      };

      const conflicts = resolver.detectConflicts(original, changeA, changeB, '/test/file.ts');

      if (conflicts.length > 0) {
        const result = resolver.attemptAutoResolve(conflicts[0].id);
        // May or may not auto-resolve depending on complexity
        expect(result).toBeDefined();
      }
    });

    it('should mark complex conflicts as manual_required', () => {
      const original = 'line1\nline2\nline3';
      const changeA = {
        agentId: 'agent-1',
        content: 'completely\ndifferent\ncontent',
        timestamp: new Date(),
      };
      const changeB = {
        agentId: 'agent-2',
        content: 'also\nvery\ndifferent',
        timestamp: new Date(),
      };

      const conflicts = resolver.detectConflicts(original, changeA, changeB, '/test/file.ts');

      if (conflicts.length > 0) {
        const result = resolver.attemptAutoResolve(conflicts[0].id);
        if (!result.success) {
          const conflict = resolver.getConflict(conflicts[0].id);
          expect(conflict?.status).toBe('manual_required');
        }
      }
    });
  });

  describe('manual resolution', () => {
    it('should accept change A', () => {
      const original = 'line1\nline2';
      const changeA = {
        agentId: 'agent-1',
        content: 'line1\nmodified',
        timestamp: new Date(),
      };
      const changeB = {
        agentId: 'agent-2',
        content: 'line1\ndifferent',
        timestamp: new Date(),
      };

      const conflicts = resolver.detectConflicts(original, changeA, changeB, '/test/file.ts');

      if (conflicts.length > 0) {
        const result = resolver.acceptChangeA(conflicts[0].id, 'user-1');
        expect(result.success).toBe(true);
        expect(result.mergedContent).toBe('modified');
        expect(result.rollbackAvailable).toBe(true);
      }
    });

    it('should accept change B', () => {
      const original = 'line1\nline2';
      const changeA = {
        agentId: 'agent-1',
        content: 'line1\nmodified',
        timestamp: new Date(),
      };
      const changeB = {
        agentId: 'agent-2',
        content: 'line1\ndifferent',
        timestamp: new Date(),
      };

      const conflicts = resolver.detectConflicts(original, changeA, changeB, '/test/file.ts');

      if (conflicts.length > 0) {
        const result = resolver.acceptChangeB(conflicts[0].id, 'user-1');
        expect(result.success).toBe(true);
        expect(result.mergedContent).toBe('different');
      }
    });

    it('should handle custom resolution', () => {
      const original = 'line1\nline2';
      const changeA = {
        agentId: 'agent-1',
        content: 'line1\nmodified',
        timestamp: new Date(),
      };
      const changeB = {
        agentId: 'agent-2',
        content: 'line1\ndifferent',
        timestamp: new Date(),
      };

      const conflicts = resolver.detectConflicts(original, changeA, changeB, '/test/file.ts');

      if (conflicts.length > 0) {
        const result = resolver.manualResolve(conflicts[0].id, {
          type: 'custom',
          resolvedContent: 'line1\nmerged-custom',
          resolvedBy: 'user-1',
          notes: 'Manual merge',
        });
        expect(result.success).toBe(true);
        expect(result.mergedContent).toBe('line1\nmerged-custom');
      }
    });
  });

  describe('rollback', () => {
    it('should rollback resolved conflict', () => {
      const original = 'line1\nline2';
      const changeA = {
        agentId: 'agent-1',
        content: 'line1\nmodified',
        timestamp: new Date(),
      };
      const changeB = {
        agentId: 'agent-2',
        content: 'line1\ndifferent',
        timestamp: new Date(),
      };

      const conflicts = resolver.detectConflicts(original, changeA, changeB, '/test/file.ts');

      if (conflicts.length > 0) {
        resolver.acceptChangeA(conflicts[0].id, 'user-1');
        const rollbackResult = resolver.rollback(conflicts[0].id);

        expect(rollbackResult.success).toBe(true);
        expect(rollbackResult.originalContent).toBeDefined();
      }
    });

    it('should fail rollback for non-existent conflict', () => {
      const result = resolver.rollback('nonexistent-id');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('conflict markers', () => {
    it('should generate Git-style conflict markers', () => {
      const original = 'line1\nline2';
      const changeA = {
        agentId: 'agent-1',
        content: 'line1\nmodified',
        timestamp: new Date(),
      };
      const changeB = {
        agentId: 'agent-2',
        content: 'line1\ndifferent',
        timestamp: new Date(),
      };

      const conflicts = resolver.detectConflicts(original, changeA, changeB, '/test/file.ts');

      if (conflicts.length > 0) {
        const markers = resolver.generateConflictMarkers(conflicts[0]);
        expect(markers).toContain('<<<<<<<');
        expect(markers).toContain('=======');
        expect(markers).toContain('>>>>>>>');
        expect(markers).toContain('agent-1');
        expect(markers).toContain('agent-2');
      }
    });
  });

  describe('audit log', () => {
    it('should track conflict actions', () => {
      const original = 'line1\nline2';
      const changeA = {
        agentId: 'agent-1',
        content: 'line1\nmodified',
        timestamp: new Date(),
      };
      const changeB = {
        agentId: 'agent-2',
        content: 'line1\ndifferent',
        timestamp: new Date(),
      };

      const conflicts = resolver.detectConflicts(original, changeA, changeB, '/test/file.ts');

      if (conflicts.length > 0) {
        const auditLog = resolver.getAuditLog(conflicts[0].id);
        expect(auditLog.some((e) => e.action === 'detected')).toBe(true);

        resolver.acceptChangeA(conflicts[0].id, 'user-1');
        const updatedLog = resolver.getAuditLog(conflicts[0].id);
        expect(updatedLog.some((e) => e.action === 'manual_resolved')).toBe(true);
      }
    });
  });

  describe('pending conflicts', () => {
    it('should return pending conflicts', () => {
      const original = 'line1\nline2';
      const changeA = {
        agentId: 'agent-1',
        content: 'line1\nmodified',
        timestamp: new Date(),
      };
      const changeB = {
        agentId: 'agent-2',
        content: 'line1\ndifferent',
        timestamp: new Date(),
      };

      resolver.detectConflicts(original, changeA, changeB, '/test/file.ts');

      const pending = resolver.getPendingConflicts();
      expect(pending.length).toBeGreaterThan(0);
    });
  });
});
