/**
 * API Key Management Service
 * Issue #134: API Key Management
 *
 * Secure API key storage and management
 */

import logger from '../utils/logger';
import { randomBytes, createHash } from 'crypto';

export interface APIKey {
  id: string;
  name: string;
  keyHash: string;
  prefix: string;
  scopes: string[];
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface APIKeyCreateResult {
  id: string;
  name: string;
  key: string; // Only returned once at creation
  prefix: string;
  scopes: string[];
  expiresAt: Date | null;
}

export interface APIKeyUsageStats {
  keyId: string;
  totalCalls: number;
  last24Hours: number;
  last7Days: number;
  lastUsed: Date | null;
}

/**
 * API Key Manager
 * Manages secure API key lifecycle
 */
export class APIKeyManager {
  private keys: Map<string, APIKey> = new Map();
  private usageCount: Map<string, number> = new Map();

  constructor() {
    logger.info('APIKeyManager initialized');
  }

  /**
   * Create a new API key
   */
  createKey(
    name: string,
    scopes: string[] = ['read'],
    expiresInDays?: number,
    metadata?: Record<string, unknown>
  ): APIKeyCreateResult {
    const id = `key_${Date.now()}_${randomBytes(8).toString('hex')}`;
    const rawKey = `pk_${randomBytes(32).toString('hex')}`;
    const prefix = rawKey.substring(0, 10);
    const keyHash = this.hashKey(rawKey);

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const apiKey: APIKey = {
      id,
      name,
      keyHash,
      prefix,
      scopes,
      createdAt: new Date(),
      lastUsedAt: null,
      expiresAt,
      isActive: true,
      metadata,
    };

    this.keys.set(id, apiKey);
    this.usageCount.set(id, 0);

    logger.info('API key created', { id, name, scopes });

    return {
      id,
      name,
      key: rawKey, // Only returned once
      prefix,
      scopes,
      expiresAt,
    };
  }

  /**
   * Hash a key for storage
   */
  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  /**
   * Validate an API key
   */
  validateKey(rawKey: string): { valid: boolean; key?: APIKey; reason?: string } {
    const keyHash = this.hashKey(rawKey);

    for (const [, apiKey] of this.keys) {
      if (apiKey.keyHash === keyHash) {
        if (!apiKey.isActive) {
          return { valid: false, reason: 'Key is deactivated' };
        }
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
          return { valid: false, reason: 'Key has expired' };
        }

        // Update last used
        apiKey.lastUsedAt = new Date();
        this.usageCount.set(apiKey.id, (this.usageCount.get(apiKey.id) || 0) + 1);

        return { valid: true, key: apiKey };
      }
    }

    return { valid: false, reason: 'Invalid key' };
  }

  /**
   * Check if key has required scope
   */
  hasScope(key: APIKey, requiredScope: string): boolean {
    return key.scopes.includes(requiredScope) || key.scopes.includes('admin');
  }

  /**
   * Get all keys (without hashes)
   */
  listKeys(): Omit<APIKey, 'keyHash'>[] {
    return Array.from(this.keys.values()).map(({ keyHash: _keyHash, ...key }) => key);
  }

  /**
   * Get a key by ID
   */
  getKey(id: string): Omit<APIKey, 'keyHash'> | undefined {
    const key = this.keys.get(id);
    if (key) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { keyHash: _keyHash, ...safeKey } = key;
      return safeKey;
    }
    return undefined;
  }

  /**
   * Revoke a key
   */
  revokeKey(id: string): boolean {
    const key = this.keys.get(id);
    if (key) {
      key.isActive = false;
      logger.info('API key revoked', { id });
      return true;
    }
    return false;
  }

  /**
   * Delete a key
   */
  deleteKey(id: string): boolean {
    const deleted = this.keys.delete(id);
    if (deleted) {
      this.usageCount.delete(id);
      logger.info('API key deleted', { id });
    }
    return deleted;
  }

  /**
   * Rotate a key (create new, revoke old)
   */
  rotateKey(id: string): APIKeyCreateResult | null {
    const oldKey = this.keys.get(id);
    if (!oldKey) return null;

    // Revoke old key
    oldKey.isActive = false;

    // Create new key with same settings
    const newKey = this.createKey(
      oldKey.name,
      oldKey.scopes,
      oldKey.expiresAt
        ? Math.ceil((oldKey.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
        : undefined,
      oldKey.metadata
    );

    logger.info('API key rotated', { oldId: id, newId: newKey.id });
    return newKey;
  }

  /**
   * Get usage statistics for a key
   */
  getKeyUsage(id: string): APIKeyUsageStats | undefined {
    const key = this.keys.get(id);
    if (!key) return undefined;

    return {
      keyId: id,
      totalCalls: this.usageCount.get(id) || 0,
      last24Hours: 0, // Would need time-based tracking
      last7Days: 0,
      lastUsed: key.lastUsedAt,
    };
  }

  /**
   * Update key scopes
   */
  updateScopes(id: string, scopes: string[]): boolean {
    const key = this.keys.get(id);
    if (key) {
      key.scopes = scopes;
      logger.info('API key scopes updated', { id, scopes });
      return true;
    }
    return false;
  }

  /**
   * Get active keys count
   */
  getActiveKeysCount(): number {
    return Array.from(this.keys.values()).filter((k) => k.isActive).length;
  }

  /**
   * Reset manager
   */
  reset(): void {
    this.keys.clear();
    this.usageCount.clear();
    logger.info('APIKeyManager reset');
  }
}

// Export singleton
export const apiKeyManager = new APIKeyManager();
