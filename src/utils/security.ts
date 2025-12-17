/**
 * Security Utilities
 *
 * Provides:
 * - Input sanitization
 * - Token validation
 * - Rate limiting helpers
 * - Secret management
 * - XSS protection
 */

import crypto from 'crypto';
import logger from './logger';

/**
 * Sanitize string input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: URIs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Validate GitHub token format
 */
export function validateGitHubToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // GitHub tokens are either classic (ghp_) or fine-grained (github_pat_)
  const validPrefixes = ['ghp_', 'github_pat_', 'gho_', 'ghu_', 'ghs_', 'ghr_'];
  return validPrefixes.some((prefix) => token.startsWith(prefix));
}

/**
 * Mask sensitive data in logs
 */
export function maskSensitiveData(data: unknown): unknown {
  if (typeof data === 'string') {
    // Mask tokens
    if (data.startsWith('ghp_') || data.startsWith('github_pat_')) {
      return data.slice(0, 7) + '***' + data.slice(-4);
    }
    // Mask emails
    if (data.includes('@')) {
      const [local, domain] = data.split('@');
      return local.slice(0, 2) + '***@' + domain;
    }
    return data;
  }

  if (typeof data === 'object' && data !== null) {
    const masked: Record<string, unknown> = {};
    const sensitiveKeys = ['token', 'password', 'secret', 'apiKey', 'api_key', 'authorization'];

    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
        masked[key] = '***REDACTED***';
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = maskSensitiveData(value);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }

  return data;
}

/**
 * Rate limiter configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

/**
 * Simple in-memory rate limiter
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests for this key
    const requests = this.requests.get(key) || [];

    // Filter to only requests within window
    const recentRequests = requests.filter((time) => time > windowStart);

    // Check if under limit
    if (recentRequests.length >= this.config.maxRequests) {
      logger.warn('Rate limit exceeded', { key, requests: recentRequests.length });
      return false;
    }

    // Add this request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    return true;
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clear(): void {
    this.requests.clear();
  }
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data
 */
export function hashData(data: string, algorithm: string = 'sha256'): string {
  return crypto.createHash(algorithm).update(data).digest('hex');
}

/**
 * Validate content security policy style input
 */
export function isValidCSPValue(value: string): boolean {
  // Basic CSP validation
  const dangerousPatterns = [/unsafe-inline/i, /unsafe-eval/i, /data:/i, /\*/];

  return !dangerousPatterns.some((pattern) => pattern.test(value));
}

/**
 * Check for common security vulnerabilities in URLs
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Only allow http(s)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    // Block localhost/internal IPs in production
    if (process.env.NODE_ENV === 'production') {
      const dangerousHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
      if (dangerousHosts.includes(parsed.hostname)) {
        return false;
      }

      // Block private IP ranges
      const privateRanges = [/^10\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./, /^192\.168\./];
      if (privateRanges.some((range) => range.test(parsed.hostname))) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Escape HTML entities
 */
export function escapeHtml(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return str.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Validate environment is properly configured for security
 */
export function validateSecurityConfig(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for required security env vars
  if (!process.env.NODE_ENV) {
    issues.push('NODE_ENV not set');
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SENTRY_DSN) {
      issues.push('SENTRY_DSN not configured for production');
    }
  }

  // Check GitHub token if present
  if (process.env.GITHUB_TOKEN && !validateGitHubToken(process.env.GITHUB_TOKEN)) {
    issues.push('Invalid GITHUB_TOKEN format');
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
