/**
 * Config Export/Import Service
 * Issue #137: Export/Import Config
 *
 * Configuration backup and restore functionality
 */

import logger from '../utils/logger';

export interface ConfigExport {
  id: string;
  name: string;
  version: string;
  exportedAt: Date;
  config: Record<string, unknown>;
  metadata: {
    exportedBy: string;
    format: 'json' | 'yaml';
    checksum: string;
  };
}

export interface ConfigImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  warnings: string[];
}

/**
 * Config Manager
 * Handles configuration export and import
 */
export class ConfigManager {
  private config: Map<string, unknown> = new Map();
  private exports: Map<string, ConfigExport> = new Map();
  private version: string = '1.0.0';

  constructor() {
    this.initializeDefaults();
    logger.info('ConfigManager initialized');
  }

  /**
   * Initialize default configuration
   */
  private initializeDefaults(): void {
    this.config.set('app.name', 'PrismCode');
    this.config.set('app.version', '0.1.0');
    this.config.set('agents.enabled', true);
    this.config.set('analytics.enabled', true);
    this.config.set('notifications.email', true);
    this.config.set('notifications.slack', false);
  }

  /**
   * Get a config value
   */
  get<T>(key: string): T | undefined {
    return this.config.get(key) as T | undefined;
  }

  /**
   * Set a config value
   */
  set(key: string, value: unknown): void {
    this.config.set(key, value);
    logger.debug('Config set', { key });
  }

  /**
   * Get all config as object
   */
  getAll(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of this.config) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Export configuration
   */
  exportConfig(name: string, exportedBy: string = 'system'): ConfigExport {
    const id = `export_${Date.now()}`;
    const config = this.getAll();

    const configExport: ConfigExport = {
      id,
      name,
      version: this.version,
      exportedAt: new Date(),
      config,
      metadata: {
        exportedBy,
        format: 'json',
        checksum: this.calculateChecksum(config),
      },
    };

    this.exports.set(id, configExport);
    logger.info('Config exported', { id, name });

    return configExport;
  }

  /**
   * Calculate checksum for config
   */
  private calculateChecksum(config: Record<string, unknown>): string {
    const str = JSON.stringify(config);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Import configuration
   */
  importConfig(
    exportData: ConfigExport,
    options: { overwrite?: boolean; merge?: boolean } = {}
  ): ConfigImportResult {
    const result: ConfigImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: [],
      warnings: [],
    };

    // Validate checksum
    const calculatedChecksum = this.calculateChecksum(exportData.config);
    if (calculatedChecksum !== exportData.metadata.checksum) {
      result.warnings.push('Checksum mismatch - config may have been modified');
    }

    // Import each config key
    for (const [key, value] of Object.entries(exportData.config)) {
      const existing = this.config.has(key);

      if (existing && !options.overwrite && !options.merge) {
        result.skipped++;
        continue;
      }

      try {
        this.config.set(key, value);
        result.imported++;
      } catch {
        result.errors.push(`Failed to import key: ${key}`);
        result.success = false;
      }
    }

    logger.info('Config imported', {
      imported: result.imported,
      skipped: result.skipped,
    });

    return result;
  }

  /**
   * Get export history
   */
  getExportHistory(): ConfigExport[] {
    return Array.from(this.exports.values()).sort(
      (a, b) => b.exportedAt.getTime() - a.exportedAt.getTime()
    );
  }

  /**
   * Get export by ID
   */
  getExport(id: string): ConfigExport | undefined {
    return this.exports.get(id);
  }

  /**
   * Delete export
   */
  deleteExport(id: string): boolean {
    return this.exports.delete(id);
  }

  /**
   * Restore from export
   */
  restoreFromExport(id: string): ConfigImportResult | null {
    const exportData = this.exports.get(id);
    if (!exportData) return null;

    return this.importConfig(exportData, { overwrite: true });
  }

  /**
   * Compare configs
   */
  compareConfigs(
    exportId1: string,
    exportId2: string
  ): { added: string[]; removed: string[]; changed: string[] } | null {
    const export1 = this.exports.get(exportId1);
    const export2 = this.exports.get(exportId2);

    if (!export1 || !export2) return null;

    const keys1 = new Set(Object.keys(export1.config));
    const keys2 = new Set(Object.keys(export2.config));

    const added = [...keys2].filter((k) => !keys1.has(k));
    const removed = [...keys1].filter((k) => !keys2.has(k));
    const changed = [...keys1]
      .filter((k) => keys2.has(k))
      .filter((k) => JSON.stringify(export1.config[k]) !== JSON.stringify(export2.config[k]));

    return { added, removed, changed };
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.config.clear();
    this.exports.clear();
    this.initializeDefaults();
    logger.info('ConfigManager reset');
  }
}

// Export singleton
export const configManager = new ConfigManager();
