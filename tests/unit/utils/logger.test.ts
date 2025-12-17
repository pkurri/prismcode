import logger, { loggers } from '../../../src/utils/logger';

describe('Logger', () => {
    it('should have default logger instance', () => {
        expect(logger).toBeDefined();
        expect(typeof logger.info).toBe('function');
        expect(typeof logger.error).toBe('function');
    });

    it('should have helper loggers', () => {
        expect(loggers.github).toBeDefined();
        expect(loggers.agent).toBeDefined();
        expect(loggers.issue).toBeDefined();
        expect(loggers.perf).toBeDefined();
    });

    it('should log without errors', () => {
        expect(() => {
            logger.info('Test log message');
            loggers.github('test_action', { test: true });
            loggers.agent('TestAgent', 'test action');
        }).not.toThrow();
    });
});
