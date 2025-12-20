/**
 * Conflict Resolution System
 * Issue #204: Conflict Resolution System
 *
 * Handle conflicts when parallel agents modify same files
 */

import logger from '../utils/logger';

export interface FileChange {
  filePath: string;
  agentId: string;
  changeType: 'create' | 'modify' | 'delete';
  originalContent?: string;
  newContent: string;
  lineRange?: { start: number; end: number };
  timestamp: Date;
}

export interface Conflict {
  id: string;
  filePath: string;
  type: 'content' | 'structural' | 'semantic';
  severity: 'auto_resolvable' | 'needs_review' | 'blocking';
  changes: FileChange[];
  resolution?: Resolution;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface Resolution {
  type: 'merge' | 'accept_first' | 'accept_last' | 'manual' | 'rollback';
  result: string;
  resolvedBy: 'auto' | 'user';
  metadata?: Record<string, unknown>;
}

export interface MergeResult {
  success: boolean;
  mergedContent: string;
  hasConflicts: boolean;
  conflictMarkers: number;
}

/**
 * Conflict Resolution System
 * Detects and resolves conflicts between parallel agent changes
 */
export class ConflictResolutionSystem {
  private pendingChanges: Map<string, FileChange[]> = new Map();
  private conflicts: Conflict[] = [];
  private conflictCounter = 0;

  constructor() {
    logger.info('ConflictResolutionSystem initialized');
  }

  /**
   * Register a file change from an agent
   */
  registerChange(change: FileChange): void {
    const existing = this.pendingChanges.get(change.filePath) || [];
    existing.push(change);
    this.pendingChanges.set(change.filePath, existing);

    logger.debug('Change registered', { 
      file: change.filePath, 
      agent: change.agentId,
      type: change.changeType,
    });

    // Check for conflicts immediately
    if (existing.length > 1) {
      this.detectConflicts(change.filePath);
    }
  }

  /**
   * Detect conflicts for a file
   */
  detectConflicts(filePath: string): Conflict | null {
    const changes = this.pendingChanges.get(filePath);
    if (!changes || changes.length < 2) return null;

    // Check if changes overlap
    const hasOverlap = this.checkForOverlap(changes);
    
    if (!hasOverlap) {
      // No conflict, changes are compatible
      return null;
    }

    const conflict: Conflict = {
      id: `conflict_${++this.conflictCounter}`,
      filePath,
      type: this.determineConflictType(changes),
      severity: this.determineSeverity(changes),
      changes,
      createdAt: new Date(),
    };

    this.conflicts.push(conflict);
    logger.warn('Conflict detected', { 
      id: conflict.id, 
      file: filePath,
      severity: conflict.severity,
    });

    return conflict;
  }

  /**
   * Attempt automatic resolution
   */
  autoResolve(conflictId: string): Resolution | null {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (!conflict) return null;

    if (conflict.severity !== 'auto_resolvable') {
      logger.info('Conflict requires manual resolution', { id: conflictId });
      return null;
    }

    // Try git-style merge
    const mergeResult = this.attemptMerge(conflict.changes);
    
    if (mergeResult.success && !mergeResult.hasConflicts) {
      const resolution: Resolution = {
        type: 'merge',
        result: mergeResult.mergedContent,
        resolvedBy: 'auto',
      };

      conflict.resolution = resolution;
      conflict.resolvedAt = new Date();

      logger.info('Conflict auto-resolved', { id: conflictId });
      return resolution;
    }

    return null;
  }

  /**
   * Manually resolve a conflict
   */
  manualResolve(
    conflictId: string,
    resolution: Omit<Resolution, 'resolvedBy'>
  ): boolean {
    const conflict = this.conflicts.find(c => c.id === conflictId);
    if (!conflict) return false;

    conflict.resolution = {
      ...resolution,
      resolvedBy: 'user',
    };
    conflict.resolvedAt = new Date();

    // Clear pending changes for this file
    this.pendingChanges.delete(conflict.filePath);

    logger.info('Conflict manually resolved', { id: conflictId, type: resolution.type });
    return true;
  }

  /**
   * Rollback changes for a file
   */
  rollback(filePath: string, toChangeId?: string): FileChange | null {
    const changes = this.pendingChanges.get(filePath);
    if (!changes || changes.length === 0) return null;

    if (toChangeId) {
      const index = changes.findIndex(c => c.agentId === toChangeId);
      if (index >= 0) {
        const keep = changes.slice(0, index + 1);
        this.pendingChanges.set(filePath, keep);
        logger.info('Rolled back to specific change', { file: filePath, changeId: toChangeId });
        return keep[keep.length - 1];
      }
    }

    // Rollback to original
    const original = changes[0];
    this.pendingChanges.set(filePath, [original]);
    logger.info('Rolled back to original', { file: filePath });
    return original;
  }

  /**
   * Get all conflicts
   */
  getConflicts(filter?: { resolved?: boolean; severity?: Conflict['severity'] }): Conflict[] {
    let result = [...this.conflicts];

    if (filter?.resolved !== undefined) {
      result = result.filter(c => (c.resolvedAt !== undefined) === filter.resolved);
    }
    if (filter?.severity) {
      result = result.filter(c => c.severity === filter.severity);
    }

    return result;
  }

  /**
   * Get conflict by ID
   */
  getConflict(id: string): Conflict | undefined {
    return this.conflicts.find(c => c.id === id);
  }

  /**
   * Get pending changes for a file
   */
  getPendingChanges(filePath: string): FileChange[] {
    return this.pendingChanges.get(filePath) || [];
  }

  /**
   * Get all affected files
   */
  getAffectedFiles(): string[] {
    return Array.from(this.pendingChanges.keys());
  }

  /**
   * Generate conflict diff
   */
  generateDiff(conflict: Conflict): string {
    const lines: string[] = [`=== Conflict: ${conflict.filePath} ===`];
    
    for (let i = 0; i < conflict.changes.length; i++) {
      const change = conflict.changes[i];
      lines.push(`\n--- Change ${i + 1} (${change.agentId}) ---`);
      lines.push(change.newContent.slice(0, 200) + '...');
    }

    return lines.join('\n');
  }

  // Private helpers

  private checkForOverlap(changes: FileChange[]): boolean {
    for (let i = 0; i < changes.length; i++) {
      for (let j = i + 1; j < changes.length; j++) {
        const a = changes[i];
        const b = changes[j];

        // If both modify the same line ranges, it's a conflict
        if (a.lineRange && b.lineRange) {
          if (a.lineRange.start <= b.lineRange.end && 
              b.lineRange.start <= a.lineRange.end) {
            return true;
          }
        } else if (a.newContent !== b.newContent) {
          // Different content without line ranges = conflict
          return true;
        }
      }
    }
    return false;
  }

  private determineConflictType(changes: FileChange[]): Conflict['type'] {
    const hasDelete = changes.some(c => c.changeType === 'delete');
    const hasCreate = changes.some(c => c.changeType === 'create');

    if (hasDelete || hasCreate) {
      return 'structural';
    }

    // Check if changes are in different functions/sections
    return 'content';
  }

  private determineSeverity(changes: FileChange[]): Conflict['severity'] {
    // Simple heuristic: non-overlapping line ranges can be auto-resolved
    if (changes.every(c => c.lineRange)) {
      let canAutoResolve = true;
      for (let i = 0; i < changes.length && canAutoResolve; i++) {
        for (let j = i + 1; j < changes.length; j++) {
          const a = changes[i].lineRange!;
          const b = changes[j].lineRange!;
          if (a.start <= b.end && b.start <= a.end) {
            canAutoResolve = false;
            break;
          }
        }
      }
      if (canAutoResolve) return 'auto_resolvable';
    }

    return 'needs_review';
  }

  private attemptMerge(changes: FileChange[]): MergeResult {
    // Sort by line range if available
    const sorted = [...changes].sort((a, b) => 
      (a.lineRange?.start || 0) - (b.lineRange?.start || 0)
    );

    // Simple merge: concatenate non-overlapping changes
    let merged = sorted[0].originalContent || '';
    let hasConflicts = false;

    for (const change of sorted) {
      if (change.lineRange) {
        // Apply change at specific location
        const lines = merged.split('\n');
        const newLines = change.newContent.split('\n');
        lines.splice(change.lineRange.start - 1, 
                     change.lineRange.end - change.lineRange.start + 1, 
                     ...newLines);
        merged = lines.join('\n');
      } else {
        // Full file replacement - conflict
        hasConflicts = true;
        merged = `<<<<<<< ${changes[0].agentId}\n${changes[0].newContent}\n=======\n${change.newContent}\n>>>>>>> ${change.agentId}`;
      }
    }

    return {
      success: !hasConflicts,
      mergedContent: merged,
      hasConflicts,
      conflictMarkers: hasConflicts ? 1 : 0,
    };
  }

  /**
   * Reset system
   */
  reset(): void {
    this.pendingChanges.clear();
    this.conflicts = [];
    this.conflictCounter = 0;
    logger.info('ConflictResolutionSystem reset');
  }
}

export const conflictResolutionSystem = new ConflictResolutionSystem();
