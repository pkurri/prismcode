/**
 * Task Decomposition Engine
 * Issue #205 - Splits complex tasks for parallel execution
 */

/**
 * Task status tracking
 */
export type TaskStatus = 'pending' | 'ready' | 'running' | 'completed' | 'failed';

/**
 * Single task node in the dependency graph
 */
export interface TaskNode {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  dependencies: string[]; // IDs of tasks this depends on
  estimatedDurationMs?: number;
  actualDurationMs?: number;
  result?: unknown;
  error?: string;
  priority: number;
  parallelizable: boolean;
}

/**
 * Edge in the dependency graph
 */
export interface TaskEdge {
  from: string; // Dependency task ID
  to: string; // Dependent task ID
}

/**
 * Complete task graph
 */
export interface TaskGraph {
  nodes: Map<string, TaskNode>;
  edges: TaskEdge[];
  rootTaskId: string;
}

/**
 * Decomposition strategy options
 */
export interface DecompositionOptions {
  maxParallelTasks: number;
  maxDepth: number;
  mergeStrategy: 'concat' | 'reduce' | 'first' | 'last' | 'custom';
  customMerge?: (results: unknown[]) => unknown;
}

/**
 * Result of decomposition analysis
 */
export interface DecompositionResult {
  graph: TaskGraph;
  executionLevels: string[][]; // Tasks grouped by execution level
  criticalPath: string[]; // Longest dependency chain
  estimatedTotalDurationMs: number;
  parallelizationFactor: number; // How much speedup from parallelization
}

/**
 * Execution plan for a set of tasks
 */
export interface ExecutionPlan {
  phases: ExecutionPhase[];
  totalEstimatedMs: number;
}

/**
 * Single phase of execution (parallelizable tasks)
 */
export interface ExecutionPhase {
  level: number;
  tasks: string[];
  estimatedDurationMs: number;
}

/**
 * Default decomposition options
 */
const DEFAULT_OPTIONS: DecompositionOptions = {
  maxParallelTasks: 5,
  maxDepth: 10,
  mergeStrategy: 'concat',
};

/**
 * Task Decomposition Engine for parallel agent execution
 * Analyzes task dependencies and creates optimal execution plans
 */
export class TaskDecompositionEngine {
  private options: DecompositionOptions;

  constructor(options: Partial<DecompositionOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Decompose a complex task into subtasks
   */
  decompose(
    rootTask: Omit<TaskNode, 'status' | 'parallelizable'>,
    subtasks: Array<Omit<TaskNode, 'status' | 'parallelizable'>>
  ): DecompositionResult {
    const graph = this.buildGraph(rootTask, subtasks);
    this.validateGraph(graph);
    this.markParallelizable(graph);

    const executionLevels = this.calculateExecutionLevels(graph);
    const criticalPath = this.findCriticalPath(graph);
    const estimatedTotalDurationMs = this.estimateTotalDuration(executionLevels, graph);
    const sequentialDuration = this.estimateSequentialDuration(graph);
    const parallelizationFactor = sequentialDuration / Math.max(estimatedTotalDurationMs, 1);

    return {
      graph,
      executionLevels,
      criticalPath,
      estimatedTotalDurationMs,
      parallelizationFactor,
    };
  }

  /**
   * Build task graph from root and subtasks
   */
  private buildGraph(
    rootTask: Omit<TaskNode, 'status' | 'parallelizable'>,
    subtasks: Array<Omit<TaskNode, 'status' | 'parallelizable'>>
  ): TaskGraph {
    const nodes = new Map<string, TaskNode>();
    const edges: TaskEdge[] = [];

    // Add root task
    nodes.set(rootTask.id, {
      ...rootTask,
      status: 'pending',
      parallelizable: false,
    });

    // Add subtasks
    for (const subtask of subtasks) {
      nodes.set(subtask.id, {
        ...subtask,
        status: 'pending',
        parallelizable: true, // Will be refined later
      });

      // Create edges from dependencies
      for (const depId of subtask.dependencies) {
        edges.push({ from: depId, to: subtask.id });
      }
    }

    return { nodes, edges, rootTaskId: rootTask.id };
  }

  /**
   * Validate graph has no cycles and all dependencies exist
   */
  private validateGraph(graph: TaskGraph): void {
    // Check all dependencies exist
    for (const edge of graph.edges) {
      if (!graph.nodes.has(edge.from)) {
        throw new Error(`Dependency not found: ${edge.from}`);
      }
      if (!graph.nodes.has(edge.to)) {
        throw new Error(`Dependent task not found: ${edge.to}`);
      }
    }

    // Check for cycles using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = graph.edges.filter((e) => e.from === nodeId);
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.to)) {
          if (hasCycle(edge.to)) {
            return true;
          }
        } else if (recursionStack.has(edge.to)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of graph.nodes.keys()) {
      if (!visited.has(nodeId) && hasCycle(nodeId)) {
        throw new Error('Circular dependency detected in task graph');
      }
    }
  }

  /**
   * Mark tasks as parallelizable based on dependencies
   */
  private markParallelizable(graph: TaskGraph): void {
    for (const [nodeId, node] of graph.nodes) {
      // A task is parallelizable if it doesn't have overlapping dependencies
      // with other tasks at the same level
      const incomingCount = graph.edges.filter((e) => e.to === nodeId).length;
      const outgoingCount = graph.edges.filter((e) => e.from === nodeId).length;

      // Root node and serial bottlenecks are not parallelizable
      node.parallelizable = incomingCount <= 1 || outgoingCount <= 1;
    }
  }

  /**
   * Calculate execution levels (topological sort with levels)
   */
  private calculateExecutionLevels(graph: TaskGraph): string[][] {
    const inDegree = new Map<string, number>();
    const levels: string[][] = [];

    // Calculate in-degree for each node
    for (const nodeId of graph.nodes.keys()) {
      inDegree.set(nodeId, 0);
    }
    for (const edge of graph.edges) {
      inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
    }

    // Find all tasks with no dependencies (level 0)
    let currentLevel: string[] = [];
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        currentLevel.push(nodeId);
      }
    }

    // Process levels
    while (currentLevel.length > 0) {
      // Limit parallel tasks per level
      const limitedLevel = currentLevel.slice(0, this.options.maxParallelTasks);
      levels.push(limitedLevel);

      // If we had to limit, add remaining to process again
      const remaining = currentLevel.slice(this.options.maxParallelTasks);

      const nextLevel: string[] = [...remaining];

      for (const nodeId of limitedLevel) {
        // Reduce in-degree for dependents
        const outgoing = graph.edges.filter((e) => e.from === nodeId);
        for (const edge of outgoing) {
          const newDegree = (inDegree.get(edge.to) || 1) - 1;
          inDegree.set(edge.to, newDegree);
          if (newDegree === 0) {
            nextLevel.push(edge.to);
          }
        }
      }

      currentLevel = nextLevel;

      // Safety check for depth
      if (levels.length > this.options.maxDepth) {
        throw new Error(`Task graph exceeds maximum depth of ${this.options.maxDepth}`);
      }
    }

    return levels;
  }

  /**
   * Find critical path (longest duration chain)
   */
  private findCriticalPath(graph: TaskGraph): string[] {
    const memo = new Map<string, { duration: number; path: string[] }>();

    const findLongestPath = (nodeId: string): { duration: number; path: string[] } => {
      if (memo.has(nodeId)) {
        return memo.get(nodeId)!;
      }

      const node = graph.nodes.get(nodeId)!;
      const nodeDuration = node.estimatedDurationMs || 0;

      const outgoing = graph.edges.filter((e) => e.from === nodeId);
      if (outgoing.length === 0) {
        const result = { duration: nodeDuration, path: [nodeId] };
        memo.set(nodeId, result);
        return result;
      }

      let maxDuration = 0;
      let maxPath: string[] = [];

      for (const edge of outgoing) {
        const subPath = findLongestPath(edge.to);
        if (subPath.duration > maxDuration) {
          maxDuration = subPath.duration;
          maxPath = subPath.path;
        }
      }

      const result = {
        duration: nodeDuration + maxDuration,
        path: [nodeId, ...maxPath],
      };
      memo.set(nodeId, result);
      return result;
    };

    // Find starting nodes (no incoming edges)
    const startNodes = Array.from(graph.nodes.keys()).filter(
      (id) => !graph.edges.some((e) => e.to === id)
    );

    let longestPath: string[] = [];
    let longestDuration = 0;

    for (const startId of startNodes) {
      const result = findLongestPath(startId);
      if (result.duration > longestDuration) {
        longestDuration = result.duration;
        longestPath = result.path;
      }
    }

    return longestPath;
  }

  /**
   * Estimate total duration with parallelization
   */
  private estimateTotalDuration(levels: string[][], graph: TaskGraph): number {
    let total = 0;

    for (const level of levels) {
      let maxLevelDuration = 0;
      for (const taskId of level) {
        const node = graph.nodes.get(taskId);
        const duration = node?.estimatedDurationMs || 0;
        maxLevelDuration = Math.max(maxLevelDuration, duration);
      }
      total += maxLevelDuration;
    }

    return total;
  }

  /**
   * Estimate duration if executed sequentially
   */
  private estimateSequentialDuration(graph: TaskGraph): number {
    let total = 0;
    for (const node of graph.nodes.values()) {
      total += node.estimatedDurationMs || 0;
    }
    return total;
  }

  /**
   * Create an execution plan from decomposition result
   */
  createExecutionPlan(result: DecompositionResult): ExecutionPlan {
    const phases: ExecutionPhase[] = [];

    for (let i = 0; i < result.executionLevels.length; i++) {
      const tasks = result.executionLevels[i];
      let maxDuration = 0;

      for (const taskId of tasks) {
        const node = result.graph.nodes.get(taskId);
        maxDuration = Math.max(maxDuration, node?.estimatedDurationMs || 0);
      }

      phases.push({
        level: i,
        tasks,
        estimatedDurationMs: maxDuration,
      });
    }

    return {
      phases,
      totalEstimatedMs: result.estimatedTotalDurationMs,
    };
  }

  /**
   * Merge results based on strategy
   */
  mergeResults(results: unknown[]): unknown {
    switch (this.options.mergeStrategy) {
      case 'concat':
        return results.flat();
      case 'reduce':
        return results.reduce((acc, curr) => ({ ...(acc as object), ...(curr as object) }), {});
      case 'first':
        return results[0];
      case 'last':
        return results[results.length - 1];
      case 'custom':
        if (this.options.customMerge) {
          return this.options.customMerge(results);
        }
        return results;
      default:
        return results;
    }
  }

  /**
   * Get tasks ready for execution (all dependencies completed)
   */
  getReadyTasks(graph: TaskGraph): TaskNode[] {
    const readyTasks: TaskNode[] = [];

    for (const node of graph.nodes.values()) {
      if (node.status !== 'pending') {
        continue;
      }

      const allDepsCompleted = node.dependencies.every((depId) => {
        const depNode = graph.nodes.get(depId);
        return depNode?.status === 'completed';
      });

      if (allDepsCompleted || node.dependencies.length === 0) {
        readyTasks.push(node);
      }
    }

    return readyTasks.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Update task status in graph
   */
  updateTaskStatus(graph: TaskGraph, taskId: string, status: TaskStatus, result?: unknown): void {
    const node = graph.nodes.get(taskId);
    if (node) {
      node.status = status;
      if (result !== undefined) {
        node.result = result;
      }
    }
  }
}

/**
 * Singleton instance for convenience
 */
export const taskDecompositionEngine = new TaskDecompositionEngine();
