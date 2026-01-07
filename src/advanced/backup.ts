/**
 * Backup System Service
 * Issue #138: Backup System
 *
 * Automated backup and recovery functionality
 */

import logger from '../utils/logger';

export interface BackupMetadata {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  size: number;
  items: number;
  checksum?: string;
  retentionDays: number;
}

export interface BackupSchedule {
  id: string;
  name: string;
  type: BackupMetadata['type'];
  cronExpression: string;
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  retentionDays: number;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: Record<string, unknown>;
}

export interface RestoreResult {
  success: boolean;
  restoredItems: number;
  errors: string[];
  duration: number;
}

/**
 * Backup Manager
 * Handles backup creation, scheduling, and restoration
 */
export class BackupManager {
  private backups: Map<string, BackupData> = new Map();
  private schedules: Map<string, BackupSchedule> = new Map();
  private dataStore: Map<string, unknown> = new Map();

  constructor() {
    logger.info('BackupManager initialized');
  }

  /**
   * Create a backup
   */
  createBackup(
    name: string,
    type: BackupMetadata['type'] = 'full',
    retentionDays: number = 30
  ): BackupMetadata {
    const id = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const metadata: BackupMetadata = {
      id,
      name,
      type,
      status: 'running',
      createdAt: new Date(),
      size: 0,
      items: 0,
      retentionDays,
    };

    // Simulate backup process
    const data = this.collectBackupData();
    const backup: BackupData = { metadata, data };

    metadata.items = Object.keys(data).length;
    metadata.size = JSON.stringify(data).length;
    metadata.checksum = this.calculateChecksum(data);
    metadata.status = 'completed';
    metadata.completedAt = new Date();

    this.backups.set(id, backup);
    this.cleanExpiredBackups();

    logger.info('Backup created', { id, name, items: metadata.items });

    return metadata;
  }

  /**
   * Collect data for backup
   */
  private collectBackupData(): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    for (const [key, value] of this.dataStore) {
      data[key] = value;
    }
    return data;
  }

  /**
   * Calculate checksum
   */
  private calculateChecksum(data: Record<string, unknown>): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Clean expired backups
   */
  private cleanExpiredBackups(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, backup] of this.backups) {
      const expiresAt =
        backup.metadata.createdAt.getTime() + backup.metadata.retentionDays * 24 * 60 * 60 * 1000;

      if (now > expiresAt) {
        this.backups.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info('Expired backups cleaned', { count: cleaned });
    }

    return cleaned;
  }

  /**
   * Restore from backup
   */
  restore(backupId: string): RestoreResult {
    const startTime = Date.now();
    const backup = this.backups.get(backupId);

    if (!backup) {
      return {
        success: false,
        restoredItems: 0,
        errors: ['Backup not found'],
        duration: Date.now() - startTime,
      };
    }

    // Validate checksum
    const currentChecksum = this.calculateChecksum(backup.data);
    if (currentChecksum !== backup.metadata.checksum) {
      return {
        success: false,
        restoredItems: 0,
        errors: ['Backup data corrupted - checksum mismatch'],
        duration: Date.now() - startTime,
      };
    }

    // Restore data
    const errors: string[] = [];
    let restoredItems = 0;

    for (const [key, value] of Object.entries(backup.data)) {
      try {
        this.dataStore.set(key, value);
        restoredItems++;
      } catch {
        errors.push(`Failed to restore: ${key}`);
      }
    }

    logger.info('Backup restored', { backupId, restoredItems });

    return {
      success: errors.length === 0,
      restoredItems,
      errors,
      duration: Date.now() - startTime,
    };
  }

  /**
   * List backups
   */
  listBackups(): BackupMetadata[] {
    return Array.from(this.backups.values())
      .map((b) => b.metadata)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get backup details
   */
  getBackup(id: string): BackupData | undefined {
    return this.backups.get(id);
  }

  /**
   * Delete backup
   */
  deleteBackup(id: string): boolean {
    const deleted = this.backups.delete(id);
    if (deleted) {
      logger.info('Backup deleted', { id });
    }
    return deleted;
  }

  /**
   * Create backup schedule
   */
  createSchedule(
    name: string,
    type: BackupMetadata['type'],
    cronExpression: string,
    retentionDays: number = 30
  ): BackupSchedule {
    const id = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const schedule: BackupSchedule = {
      id,
      name,
      type,
      cronExpression,
      isActive: true,
      retentionDays,
    };

    this.schedules.set(id, schedule);
    logger.info('Backup schedule created', { id, name, cronExpression });

    return schedule;
  }

  /**
   * List schedules
   */
  listSchedules(): BackupSchedule[] {
    return Array.from(this.schedules.values());
  }

  /**
   * Update schedule
   */
  updateSchedule(id: string, updates: Partial<BackupSchedule>): boolean {
    const schedule = this.schedules.get(id);
    if (schedule) {
      Object.assign(schedule, updates);
      return true;
    }
    return false;
  }

  /**
   * Delete schedule
   */
  deleteSchedule(id: string): boolean {
    return this.schedules.delete(id);
  }

  /**
   * Set data for backup (for testing)
   */
  setData(key: string, value: unknown): void {
    this.dataStore.set(key, value);
  }

  /**
   * Get data
   */
  getData(key: string): unknown {
    return this.dataStore.get(key);
  }

  /**
   * Reset manager
   */
  reset(): void {
    this.backups.clear();
    this.schedules.clear();
    this.dataStore.clear();
    logger.info('BackupManager reset');
  }
}

// Export singleton
export const backupManager = new BackupManager();
