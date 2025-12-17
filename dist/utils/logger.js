"use strict";
/**
 * Logger Utility
 *
 * Centralized logging using Winston with support for:
 * - Console output (development)
 * - File output (production)
 * - Structured logging
 * - Log levels
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggers = exports.stream = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';
// Define log format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
// Console format for development
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'HH:mm:ss' }), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
}));
// Create logger instance
const logger = winston_1.default.createLogger({
    level: LOG_LEVEL,
    format: logFormat,
    defaultMeta: { service: 'prismcode' },
    transports: [],
});
// Add console transport for development
if (NODE_ENV !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: consoleFormat,
    }));
}
// Add file transports for production
if (NODE_ENV === 'production') {
    logger.add(new winston_1.default.transports.File({
        filename: path_1.default.join('logs', 'error.log'),
        level: 'error',
    }));
    logger.add(new winston_1.default.transports.File({
        filename: path_1.default.join('logs', 'combined.log'),
    }));
}
// Create a stream for Morgan HTTP logging (if using Express)
exports.stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};
// Helper methods for common logging patterns
exports.loggers = {
    /**
     * Log GitHub API call
     */
    github: (action, metadata) => {
        logger.info(`GitHub API: ${action}`, { component: 'github-api', ...metadata });
    },
    /**
     * Log agent activity
     */
    agent: (agentName, action, metadata) => {
        logger.info(`Agent: ${agentName} - ${action}`, { component: 'agent', agentName, ...metadata });
    },
    /**
     * Log issue/PR operations
     */
    issue: (operation, issueNumber, metadata) => {
        logger.info(`Issue #${issueNumber}: ${operation}`, {
            component: 'issue',
            issueNumber,
            ...metadata,
        });
    },
    /**
     * Log performance metrics
     */
    perf: (operation, duration, metadata) => {
        logger.info(`Performance: ${operation} took ${duration}ms`, {
            component: 'performance',
            duration,
            ...metadata,
        });
    },
};
exports.default = logger;
//# sourceMappingURL=logger.js.map