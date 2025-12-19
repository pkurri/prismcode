/**
 * SSO Support Service
 * Issue #136: SSO Support
 *
 * Single Sign-On integration with SAML/OIDC
 */

import logger from '../utils/logger';
import { randomBytes } from 'crypto';

export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oidc';
  issuer: string;
  ssoUrl: string;
  certificate?: string;
  clientId?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface SSOSession {
  id: string;
  providerId: string;
  userId: string;
  email: string;
  attributes: Record<string, string>;
  createdAt: Date;
  expiresAt: Date;
}

export interface SSOConfig {
  defaultProvider?: string;
  allowedDomains: string[];
  autoProvision: boolean;
  sessionDuration: number; // minutes
}

/**
 * SSO Manager
 * Handles Single Sign-On authentication
 */
export class SSOManager {
  private providers: Map<string, SSOProvider> = new Map();
  private sessions: Map<string, SSOSession> = new Map();
  private config: SSOConfig = {
    allowedDomains: [],
    autoProvision: true,
    sessionDuration: 480, // 8 hours
  };

  constructor() {
    logger.info('SSOManager initialized');
  }

  /**
   * Register SSO provider
   */
  registerProvider(config: Omit<SSOProvider, 'id' | 'isActive' | 'createdAt'>): SSOProvider {
    const id = `sso_${config.name.toLowerCase().replace(/\s+/g, '_')}`;

    const provider: SSOProvider = {
      id,
      ...config,
      isActive: true,
      createdAt: new Date(),
    };

    this.providers.set(id, provider);
    logger.info('SSO provider registered', { id, name: config.name, type: config.type });

    return provider;
  }

  /**
   * Get SSO login URL
   */
  getLoginUrl(providerId: string, returnUrl: string): string | null {
    const provider = this.providers.get(providerId);
    if (!provider || !provider.isActive) return null;

    const state = randomBytes(16).toString('hex');
    return `${provider.ssoUrl}?state=${state}&returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  /**
   * Process SSO callback (mock)
   */
  processCallback(providerId: string, _assertion: string): SSOSession | null {
    const provider = this.providers.get(providerId);
    if (!provider) return null;

    // Mock decode assertion
    const email = `user_${Date.now()}@example.com`;
    const userId = `user_${randomBytes(8).toString('hex')}`;

    // Check domain
    const domain = email.split('@')[1];
    if (this.config.allowedDomains.length > 0 && !this.config.allowedDomains.includes(domain)) {
      logger.warn('SSO domain not allowed', { domain });
      return null;
    }

    const session: SSOSession = {
      id: `session_${Date.now()}_${randomBytes(8).toString('hex')}`,
      providerId,
      userId,
      email,
      attributes: { name: 'Demo User', role: 'member' },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.sessionDuration * 60 * 1000),
    };

    this.sessions.set(session.id, session);
    logger.info('SSO session created', { sessionId: session.id, email });

    return session;
  }

  /**
   * Validate session
   */
  validateSession(sessionId: string): SSOSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  /**
   * End session
   */
  endSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Get providers
   */
  getProviders(): SSOProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<SSOConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('SSO config updated');
  }

  /**
   * Get config
   */
  getConfig(): SSOConfig {
    return { ...this.config };
  }

  /**
   * Reset
   */
  reset(): void {
    this.providers.clear();
    this.sessions.clear();
    logger.info('SSOManager reset');
  }
}

export const ssoManager = new SSOManager();
