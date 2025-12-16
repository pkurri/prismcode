"use strict";
/**
 * Health Check Utility
 *
 * Provides health check endpoints and system status
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealthStatus = getHealthStatus;
exports.getSimpleHealth = getSimpleHealth;
const logger_1 = __importDefault(require("./logger"));
/**
 * Check if GitHub API is accessible
 */
async function checkGitHubAPI() {
    const startTime = Date.now();
    try {
        // Simple check - verify token and basic connectivity
        if (!process.env.GITHUB_TOKEN) {
            return {
                status: 'fail',
                message: 'GitHub token not configured',
                responseTime: Date.now() - startTime,
            };
        }
        // If we have Octokit, we could do a real API call here
        // For now, just verify token exists
        return {
            status: 'pass',
            responseTime: Date.now() - startTime,
        };
    }
    catch (error) {
        return {
            status: 'fail',
            message: error instanceof Error ? error.message : 'Unknown error',
            responseTime: Date.now() - startTime,
        };
    }
}
/**
 * Check environment configuration
 */
function checkEnvironment() {
    const requiredVars = ['GITHUB_TOKEN'];
    const missing = requiredVars.filter((v) => !process.env[v]);
    if (missing.length > 0) {
        return {
            status: 'warn',
            message: `Missing environment variables: ${missing.join(', ')}`,
        };
    }
    return { status: 'pass' };
}
/**
 * Check system resources
 */
function checkSystemResources() {
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    // Warn if using more than 500MB
    if (memUsageMB > 500) {
        return {
            status: 'warn',
            message: `High memory usage: ${memUsageMB}MB`,
        };
    }
    return { status: 'pass' };
}
/**
 * Perform comprehensive health check
 */
async function getHealthStatus() {
    logger_1.default.info('Performing health check');
    const checks = {};
    // Run all checks
    checks.github = await checkGitHubAPI();
    checks.environment = checkEnvironment();
    checks.system = checkSystemResources();
    // Determine overall status
    const hasFailure = Object.values(checks).some((c) => c.status === 'fail');
    const hasWarning = Object.values(checks).some((c) => c.status === 'warn');
    let status;
    if (hasFailure) {
        status = 'unhealthy';
    }
    else if (hasWarning) {
        status = 'degraded';
    }
    else {
        status = 'healthy';
    }
    const healthStatus = {
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks,
    };
    logger_1.default.info('Health check complete', { status });
    return healthStatus;
}
/**
 * Simple health check (minimal overhead)
 */
function getSimpleHealth() {
    return {
        status: 'ok',
        uptime: process.uptime(),
    };
}
//# sourceMappingURL=health.js.map