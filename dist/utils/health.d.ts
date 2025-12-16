/**
 * Health Check Utility
 *
 * Provides health check endpoints and system status
 */
export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    uptime: number;
    checks: {
        [key: string]: {
            status: 'pass' | 'fail' | 'warn';
            message?: string;
            responseTime?: number;
        };
    };
}
/**
 * Perform comprehensive health check
 */
export declare function getHealthStatus(): Promise<HealthStatus>;
/**
 * Simple health check (minimal overhead)
 */
export declare function getSimpleHealth(): {
    status: 'ok';
    uptime: number;
};
//# sourceMappingURL=health.d.ts.map