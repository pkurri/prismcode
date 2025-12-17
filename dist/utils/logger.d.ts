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
declare const logger: winston.Logger;
export declare const stream: {
    write: (message: string) => void;
};
export declare const loggers: {
    /**
     * Log GitHub API call
     */
    github: (action: string, metadata?: Record<string, any>) => void;
    /**
     * Log agent activity
     */
    agent: (agentName: string, action: string, metadata?: Record<string, any>) => void;
    /**
     * Log issue/PR operations
     */
    issue: (operation: string, issueNumber: number, metadata?: Record<string, any>) => void;
    /**
     * Log performance metrics
     */
    perf: (operation: string, duration: number, metadata?: Record<string, any>) => void;
};
export default logger;
//# sourceMappingURL=logger.d.ts.map