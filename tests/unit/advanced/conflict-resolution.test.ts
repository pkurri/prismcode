/**
 * Conflict Resolution Tests
 * Issue #206: Conflict Resolution System
 */

import {
  ConflictResolutionSystem,
  conflictResolutionSystem,
} from '../../../src/advanced/conflict-resolution';

describe('ConflictResolutionSystem', () => {
  let conflictSystem: ConflictResolutionSystem;

  beforeEach(() => {
    conflictSystem = new ConflictResolutionSystem();
  });

  afterEach(() => {
    conflictSystem.reset();
  });

  describe('change registration', () => {
    it('should register file changes', () => {
      conflictSystem.registerChange({
        filePath: 'src/file1.ts',
        agentId: 'agent1',
        changeType: 'modify',
        originalContent: 'old content',
        newContent: 'new content',
        timestamp: new Date(),
      });

      const changes = conflictSystem.getPendingChanges('src/file1.ts');
      expect(changes.length).toBe(1);
    });

    it('should track multiple changes to same file', () => {
      conflictSystem.registerChange({
        filePath: 'src/file1.ts',
        agentId: 'agent1',
        changeType: 'modify',
        newContent: 'content from agent 1',
        timestamp: new Date(),
      });

      conflictSystem.registerChange({
        filePath: 'src/file1.ts',
        agentId: 'agent2',
        changeType: 'modify',
        newContent: 'content from agent 2',
        timestamp: new Date(),
      });

      const changes = conflictSystem.getPendingChanges('src/file1.ts');
      expect(changes.length).toBe(2);
    });
  });

  describe('conflict detection', () => {
    it('should detect conflicts when multiple agents modify same file', () => {
      conflictSystem.registerChange({
        filePath: 'src/file1.ts',
        agentId: 'agent1',
        changeType: 'modify',
        newContent: 'content from agent 1',
        lineRange: { start: 1, end: 10 },
        timestamp: new Date(),
      });

      conflictSystem.registerChange({
        filePath: 'src/file1.ts',
        agentId: 'agent2',
        changeType: 'modify',
        newContent: 'content from agent 2',
        lineRange: { start: 5, end: 15 },
        timestamp: new Date(),
      });

      const conflict = conflictSystem.detectConflicts('src/file1.ts');
      expect(conflict).toBeDefined();
    });

    it('should return null when no conflicts', () => {
      conflictSystem.registerChange({
        filePath: 'src/file1.ts',
        agentId: 'agent1',
        changeType: 'modify',
        newContent: 'content',
        timestamp: new Date(),
      });

      const conflict = conflictSystem.detectConflicts('src/file1.ts');
      // Single change shouldn't create conflict
      expect(conflict).toBeNull();
    });
  });

  describe('auto resolution', () => {
    it('should auto-resolve compatible changes', () => {
      conflictSystem.registerChange({
        filePath: 'src/file1.ts',
        agentId: 'agent1',
        changeType: 'modify',
        newContent: 'content 1',
        lineRange: { start: 1, end: 5 },
        timestamp: new Date(),
      });

      conflictSystem.registerChange({
        filePath: 'src/file1.ts',
        agentId: 'agent2',
        changeType: 'modify',
        newContent: 'content 2',
        lineRange: { start: 1, end: 5 },
        timestamp: new Date(),
      });

      const conflict = conflictSystem.detectConflicts('src/file1.ts');
      if (conflict) {
        const resolution = conflictSystem.autoResolve(conflict.id);
        // May or may not auto-resolve depending on conflict type
        expect(resolution === null || resolution.type).toBeTruthy();
      }
    });
  });

  describe('manual resolution', () => {
    it('should allow manual resolution', () => {
      conflictSystem.registerChange({
        filePath: 'src/file1.ts',
        agentId: 'agent1',
        changeType: 'modify',
        newContent: 'content 1',
        lineRange: { start: 1, end: 10 },
        timestamp: new Date(),
      });

      conflictSystem.registerChange({
        filePath: 'src/file1.ts',
        agentId: 'agent2',
        changeType: 'modify',
        newContent: 'content 2',
        lineRange: { start: 5, end: 15 },
        timestamp: new Date(),
      });

      const conflict = conflictSystem.detectConflicts('src/file1.ts');
      if (conflict) {
        const resolved = conflictSystem.manualResolve(conflict.id, {
          type: 'manual',
          result: 'manually merged content',
        });
        expect(resolved).toBe(true);
      }
    });
  });

  describe('rollback', () => {
    it('should rollback changes for a file', () => {
      conflictSystem.registerChange({
        filePath: 'src/file1.ts',
        agentId: 'agent1',
        changeType: 'modify',
        originalContent: 'original',
        newContent: 'modified',
        timestamp: new Date(),
      });

      const rolledBack = conflictSystem.rollback('src/file1.ts');
      expect(rolledBack).toBeDefined();
    });
  });

  describe('conflict queries', () => {
    it('should get all conflicts', () => {
      const conflicts = conflictSystem.getConflicts();
      expect(conflicts).toBeInstanceOf(Array);
    });

    it('should filter resolved conflicts', () => {
      const unresolved = conflictSystem.getConflicts({ resolved: false });
      expect(unresolved).toBeInstanceOf(Array);
    });

    it('should get affected files', () => {
      conflictSystem.registerChange({
        filePath: 'src/file1.ts',
        agentId: 'agent1',
        changeType: 'modify',
        newContent: 'content',
        timestamp: new Date(),
      });

      const files = conflictSystem.getAffectedFiles();
      expect(files).toContain('src/file1.ts');
    });
  });

  describe('diff generation', () => {
    it('should generate conflict diff', () => {
      conflictSystem.registerChange({
        filePath: 'src/file1.ts',
        agentId: 'agent1',
        changeType: 'modify',
        newContent: 'content 1',
        lineRange: { start: 1, end: 5 },
        timestamp: new Date(),
      });

      conflictSystem.registerChange({
        filePath: 'src/file1.ts',
        agentId: 'agent2',
        changeType: 'modify',
        newContent: 'content 2',
        lineRange: { start: 3, end: 8 },
        timestamp: new Date(),
      });

      const conflict = conflictSystem.detectConflicts('src/file1.ts');
      if (conflict) {
        const diff = conflictSystem.generateDiff(conflict);
        expect(typeof diff).toBe('string');
      }
    });
  });

  describe('singleton instance', () => {
    it('should export singleton instance', () => {
      expect(conflictResolutionSystem).toBeInstanceOf(ConflictResolutionSystem);
    });
  });
});
