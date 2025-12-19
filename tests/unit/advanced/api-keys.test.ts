/**
 * API Key Management Tests
 * Tests for Issue #134
 */

import { APIKeyManager } from '../../../src/advanced/api-keys';

describe('APIKeyManager', () => {
  let manager: APIKeyManager;

  beforeEach(() => {
    manager = new APIKeyManager();
    manager.reset();
  });

  describe('createKey', () => {
    it('should create a new API key', () => {
      const result = manager.createKey('Test Key', ['read', 'write']);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test Key');
      expect(result.key).toMatch(/^pk_/);
      expect(result.scopes).toEqual(['read', 'write']);
    });

    it('should create key with expiration', () => {
      const result = manager.createKey('Expiring Key', ['read'], 30);

      expect(result.expiresAt).toBeDefined();
      expect(result.expiresAt!.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('validateKey', () => {
    it('should validate a correct key', () => {
      const created = manager.createKey('Test', ['read']);
      const result = manager.validateKey(created.key);

      expect(result.valid).toBe(true);
      expect(result.key).toBeDefined();
    });

    it('should reject invalid key', () => {
      const result = manager.validateKey('invalid_key');

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid key');
    });

    it('should reject revoked key', () => {
      const created = manager.createKey('Test', ['read']);
      manager.revokeKey(created.id);

      const result = manager.validateKey(created.key);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Key is deactivated');
    });
  });

  describe('hasScope', () => {
    it('should check scopes correctly', () => {
      const created = manager.createKey('Test', ['read', 'write']);
      const validation = manager.validateKey(created.key);

      expect(manager.hasScope(validation.key!, 'read')).toBe(true);
      expect(manager.hasScope(validation.key!, 'delete')).toBe(false);
    });

    it('should allow admin scope for everything', () => {
      const created = manager.createKey('Admin', ['admin']);
      const validation = manager.validateKey(created.key);

      expect(manager.hasScope(validation.key!, 'anything')).toBe(true);
    });
  });

  describe('listKeys', () => {
    it('should list all keys without hashes', () => {
      manager.createKey('Key1', ['read']);
      manager.createKey('Key2', ['write']);

      const keys = manager.listKeys();

      expect(keys.length).toBe(2);
      expect(keys[0]).not.toHaveProperty('keyHash');
    });
  });

  describe('revokeKey', () => {
    it('should revoke a key', () => {
      const created = manager.createKey('Test', ['read']);
      const result = manager.revokeKey(created.id);

      expect(result).toBe(true);
      expect(manager.validateKey(created.key).valid).toBe(false);
    });
  });

  describe('deleteKey', () => {
    it('should delete a key', () => {
      const created = manager.createKey('Test', ['read']);
      const result = manager.deleteKey(created.id);

      expect(result).toBe(true);
      expect(manager.listKeys().length).toBe(0);
    });
  });

  describe('rotateKey', () => {
    it('should rotate a key', () => {
      const original = manager.createKey('Test', ['read', 'write']);
      const rotated = manager.rotateKey(original.id);

      expect(rotated).toBeDefined();
      expect(rotated!.key).not.toBe(original.key);
      expect(rotated!.scopes).toEqual(original.scopes);
      expect(manager.validateKey(original.key).valid).toBe(false);
    });
  });

  describe('updateScopes', () => {
    it('should update key scopes', () => {
      const created = manager.createKey('Test', ['read']);
      manager.updateScopes(created.id, ['read', 'write', 'admin']);

      const key = manager.getKey(created.id);
      expect(key?.scopes).toEqual(['read', 'write', 'admin']);
    });
  });

  describe('getActiveKeysCount', () => {
    it('should count active keys', () => {
      const key1 = manager.createKey('Key1', ['read']);
      manager.createKey('Key2', ['read']);
      manager.revokeKey(key1.id);

      expect(manager.getActiveKeysCount()).toBe(1);
    });
  });
});
