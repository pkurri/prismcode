import {
  MCPServer,
  ToolDefinition,
  ToolResult,
  ToolInvocation,
  createEchoTool,
  createDelayTool,
  createReadFileTool,
  createSearchCodeTool,
  registerBuiltInTools,
} from '../../../src/advanced/mcp-server';

describe('MCP Server Core Implementation', () => {
  let server: MCPServer;

  // Helper to create a simple test tool
  const createTestTool = (name: string, handler?: () => Promise<ToolResult>): ToolDefinition => ({
    name,
    description: `Test tool: ${name}`,
    category: 'system',
    parameters: [],
    returns: { type: 'void', description: 'Test result' },
    handler: handler || (async () => ({ success: true })),
  });

  beforeEach(() => {
    server = new MCPServer({ enableLogging: false });
  });

  describe('Tool Registration', () => {
    it('should register a tool', () => {
      const tool = createTestTool('test-tool');
      server.registerTool(tool);

      expect(server.getTool('test-tool')).toBeDefined();
    });

    it('should throw when registering duplicate tool', () => {
      const tool = createTestTool('duplicate');
      server.registerTool(tool);

      expect(() => server.registerTool(tool)).toThrow('Tool already registered');
    });

    it('should register multiple tools', () => {
      server.registerTools([
        createTestTool('tool1'),
        createTestTool('tool2'),
        createTestTool('tool3'),
      ]);

      expect(server.listTools()).toHaveLength(3);
    });

    it('should unregister a tool', () => {
      server.registerTool(createTestTool('removable'));
      const removed = server.unregisterTool('removable');

      expect(removed).toBe(true);
      expect(server.getTool('removable')).toBeUndefined();
    });

    it('should return false when unregistering non-existent tool', () => {
      const removed = server.unregisterTool('nonexistent');
      expect(removed).toBe(false);
    });
  });

  describe('Tool Listing', () => {
    beforeEach(() => {
      server.registerTools([
        { ...createTestTool('code-tool'), category: 'code' },
        { ...createTestTool('file-tool'), category: 'file' },
        { ...createTestTool('search-tool'), category: 'search' },
        { ...createTestTool('code-tool-2'), category: 'code' },
      ]);
    });

    it('should list all tools', () => {
      expect(server.listTools()).toHaveLength(4);
    });

    it('should list tools by category', () => {
      const codeTools = server.listToolsByCategory('code');
      expect(codeTools).toHaveLength(2);
    });

    it('should return empty array for empty category', () => {
      const analyzeTools = server.listToolsByCategory('analyze');
      expect(analyzeTools).toHaveLength(0);
    });
  });

  describe('Tool Invocation', () => {
    it('should invoke a tool successfully', async () => {
      server.registerTool(
        createTestTool('success-tool', async () => ({
          success: true,
          data: 'result',
        }))
      );

      const result = await server.invoke('success-tool');

      expect(result.success).toBe(true);
      expect(result.data).toBe('result');
    });

    it('should return error for non-existent tool', async () => {
      const result = await server.invoke('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tool not found');
    });

    it('should handle tool errors', async () => {
      server.registerTool(
        createTestTool('error-tool', async () => {
          throw new Error('Tool error');
        })
      );

      const result = await server.invoke('error-tool');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Tool error');
    });

    it('should pass parameters to handler', async () => {
      const tool: ToolDefinition = {
        name: 'param-tool',
        description: 'Test',
        category: 'system',
        parameters: [{ name: 'input', type: 'string', description: 'Input', required: true }],
        returns: { type: 'string', description: 'Output' },
        handler: async (params) => ({
          success: true,
          data: `received: ${params.input}`,
        }),
      };
      server.registerTool(tool);

      const result = await server.invoke('param-tool', { input: 'hello' });

      expect(result.data).toBe('received: hello');
    });

    it('should validate required parameters', async () => {
      const tool: ToolDefinition = {
        name: 'required-param',
        description: 'Test',
        category: 'system',
        parameters: [{ name: 'required', type: 'string', description: 'Required', required: true }],
        returns: { type: 'void', description: 'None' },
        handler: async () => ({ success: true }),
      };
      server.registerTool(tool);

      const result = await server.invoke('required-param', {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required parameter');
    });

    it('should validate parameter types', async () => {
      const tool: ToolDefinition = {
        name: 'typed-param',
        description: 'Test',
        category: 'system',
        parameters: [{ name: 'count', type: 'number', description: 'Count', required: true }],
        returns: { type: 'void', description: 'None' },
        handler: async () => ({ success: true }),
      };
      server.registerTool(tool);

      const result = await server.invoke('typed-param', { count: 'not-a-number' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid type');
    });
  });

  describe('Concurrent Execution', () => {
    it('should respect max concurrent limit', async () => {
      const limitedServer = new MCPServer({ maxConcurrentTools: 1, enableLogging: false });
      limitedServer.registerTool(createDelayTool());

      // Start first invocation
      const first = limitedServer.invoke('delay', { ms: 100 });

      // Try second immediately
      const second = await limitedServer.invoke('delay', { ms: 10 });

      expect(second.success).toBe(false);
      expect(second.error).toContain('limit reached');

      await first; // Wait for cleanup
    });

    it('should invoke tools in parallel', async () => {
      server.registerTool(createEchoTool());

      const results = await server.invokeParallel([
        { tool: 'echo', params: { message: 'a' } },
        { tool: 'echo', params: { message: 'b' } },
        { tool: 'echo', params: { message: 'c' } },
      ]);

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.success)).toBe(true);
    });

    it('should invoke tools in sequence', async () => {
      server.registerTool(createEchoTool());

      const results = await server.invokeSequence([
        { tool: 'echo', params: { message: '1' } },
        { tool: 'echo', params: { message: '2' } },
        { tool: 'echo', params: { message: '3' } },
      ]);

      expect(results).toHaveLength(3);
      expect(results.map((r) => r.data)).toEqual(['1', '2', '3']);
    });

    it('should stop sequence on failure', async () => {
      server.registerTool(createEchoTool());
      server.registerTool(
        createTestTool('fail-tool', async () => ({
          success: false,
          error: 'Intentional failure',
        }))
      );

      const results = await server.invokeSequence([
        { tool: 'echo', params: { message: 'ok' } },
        { tool: 'fail-tool' },
        { tool: 'echo', params: { message: 'never' } },
      ]);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });

  describe('Invocation Management', () => {
    it('should track invocations', async () => {
      server.registerTool(createEchoTool());
      await server.invoke('echo', { message: 'test' });

      const history = server.getInvocationHistory();

      expect(history).toHaveLength(1);
      expect(history[0].toolName).toBe('echo');
      expect(history[0].status).toBe('completed');
    });

    it('should get invocation by ID', async () => {
      server.registerTool(createEchoTool());
      await server.invoke('echo', { message: 'test' });

      const history = server.getInvocationHistory();
      const invocation = server.getInvocation(history[0].id);

      expect(invocation).toBeDefined();
      expect(invocation?.toolName).toBe('echo');
    });

    it('should clear history', async () => {
      server.registerTool(createEchoTool());
      await server.invoke('echo', { message: 'test' });
      server.clearHistory();

      expect(server.getInvocationHistory()).toHaveLength(0);
    });

    it('should limit history results', async () => {
      server.registerTool(createEchoTool());

      for (let i = 0; i < 10; i++) {
        await server.invoke('echo', { message: `msg${i}` });
      }

      const limited = server.getInvocationHistory(5);
      expect(limited).toHaveLength(5);
    });
  });

  describe('Server Capabilities', () => {
    it('should return capabilities', () => {
      registerBuiltInTools(server);

      const caps = server.getCapabilities();

      expect(caps.tools).toContain('echo');
      expect(caps.tools).toContain('delay');
      expect(caps.tools).toContain('readFile');
      expect(caps.tools).toContain('searchCode');
      expect(caps.categories).toContain('system');
      expect(caps.categories).toContain('file');
    });

    it('should return server status', () => {
      server.registerTool(createEchoTool());

      const status = server.getStatus();

      expect(status.toolCount).toBe(1);
      expect(status.runningInvocations).toBe(0);
      expect(status.serverId).toBe('prismcode-mcp');
    });
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const config = server.getConfig();

      expect(config.serverId).toBe('prismcode-mcp');
      expect(config.version).toBe('1.0.0');
      expect(config.maxConcurrentTools).toBe(5);
    });

    it('should accept custom configuration', () => {
      const custom = new MCPServer({
        serverId: 'custom-server',
        version: '2.0.0',
      });

      const config = custom.getConfig();

      expect(config.serverId).toBe('custom-server');
      expect(config.version).toBe('2.0.0');
    });

    it('should update configuration', () => {
      server.updateConfig({ toolTimeout: 60000 });

      expect(server.getConfig().toolTimeout).toBe(60000);
    });
  });

  describe('Built-in Tools', () => {
    describe('Echo Tool', () => {
      it('should echo message', async () => {
        server.registerTool(createEchoTool());

        const result = await server.invoke('echo', { message: 'Hello!' });

        expect(result.success).toBe(true);
        expect(result.data).toBe('Hello!');
      });
    });

    describe('Delay Tool', () => {
      it('should delay execution', async () => {
        server.registerTool(createDelayTool());
        const start = Date.now();

        await server.invoke('delay', { ms: 50 });

        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(40);
      });
    });

    describe('ReadFile Tool', () => {
      it('should return file contents', async () => {
        server.registerTool(createReadFileTool());

        const result = await server.invoke('readFile', { path: '/test/file.txt' });

        expect(result.success).toBe(true);
        expect(result.data).toContain('/test/file.txt');
      });
    });

    describe('SearchCode Tool', () => {
      it('should return search results', async () => {
        server.registerTool(createSearchCodeTool());

        const result = await server.invoke('searchCode', { query: 'function' });

        expect(result.success).toBe(true);
        expect(Array.isArray(result.data)).toBe(true);
        expect((result.data as unknown[]).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Timeout Handling', () => {
    it('should timeout slow tools', async () => {
      const timeoutServer = new MCPServer({ toolTimeout: 50, enableLogging: false });
      timeoutServer.registerTool({
        name: 'slow-tool',
        description: 'Takes too long',
        category: 'system',
        parameters: [],
        returns: { type: 'void', description: 'None' },
        handler: async () => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          return { success: true };
        },
      });

      const result = await timeoutServer.invoke('slow-tool');

      expect(result.success).toBe(false);
      expect(result.error).toContain('timed out');
    });
  });
});
