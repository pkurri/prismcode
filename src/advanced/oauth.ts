/**
 * OAuth Integration Service
 * Issue #135: OAuth Integration
 *
 * OAuth 2.0 authentication flow support
 */

import logger from '../utils/logger';
import { randomBytes } from 'crypto';

export interface OAuthProvider {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
  redirectUri: string;
  isActive: boolean;
}

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: Date;
  scope: string[];
}

export interface OAuthSession {
  id: string;
  providerId: string;
  userId: string;
  token: OAuthToken;
  createdAt: Date;
  lastUsed: Date;
}

/**
 * OAuth Manager
 * Handles OAuth 2.0 flows and token management
 */
export class OAuthManager {
  private providers: Map<string, OAuthProvider> = new Map();
  private sessions: Map<string, OAuthSession> = new Map();
  private pendingStates: Map<string, { providerId: string; timestamp: Date }> = new Map();

  constructor() {
    logger.info('OAuthManager initialized');
  }

  /**
   * Register an OAuth provider
   */
  registerProvider(config: Omit<OAuthProvider, 'id' | 'isActive'>): OAuthProvider {
    const id = `oauth_${config.name.toLowerCase().replace(/\s+/g, '_')}`;

    const provider: OAuthProvider = {
      id,
      ...config,
      isActive: true,
    };

    this.providers.set(id, provider);
    logger.info('OAuth provider registered', { id, name: config.name });

    return provider;
  }

  /**
   * Generate authorization URL
   */
  getAuthorizationUrl(providerId: string, _userId: string): string | null {
    const provider = this.providers.get(providerId);
    if (!provider || !provider.isActive) return null;

    const state = this.generateState(providerId);

    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: provider.redirectUri,
      response_type: 'code',
      scope: provider.scopes.join(' '),
      state,
    });

    return `${provider.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Generate CSRF state token
   */
  private generateState(providerId: string): string {
    const state = randomBytes(32).toString('hex');
    this.pendingStates.set(state, { providerId, timestamp: new Date() });

    // Clean old states (> 10 minutes)
    const cutoff = Date.now() - 10 * 60 * 1000;
    for (const [s, data] of this.pendingStates) {
      if (data.timestamp.getTime() < cutoff) {
        this.pendingStates.delete(s);
      }
    }

    return state;
  }

  /**
   * Validate state token
   */
  validateState(state: string): { valid: boolean; providerId?: string } {
    const data = this.pendingStates.get(state);
    if (!data) return { valid: false };

    this.pendingStates.delete(state);
    return { valid: true, providerId: data.providerId };
  }

  /**
   * Exchange authorization code for tokens (mock)
   */
  exchangeCode(providerId: string, code: string, userId: string): OAuthSession | null {
    const provider = this.providers.get(providerId);
    if (!provider) return null;

    // In real implementation, this would make HTTP request to token endpoint
    const token: OAuthToken = {
      accessToken: `access_${randomBytes(32).toString('hex')}`,
      refreshToken: `refresh_${randomBytes(32).toString('hex')}`,
      tokenType: 'Bearer',
      expiresIn: 3600,
      expiresAt: new Date(Date.now() + 3600 * 1000),
      scope: provider.scopes,
    };

    const session: OAuthSession = {
      id: `session_${Date.now()}_${randomBytes(8).toString('hex')}`,
      providerId,
      userId,
      token,
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    this.sessions.set(session.id, session);
    logger.info('OAuth session created', { sessionId: session.id, providerId, userId });

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): OAuthSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get sessions for user
   */
  getUserSessions(userId: string): OAuthSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.userId === userId);
  }

  /**
   * Refresh token (mock)
   */
  refreshToken(sessionId: string): OAuthToken | null {
    const session = this.sessions.get(sessionId);
    if (!session || !session.token.refreshToken) return null;

    // Update token
    session.token.accessToken = `access_${randomBytes(32).toString('hex')}`;
    session.token.expiresAt = new Date(Date.now() + 3600 * 1000);
    session.lastUsed = new Date();

    logger.info('OAuth token refreshed', { sessionId });
    return session.token;
  }

  /**
   * Revoke session
   */
  revokeSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      logger.info('OAuth session revoked', { sessionId });
    }
    return deleted;
  }

  /**
   * Get all providers
   */
  getProviders(): OAuthProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get provider by ID
   */
  getProvider(id: string): OAuthProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * Disable provider
   */
  disableProvider(id: string): boolean {
    const provider = this.providers.get(id);
    if (provider) {
      provider.isActive = false;
      return true;
    }
    return false;
  }

  /**
   * Reset manager
   */
  reset(): void {
    this.providers.clear();
    this.sessions.clear();
    this.pendingStates.clear();
    logger.info('OAuthManager reset');
  }
}

// Export singleton
export const oauthManager = new OAuthManager();
