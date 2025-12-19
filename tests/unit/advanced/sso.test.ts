/**
 * SSO Support Tests
 * Tests for Issue #136
 */

import { SSOManager } from '../../../src/advanced/sso';

describe('SSOManager', () => {
  let manager: SSOManager;

  beforeEach(() => {
    manager = new SSOManager();
    manager.reset();
  });

  describe('registerProvider', () => {
    it('should register SSO provider', () => {
      const provider = manager.registerProvider({
        name: 'Okta',
        type: 'saml',
        issuer: 'https://okta.example.com',
        ssoUrl: 'https://okta.example.com/sso',
      });

      expect(provider.id).toBe('sso_okta');
      expect(provider.isActive).toBe(true);
    });
  });

  describe('getLoginUrl', () => {
    it('should generate login URL', () => {
      manager.registerProvider({
        name: 'Okta',
        type: 'saml',
        issuer: 'https://okta.example.com',
        ssoUrl: 'https://okta.example.com/sso',
      });

      const url = manager.getLoginUrl('sso_okta', '/dashboard');
      expect(url).toContain('https://okta.example.com/sso');
      expect(url).toContain('state=');
    });
  });

  describe('processCallback', () => {
    it('should create session from callback', () => {
      manager.registerProvider({
        name: 'Okta',
        type: 'saml',
        issuer: 'https://okta.example.com',
        ssoUrl: 'https://okta.example.com/sso',
      });

      const session = manager.processCallback('sso_okta', 'mock-assertion');
      expect(session).toBeDefined();
      expect(session!.email).toBeDefined();
    });
  });

  describe('validateSession', () => {
    it('should validate active session', () => {
      manager.registerProvider({
        name: 'Okta',
        type: 'saml',
        issuer: 'https://okta.example.com',
        ssoUrl: 'https://okta.example.com/sso',
      });

      const session = manager.processCallback('sso_okta', 'assertion')!;
      const validated = manager.validateSession(session.id);

      expect(validated).toBeDefined();
      expect(validated!.id).toBe(session.id);
    });
  });

  describe('endSession', () => {
    it('should end session', () => {
      manager.registerProvider({
        name: 'Okta',
        type: 'saml',
        issuer: 'https://okta.example.com',
        ssoUrl: 'https://okta.example.com/sso',
      });

      const session = manager.processCallback('sso_okta', 'assertion')!;
      const ended = manager.endSession(session.id);

      expect(ended).toBe(true);
      expect(manager.validateSession(session.id)).toBeNull();
    });
  });

  describe('config', () => {
    it('should update and get config', () => {
      manager.updateConfig({ allowedDomains: ['example.com'] });
      const config = manager.getConfig();

      expect(config.allowedDomains).toContain('example.com');
    });
  });
});
