/**
 * Request Validation Middleware
 * Issue #16
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/**
 * Validate request body against schema
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Validate query parameters
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Invalid query parameters',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Validate request params
 */
export function validateParams<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Invalid path parameters',
          details: error.errors,
        });
        return;
      }
      next(error);
    }
  };
}
