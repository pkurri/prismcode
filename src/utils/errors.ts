/**
 * Error Handling Utilities
 * 
 * Provides:
 * - Custom error classes
 * - Error wrapping and context
 * - Async error handling
 * - Error serialization
 */

import logger from './logger';
import { captureException } from './sentry';

/**
 * Base error class for PrismCode
 */
export class PrismCodeError extends Error {
    public readonly code: string;
    public readonly context: Record<string, unknown>;
    public readonly timestamp: Date;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        code: string = 'PRISMCODE_ERROR',
        context: Record<string, unknown> = {},
        isOperational: boolean = true
    ) {
        super(message);
        this.name = 'PrismCodeError';
        this.code = code;
        this.context = context;
        this.timestamp = new Date();
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }

    toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            timestamp: this.timestamp.toISOString(),
            stack: this.stack,
        };
    }
}

/**
 * Validation error
 */
export class ValidationError extends PrismCodeError {
    constructor(message: string, context: Record<string, unknown> = {}) {
        super(message, 'VALIDATION_ERROR', context);
        this.name = 'ValidationError';
    }
}

/**
 * Configuration error
 */
export class ConfigurationError extends PrismCodeError {
    constructor(message: string, context: Record<string, unknown> = {}) {
        super(message, 'CONFIG_ERROR', context, false);
        this.name = 'ConfigurationError';
    }
}

/**
 * Agent error
 */
export class AgentError extends PrismCodeError {
    public readonly agentName: string;

    constructor(agentName: string, message: string, context: Record<string, unknown> = {}) {
        super(message, 'AGENT_ERROR', { agentName, ...context });
        this.name = 'AgentError';
        this.agentName = agentName;
    }
}

/**
 * GitHub API error
 */
export class GitHubError extends PrismCodeError {
    public readonly statusCode?: number;

    constructor(message: string, statusCode?: number, context: Record<string, unknown> = {}) {
        super(message, 'GITHUB_ERROR', { statusCode, ...context });
        this.name = 'GitHubError';
        this.statusCode = statusCode;
    }
}

/**
 * Timeout error
 */
export class TimeoutError extends PrismCodeError {
    public readonly timeoutMs: number;

    constructor(message: string, timeoutMs: number, context: Record<string, unknown> = {}) {
        super(message, 'TIMEOUT_ERROR', { timeoutMs, ...context });
        this.name = 'TimeoutError';
        this.timeoutMs = timeoutMs;
    }
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    options: {
        rethrow?: boolean;
        logLevel?: 'error' | 'warn' | 'info';
        defaultValue?: R;
    } = {}
): (...args: T) => Promise<R> {
    const { rethrow = true, logLevel = 'error', defaultValue } = options;

    return async (...args: T): Promise<R> => {
        try {
            return await fn(...args);
        } catch (error) {
            const prismError = normalizeError(error);

            // Log
            logger[logLevel]('Error in async function', prismError.toJSON());

            // Report to Sentry
            captureException(error as Error);

            if (rethrow) {
                throw prismError;
            }

            return defaultValue as R;
        }
    };
}

/**
 * Normalize any error to PrismCodeError
 */
export function normalizeError(error: unknown): PrismCodeError {
    if (error instanceof PrismCodeError) {
        return error;
    }

    if (error instanceof Error) {
        const prismError = new PrismCodeError(error.message, 'UNKNOWN_ERROR', {
            originalName: error.name,
        });
        prismError.stack = error.stack;
        return prismError;
    }

    return new PrismCodeError(String(error), 'UNKNOWN_ERROR');
}

/**
 * Create error handler for Express/Koa style middleware
 */
export function createErrorHandler() {
    return (err: Error, req: unknown, res: { status: (code: number) => { json: (body: unknown) => void } }, _next: unknown) => {
        const prismError = normalizeError(err);

        logger.error('Request error', prismError.toJSON());
        captureException(err);

        const statusCode = prismError.code === 'VALIDATION_ERROR' ? 400 :
            prismError.code === 'NOT_FOUND' ? 404 :
                prismError.code === 'UNAUTHORIZED' ? 401 :
                    500;

        res.status(statusCode).json({
            error: prismError.message,
            code: prismError.code,
            timestamp: prismError.timestamp,
        });
    };
}

/**
 * Retry helper with exponential backoff
 */
export async function retry<T>(
    fn: () => Promise<T>,
    options: {
        maxAttempts?: number;
        baseDelay?: number;
        maxDelay?: number;
        onRetry?: (error: Error, attempt: number) => void;
    } = {}
): Promise<T> {
    const { maxAttempts = 3, baseDelay = 1000, maxDelay = 30000, onRetry } = options;

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (attempt < maxAttempts) {
                const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

                if (onRetry) {
                    onRetry(lastError, attempt);
                }

                logger.warn(`Retry attempt ${attempt}/${maxAttempts}`, {
                    error: lastError.message,
                    delay,
                });

                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

/**
 * Assert condition or throw error
 */
export function assert(
    condition: unknown,
    message: string,
    ErrorClass: new (message: string) => Error = ValidationError
): asserts condition {
    if (!condition) {
        throw new ErrorClass(message);
    }
}
