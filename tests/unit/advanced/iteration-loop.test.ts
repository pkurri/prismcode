import {
  IterationLoopController,
  IterationConfig,
  IterationResult,
  IterationRecord,
  ErrorType,
  withRetries,
} from '../../../src/advanced/iteration-loop';

describe('Iteration Loop Controller', () => {
  let controller: IterationLoopController;

  beforeEach(() => {
    controller = new IterationLoopController({
      maxIterations: 5,
      initialBackoffMs: 10,
      maxBackoffMs: 100,
      backoffMultiplier: 2,
    });
  });

  describe('Basic Execution', () => {
    it('should execute a successful task on first try', async () => {
      const task = jest.fn().mockResolvedValue('success');

      const result = await controller.execute(task, 'test-task');

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.totalIterations).toBe(1);
      expect(result.history).toHaveLength(1);
      expect(result.history[0].success).toBe(true);
    });

    it('should retry on transient failure and eventually succeed', async () => {
      let attempts = 0;
      const task = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('ECONNRESET');
        }
        return 'success';
      });

      const result = await controller.execute(task, 'retry-task');

      expect(result.success).toBe(true);
      expect(result.result).toBe('success');
      expect(result.totalIterations).toBe(3);
      expect(task).toHaveBeenCalledTimes(3);
    });

    it('should fail after max iterations', async () => {
      const task = jest.fn().mockRejectedValue(new Error('Always fails'));

      const result = await controller.execute(task, 'failing-task');

      expect(result.success).toBe(false);
      expect(result.totalIterations).toBe(5);
      expect(result.finalError?.message).toBe('Always fails');
      expect(task).toHaveBeenCalledTimes(5);
    });
  });

  describe('Error Classification', () => {
    it('should classify transient errors correctly', () => {
      const transientErrors = [
        new Error('ECONNRESET'),
        new Error('ETIMEDOUT'),
        new Error('rate limit exceeded'),
        new Error('503 Service Unavailable'),
        new Error('Network error'),
      ];

      for (const error of transientErrors) {
        expect(controller.classifyError(error)).toBe('transient');
      }
    });

    it('should classify permanent errors correctly', () => {
      const permanentErrors = [
        new Error('syntax error: unexpected token'),
        new Error('undefined is not a function'),
        new Error("TypeError: Cannot read property 'x' of null"),
        new Error('Permission denied'),
      ];

      for (const error of permanentErrors) {
        expect(controller.classifyError(error)).toBe('permanent');
      }
    });

    it('should classify unknown errors as unknown', () => {
      const unknownError = new Error('Some random error message');
      expect(controller.classifyError(unknownError)).toBe('unknown');
    });

    it('should stop immediately on permanent errors', async () => {
      const task = jest.fn().mockRejectedValue(new Error('syntax error'));

      const result = await controller.execute(task, 'permanent-error-task');

      expect(result.success).toBe(false);
      expect(result.totalIterations).toBe(1);
      expect(task).toHaveBeenCalledTimes(1);
    });
  });

  describe('Backoff Behavior', () => {
    it('should apply exponential backoff between retries', async () => {
      const startTime = Date.now();
      let attempts = 0;
      const task = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 4) {
          throw new Error('ETIMEDOUT');
        }
        return 'success';
      });

      const result = await controller.execute(task, 'backoff-task');

      const elapsed = Date.now() - startTime;
      // With 3 failures and backoff: ~10 + ~20 + ~40 = ~70ms minimum
      expect(elapsed).toBeGreaterThan(50);
      expect(result.success).toBe(true);
    });

    it('should cap backoff at maxBackoffMs', async () => {
      const controllerWithLowMax = new IterationLoopController({
        maxIterations: 10,
        initialBackoffMs: 50,
        maxBackoffMs: 60,
        backoffMultiplier: 10,
      });

      let attempts = 0;
      const task = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('ETIMEDOUT');
        }
        return 'success';
      });

      const startTime = Date.now();
      await controllerWithLowMax.execute(task, 'capped-backoff-task');
      const elapsed = Date.now() - startTime;

      // Should not exceed 60ms per backoff × 2 retries = 120ms + some overhead
      expect(elapsed).toBeLessThan(300);
    });
  });

  describe('Cancellation', () => {
    it('should stop on cancellation', async () => {
      let attempts = 0;
      const task = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts === 2) {
          controller.cancel();
        }
        throw new Error('Keep trying');
      });

      const result = await controller.execute(task, 'cancellable-task');

      expect(result.cancelled).toBe(true);
      expect(result.success).toBe(false);
      expect(controller.isCancelled()).toBe(true);
    });

    it('should be cancellable before any iterations', () => {
      controller.cancel();
      expect(controller.isCancelled()).toBe(true);
    });
  });

  describe('Iteration History', () => {
    it('should track iteration history', async () => {
      let attempts = 0;
      const task = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Network timeout');
        }
        return 'data';
      });

      const result = await controller.execute(task, 'history-task');

      expect(result.history).toHaveLength(3);
      expect(result.history[0].success).toBe(false);
      expect(result.history[0].errorType).toBe('transient');
      expect(result.history[1].success).toBe(false);
      expect(result.history[2].success).toBe(true);
    });

    it('should include timing information', async () => {
      const task = jest.fn().mockImplementation(async () => {
        await new Promise((r) => setTimeout(r, 10));
        return 'done';
      });

      const result = await controller.execute(task, 'timing-task');

      const record = result.history[0];
      expect(record.startTime).toBeInstanceOf(Date);
      expect(record.endTime).toBeInstanceOf(Date);
      expect(record.endTime!.getTime()).toBeGreaterThanOrEqual(record.startTime.getTime());
    });
  });

  describe('Callbacks', () => {
    it('should call onIteration callback for each iteration', async () => {
      const onIteration = jest.fn();
      const controllerWithCallback = new IterationLoopController({
        maxIterations: 3,
        initialBackoffMs: 1,
        onIteration,
      });

      let attempts = 0;
      const task = jest.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 2) throw new Error('retry');
        return 'done';
      });

      await controllerWithCallback.execute(task, 'callback-task');

      expect(onIteration).toHaveBeenCalledTimes(1); // Only called on successful iteration
    });

    it('should call onError callback for errors', async () => {
      const onError = jest.fn();
      const controllerWithCallback = new IterationLoopController({
        maxIterations: 2,
        initialBackoffMs: 1,
        onError,
      });

      const task = jest.fn().mockRejectedValue(new Error('test error'));

      await controllerWithCallback.execute(task, 'error-callback-task');

      expect(onError).toHaveBeenCalledTimes(2);
      expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(String));
    });
  });

  describe('Custom Retry Logic', () => {
    it('should respect custom shouldRetry function', async () => {
      const shouldRetry = jest.fn().mockReturnValueOnce(true).mockReturnValue(false);
      const controllerWithCustomRetry = new IterationLoopController({
        maxIterations: 10,
        initialBackoffMs: 1,
        shouldRetry,
      });

      const task = jest.fn().mockRejectedValue(new Error('custom'));

      const result = await controllerWithCustomRetry.execute(task, 'custom-retry-task');

      expect(result.totalIterations).toBe(2);
      expect(shouldRetry).toHaveBeenCalledTimes(2);
    });
  });

  describe('withRetries Helper', () => {
    it('should return result on success', async () => {
      const result = await withRetries(async () => 'hello', { maxIterations: 3 });
      expect(result).toBe('hello');
    });

    it('should throw on failure', async () => {
      await expect(
        withRetries(
          async () => {
            throw new Error('permanent error: syntax');
          },
          { maxIterations: 1 }
        )
      ).rejects.toThrow();
    });
  });

  describe('Reset', () => {
    it('should reset state for reuse', async () => {
      const task = jest.fn().mockResolvedValue('first');
      await controller.execute(task, 'first-task');

      expect(controller.getHistory()).toHaveLength(1);

      controller.reset();

      expect(controller.getHistory()).toHaveLength(0);
      expect(controller.getCurrentIteration()).toBe(0);
      expect(controller.isCancelled()).toBe(false);
    });
  });
});
