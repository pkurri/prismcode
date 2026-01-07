import { KnowledgeGraphManager } from '../../../src/advanced/knowledge-graph';

describe('KnowledgeGraphManager', () => {
  let manager: KnowledgeGraphManager;

  beforeEach(() => {
    manager = new KnowledgeGraphManager();
  });

  describe('addNode', () => {
    it('should add nodes to the graph', () => {
      manager.addNode({
        id: 'file1',
        type: 'file',
        name: 'utils.ts',
        metadata: {},
      });

      const stats = manager.getStats();
      expect(stats.nodeCount).toBe(1);
    });
  });

  describe('buildFromDependencies', () => {
    it('should build graph from file dependencies', () => {
      manager.buildFromDependencies([
        { file: 'a.ts', imports: ['b.ts', 'c.ts'] },
        { file: 'b.ts', imports: ['c.ts'] },
        { file: 'c.ts', imports: [] },
      ]);

      const stats = manager.getStats();
      expect(stats.nodeCount).toBe(3);
      expect(stats.edgeCount).toBe(3);
    });
  });

  describe('registerTeamMember', () => {
    it('should register team member with contributions', () => {
      manager.registerTeamMember({
        id: 'dev1',
        name: 'Alice',
        expertise: [{ area: 'frontend', level: 'expert', files: ['app.tsx'] }],
        contributions: [
          { file: 'app.tsx', commits: 50, linesChanged: 1000, lastModified: new Date() },
        ],
      });

      const stats = manager.getStats();
      expect(stats.memberCount).toBe(1);
    });
  });

  describe('query', () => {
    beforeEach(() => {
      manager.buildFromDependencies([
        { file: 'index.ts', imports: ['utils.ts', 'api.ts'] },
        { file: 'utils.ts', imports: [] },
        { file: 'api.ts', imports: ['utils.ts'] },
      ]);

      manager.registerTeamMember({
        id: 'dev1',
        name: 'Bob',
        expertise: [{ area: 'backend', level: 'expert', files: ['api.ts'] }],
        contributions: [
          { file: 'api.ts', commits: 20, linesChanged: 500, lastModified: new Date() },
        ],
      });
    });

    it('should find dependencies', () => {
      const result = manager.query({ type: 'dependencies-of', target: 'index.ts', depth: 1 });
      expect(result.nodes.length).toBeGreaterThan(0);
    });

    it('should find experts', () => {
      const result = manager.query({ type: 'expert-for', target: 'api.ts' });
      expect(result.experts?.length).toBeGreaterThan(0);
      expect(result.experts?.[0].name).toBe('Bob');
    });

    it('should find related nodes', () => {
      const result = manager.query({ type: 'related-to', target: 'utils.ts', depth: 1 });
      expect(result.edges.length).toBeGreaterThan(0);
    });
  });

  describe('exportGraph', () => {
    it('should export graph data', () => {
      manager.addNode({ id: 'test', type: 'file', name: 'test.ts', metadata: {} });
      const exported = manager.exportGraph();

      expect(exported.nodes.length).toBe(1);
      expect(exported.edges).toEqual([]);
    });
  });
});
