/**
 * Tests for SSO Integration
 * Issue #219: SSO Integration (SAML/OIDC)
 * 
 * Extended tests for SSO functionality
 */

import { SSOManager, type SSOProvider, type SSOSession } from '../../../src/advanced/sso';

describe('SSOManager - Extended Tests', () => {
  let sso: SSOManager;

  beforeEach(() => {
    sso = new SSOManager();
  });

  afterEach(() => {
    sso.reset();
  });

  describe('provider registration', () => {
    it('should register SAML provider', () => {
      const provider = sso.registerProvider({
        name: 'Okta SAML',
        type: 'saml',
        issuer: 'https://company.okta.com',
        ssoUrl: 'https://company.okta.com/app/sso/saml',
        certificate: 'MIIC...',
      });

      expect(provider.id).toBeDefined();
      expect(provider.type).toBe('saml');
      expect(provider.isActive).toBe(true);
      expect(provider.createdAt).toBeInstanceOf(Date);
    });

    it('should register OIDC provider', () => {
      const provider = sso.registerProvider({
        name: 'Azure AD',
        type: 'oidc',
        issuer: 'https://login.microsoftonline.com/tenant-id',
        ssoUrl: 'https://login.microsoftonline.com/tenant-id/oauth2/v2.0/authorize',
        clientId: 'client-id-123',
      });

      expect(provider.type).toBe('oidc');
      expect(provider.clientId).toBe('client-id-123');
    });

    it('should generate unique provider IDs', () => {
      const provider1 = sso.registerProvider({
        name: 'Provider One',
        type: 'saml',
        issuer: 'https://one.example.com',
        ssoUrl: 'https://one.example.com/sso',
      });

      const provider2 = sso.registerProvider({
        name: 'Provider Two',
        type: 'oidc',
        issuer: 'https://two.example.com',
        ssoUrl: 'https://two.example.com/authorize',
      });

      expect(provider1.id).not.toBe(provider2.id);
    });

    it('should list all providers', () => {
      sso.registerProvider({
        name: 'Provider 1',
        type: 'saml',
        issuer: 'https://1.example.com',
        ssoUrl: 'https://1.example.com/sso',
      });

      sso.registerProvider({
        name: 'Provider 2',
        type: 'oidc',
        issuer: 'https://2.example.com',
        ssoUrl: 'https://2.example.com/sso',
      });

      const providers = sso.getProviders();

      expect(providers.length).toBe(2);
    });
  });

  describe('login URL generation', () => {
    let provider: SSOProvider;

    beforeEach(() => {
      provider = sso.registerProvider({
        name: 'Test Provider',
        type: 'saml',
        issuer: 'https://test.example.com',
        ssoUrl: 'https://test.example.com/sso',
      });
    });

    it('should generate login URL with state', () => {
      const loginUrl = sso.getLoginUrl(provider.id, 'https://app.example.com/callback');

      expect(loginUrl).not.toBeNull();
      expect(loginUrl).toContain('state=');
      expect(loginUrl).toContain('returnUrl=');
    });

    it('should return null for invalid provider', () => {
      const loginUrl = sso.getLoginUrl('invalid_provider', 'https://app.example.com');

      expect(loginUrl).toBeNull();
    });

    it('should encode return URL', () => {
      const returnUrl = 'https://app.example.com/callback?param=value';
      const loginUrl = sso.getLoginUrl(provider.id, returnUrl);

      expect(loginUrl).toContain(encodeURIComponent(returnUrl));
    });
  });

  describe('session management', () => {
    let provider: SSOProvider;

    beforeEach(() => {
      provider = sso.registerProvider({
        name: 'Test Provider',
        type: 'saml',
        issuer: 'https://test.example.com',
        ssoUrl: 'https://test.example.com/sso',
      });
    });

    it('should create session on callback', () => {
      const session = sso.processCallback(provider.id, 'mock_assertion');

      expect(session).not.toBeNull();
      expect(session!.id).toBeDefined();
      expect(session!.providerId).toBe(provider.id);
      expect(session!.email).toBeDefined();
      expect(session!.createdAt).toBeInstanceOf(Date);
      expect(session!.expiresAt).toBeInstanceOf(Date);
    });

    it('should validate active session', () => {
      const session = sso.processCallback(provider.id, 'mock_assertion');
      const validated = sso.validateSession(session!.id);

      expect(validated).not.toBeNull();
      expect(validated!.id).toBe(session!.id);
    });

    it('should return null for invalid session', () => {
      const validated = sso.validateSession('invalid_session_id');

      expect(validated).toBeNull();
    });

    it('should end session', () => {
      const session = sso.processCallback(provider.id, 'mock_assertion');
      const ended = sso.endSession(session!.id);
      const validated = sso.validateSession(session!.id);

      expect(ended).toBe(true);
      expect(validated).toBeNull();
    });

    it('should return false when ending non-existent session', () => {
      const ended = sso.endSession('non_existent_session');

      expect(ended).toBe(false);
    });
  });

  describe('configuration', () => {
    it('should return default config', () => {
      const config = sso.getConfig();

      expect(config.allowedDomains).toEqual([]);
      expect(config.autoProvision).toBe(true);
      expect(config.sessionDuration).toBe(480);
    });

    it('should update config', () => {
      sso.updateConfig({
        allowedDomains: ['example.com', 'company.com'],
        sessionDuration: 60,
      });

      const config = sso.getConfig();

      expect(config.allowedDomains).toContain('example.com');
      expect(config.sessionDuration).toBe(60);
    });

    it('should set default provider', () => {
      const provider = sso.registerProvider({
        name: 'Default Provider',
        type: 'oidc',
        issuer: 'https://default.example.com',
        ssoUrl: 'https://default.example.com/authorize',
      });

      sso.updateConfig({ defaultProvider: provider.id });

      const config = sso.getConfig();
      expect(config.defaultProvider).toBe(provider.id);
    });
  });

  describe('domain restrictions', () => {
    let provider: SSOProvider;

    beforeEach(() => {
      provider = sso.registerProvider({
        name: 'Test Provider',
        type: 'saml',
        issuer: 'https://test.example.com',
        ssoUrl: 'https://test.example.com/sso',
      });
    });

    it('should allow any domain when no restrictions', () => {
      const session = sso.processCallback(provider.id, 'mock_assertion');

      expect(session).not.toBeNull();
    });

    it('should block unauthorized domains', () => {
      sso.updateConfig({ allowedDomains: ['allowed.com'] });

      // Since processCallback generates mock emails with example.com domain
      // which is not in allowed list, it should return null
      const session = sso.processCallback(provider.id, 'mock_assertion');

      expect(session).toBeNull();
    });
  });

  describe('session attributes', () => {
    let provider: SSOProvider;

    beforeEach(() => {
      provider = sso.registerProvider({
        name: 'Test Provider',
        type: 'saml',
        issuer: 'https://test.example.com',
        ssoUrl: 'https://test.example.com/sso',
      });
    });

    it('should include user attributes in session', () => {
      const session = sso.processCallback(provider.id, 'mock_assertion');

      expect(session!.attributes).toBeDefined();
      expect(typeof session!.attributes).toBe('object');
    });

    it('should have session expiration in future', () => {
      const session = sso.processCallback(provider.id, 'mock_assertion');

      expect(session!.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });
});
