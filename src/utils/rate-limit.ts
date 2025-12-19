/**
 * API Rate Limiting Middleware
 * Issue #15
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Simple in-memory rate limiter
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || 60000; // 1 minute
  const maxRequests = options.maxRequests || 100;
  const message = options.message || 'Too many requests, please try again later';

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();

    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
      return;
    }

    next();
  };
}

/**
 * Clean up expired entries
 */
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  });
}, 60000); // Clean every minute
