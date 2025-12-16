/**
 * Logger Utility
 * 
 * Centralized logging using Winston with support for:
 * - Console output (development)
 * - File output (production)
 * - Structured logging
 * - Log levels
 */

import winston from 'winston';
import path from 'path';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: LOG_LEVEL,
    format: logFormat,
    defaultMeta: { service: 'prismcode' },
    transports: [],
});

// Add console transport for development
if (NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: consoleFormat,
        })
    );
}

// Add file transports for production
if (NODE_ENV === 'production') {
    logger.add(
        new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
        })
    );

    logger.add(
        new winston.transports.File({
            filename: path.join('logs', 'combined.log'),
        })
    );
}

// Create a stream for Morgan HTTP logging (if using Express)
export const stream = {
    write: (message: string) => {
        logger.info(message.trim());
    },
};

// Helper methods for common logging patterns
export const loggers = {
    /**
     * Log GitHub API call
     */
    github: (action: string, metadata?: Record<string, any>) => {
        logger.info(`GitHub API: ${action}`, { component: 'github-api', ...metadata });
    },

    /**
     * Log agent activity
     */
    agent: (agentName: string, action: string, metadata?: Record<string, any>) => {
        logger.info(`Agent: ${agentName} - ${action}`, { component: 'agent', agentName, ...metadata });
    },

    /**
     * Log issue/PR operations
     */
    issue: (operation: string, issueNumber: number, metadata?: Record<string, any>) => {
        logger.info(`Issue #${issueNumber}: ${operation}`, {
            component: 'issue',
            issueNumber,
            ...metadata,
        });
    },

    /**
     * Log performance metrics
     */
    perf: (operation: string, duration: number, metadata?: Record<string, any>) => {
        logger.info(`Performance: ${operation} took ${duration}ms`, {
            component: 'performance',
            duration,
            ...metadata,
        });
    },
};

export default logger;
