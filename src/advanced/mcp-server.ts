/**
 * MCP Server Core Implementation
 * Issue #198: MCP Server Core Implementation
 *
 * Provides Model Context Protocol (MCP) server for tool orchestration
 */

import logger from '../utils/logger';

export type ToolCategory = 'code' | 'file' | 'search' | 'generate' | 'analyze' | 'system';

export interface MCPConfig {
  serverId: string;
  version: string;
  maxConcurrentTools: number;
  toolTimeout: number;
  enableLogging: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  category: ToolCategory;
  parameters: ParameterSchema[];
  returns: ReturnSchema;
  handler: ToolHandler;
}

export interface ParameterSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: unknown;
}

export interface ReturnSchema {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'void';
  description: string;
}

export type ToolHandler = (params: Record<string, unknown>) => Promise<ToolResult>;

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ToolInvocation {
  id: string;
  toolName: string;
  params: Record<string, unknown>;
  startTime: Date;
  endTime?: Date;
  result?: ToolResult;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
}

export interface ServerCapabilities {
  tools: string[];
  categories: ToolCategory[];
  maxConcurrent: number;
  version: string;
}

const DEFAULT_CONFIG: MCPConfig = {
  serverId: 'prismcode-mcp',
  version: '1.0.0',
  maxConcurrentTools: 5,
  toolTimeout: 30000,
  enableLogging: true,
};

/**
 * MCP Server Core
 * Handles tool registration, invocation, and orchestration
 */
export class MCPServer {
  private config: MCPConfig;
  private tools: Map<string, ToolDefinition> = new Map();
  private invocations: Map<string, ToolInvocation> = new Map();
  private runningCount = 0;

  constructor(config: Partial<MCPConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('MCPServer initialized', {
      serverId: this.config.serverId,
      version: this.config.version,
    });
  }

  /**
   * Register a tool with the server
   */
  registerTool(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }

    this.tools.set(tool.name, tool);

    if (this.config.enableLogging) {
      logger.info('Tool registered', {
        name: tool.name,
        category: tool.category,
        parameters: tool.parameters.length,
      });
    }
  }

  /**
   * Register multiple tools
   */
  registerTools(tools: ToolDefinition[]): void {
    for (const tool of tools) {
      this.registerTool(tool);
    }
  }

  /**
   * Unregister a tool
   */
  unregisterTool(name: string): boolean {
    const deleted = this.tools.delete(name);
    if (deleted && this.config.enableLogging) {
      logger.info('Tool unregistered', { name });
    }
    return deleted;
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * List all registered tools
   */
  listTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * List tools by category
   */
  listToolsByCategory(category: ToolCategory): ToolDefinition[] {
    return this.listTools().filter((t) => t.category === category);
  }

  /**
   * Invoke a tool
   */
  async invoke(toolName: string, params: Record<string, unknown> = {}): Promise<ToolResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return {
        success: false,
        error: `Tool not found: ${toolName}`,
      };
    }

    // Check concurrent limit
    if (this.runningCount >= this.config.maxConcurrentTools) {
      return {
        success: false,
        error: 'Maximum concurrent tool limit reached',
      };
    }

    // Validate parameters
    const validationError = this.validateParams(tool, params);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    // Create invocation record
    const invocation = this.createInvocation(toolName, params);
    this.invocations.set(invocation.id, invocation);

    try {
      this.runningCount++;
      invocation.status = 'running';

      // Execute with timeout
      const result = await this.executeWithTimeout(tool.handler, params, this.config.toolTimeout);

      invocation.result = result;
      invocation.status = result.success ? 'completed' : 'failed';
      invocation.endTime = new Date();

      if (this.config.enableLogging) {
        logger.info('Tool invoked', {
          tool: toolName,
          success: result.success,
          duration: invocation.endTime.getTime() - invocation.startTime.getTime(),
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      invocation.result = { success: false, error: errorMessage };
      invocation.status = 'failed';
      invocation.endTime = new Date();

      if (this.config.enableLogging) {
        logger.error('Tool invocation failed', {
          tool: toolName,
          error: errorMessage,
        });
      }

      return { success: false, error: errorMessage };
    } finally {
      this.runningCount--;
    }
  }

  /**
   * Invoke multiple tools in parallel
   */
  async invokeParallel(
    invocations: Array<{ tool: string; params?: Record<string, unknown> }>
  ): Promise<ToolResult[]> {
    const promises = invocations.map((inv) => this.invoke(inv.tool, inv.params || {}));
    return Promise.all(promises);
  }

  /**
   * Invoke tools in sequence
   */
  async invokeSequence(
    invocations: Array<{ tool: string; params?: Record<string, unknown> }>
  ): Promise<ToolResult[]> {
    const results: ToolResult[] = [];
    for (const inv of invocations) {
      const result = await this.invoke(inv.tool, inv.params || {});
      results.push(result);
      if (!result.success) {
        break; // Stop on first failure
      }
    }
    return results;
  }

  /**
   * Cancel a running invocation
   */
  cancelInvocation(invocationId: string): boolean {
    const invocation = this.invocations.get(invocationId);
    if (!invocation || invocation.status !== 'running') {
      return false;
    }

    invocation.status = 'cancelled';
    invocation.endTime = new Date();
    return true;
  }

  /**
   * Get invocation by ID
   */
  getInvocation(id: string): ToolInvocation | undefined {
    return this.invocations.get(id);
  }

  /**
   * Get invocation history
   */
  getInvocationHistory(limit = 100): ToolInvocation[] {
    return Array.from(this.invocations.values())
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  /**
   * Clear invocation history
   */
  clearHistory(): void {
    this.invocations.clear();
    logger.info('Invocation history cleared');
  }

  /**
   * Get server capabilities
   */
  getCapabilities(): ServerCapabilities {
    const categories = [...new Set(this.listTools().map((t) => t.category))];
    return {
      tools: this.listTools().map((t) => t.name),
      categories,
      maxConcurrent: this.config.maxConcurrentTools,
      version: this.config.version,
    };
  }

  /**
   * Get server status
   */
  getStatus(): {
    serverId: string;
    version: string;
    toolCount: number;
    runningInvocations: number;
    totalInvocations: number;
  } {
    return {
      serverId: this.config.serverId,
      version: this.config.version,
      toolCount: this.tools.size,
      runningInvocations: this.runningCount,
      totalInvocations: this.invocations.size,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MCPConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('MCPServer config updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): MCPConfig {
    return { ...this.config };
  }

  // Private methods

  private validateParams(tool: ToolDefinition, params: Record<string, unknown>): string | null {
    for (const param of tool.parameters) {
      if (param.required && !(param.name in params)) {
        return `Missing required parameter: ${param.name}`;
      }

      if (param.name in params) {
        const value = params[param.name];
        const actualType = Array.isArray(value) ? 'array' : typeof value;

        if (actualType !== param.type && value !== null && value !== undefined) {
          return `Invalid type for ${param.name}: expected ${param.type}, got ${actualType}`;
        }
      }
    }
    return null;
  }

  private createInvocation(toolName: string, params: Record<string, unknown>): ToolInvocation {
    return {
      id: this.generateId(),
      toolName,
      params,
      startTime: new Date(),
      status: 'pending',
    };
  }

  private async executeWithTimeout<T>(
    fn: (params: Record<string, unknown>) => Promise<T>,
    params: Record<string, unknown>,
    timeout: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Tool execution timed out'));
      }, timeout);

      fn(params)
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error: unknown) => {
          clearTimeout(timer);
          reject(error instanceof Error ? error : new Error(String(error)));
        });
    });
  }

  private generateId(): string {
    return `inv_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 8)}`;
  }
}

// Singleton instance
export const mcpServer = new MCPServer();

// Built-in tools

/**
 * Create a simple echo tool for testing
 */
export function createEchoTool(): ToolDefinition {
  return {
    name: 'echo',
    description: 'Echoes back the input message',
    category: 'system',
    parameters: [
      {
        name: 'message',
        type: 'string',
        description: 'Message to echo',
        required: true,
      },
    ],
    returns: {
      type: 'string',
      description: 'Echoed message',
    },
    handler: (params): Promise<ToolResult> =>
      Promise.resolve({
        success: true,
        data: params.message,
      }),
  };
}

/**
 * Create a delay tool for testing async behavior
 */
export function createDelayTool(): ToolDefinition {
  return {
    name: 'delay',
    description: 'Waits for specified milliseconds',
    category: 'system',
    parameters: [
      {
        name: 'ms',
        type: 'number',
        description: 'Milliseconds to wait',
        required: true,
      },
    ],
    returns: {
      type: 'void',
      description: 'Completes after delay',
    },
    handler: async (params) => {
      await new Promise((resolve) => setTimeout(resolve, params.ms as number));
      return { success: true };
    },
  };
}

/**
 * Create a file read tool
 */
export function createReadFileTool(): ToolDefinition {
  return {
    name: 'readFile',
    description: 'Reads file contents',
    category: 'file',
    parameters: [
      {
        name: 'path',
        type: 'string',
        description: 'File path to read',
        required: true,
      },
    ],
    returns: {
      type: 'string',
      description: 'File contents',
    },
    handler: (params): Promise<ToolResult> =>
      Promise.resolve({
        success: true,
        data: `Contents of ${String(params.path)}`,
        metadata: { path: params.path },
      }),
  };
}

/**
 * Create a code search tool
 */
export function createSearchCodeTool(): ToolDefinition {
  return {
    name: 'searchCode',
    description: 'Searches for code patterns',
    category: 'search',
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'Search query',
        required: true,
      },
      {
        name: 'limit',
        type: 'number',
        description: 'Maximum results',
        required: false,
        default: 10,
      },
    ],
    returns: {
      type: 'array',
      description: 'Search results',
    },
    handler: (params): Promise<ToolResult> =>
      Promise.resolve({
        success: true,
        data: [
          { file: 'src/index.ts', line: 10, match: params.query },
          { file: 'src/utils.ts', line: 25, match: params.query },
        ],
        metadata: { query: params.query, limit: params.limit || 10 },
      }),
  };
}

/**
 * Register built-in tools
 */
export function registerBuiltInTools(server: MCPServer): void {
  server.registerTools([
    createEchoTool(),
    createDelayTool(),
    createReadFileTool(),
    createSearchCodeTool(),
  ]);
}
