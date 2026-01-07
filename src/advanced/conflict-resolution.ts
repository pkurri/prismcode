/**
 * Conflict Resolution System
 * Issue #206 - Handles file conflicts from parallel agent operations
 */

/**
 * Conflict severity levels
 */
export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Resolution status
 */
export type ResolutionStatus =
  | 'pending'
  | 'auto_resolved'
  | 'manual_required'
  | 'resolved'
  | 'rolled_back';

/**
 * Represents a single conflict between parallel changes
 */
export interface Conflict {
  id: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  originalContent: string;
  changeA: ChangeInfo;
  changeB: ChangeInfo;
  severity: ConflictSeverity;
  status: ResolutionStatus;
  detectedAt: Date;
  resolvedAt?: Date;
  resolution?: Resolution;
}

/**
 * Information about a change
 */
export interface ChangeInfo {
  agentId: string;
  content: string;
  timestamp: Date;
  reason?: string;
}

/**
 * Resolution for a conflict
 */
export interface Resolution {
  type: 'accept_a' | 'accept_b' | 'merge' | 'custom' | 'manual';
  resolvedContent: string;
  resolvedBy: string;
  notes?: string;
}

/**
 * Result of a merge operation
 */
export interface MergeResult {
  success: boolean;
  mergedContent?: string;
  conflicts: Conflict[];
  warnings: string[];
  rollbackAvailable: boolean;
}

/**
 * Audit log entry for tracking changes
 */
export interface ConflictAuditEntry {
  id: string;
  conflictId: string;
  action: 'detected' | 'auto_resolved' | 'manual_resolved' | 'rolled_back';
  timestamp: Date;
  actor: string;
  details: Record<string, unknown>;
}

/**
 * Rollback state for undoing resolutions
 */
export interface RollbackState {
  conflictId: string;
  originalFilePath: string;
  originalContent: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Options for conflict detection
 */
export interface ConflictDetectionOptions {
  ignoreWhitespace: boolean;
  contextLines: number;
  autoResolveSimple: boolean;
  maxAutoResolveComplexity: number;
}

/**
 * Default detection options
 */
const DEFAULT_OPTIONS: ConflictDetectionOptions = {
  ignoreWhitespace: false,
  contextLines: 3,
  autoResolveSimple: true,
  maxAutoResolveComplexity: 5,
};

/**
 * Conflict Resolution System for parallel agent execution
 * Provides Git-style merge, conflict detection, and rollback capabilities
 */
export class ConflictResolver {
  private conflicts: Map<string, Conflict> = new Map();
  private rollbackStates: Map<string, RollbackState> = new Map();
  private auditLog: ConflictAuditEntry[] = [];
  private options: ConflictDetectionOptions;
  private rollbackRetentionMs: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor(options: Partial<ConflictDetectionOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Detect conflicts between two sets of changes to a file
   */
  detectConflicts(
    originalContent: string,
    changeA: ChangeInfo,
    changeB: ChangeInfo,
    filePath: string
  ): Conflict[] {
    const conflicts: Conflict[] = [];
    const originalLines = originalContent.split('\n');
    const linesA = changeA.content.split('\n');
    const linesB = changeB.content.split('\n');

    // Find differing regions
    const regionsA = this.findChangedRegions(originalLines, linesA);
    const regionsB = this.findChangedRegions(originalLines, linesB);

    // Find overlapping regions
    for (const regionA of regionsA) {
      for (const regionB of regionsB) {
        if (this.regionsOverlap(regionA, regionB)) {
          const conflict = this.createConflict(
            filePath,
            originalContent,
            regionA,
            regionB,
            changeA,
            changeB
          );
          conflicts.push(conflict);
          this.conflicts.set(conflict.id, conflict);
          this.addAuditEntry(conflict.id, 'detected', 'system', { regionA, regionB });
        }
      }
    }

    return conflicts;
  }

  /**
   * Find regions that changed between original and new content
   */
  private findChangedRegions(
    original: string[],
    modified: string[]
  ): Array<{ start: number; end: number; content: string[] }> {
    const regions: Array<{ start: number; end: number; content: string[] }> = [];
    let regionStart: number | null = null;
    let regionContent: string[] = [];

    const maxLen = Math.max(original.length, modified.length);

    for (let i = 0; i < maxLen; i++) {
      const origLine = original[i] || '';
      const modLine = modified[i] || '';
      const isDifferent = this.options.ignoreWhitespace
        ? origLine.trim() !== modLine.trim()
        : origLine !== modLine;

      if (isDifferent) {
        if (regionStart === null) {
          regionStart = i;
        }
        regionContent.push(modLine);
      } else {
        if (regionStart !== null) {
          regions.push({
            start: regionStart,
            end: i - 1,
            content: regionContent,
          });
          regionStart = null;
          regionContent = [];
        }
      }
    }

    // Handle trailing region
    if (regionStart !== null) {
      regions.push({
        start: regionStart,
        end: maxLen - 1,
        content: regionContent,
      });
    }

    return regions;
  }

  /**
   * Check if two regions overlap
   */
  private regionsOverlap(
    a: { start: number; end: number },
    b: { start: number; end: number }
  ): boolean {
    return !(a.end < b.start || b.end < a.start);
  }

  /**
   * Create a conflict object
   */
  private createConflict(
    filePath: string,
    originalContent: string,
    regionA: { start: number; end: number; content: string[] },
    regionB: { start: number; end: number; content: string[] },
    changeA: ChangeInfo,
    changeB: ChangeInfo
  ): Conflict {
    const lineStart = Math.min(regionA.start, regionB.start);
    const lineEnd = Math.max(regionA.end, regionB.end);
    const originalLines = originalContent.split('\n');
    const original = originalLines.slice(lineStart, lineEnd + 1).join('\n');

    const severity = this.calculateSeverity(regionA, regionB);

    return {
      id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filePath,
      lineStart,
      lineEnd,
      originalContent: original,
      changeA: {
        ...changeA,
        content: regionA.content.join('\n'),
      },
      changeB: {
        ...changeB,
        content: regionB.content.join('\n'),
      },
      severity,
      status: 'pending',
      detectedAt: new Date(),
    };
  }

  /**
   * Calculate conflict severity based on overlap size
   */
  private calculateSeverity(
    regionA: { start: number; end: number },
    regionB: { start: number; end: number }
  ): ConflictSeverity {
    const overlapStart = Math.max(regionA.start, regionB.start);
    const overlapEnd = Math.min(regionA.end, regionB.end);
    const overlapSize = overlapEnd - overlapStart + 1;

    if (overlapSize > 20) return 'critical';
    if (overlapSize > 10) return 'high';
    if (overlapSize > 5) return 'medium';
    return 'low';
  }

  /**
   * Attempt to auto-resolve a conflict using Git-style 3-way merge
   */
  attemptAutoResolve(conflictId: string): MergeResult {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      return {
        success: false,
        conflicts: [],
        warnings: [`Conflict not found: ${conflictId}`],
        rollbackAvailable: false,
      };
    }

    // Simple auto-resolution: if changes are in non-overlapping parts
    if (conflict.severity === 'low' && this.options.autoResolveSimple) {
      const merged = this.mergeNonOverlapping(conflict);
      if (merged) {
        conflict.status = 'auto_resolved';
        conflict.resolvedAt = new Date();
        conflict.resolution = {
          type: 'merge',
          resolvedContent: merged,
          resolvedBy: 'auto-resolver',
        };
        this.saveRollbackState(conflict);
        this.addAuditEntry(conflictId, 'auto_resolved', 'system', { merged });

        return {
          success: true,
          mergedContent: merged,
          conflicts: [],
          warnings: [],
          rollbackAvailable: true,
        };
      }
    }

    // Mark as requiring manual resolution
    conflict.status = 'manual_required';
    return {
      success: false,
      conflicts: [conflict],
      warnings: ['Auto-resolution not possible, manual intervention required'],
      rollbackAvailable: false,
    };
  }

  /**
   * Merge non-overlapping changes
   */
  private mergeNonOverlapping(conflict: Conflict): string | null {
    // Simple heuristic: if changes are additive, combine them
    const aLines = conflict.changeA.content.split('\n');
    const bLines = conflict.changeB.content.split('\n');
    const origLines = conflict.originalContent.split('\n');

    // If one is a subset of original + additions, merge
    if (aLines.length === origLines.length && bLines.length > origLines.length) {
      return conflict.changeB.content;
    }
    if (bLines.length === origLines.length && aLines.length > origLines.length) {
      return conflict.changeA.content;
    }

    // Both made changes, cannot auto-merge
    return null;
  }

  /**
   * Manually resolve a conflict
   */
  manualResolve(conflictId: string, resolution: Resolution): MergeResult {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      return {
        success: false,
        conflicts: [],
        warnings: [`Conflict not found: ${conflictId}`],
        rollbackAvailable: false,
      };
    }

    this.saveRollbackState(conflict);

    conflict.status = 'resolved';
    conflict.resolvedAt = new Date();
    conflict.resolution = resolution;

    this.addAuditEntry(conflictId, 'manual_resolved', resolution.resolvedBy, {
      type: resolution.type,
    });

    return {
      success: true,
      mergedContent: resolution.resolvedContent,
      conflicts: [],
      warnings: [],
      rollbackAvailable: true,
    };
  }

  /**
   * Accept change A
   */
  acceptChangeA(conflictId: string, resolvedBy: string): MergeResult {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      return {
        success: false,
        conflicts: [],
        warnings: [`Conflict not found: ${conflictId}`],
        rollbackAvailable: false,
      };
    }

    return this.manualResolve(conflictId, {
      type: 'accept_a',
      resolvedContent: conflict.changeA.content,
      resolvedBy,
      notes: `Accepted change from agent ${conflict.changeA.agentId}`,
    });
  }

  /**
   * Accept change B
   */
  acceptChangeB(conflictId: string, resolvedBy: string): MergeResult {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      return {
        success: false,
        conflicts: [],
        warnings: [`Conflict not found: ${conflictId}`],
        rollbackAvailable: false,
      };
    }

    return this.manualResolve(conflictId, {
      type: 'accept_b',
      resolvedContent: conflict.changeB.content,
      resolvedBy,
      notes: `Accepted change from agent ${conflict.changeB.agentId}`,
    });
  }

  /**
   * Save rollback state for a conflict
   */
  private saveRollbackState(conflict: Conflict): void {
    const state: RollbackState = {
      conflictId: conflict.id,
      originalFilePath: conflict.filePath,
      originalContent: conflict.originalContent,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.rollbackRetentionMs),
    };
    this.rollbackStates.set(conflict.id, state);
  }

  /**
   * Rollback a resolved conflict
   */
  rollback(conflictId: string): { success: boolean; originalContent?: string; error?: string } {
    const state = this.rollbackStates.get(conflictId);
    if (!state) {
      return { success: false, error: 'No rollback state available' };
    }

    if (new Date() > state.expiresAt) {
      this.rollbackStates.delete(conflictId);
      return { success: false, error: 'Rollback state has expired' };
    }

    const conflict = this.conflicts.get(conflictId);
    if (conflict) {
      conflict.status = 'rolled_back';
    }

    this.addAuditEntry(conflictId, 'rolled_back', 'system', {});
    this.rollbackStates.delete(conflictId);

    return { success: true, originalContent: state.originalContent };
  }

  /**
   * Add audit log entry
   */
  private addAuditEntry(
    conflictId: string,
    action: ConflictAuditEntry['action'],
    actor: string,
    details: Record<string, unknown>
  ): void {
    this.auditLog.push({
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conflictId,
      action,
      timestamp: new Date(),
      actor,
      details,
    });
  }

  /**
   * Get conflict by ID
   */
  getConflict(conflictId: string): Conflict | undefined {
    return this.conflicts.get(conflictId);
  }

  /**
   * Get all pending conflicts
   */
  getPendingConflicts(): Conflict[] {
    return Array.from(this.conflicts.values()).filter(
      (c) => c.status === 'pending' || c.status === 'manual_required'
    );
  }

  /**
   * Get audit log for a conflict
   */
  getAuditLog(conflictId?: string): ConflictAuditEntry[] {
    if (conflictId) {
      return this.auditLog.filter((e) => e.conflictId === conflictId);
    }
    return [...this.auditLog];
  }

  /**
   * Generate conflict markers (Git-style)
   */
  generateConflictMarkers(conflict: Conflict): string {
    return `<<<<<<< ${conflict.changeA.agentId}
${conflict.changeA.content}
=======
${conflict.changeB.content}
>>>>>>> ${conflict.changeB.agentId}`;
  }

  /**
   * Clear resolved conflicts older than specified age
   */
  cleanupOldConflicts(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): number {
    const cutoff = new Date(Date.now() - maxAgeMs);
    let removed = 0;

    for (const [id, conflict] of this.conflicts) {
      if (conflict.resolvedAt && conflict.resolvedAt < cutoff) {
        this.conflicts.delete(id);
        removed++;
      }
    }

    return removed;
  }
}

/**
 * Singleton instance for convenience
 */
export const conflictResolver = new ConflictResolver();
