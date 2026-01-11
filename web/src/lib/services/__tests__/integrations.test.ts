import { registerConnector, getConnector, getAllConnectors, syncConnector } from '../integrations';

describe('Integrations Service', () => {
  describe('registerConnector', () => {
    it('registers a new connector', () => {
      registerConnector({ id: 'test-conn', name: 'Test', type: 'github', status: 'disconnected', config: {} });
      const conn = getConnector('test-conn');
      expect(conn).toBeDefined();
      expect(conn?.name).toBe('Test');
    });
  });

  describe('getAllConnectors', () => {
    it('returns all registered connectors', () => {
      const connectors = getAllConnectors();
      expect(connectors.length).toBeGreaterThan(0);
    });
  });

  describe('syncConnector', () => {
    it('syncs a connector and updates status', async () => {
      registerConnector({ id: 'sync-test', name: 'Sync Test', type: 'slack', status: 'disconnected', config: {} });
      const result = await syncConnector('sync-test');
      expect(result).toBe(true);
      const conn = getConnector('sync-test');
      expect(conn?.status).toBe('connected');
    });

    it('returns false for unknown connector', async () => {
      const result = await syncConnector('unknown');
      expect(result).toBe(false);
    });
  });
});
