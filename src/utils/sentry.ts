/**
 * Sentry Integration
 *
 * Error tracking and monitoring using Sentry
 */

import * as Sentry from '@sentry/node';
import logger from './logger';

const SENTRY_DSN = process.env.SENTRY_DSN;
const NODE_ENV = process.env.NODE_ENV || 'development';
const APP_VERSION = process.env.npm_package_version || '0.1.0';

// Initialize Sentry only if DSN is provided
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: NODE_ENV,
    release: `prismcode@${APP_VERSION}`,
    tracesSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      // Add integrations as needed
    ],
  });

  logger.info('Sentry initialized', { environment: NODE_ENV, release: APP_VERSION });
} else {
  logger.warn('Sentry DSN not provided, error tracking disabled');
}

/**
 * Capture an exception with Sentry
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  logger.error('Exception captured', { error: error.message, stack: error.stack, ...context });

  if (SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: context ? { custom: context } : undefined,
    });
  }
}

/**
 * Capture a message with Sentry
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>
): void {
  logger.log(level, message, context);

  if (SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
      contexts: context ? { custom: context } : undefined,
    });
  }
}

/**
 * Set user context for error tracking
 */
export function setUser(user: { id: string; username?: string; email?: string }): void {
  if (SENTRY_DSN) {
    Sentry.setUser(user);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  category: string,
  message: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, unknown>
): void {
  if (SENTRY_DSN) {
    Sentry.addBreadcrumb({
      category,
      message,
      level,
      data,
    });
  }
}

/**
 * Wrap an async function with error tracking
 */
export function wrapAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: Record<string, unknown>
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error as Error, { ...context, args });
      throw error;
    }
  }) as T;
}

/**
 * Flush Sentry events (call before process exit)
 */
export async function flush(timeout: number = 2000): Promise<void> {
  if (SENTRY_DSN) {
    await Sentry.flush(timeout);
    logger.info('Sentry events flushed');
  }
}

export default Sentry;
