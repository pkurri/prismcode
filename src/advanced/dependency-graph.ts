/**
 * Dependency Graph Viewer Service
 * Issue #140: Dependency Graph Viewer
 *
 * Visualize project dependencies
 */

import logger from '../utils/logger';

export interface DependencyNode {
  id: string;
  name: string;
  version: string;
  type: 'direct' | 'transitive';
  level: number;
  dependencies: string[];
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'production' | 'development' | 'peer';
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  metadata: {
    totalDirect: number;
    totalTransitive: number;
    maxDepth: number;
  };
}

export interface DependencyAnalysis {
  outdated: Array<{ name: string; current: string; latest: string }>;
  vulnerable: Array<{ name: string; severity: string; advisory: string }>;
  duplicates: Array<{ name: string; versions: string[] }>;
}

/**
 * Dependency Graph Manager
 * Analyzes and visualizes project dependencies
 */
export class DependencyGraphManager {
  private nodes: Map<string, DependencyNode> = new Map();
  private edges: DependencyEdge[] = [];

  constructor() {
    logger.info('DependencyGraphManager initialized');
  }

  /**
   * Add dependency node
   */
  addNode(
    name: string,
    version: string,
    type: DependencyNode['type'],
    level: number = 0
  ): DependencyNode {
    const id = `${name}@${version}`;

    const node: DependencyNode = {
      id,
      name,
      version,
      type,
      level,
      dependencies: [],
    };

    this.nodes.set(id, node);
    return node;
  }

  /**
   * Add edge between dependencies
   */
  addEdge(fromId: string, toId: string, type: DependencyEdge['type'] = 'production'): boolean {
    const fromNode = this.nodes.get(fromId);
    const toNode = this.nodes.get(toId);

    if (!fromNode || !toNode) return false;

    fromNode.dependencies.push(toId);
    this.edges.push({ from: fromId, to: toId, type });

    return true;
  }

  /**
   * Build graph from package.json (mock)
   */
  buildFromPackageJson(packageJson: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }): DependencyGraph {
    this.reset();

    // Add direct dependencies
    if (packageJson.dependencies) {
      for (const [name, version] of Object.entries(packageJson.dependencies)) {
        this.addNode(name, version, 'direct', 0);
      }
    }

    if (packageJson.devDependencies) {
      for (const [name, version] of Object.entries(packageJson.devDependencies)) {
        this.addNode(name, version, 'direct', 0);
      }
    }

    return this.getGraph();
  }

  /**
   * Get full graph
   */
  getGraph(): DependencyGraph {
    const nodes = Array.from(this.nodes.values());
    const directCount = nodes.filter((n) => n.type === 'direct').length;
    const transitiveCount = nodes.filter((n) => n.type === 'transitive').length;
    const maxDepth = Math.max(...nodes.map((n) => n.level), 0);

    return {
      nodes,
      edges: this.edges,
      metadata: {
        totalDirect: directCount,
        totalTransitive: transitiveCount,
        maxDepth,
      },
    };
  }

  /**
   * Get node by ID
   */
  getNode(id: string): DependencyNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Find dependents of a package
   */
  findDependents(nodeId: string): string[] {
    return this.edges.filter((e) => e.to === nodeId).map((e) => e.from);
  }

  /**
   * Find dependencies of a package
   */
  findDependencies(nodeId: string): string[] {
    return this.edges.filter((e) => e.from === nodeId).map((e) => e.to);
  }

  /**
   * Analyze dependencies (mock)
   */
  analyze(): DependencyAnalysis {
    return {
      outdated: [],
      vulnerable: [],
      duplicates: [],
    };
  }

  /**
   * Export as DOT format
   */
  exportAsDot(): string {
    let dot = 'digraph Dependencies {\n';
    for (const node of this.nodes.values()) {
      dot += `  "${node.id}" [label="${node.name}\\n${node.version}"];\n`;
    }
    for (const edge of this.edges) {
      dot += `  "${edge.from}" -> "${edge.to}";\n`;
    }
    dot += '}';
    return dot;
  }

  /**
   * Reset
   */
  reset(): void {
    this.nodes.clear();
    this.edges = [];
    logger.info('DependencyGraphManager reset');
  }
}

export const dependencyGraphManager = new DependencyGraphManager();
