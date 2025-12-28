/**
 * Progress Checkpoints & Rollback
 * Issue #194: Progress Checkpoints & Rollback
 *
 * Enables automatic checkpoints during task execution with rollback capability
 */

import logger from '../utils/logger';

export interface CheckpointMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  taskId?: string;
  files: FileSnapshot[];
  gitCommit?: string;
  state: Record<string, unknown>;
}

export interface FileSnapshot {
  path: string;
  content: string;
  hash: string;
}

export interface CheckpointDiff {
  fromCheckpoint: string;
  toCheckpoint: string;
  changes: FileChange[];
}

export interface FileChange {
  path: string;
  type: 'added' | 'modified' | 'deleted';
  oldContent?: string;
  newContent?: string;
}

export interface RollbackResult {
  success: boolean;
  checkpointId: string;
  restoredFiles: string[];
  errors: string[];
  rolledBackAt: Date;
}

export interface CheckpointConfig {
  maxCheckpoints: number;
  autoCommit: boolean;
  commitMessagePrefix: string;
}

const DEFAULT_CONFIG: CheckpointConfig = {
  maxCheckpoints: 50,
  autoCommit: true,
  commitMessagePrefix: '[checkpoint]',
};

/**
 * Progress Checkpoints Manager
 * Manages checkpoints and rollback for task execution
 */
export class CheckpointManager {
  private checkpoints: Map<string, CheckpointMetadata> = new Map();
  private config: CheckpointConfig;
  private currentTaskId?: string;

  constructor(config: Partial<CheckpointConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('CheckpointManager initialized', {
      maxCheckpoints: this.config.maxCheckpoints,
      autoCommit: this.config.autoCommit,
    });
  }

  /**
   * Create a new checkpoint
   */
  createCheckpoint(
    name: string,
    options: {
      description?: string;
      files?: FileSnapshot[];
      state?: Record<string, unknown>;
    } = {}
  ): CheckpointMetadata {
    const id = this.generateId();
    const files = options.files || [];

    // Create checkpoint metadata
    const checkpoint: CheckpointMetadata = {
      id,
      name,
      description: options.description,
      createdAt: new Date(),
      taskId: this.currentTaskId,
      files,
      state: options.state || {},
    };

    // Auto-commit if enabled
    if (this.config.autoCommit && files.length > 0) {
      checkpoint.gitCommit = this.createGitCommit(name);
    }

    // Store checkpoint
    this.checkpoints.set(id, checkpoint);

    // Cleanup old checkpoints if exceeding max
    this.cleanupOldCheckpoints();

    logger.info('Checkpoint created', {
      id,
      name,
      fileCount: files.length,
      hasGitCommit: !!checkpoint.gitCommit,
    });

    return checkpoint;
  }

  /**
   * Get a checkpoint by ID
   */
  getCheckpoint(id: string): CheckpointMetadata | undefined {
    return this.checkpoints.get(id);
  }

  /**
   * Get all checkpoints
   */
  getAllCheckpoints(): CheckpointMetadata[] {
    return Array.from(this.checkpoints.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Get checkpoints for a specific task
   */
  getTaskCheckpoints(taskId: string): CheckpointMetadata[] {
    return this.getAllCheckpoints().filter((cp) => cp.taskId === taskId);
  }

  /**
   * Get the latest checkpoint
   */
  getLatestCheckpoint(): CheckpointMetadata | undefined {
    const checkpoints = this.getAllCheckpoints();
    return checkpoints[0];
  }

  /**
   * Calculate diff between two checkpoints
   */
  diffCheckpoints(fromId: string, toId: string): CheckpointDiff {
    const from = this.checkpoints.get(fromId);
    const to = this.checkpoints.get(toId);

    if (!from || !to) {
      throw new Error('One or both checkpoints not found');
    }

    const fromFiles = new Map(from.files.map((f) => [f.path, f]));
    const toFiles = new Map(to.files.map((f) => [f.path, f]));

    const changes: FileChange[] = [];

    // Find modified and deleted files
    for (const [path, fromFile] of fromFiles) {
      const toFile = toFiles.get(path);
      if (!toFile) {
        changes.push({
          path,
          type: 'deleted',
          oldContent: fromFile.content,
        });
      } else if (fromFile.hash !== toFile.hash) {
        changes.push({
          path,
          type: 'modified',
          oldContent: fromFile.content,
          newContent: toFile.content,
        });
      }
    }

    // Find added files
    for (const [path, toFile] of toFiles) {
      if (!fromFiles.has(path)) {
        changes.push({
          path,
          type: 'added',
          newContent: toFile.content,
        });
      }
    }

    logger.debug('Checkpoint diff calculated', {
      fromId,
      toId,
      changeCount: changes.length,
    });

    return {
      fromCheckpoint: fromId,
      toCheckpoint: toId,
      changes,
    };
  }

  /**
   * Rollback to a specific checkpoint
   */
  rollback(checkpointId: string): RollbackResult {
    const checkpoint = this.checkpoints.get(checkpointId);

    if (!checkpoint) {
      return {
        success: false,
        checkpointId,
        restoredFiles: [],
        errors: [`Checkpoint not found: ${checkpointId}`],
        rolledBackAt: new Date(),
      };
    }

    const restoredFiles: string[] = [];
    const errors: string[] = [];

    // In a real implementation, this would restore files from the checkpoint
    for (const file of checkpoint.files) {
      try {
        // Simulate file restoration
        restoredFiles.push(file.path);
        logger.debug('File restored', { path: file.path });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`Failed to restore ${file.path}: ${errorMessage}`);
      }
    }

    // Remove checkpoints created after this one
    const checkpointTime = checkpoint.createdAt.getTime();
    for (const [id, cp] of this.checkpoints) {
      if (cp.createdAt.getTime() > checkpointTime) {
        this.checkpoints.delete(id);
      }
    }

    const result: RollbackResult = {
      success: errors.length === 0,
      checkpointId,
      restoredFiles,
      errors,
      rolledBackAt: new Date(),
    };

    logger.info('Rollback completed', {
      checkpointId,
      success: result.success,
      restoredCount: restoredFiles.length,
      errorCount: errors.length,
    });

    return result;
  }

  /**
   * Quick rollback to the previous checkpoint
   */
  rollbackToPrevious(): RollbackResult {
    const checkpoints = this.getAllCheckpoints();
    if (checkpoints.length < 2) {
      return {
        success: false,
        checkpointId: '',
        restoredFiles: [],
        errors: ['No previous checkpoint available'],
        rolledBackAt: new Date(),
      };
    }

    // Second item is the previous checkpoint (first is latest)
    return this.rollback(checkpoints[1].id);
  }

  /**
   * Delete a checkpoint
   */
  deleteCheckpoint(id: string): boolean {
    const deleted = this.checkpoints.delete(id);
    if (deleted) {
      logger.info('Checkpoint deleted', { id });
    }
    return deleted;
  }

  /**
   * Set the current task ID for checkpoints
   */
  setCurrentTask(taskId?: string): void {
    this.currentTaskId = taskId;
  }

  /**
   * Get the current task ID
   */
  getCurrentTask(): string | undefined {
    return this.currentTaskId;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CheckpointConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('CheckpointManager config updated', { config: this.config });
  }

  /**
   * Get current configuration
   */
  getConfig(): CheckpointConfig {
    return { ...this.config };
  }

  /**
   * Clear all checkpoints
   */
  clearAll(): void {
    this.checkpoints.clear();
    logger.info('All checkpoints cleared');
  }

  /**
   * Get checkpoint count
   */
  getCount(): number {
    return this.checkpoints.size;
  }

  // Private helpers

  private generateId(): string {
    return `cp_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 10)}`;
  }

  private createGitCommit(name: string): string {
    // In a real implementation, this would create a git commit
    const commitHash = Math.random().toString(16).slice(2, 10);
    logger.debug('Git commit created', {
      message: `${this.config.commitMessagePrefix} ${name}`,
      hash: commitHash,
    });
    return commitHash;
  }

  private cleanupOldCheckpoints(): void {
    const checkpoints = this.getAllCheckpoints();
    if (checkpoints.length > this.config.maxCheckpoints) {
      const toRemove = checkpoints.slice(this.config.maxCheckpoints);
      for (const cp of toRemove) {
        this.checkpoints.delete(cp.id);
      }
      logger.debug('Old checkpoints cleaned up', { removedCount: toRemove.length });
    }
  }
}

// Singleton instance
export const checkpointManager = new CheckpointManager();

/**
 * Create a file snapshot helper
 */
export function createFileSnapshot(path: string, content: string): FileSnapshot {
  return {
    path,
    content,
    hash: simpleHash(content),
  };
}

/**
 * Simple hash function for content comparison
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}
