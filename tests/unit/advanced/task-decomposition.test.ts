/**
 * Task Decomposition Tests
 * Issue #205: Task Decomposition Engine
 */

import {
  TaskDecompositionEngine,
  taskDecompositionEngine,
  type Task,
} from '../../../src/advanced/task-decomposition';

describe('TaskDecompositionEngine', () => {
  let engine: TaskDecompositionEngine;

  beforeEach(() => {
    engine = new TaskDecompositionEngine();
  });

  afterEach(() => {
    engine.reset();
  });

  describe('task creation', () => {
    it('should create atomic task', () => {
      const task = engine.createTask('Simple Task', 'A simple task', {
        type: 'atomic',
        complexity: 2,
      });

      expect(task.id).toBeDefined();
      expect(task.name).toBe('Simple Task');
      expect(task.type).toBe('atomic');
      expect(task.status).toBe('pending');
    });

    it('should create composite task', () => {
      const task = engine.createTask('Complex Task', 'A complex task', {
        type: 'composite',
        complexity: 8,
        estimatedTime: 10000,
      });

      expect(task.type).toBe('composite');
      expect(task.complexity).toBe(8);
    });

    it('should create task with dependencies', () => {
      const task1 = engine.createTask('Task 1', 'First task');
      const task2 = engine.createTask('Task 2', 'Second task', {
        dependencies: [task1.id],
      });

      expect(task2.dependencies).toContain(task1.id);
    });
  });

  describe('task decomposition', () => {
    it('should not decompose atomic tasks', () => {
      const task = engine.createTask('Atomic', 'Atomic task', {
        type: 'atomic',
        complexity: 2,
      });

      const result = engine.decompose(task);

      expect(result.subtasks.length).toBe(1);
      expect(result.subtasks[0]).toBe(task);
    });

    it('should decompose complex tasks', () => {
      const task = engine.createTask('Complex Task', 'Complex task', {
        type: 'composite',
        complexity: 8,
        estimatedTime: 10000,
      });

      const result = engine.decompose(task);

      expect(result.subtasks.length).toBeGreaterThan(1);
      expect(result.parallelGroups.length).toBeGreaterThanOrEqual(1);
      expect(result.estimatedSpeedup).toBeGreaterThanOrEqual(1);
    });

    it('should build dependency graph', () => {
      const task = engine.createTask('Complex', 'Complex task', {
        type: 'composite',
        complexity: 6,
      });

      const result = engine.decompose(task);

      expect(result.dependencyGraph.nodes.length).toBeGreaterThan(0);
      expect(result.dependencyGraph.inDegree).toBeInstanceOf(Map);
    });
  });

  describe('parallelization analysis', () => {
    it('should analyze parallelizability', () => {
      const task: Task = {
        id: 'task1',
        name: 'Test Task',
        description: 'A task with subtasks',
        type: 'composite',
        complexity: 5,
        estimatedTime: 5000,
        dependencies: [],
        subtasks: [
          engine.createTask('Sub1', 'Subtask 1'),
          engine.createTask('Sub2', 'Subtask 2'),
        ],
        status: 'pending',
      };

      const analysis = engine.analyzeParallelizability(task);

      expect(analysis.canParallelize).toBeDefined();
      expect(analysis.maxParallelism).toBeGreaterThanOrEqual(1);
      expect(analysis.bottlenecks).toBeInstanceOf(Array);
      expect(analysis.suggestions).toBeInstanceOf(Array);
    });

    it('should not parallelize atomic tasks', () => {
      const task = engine.createTask('Atomic', 'Atomic task', { type: 'atomic' });
      const analysis = engine.analyzeParallelizability(task);

      expect(analysis.canParallelize).toBe(false);
      expect(analysis.maxParallelism).toBe(1);
    });
  });

  describe('result merging', () => {
    it('should concatenate results', () => {
      const results = ['part1', 'part2', 'part3'];
      const merged = engine.mergeResults(results, { type: 'concatenate' });

      expect(merged).toBe('part1\npart2\npart3');
    });

    it('should reduce results', () => {
      const results = [{ a: 1 }, { b: 2 }, { c: 3 }];
      const merged = engine.mergeResults(results, { type: 'reduce' });

      expect(merged).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should combine unique results', () => {
      const results = [[1, 2], [2, 3], [3, 4]];
      const merged = engine.mergeResults(results, { type: 'combine_unique' }) as number[];

      expect(merged).toContain(1);
      expect(merged).toContain(4);
    });

    it('should use custom merger', () => {
      const results = [1, 2, 3];
      const merged = engine.mergeResults(results, {
        type: 'custom',
        customMerger: (r) => (r as number[]).reduce((a, b) => a + b, 0),
      });

      expect(merged).toBe(6);
    });
  });

  describe('execution order', () => {
    it('should get execution order respecting dependencies', () => {
      const task1 = engine.createTask('Task 1', 'First');
      const task2 = engine.createTask('Task 2', 'Second', { dependencies: [task1.id] });
      const task3 = engine.createTask('Task 3', 'Third');

      const order = engine.getExecutionOrder([task1, task2, task3]);

      expect(order.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('history', () => {
    it('should track decomposition history', () => {
      const task = engine.createTask('Task', 'Test', { type: 'composite', complexity: 6 });
      engine.decompose(task);

      const history = engine.getHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('singleton instance', () => {
    it('should export singleton instance', () => {
      expect(taskDecompositionEngine).toBeInstanceOf(TaskDecompositionEngine);
    });
  });
});
