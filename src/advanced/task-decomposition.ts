/**
 * Task Decomposition Engine
 * Issue #203: Task Decomposition Engine
 *
 * Split complex tasks for parallel execution
 */

import logger from '../utils/logger';

export interface Task {
  id: string;
  name: string;
  description: string;
  type: 'atomic' | 'composite';
  complexity: number; // 1-10
  estimatedTime: number; // ms
  dependencies: string[];
  subtasks: Task[];
  status: 'pending' | 'ready' | 'running' | 'completed' | 'failed';
  result?: unknown;
}

export interface DecompositionResult {
  originalTask: Task;
  subtasks: Task[];
  dependencyGraph: DependencyGraph;
  parallelGroups: Task[][];
  estimatedSpeedup: number;
}

export interface DependencyGraph {
  nodes: string[];
  edges: Array<{ from: string; to: string }>;
  inDegree: Map<string, number>;
  outDegree: Map<string, number>;
}

export interface MergeStrategy {
  type: 'concatenate' | 'reduce' | 'select_best' | 'combine_unique' | 'custom';
  customMerger?: (results: unknown[]) => unknown;
}

/**
 * Task Decomposition Engine
 * Analyzes tasks and splits them for parallel execution
 */
export class TaskDecompositionEngine {
  private taskCounter = 0;
  private decompositionHistory: DecompositionResult[] = [];

  constructor() {
    logger.info('TaskDecompositionEngine initialized');
  }

  /**
   * Decompose a task into subtasks
   */
  decompose(task: Task): DecompositionResult {
    logger.info('Decomposing task', { id: task.id, name: task.name });

    // If task is atomic or simple, return as-is
    if (task.type === 'atomic' || task.complexity <= 3) {
      return {
        originalTask: task,
        subtasks: [task],
        dependencyGraph: this.buildDependencyGraph([task]),
        parallelGroups: [[task]],
        estimatedSpeedup: 1,
      };
    }

    // Generate subtasks based on complexity
    const subtasks = this.generateSubtasks(task);
    const dependencyGraph = this.buildDependencyGraph(subtasks);
    const parallelGroups = this.findParallelGroups(subtasks, dependencyGraph);
    const estimatedSpeedup = this.calculateSpeedup(task, parallelGroups);

    const result: DecompositionResult = {
      originalTask: task,
      subtasks,
      dependencyGraph,
      parallelGroups,
      estimatedSpeedup,
    };

    this.decompositionHistory.push(result);
    logger.info('Task decomposed', { 
      subtasks: subtasks.length, 
      parallelGroups: parallelGroups.length,
      speedup: estimatedSpeedup.toFixed(2),
    });

    return result;
  }

  /**
   * Analyze task for parallelization potential
   */
  analyzeParallelizability(task: Task): {
    canParallelize: boolean;
    maxParallelism: number;
    bottlenecks: string[];
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    const bottlenecks: string[] = [];
    let maxParallelism = 1;

    if (task.type === 'atomic') {
      return { canParallelize: false, maxParallelism: 1, bottlenecks: [], suggestions: [] };
    }

    // Analyze subtasks
    if (task.subtasks.length > 0) {
      const independentTasks = task.subtasks.filter(t => t.dependencies.length === 0);
      maxParallelism = Math.max(1, independentTasks.length);

      // Find bottlenecks (tasks with many dependents)
      const dependencyCount: Record<string, number> = {};
      for (const subtask of task.subtasks) {
        for (const dep of subtask.dependencies) {
          dependencyCount[dep] = (dependencyCount[dep] || 0) + 1;
        }
      }

      for (const [taskId, count] of Object.entries(dependencyCount)) {
        if (count > 2) {
          bottlenecks.push(taskId);
        }
      }

      if (bottlenecks.length > 0) {
        suggestions.push('Consider breaking down bottleneck tasks to improve parallelism');
      }
    } else {
      suggestions.push('Task has no subtasks - consider manual decomposition');
    }

    return {
      canParallelize: maxParallelism > 1,
      maxParallelism,
      bottlenecks,
      suggestions,
    };
  }

  /**
   * Create a task
   */
  createTask(
    name: string,
    description: string,
    options: {
      type?: 'atomic' | 'composite';
      complexity?: number;
      estimatedTime?: number;
      dependencies?: string[];
    } = {}
  ): Task {
    return {
      id: `task_${++this.taskCounter}`,
      name,
      description,
      type: options.type || 'atomic',
      complexity: options.complexity || 5,
      estimatedTime: options.estimatedTime || 5000,
      dependencies: options.dependencies || [],
      subtasks: [],
      status: 'pending',
    };
  }

  /**
   * Merge results from parallel tasks
   */
  mergeResults(results: unknown[], strategy: MergeStrategy): unknown {
    switch (strategy.type) {
      case 'concatenate':
        return (results as string[]).join('\n');
      case 'reduce':
        return results.reduce((acc, r) => ({ ...acc as object, ...r as object }), {});
      case 'select_best':
        return results[0]; // Simplified - would use scoring
      case 'combine_unique':
        return [...new Set(results.flat())];
      case 'custom':
        return strategy.customMerger ? strategy.customMerger(results) : results;
      default:
        return results;
    }
  }

  /**
   * Get execution order respecting dependencies
   */
  getExecutionOrder(tasks: Task[]): Task[][] {
    return this.findParallelGroups(tasks, this.buildDependencyGraph(tasks));
  }

  /**
   * Get decomposition history
   */
  getHistory(limit: number = 10): DecompositionResult[] {
    return this.decompositionHistory.slice(-limit);
  }

  // Private helpers

  private generateSubtasks(task: Task): Task[] {
    const subtaskCount = Math.min(Math.ceil(task.complexity / 2), 5);
    const subtasks: Task[] = [];

    for (let i = 0; i < subtaskCount; i++) {
      const subtask: Task = {
        id: `${task.id}_sub_${i + 1}`,
        name: `${task.name} - Part ${i + 1}`,
        description: `Subtask ${i + 1} of ${task.name}`,
        type: 'atomic',
        complexity: Math.ceil(task.complexity / subtaskCount),
        estimatedTime: Math.ceil(task.estimatedTime / subtaskCount),
        dependencies: i > 0 && i % 2 === 0 ? [subtasks[i - 1].id] : [],
        subtasks: [],
        status: 'pending',
      };
      subtasks.push(subtask);
    }

    return subtasks;
  }

  private buildDependencyGraph(tasks: Task[]): DependencyGraph {
    const nodes = tasks.map(t => t.id);
    const edges: Array<{ from: string; to: string }> = [];
    const inDegree = new Map<string, number>();
    const outDegree = new Map<string, number>();

    for (const task of tasks) {
      inDegree.set(task.id, task.dependencies.length);
      outDegree.set(task.id, 0);

      for (const dep of task.dependencies) {
        edges.push({ from: dep, to: task.id });
        outDegree.set(dep, (outDegree.get(dep) || 0) + 1);
      }
    }

    return { nodes, edges, inDegree, outDegree };
  }

  private findParallelGroups(tasks: Task[], _graph: DependencyGraph): Task[][] {
    const groups: Task[][] = [];
    const completed = new Set<string>();
    let remaining = [...tasks];

    while (remaining.length > 0) {
      const ready = remaining.filter(t => 
        t.dependencies.every(d => completed.has(d))
      );

      if (ready.length === 0 && remaining.length > 0) {
        // Circular dependency, break
        groups.push(remaining);
        break;
      }

      groups.push(ready);
      ready.forEach(t => completed.add(t.id));
      remaining = remaining.filter(t => !completed.has(t.id));
    }

    return groups;
  }

  private calculateSpeedup(originalTask: Task, parallelGroups: Task[][]): number {
    if (parallelGroups.length === 0) return 1;

    const sequentialTime = originalTask.estimatedTime;
    const parallelTime = parallelGroups.reduce((max, group) => {
      const groupTime = Math.max(...group.map(t => t.estimatedTime));
      return max + groupTime;
    }, 0);

    return sequentialTime / Math.max(parallelTime, 1);
  }

  /**
   * Reset engine
   */
  reset(): void {
    this.taskCounter = 0;
    this.decompositionHistory = [];
    logger.info('TaskDecompositionEngine reset');
  }
}

export const taskDecompositionEngine = new TaskDecompositionEngine();
