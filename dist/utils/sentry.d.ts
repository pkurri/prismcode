/**
 * Sentry Integration
 *
 * Error tracking and monitoring using Sentry
 */
import * as Sentry from '@sentry/node';
/**
 * Capture an exception with Sentry
 */
export declare function captureException(error: Error, context?: Record<string, any>): void;
/**
 * Capture a message with Sentry
 */
export declare function captureMessage(message: string, level?: Sentry.SeverityLevel, context?: Record<string, any>): void;
/**
 * Set user context for error tracking
 */
export declare function setUser(user: {
    id: string;
    username?: string;
    email?: string;
}): void;
/**
 * Add breadcrumb for debugging
 */
export declare function addBreadcrumb(category: string, message: string, level?: Sentry.SeverityLevel, data?: Record<string, any>): void;
/**
 * Wrap an async function with error tracking
 */
export declare function wrapAsync<T extends (...args: any[]) => Promise<any>>(fn: T, context?: Record<string, any>): T;
/**
 * Flush Sentry events (call before process exit)
 */
export declare function flush(timeout?: number): Promise<void>;
export default Sentry;
//# sourceMappingURL=sentry.d.ts.map