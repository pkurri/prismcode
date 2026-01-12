import { MCPClient, loadMCPConfig, createMCPClient } from '../client';

describe('MCP Client', () => {
  it('loads configuration', () => {
    const config = loadMCPConfig('dummy');
    expect(config.servers.orchestrator).toBeDefined();
    expect(config.tools.run_tests).toBeDefined();
  });

  it('creates client', () => {
    const client = createMCPClient();
    expect(client).toBeInstanceOf(MCPClient);
    expect(client.getAvailableTools()).toContain('run_tests');
  });

  it('connects to server', async () => {
    const client = createMCPClient();
    const result = await client.connect('orchestrator');
    expect(result).toBe(true);
    expect(client.isConnected('orchestrator')).toBe(true);
  });

  it('executes tool successfully', async () => {
    const client = createMCPClient();
    const result = await client.executeTool('generate_code', { language: 'ts', spec: 'foo' });
    expect(result.success).toBe(true);
    expect(result.data.result).toContain('Executed generate_code');
  });

  it('fails on unknown tool', async () => {
    const client = createMCPClient();
    const result = await client.executeTool('unknown_tool', {});
    expect(result.success).toBe(false);
  });
});
