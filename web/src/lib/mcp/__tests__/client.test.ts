import { MCPClient, loadMCPConfig, createMCPClient } from '../client';

describe('MCP Client', () => {
  describe('MCPClient', () => {
    it('creates client with config', () => {
      const config = loadMCPConfig('test');
      const client = new MCPClient(config);
      expect(client).toBeDefined();
    });

    it('connects to server', async () => {
      const client = createMCPClient();
      const connected = await client.connect('orchestrator');
      expect(connected).toBe(true);
      expect(client.isConnected('orchestrator')).toBe(true);
    });

    it('disconnects from server', async () => {
      const client = createMCPClient();
      await client.connect('orchestrator');
      await client.disconnect('orchestrator');
      expect(client.isConnected('orchestrator')).toBe(false);
    });

    it('gets available tools', () => {
      const client = createMCPClient();
      const tools = client.getAvailableTools();
      expect(tools.length).toBeGreaterThan(0);
    });

    it('executes tool', async () => {
      const client = createMCPClient();
      const result = await client.executeTool('gather_requirements', { input: 'test' });
      expect(result.success).toBe(true);
    });
  });

  describe('loadMCPConfig', () => {
    it('loads default config', () => {
      const config = loadMCPConfig('default');
      expect(config.servers).toBeDefined();
      expect(config.tools).toBeDefined();
      expect(config.defaultTimeout).toBeGreaterThan(0);
    });
  });
});
