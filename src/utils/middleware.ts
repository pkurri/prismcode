/**
 * Server Middleware - Express/HTTP middleware utilities
 *
 * Implements:
 * - #14 Environment Variables Management
 * - #15 API Rate Limiting
 * - #16 Request Validation
 * - #17 Error Handling Middleware
 * - #21 Health Check Endpoints
 * - #22 Security Headers
 * - #23 CORS Configuration
 * - #24 Request Logging
 */

import { Request, Response, NextFunction, Application } from 'express';
import { RateLimiter, sanitizeObject } from './security';
import { normalizeError } from './errors';
import logger from './logger';

// ============================================
// #14 Environment Variables Management
// ============================================

/**
 * Environment configuration with validation
 */
export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  LOG_LEVEL: string;
  GITHUB_TOKEN?: string;
  SENTRY_DSN?: string;
  REDIS_URL?: string;
  DATABASE_URL?: string;
}

/**
 * Get validated environment configuration
 */
export function getEnvConfig(): EnvConfig {
  const requiredVars = ['NODE_ENV'];
  const missing = requiredVars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    logger.warn('Missing environment variables', { missing });
  }

  return {
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    SENTRY_DSN: process.env.SENTRY_DSN,
    REDIS_URL: process.env.REDIS_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  };
}

// ============================================
// #15 API Rate Limiting Middleware
// ============================================

const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
});

/**
 * Rate limiting middleware
 */
export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || 'unknown';

  if (!apiRateLimiter.isAllowed(key)) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: 60,
    });
    return;
  }

  next();
}

// ============================================
// #16 Request Validation Middleware
// ============================================

/**
 * Validation schema type
 */
export interface ValidationSchema {
  body?: Record<string, { type: string; required?: boolean }>;
  query?: Record<string, { type: string; required?: boolean }>;
  params?: Record<string, { type: string; required?: boolean }>;
}

/**
 * Request validation middleware factory
 */
export function validateRequest(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    // Validate body
    if (schema.body) {
      for (const [field, rules] of Object.entries(schema.body)) {
        const value = req.body?.[field];
        if (rules.required && (value === undefined || value === null)) {
          errors.push(`Body field '${field}' is required`);
        }
      }
    }

    // Validate query
    if (schema.query) {
      for (const [field, rules] of Object.entries(schema.query)) {
        const value = req.query?.[field];
        if (rules.required && !value) {
          errors.push(`Query parameter '${field}' is required`);
        }
      }
    }

    // Validate params
    if (schema.params) {
      for (const [field, rules] of Object.entries(schema.params)) {
        const value = req.params?.[field];
        if (rules.required && !value) {
          errors.push(`URL parameter '${field}' is required`);
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        error: 'Validation Error',
        details: errors,
      });
      return;
    }

    // Sanitize body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    next();
  };
}

// ============================================
// #17 Error Handling Middleware
// ============================================

/**
 * Error handling middleware
 */
export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const prismError = normalizeError(err);

  logger.error('Request error', {
    method: req.method,
    path: req.path,
    error: prismError.message,
    code: prismError.code,
  });

  const statusCode =
    prismError.code === 'VALIDATION_ERROR'
      ? 400
      : prismError.code === 'NOT_FOUND'
        ? 404
        : prismError.code === 'UNAUTHORIZED'
          ? 401
          : prismError.code === 'FORBIDDEN'
            ? 403
            : 500;

  res.status(statusCode).json({
    error: prismError.message,
    code: prismError.code,
    ...(process.env.NODE_ENV === 'development' && { stack: prismError.stack }),
  });
}

// ============================================
// #21 Health Check Endpoints
// ============================================

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  checks: Record<string, { status: string; latency?: number }>;
}

/**
 * Health check middleware
 */
export function healthCheckMiddleware(req: Request, res: Response): void {
  const startTime = Date.now();

  const health: HealthCheckResponse = {
    status: 'healthy',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks: {
      server: { status: 'ok', latency: Date.now() - startTime },
      memory: {
        status: process.memoryUsage().heapUsed < 500 * 1024 * 1024 ? 'ok' : 'warning',
      },
    },
  };

  res.json(health);
}

/**
 * Liveness probe
 */
export function livenessProbe(req: Request, res: Response): void {
  res.status(200).send('OK');
}

/**
 * Readiness probe
 */
export function readinessProbe(req: Request, res: Response): void {
  // Add checks for dependencies (DB, Redis, etc)
  res.status(200).send('OK');
}

// ============================================
// #22 Security Headers Middleware
// ============================================

/**
 * Security headers middleware
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Prevent XSS
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // HSTS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // CSP
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
  );

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
}

// ============================================
// #23 CORS Configuration
// ============================================

/**
 * CORS options
 */
export interface CorsOptions {
  origins: string[];
  methods: string[];
  headers: string[];
  credentials: boolean;
  maxAge: number;
}

const defaultCorsOptions: CorsOptions = {
  origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization', 'X-Request-ID'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * CORS middleware
 */
export function corsMiddleware(options: Partial<CorsOptions> = {}) {
  const opts = { ...defaultCorsOptions, ...options };

  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.headers.origin;

    if (origin && opts.origins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', opts.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', opts.headers.join(', '));
    res.setHeader('Access-Control-Allow-Credentials', String(opts.credentials));
    res.setHeader('Access-Control-Max-Age', String(opts.maxAge));

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  };
}

// ============================================
// #24 Request Logging Middleware
// ============================================

/**
 * Request logging middleware
 */
export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || generateRequestId();

  // Attach request ID
  req.headers['x-request-id'] = requestId as string;
  res.setHeader('X-Request-ID', requestId);

  // Log request
  logger.info('Request started', {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
}

function generateRequestId(): string {
  return 'req-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
}

// ============================================
// Setup all middleware
// ============================================

/**
 * Apply all middleware to Express app
 */
export function setupMiddleware(app: Application): void {
  // Request logging first
  app.use(requestLoggingMiddleware);

  // Security
  app.use(securityHeadersMiddleware);
  app.use(corsMiddleware());

  // Rate limiting
  app.use('/api', rateLimitMiddleware);

  // Health checks
  app.get('/health', healthCheckMiddleware);
  app.get('/healthz', livenessProbe);
  app.get('/readyz', readinessProbe);

  // Error handling (should be last)
  app.use(errorMiddleware);

  logger.info('Middleware configured', {
    rateLimit: '100 req/min',
    cors: 'enabled',
    security: 'enabled',
  });
}
