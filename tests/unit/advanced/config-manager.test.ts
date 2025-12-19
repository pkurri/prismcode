/**
 * Config Manager Tests
 * Tests for Issue #137
 */

import { ConfigManager } from '../../../src/advanced/config-manager';

describe('ConfigManager', () => {
  let manager: ConfigManager;

  beforeEach(() => {
    manager = new ConfigManager();
    manager.reset();
  });

  describe('get/set', () => {
    it('should set and get config values', () => {
      manager.set('test.key', 'value');
      expect(manager.get('test.key')).toBe('value');
    });

    it('should return undefined for missing keys', () => {
      expect(manager.get('nonexistent')).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('should return all config as object', () => {
      const all = manager.getAll();
      expect(all['app.name']).toBe('PrismCode');
    });
  });

  describe('exportConfig', () => {
    it('should export configuration', () => {
      manager.set('custom.setting', true);
      const exported = manager.exportConfig('Test Export', 'admin');

      expect(exported.name).toBe('Test Export');
      expect(exported.config['custom.setting']).toBe(true);
      expect(exported.metadata.checksum).toBeDefined();
    });
  });

  describe('importConfig', () => {
    it('should import configuration', () => {
      const exported = manager.exportConfig('Export');
      manager.set('new.key', 'new-value');
      const newExport = manager.exportConfig('New Export');

      manager.reset();
      const result = manager.importConfig(newExport, { overwrite: true });

      expect(result.success).toBe(true);
      expect(result.imported).toBeGreaterThan(0);
    });

    it('should skip existing keys without overwrite', () => {
      manager.set('existing', 'original');
      const exported = {
        id: 'test',
        name: 'Test',
        version: '1.0.0',
        exportedAt: new Date(),
        config: { existing: 'new-value' },
        metadata: {
          exportedBy: 'test',
          format: 'json' as const,
          checksum: '',
        },
      };

      const result = manager.importConfig(exported);
      expect(result.skipped).toBe(1);
    });
  });

  describe('getExportHistory', () => {
    it('should return export history', () => {
      manager.exportConfig('Export 1');
      manager.exportConfig('Export 2');

      const history = manager.getExportHistory();
      expect(history.length).toBe(2);
    });
  });

  describe('restoreFromExport', () => {
    it('should restore from export', () => {
      manager.set('original', 'value');
      const exported = manager.exportConfig('Backup');

      manager.set('original', 'changed');
      manager.restoreFromExport(exported.id);

      expect(manager.get('original')).toBe('value');
    });
  });

  describe('compareConfigs', () => {
    it('should compare two exports', () => {
      const export1 = manager.exportConfig('V1');
      manager.set('new.key', 'value');
      const export2 = manager.exportConfig('V2');

      const diff = manager.compareConfigs(export1.id, export2.id);
      expect(diff?.added).toContain('new.key');
    });
  });
});
