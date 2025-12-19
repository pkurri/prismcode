/**
 * Dependency Graph Viewer Tests
 * Tests for Issue #140
 */

import { DependencyGraphManager } from '../../../src/advanced/dependency-graph';

describe('DependencyGraphManager', () => {
  let manager: DependencyGraphManager;

  beforeEach(() => {
    manager = new DependencyGraphManager();
    manager.reset();
  });

  describe('addNode', () => {
    it('should add dependency node', () => {
      const node = manager.addNode('lodash', '4.17.21', 'direct');

      expect(node.id).toBe('lodash@4.17.21');
      expect(node.type).toBe('direct');
    });
  });

  describe('addEdge', () => {
    it('should add edge between nodes', () => {
      manager.addNode('lodash', '4.17.21', 'direct');
      manager.addNode('lodash-es', '4.17.21', 'transitive');

      const result = manager.addEdge('lodash@4.17.21', 'lodash-es@4.17.21');
      expect(result).toBe(true);
    });
  });

  describe('buildFromPackageJson', () => {
    it('should build graph from package.json', () => {
      const graph = manager.buildFromPackageJson({
        dependencies: { express: '^4.18.0', lodash: '^4.17.0' },
        devDependencies: { jest: '^29.0.0' },
      });

      expect(graph.nodes.length).toBe(3);
      expect(graph.metadata.totalDirect).toBe(3);
    });
  });

  describe('getGraph', () => {
    it('should return complete graph', () => {
      manager.addNode('pkg1', '1.0.0', 'direct', 0);
      manager.addNode('pkg2', '2.0.0', 'transitive', 1);

      const graph = manager.getGraph();

      expect(graph.nodes.length).toBe(2);
      expect(graph.metadata.maxDepth).toBe(1);
    });
  });

  describe('findDependents', () => {
    it('should find dependents of package', () => {
      manager.addNode('parent', '1.0.0', 'direct');
      manager.addNode('child', '1.0.0', 'transitive');
      manager.addEdge('parent@1.0.0', 'child@1.0.0');

      const dependents = manager.findDependents('child@1.0.0');
      expect(dependents).toContain('parent@1.0.0');
    });
  });

  describe('findDependencies', () => {
    it('should find dependencies of package', () => {
      manager.addNode('parent', '1.0.0', 'direct');
      manager.addNode('child', '1.0.0', 'transitive');
      manager.addEdge('parent@1.0.0', 'child@1.0.0');

      const deps = manager.findDependencies('parent@1.0.0');
      expect(deps).toContain('child@1.0.0');
    });
  });

  describe('exportAsDot', () => {
    it('should export as DOT format', () => {
      manager.addNode('pkg', '1.0.0', 'direct');
      const dot = manager.exportAsDot();

      expect(dot).toContain('digraph Dependencies');
      expect(dot).toContain('pkg@1.0.0');
    });
  });
});
