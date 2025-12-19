/**
 * Request Logging Middleware
 * Issue #24
 */

import { Request, Response, NextFunction } from 'express';
import logger from './logger';

/**
 * Log HTTP requests
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      query: req.query,
      status: res.statusCode,
      duration,
      userAgent: req.get('user-agent'),
      ip: req.ip,
    });
  });

  next();
}
