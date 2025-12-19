/**
 * OAuth Integration Tests
 * Tests for Issue #135
 */

import { OAuthManager } from '../../../src/advanced/oauth';

describe('OAuthManager', () => {
  let manager: OAuthManager;

  beforeEach(() => {
    manager = new OAuthManager();
    manager.reset();
  });

  describe('registerProvider', () => {
    it('should register a new OAuth provider', () => {
      const provider = manager.registerProvider({
        name: 'GitHub',
        clientId: 'test-client-id',
        clientSecret: 'test-secret',
        authorizationUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        scopes: ['repo', 'user'],
        redirectUri: 'http://localhost:3000/callback',
      });

      expect(provider.id).toBe('oauth_github');
      expect(provider.name).toBe('GitHub');
      expect(provider.isActive).toBe(true);
    });
  });

  describe('getAuthorizationUrl', () => {
    it('should generate authorization URL', () => {
      manager.registerProvider({
        name: 'GitHub',
        clientId: 'test-client-id',
        clientSecret: 'test-secret',
        authorizationUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        scopes: ['repo'],
        redirectUri: 'http://localhost:3000/callback',
      });

      const url = manager.getAuthorizationUrl('oauth_github', 'user1');

      expect(url).toContain('https://github.com/login/oauth/authorize');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('state=');
    });

    it('should return null for unknown provider', () => {
      const url = manager.getAuthorizationUrl('unknown', 'user1');
      expect(url).toBeNull();
    });
  });

  describe('validateState', () => {
    it('should validate state token', () => {
      manager.registerProvider({
        name: 'GitHub',
        clientId: 'test',
        clientSecret: 'secret',
        authorizationUrl: 'https://github.com/oauth',
        tokenUrl: 'https://github.com/token',
        scopes: [],
        redirectUri: 'http://localhost/cb',
      });

      const url = manager.getAuthorizationUrl('oauth_github', 'user1')!;
      const state = new URL(url).searchParams.get('state')!;

      const result = manager.validateState(state);
      expect(result.valid).toBe(true);
      expect(result.providerId).toBe('oauth_github');
    });

    it('should reject invalid state', () => {
      const result = manager.validateState('invalid-state');
      expect(result.valid).toBe(false);
    });
  });

  describe('exchangeCode', () => {
    it('should create a session', () => {
      manager.registerProvider({
        name: 'GitHub',
        clientId: 'test',
        clientSecret: 'secret',
        authorizationUrl: 'https://github.com/oauth',
        tokenUrl: 'https://github.com/token',
        scopes: ['repo'],
        redirectUri: 'http://localhost/cb',
      });

      const session = manager.exchangeCode('oauth_github', 'test-code', 'user1');

      expect(session).toBeDefined();
      expect(session!.token.accessToken).toBeDefined();
      expect(session!.userId).toBe('user1');
    });
  });

  describe('getUserSessions', () => {
    it('should return sessions for user', () => {
      manager.registerProvider({
        name: 'GitHub',
        clientId: 'test',
        clientSecret: 'secret',
        authorizationUrl: 'https://github.com/oauth',
        tokenUrl: 'https://github.com/token',
        scopes: [],
        redirectUri: 'http://localhost/cb',
      });

      manager.exchangeCode('oauth_github', 'code1', 'user1');
      manager.exchangeCode('oauth_github', 'code2', 'user2');

      const sessions = manager.getUserSessions('user1');
      expect(sessions.length).toBe(1);
    });
  });

  describe('revokeSession', () => {
    it('should revoke a session', () => {
      manager.registerProvider({
        name: 'GitHub',
        clientId: 'test',
        clientSecret: 'secret',
        authorizationUrl: 'https://github.com/oauth',
        tokenUrl: 'https://github.com/token',
        scopes: [],
        redirectUri: 'http://localhost/cb',
      });

      const session = manager.exchangeCode('oauth_github', 'code', 'user1')!;
      const revoked = manager.revokeSession(session.id);

      expect(revoked).toBe(true);
      expect(manager.getSession(session.id)).toBeUndefined();
    });
  });
});
