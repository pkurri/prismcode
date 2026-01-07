/**
 * Team Knowledge Graph
 * Issue #262: Team Knowledge Graph
 *
 * Visualizes code relationships and team expertise
 */

import logger from '../utils/logger';

export interface KnowledgeNode {
  id: string;
  type: 'file' | 'function' | 'class' | 'module' | 'concept' | 'person';
  name: string;
  metadata: Record<string, unknown>;
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  relationship: 'imports' | 'calls' | 'extends' | 'owns' | 'knows' | 'authored';
  weight: number;
}

export interface TeamMember {
  id: string;
  name: string;
  expertise: ExpertiseArea[];
  contributions: Contribution[];
}

export interface ExpertiseArea {
  area: string;
  level: 'novice' | 'intermediate' | 'expert';
  files: string[];
}

export interface Contribution {
  file: string;
  commits: number;
  linesChanged: number;
  lastModified: Date;
}

export interface KnowledgeGraph {
  nodes: Map<string, KnowledgeNode>;
  edges: KnowledgeEdge[];
  teamMembers: Map<string, TeamMember>;
  lastUpdated: Date;
}

export interface KnowledgeQuery {
  type: 'expert-for' | 'dependencies-of' | 'related-to' | 'owned-by';
  target: string;
  depth?: number;
}

export interface QueryResult {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  experts?: TeamMember[];
}

/**
 * Knowledge Graph Manager
 * Builds and queries code knowledge relationships
 */
export class KnowledgeGraphManager {
  private graph: KnowledgeGraph;

  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: [],
      teamMembers: new Map(),
      lastUpdated: new Date(),
    };
    logger.info('KnowledgeGraphManager initialized');
  }

  /**
   * Add a node to the graph
   */
  addNode(node: KnowledgeNode): void {
    this.graph.nodes.set(node.id, node);
    this.graph.lastUpdated = new Date();
  }

  /**
   * Add an edge to the graph
   */
  addEdge(edge: KnowledgeEdge): void {
    this.graph.edges.push(edge);
    this.graph.lastUpdated = new Date();
  }

  /**
   * Register a team member
   */
  registerTeamMember(member: TeamMember): void {
    this.graph.teamMembers.set(member.id, member);

    // Create person node
    this.addNode({
      id: `person_${member.id}`,
      type: 'person',
      name: member.name,
      metadata: { expertiseCount: member.expertise.length },
    });

    // Create edges for file ownership
    for (const contribution of member.contributions) {
      this.addEdge({
        source: `person_${member.id}`,
        target: contribution.file,
        relationship: 'authored',
        weight: contribution.commits,
      });
    }

    logger.info('Team member registered', { name: member.name });
  }

  /**
   * Build graph from file dependencies
   */
  buildFromDependencies(dependencies: { file: string; imports: string[] }[]): void {
    for (const dep of dependencies) {
      // Add file node
      this.addNode({
        id: dep.file,
        type: 'file',
        name: dep.file.split('/').pop() || dep.file,
        metadata: { importCount: dep.imports.length },
      });

      // Add import edges
      for (const imported of dep.imports) {
        this.addEdge({
          source: dep.file,
          target: imported,
          relationship: 'imports',
          weight: 1,
        });
      }
    }

    logger.info('Graph built from dependencies', { fileCount: dependencies.length });
  }

  /**
   * Query the knowledge graph
   */
  query(q: KnowledgeQuery): QueryResult {
    switch (q.type) {
      case 'expert-for':
        return this.findExperts(q.target);
      case 'dependencies-of':
        return this.findDependencies(q.target, q.depth || 1);
      case 'related-to':
        return this.findRelated(q.target, q.depth || 2);
      case 'owned-by':
        return this.findOwnedFiles(q.target);
      default:
        return { nodes: [], edges: [] };
    }
  }

  /**
   * Find experts for a file or concept
   */
  private findExperts(target: string): QueryResult {
    const experts: TeamMember[] = [];

    for (const member of this.graph.teamMembers.values()) {
      const isExpert = member.expertise.some(
        (e) => e.files.includes(target) || e.area.toLowerCase().includes(target.toLowerCase())
      );

      if (isExpert) {
        experts.push(member);
      }
    }

    // Sort by expertise level
    experts.sort((a, b) => {
      const aLevel = a.expertise.find((e) => e.files.includes(target))?.level || 'novice';
      const bLevel = b.expertise.find((e) => e.files.includes(target))?.level || 'novice';
      const levels = { novice: 1, intermediate: 2, expert: 3 };
      return levels[bLevel] - levels[aLevel];
    });

    return { nodes: [], edges: [], experts };
  }

  /**
   * Find file dependencies
   */
  private findDependencies(file: string, depth: number): QueryResult {
    const visited = new Set<string>();
    const nodes: KnowledgeNode[] = [];
    const edges: KnowledgeEdge[] = [];

    const traverse = (current: string, currentDepth: number): void => {
      if (currentDepth > depth || visited.has(current)) return;
      visited.add(current);

      const node = this.graph.nodes.get(current);
      if (node) nodes.push(node);

      for (const edge of this.graph.edges) {
        if (edge.source === current && edge.relationship === 'imports') {
          edges.push(edge);
          traverse(edge.target, currentDepth + 1);
        }
      }
    };

    traverse(file, 0);
    return { nodes, edges };
  }

  /**
   * Find related nodes
   */
  private findRelated(target: string, depth: number): QueryResult {
    const visited = new Set<string>();
    const nodes: KnowledgeNode[] = [];
    const edges: KnowledgeEdge[] = [];

    const traverse = (current: string, currentDepth: number): void => {
      if (currentDepth > depth || visited.has(current)) return;
      visited.add(current);

      const node = this.graph.nodes.get(current);
      if (node) nodes.push(node);

      for (const edge of this.graph.edges) {
        if (edge.source === current || edge.target === current) {
          edges.push(edge);
          const next = edge.source === current ? edge.target : edge.source;
          traverse(next, currentDepth + 1);
        }
      }
    };

    traverse(target, 0);
    return { nodes, edges };
  }

  /**
   * Find files owned by a person
   */
  private findOwnedFiles(personId: string): QueryResult {
    const member = this.graph.teamMembers.get(personId);
    if (!member) return { nodes: [], edges: [] };

    const nodes: KnowledgeNode[] = [];
    const edges: KnowledgeEdge[] = [];

    for (const contribution of member.contributions) {
      const node = this.graph.nodes.get(contribution.file);
      if (node) nodes.push(node);

      edges.push({
        source: `person_${personId}`,
        target: contribution.file,
        relationship: 'authored',
        weight: contribution.commits,
      });
    }

    return { nodes, edges };
  }

  /**
   * Get graph statistics
   */
  getStats(): { nodeCount: number; edgeCount: number; memberCount: number } {
    return {
      nodeCount: this.graph.nodes.size,
      edgeCount: this.graph.edges.length,
      memberCount: this.graph.teamMembers.size,
    };
  }

  /**
   * Export graph for visualization
   */
  exportGraph(): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
    return {
      nodes: Array.from(this.graph.nodes.values()),
      edges: this.graph.edges,
    };
  }
}

export const knowledgeGraphManager = new KnowledgeGraphManager();
