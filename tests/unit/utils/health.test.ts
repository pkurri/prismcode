import { getHealthStatus, getSimpleHealth } from '../../../src/utils/health';

describe('Health Checks', () => {
    describe('getSimpleHealth', () => {
        it('should return ok status', () => {
            const health = getSimpleHealth();
            expect(health.status).toBe('ok');
            expect(health.uptime).toBeGreaterThan(0);
        });
    });

    describe('getHealthStatus', () => {
        it('should return comprehensive health status', async () => {
            const health = await getHealthStatus();

            expect(health.status).toBeDefined();
            expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status);
            expect(health.timestamp).toBeDefined();
            expect(health.uptime).toBeGreaterThan(0);
            expect(health.checks).toBeDefined();
        });

        it('should include check results', async () => {
            const health = await getHealthStatus();

            expect(health.checks.github).toBeDefined();
            expect(health.checks.environment).toBeDefined();
            expect(health.checks.system).toBeDefined();
        });
    });
});
