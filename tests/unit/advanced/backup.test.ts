/**
 * Backup System Tests
 * Tests for Issue #138
 */

import { BackupManager } from '../../../src/advanced/backup';

describe('BackupManager', () => {
  let manager: BackupManager;

  beforeEach(() => {
    manager = new BackupManager();
    manager.reset();
  });

  describe('createBackup', () => {
    it('should create a backup', () => {
      manager.setData('key1', 'value1');
      const backup = manager.createBackup('Test Backup');

      expect(backup.id).toBeDefined();
      expect(backup.name).toBe('Test Backup');
      expect(backup.status).toBe('completed');
      expect(backup.items).toBe(1);
    });

    it('should create different backup types', () => {
      const full = manager.createBackup('Full', 'full');
      const incremental = manager.createBackup('Incremental', 'incremental');

      expect(full.type).toBe('full');
      expect(incremental.type).toBe('incremental');
    });
  });

  describe('restore', () => {
    it('should restore from backup', () => {
      manager.setData('key1', 'original');
      const backup = manager.createBackup('Backup');

      manager.setData('key1', 'changed');
      const result = manager.restore(backup.id);

      expect(result.success).toBe(true);
      expect(manager.getData('key1')).toBe('original');
    });

    it('should fail for unknown backup', () => {
      const result = manager.restore('unknown');
      expect(result.success).toBe(false);
    });
  });

  describe('listBackups', () => {
    it('should list all backups', () => {
      manager.createBackup('Backup 1');
      manager.createBackup('Backup 2');

      const backups = manager.listBackups();
      expect(backups.length).toBe(2);
    });
  });

  describe('deleteBackup', () => {
    it('should delete a backup', () => {
      const backup = manager.createBackup('Delete Me');
      const deleted = manager.deleteBackup(backup.id);

      expect(deleted).toBe(true);
      expect(manager.listBackups().length).toBe(0);
    });
  });

  describe('schedules', () => {
    it('should create backup schedule', () => {
      const schedule = manager.createSchedule('Daily', 'full', '0 0 * * *');

      expect(schedule.id).toBeDefined();
      expect(schedule.name).toBe('Daily');
      expect(schedule.isActive).toBe(true);
    });

    it('should list schedules', () => {
      manager.createSchedule('Daily', 'full', '0 0 * * *');
      manager.createSchedule('Weekly', 'incremental', '0 0 * * 0');

      const schedules = manager.listSchedules();
      expect(schedules.length).toBe(2);
    });

    it('should update schedule', () => {
      const schedule = manager.createSchedule('Test', 'full', '* * * * *');
      manager.updateSchedule(schedule.id, { isActive: false });

      const updated = manager.listSchedules().find((s) => s.id === schedule.id);
      expect(updated?.isActive).toBe(false);
    });

    it('should delete schedule', () => {
      const schedule = manager.createSchedule('Delete', 'full', '* * * * *');
      manager.deleteSchedule(schedule.id);

      expect(manager.listSchedules().length).toBe(0);
    });
  });
});
