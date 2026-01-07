/**
 * Task Decomposition Engine Tests
 * Issue #205
 */

import { TaskDecompositionEngine } from '../../../src/advanced/task-decomposition';

describe('TaskDecompositionEngine', () => {
  let engine: TaskDecompositionEngine;

  beforeEach(() => {
    engine = new TaskDecompositionEngine({ maxParallelTasks: 3, maxDepth: 5 });
  });

  describe('decomposition', () => {
    it('should decompose a simple task graph', () => {
      const rootTask = {
        id: 'root',
        name: 'Build Feature',
        dependencies: [],
        priority: 1,
      };

      const subtasks = [
        { id: 'task-1', name: 'Design', dependencies: [], priority: 2 },
        { id: 'task-2', name: 'Implement', dependencies: ['task-1'], priority: 1 },
        { id: 'task-3', name: 'Test', dependencies: ['task-2'], priority: 1 },
      ];

      const result = engine.decompose(rootTask, subtasks);

      expect(result.graph.nodes.size).toBe(4);
      expect(result.executionLevels.length).toBeGreaterThan(0);
      // When no estimatedDurationMs provided, factor may be 0 or 1
      expect(result.parallelizationFactor).toBeGreaterThanOrEqual(0);
    });

    it('should detect circular dependencies', () => {
      const rootTask = { id: 'root', name: 'Root', dependencies: [], priority: 1 };
      const subtasks = [
        { id: 'task-1', name: 'Task 1', dependencies: ['task-2'], priority: 1 },
        { id: 'task-2', name: 'Task 2', dependencies: ['task-1'], priority: 1 },
      ];

      expect(() => engine.decompose(rootTask, subtasks)).toThrow('Circular dependency detected');
    });

    it('should throw on missing dependency', () => {
      const rootTask = { id: 'root', name: 'Root', dependencies: [], priority: 1 };
      const subtasks = [
        { id: 'task-1', name: 'Task 1', dependencies: ['nonexistent'], priority: 1 },
      ];

      expect(() => engine.decompose(rootTask, subtasks)).toThrow('Dependency not found');
    });
  });

  describe('execution levels', () => {
    it('should calculate correct execution levels', () => {
      const rootTask = { id: 'root', name: 'Root', dependencies: [], priority: 1 };
      const subtasks = [
        { id: 'a', name: 'A', dependencies: [], priority: 1 },
        { id: 'b', name: 'B', dependencies: [], priority: 1 },
        { id: 'c', name: 'C', dependencies: ['a', 'b'], priority: 1 },
      ];

      const result = engine.decompose(rootTask, subtasks);

      // Level 0: root, a, b (parallel)
      // Level 1: c
      expect(result.executionLevels.length).toBeGreaterThanOrEqual(2);
    });

    it('should respect maxParallelTasks limit', () => {
      const rootTask = { id: 'root', name: 'Root', dependencies: [], priority: 1 };
      const subtasks = [
        { id: 'a', name: 'A', dependencies: [], priority: 1 },
        { id: 'b', name: 'B', dependencies: [], priority: 1 },
        { id: 'c', name: 'C', dependencies: [], priority: 1 },
        { id: 'd', name: 'D', dependencies: [], priority: 1 },
        { id: 'e', name: 'E', dependencies: [], priority: 1 },
      ];

      const result = engine.decompose(rootTask, subtasks);

      // With maxParallelTasks = 3, first level should have max 3 tasks
      expect(result.executionLevels[0].length).toBeLessThanOrEqual(3);
    });
  });

  describe('critical path', () => {
    it('should find critical path', () => {
      const rootTask = {
        id: 'root',
        name: 'Root',
        dependencies: [],
        priority: 1,
        estimatedDurationMs: 100,
      };
      const subtasks = [
        { id: 'a', name: 'A', dependencies: [], priority: 1, estimatedDurationMs: 200 },
        { id: 'b', name: 'B', dependencies: ['a'], priority: 1, estimatedDurationMs: 300 },
        { id: 'c', name: 'C', dependencies: [], priority: 1, estimatedDurationMs: 100 },
      ];

      const result = engine.decompose(rootTask, subtasks);

      expect(result.criticalPath.length).toBeGreaterThan(0);
      // Critical path should include the longest chain
      expect(result.criticalPath).toContain('a');
      expect(result.criticalPath).toContain('b');
    });
  });

  describe('execution plan', () => {
    it('should create execution plan from decomposition', () => {
      const rootTask = {
        id: 'root',
        name: 'Root',
        dependencies: [],
        priority: 1,
        estimatedDurationMs: 100,
      };
      const subtasks = [
        { id: 'task-1', name: 'Task 1', dependencies: [], priority: 1, estimatedDurationMs: 200 },
      ];

      const result = engine.decompose(rootTask, subtasks);
      const plan = engine.createExecutionPlan(result);

      expect(plan.phases.length).toBeGreaterThan(0);
      expect(plan.totalEstimatedMs).toBe(result.estimatedTotalDurationMs);
    });
  });

  describe('merge strategies', () => {
    it('should merge results with concat strategy', () => {
      const concatEngine = new TaskDecompositionEngine({ mergeStrategy: 'concat' });
      const results = [[1, 2], [3, 4], [5]];
      const merged = concatEngine.mergeResults(results);
      expect(merged).toEqual([1, 2, 3, 4, 5]);
    });

    it('should merge results with reduce strategy', () => {
      const reduceEngine = new TaskDecompositionEngine({ mergeStrategy: 'reduce' });
      const results = [{ a: 1 }, { b: 2 }, { c: 3 }];
      const merged = reduceEngine.mergeResults(results);
      expect(merged).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should merge results with first strategy', () => {
      const firstEngine = new TaskDecompositionEngine({ mergeStrategy: 'first' });
      const results = ['first', 'second', 'third'];
      const merged = firstEngine.mergeResults(results);
      expect(merged).toBe('first');
    });

    it('should merge results with last strategy', () => {
      const lastEngine = new TaskDecompositionEngine({ mergeStrategy: 'last' });
      const results = ['first', 'second', 'third'];
      const merged = lastEngine.mergeResults(results);
      expect(merged).toBe('third');
    });
  });

  describe('ready tasks', () => {
    it('should return tasks with completed dependencies', () => {
      const rootTask = { id: 'root', name: 'Root', dependencies: [], priority: 1 };
      const subtasks = [
        { id: 'a', name: 'A', dependencies: [], priority: 2 },
        { id: 'b', name: 'B', dependencies: ['a'], priority: 1 },
      ];

      const result = engine.decompose(rootTask, subtasks);

      // Initially, root and a are ready
      let ready = engine.getReadyTasks(result.graph);
      expect(ready.some((t) => t.id === 'root')).toBe(true);
      expect(ready.some((t) => t.id === 'a')).toBe(true);
      expect(ready.some((t) => t.id === 'b')).toBe(false);

      // Complete 'a', now 'b' should be ready
      engine.updateTaskStatus(result.graph, 'a', 'completed');
      ready = engine.getReadyTasks(result.graph);
      expect(ready.some((t) => t.id === 'b')).toBe(true);
    });
  });
});
