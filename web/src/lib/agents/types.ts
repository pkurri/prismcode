/**
 * PrismCode Multi-Agent Orchestrator - Type Definitions
 * GitHub Issue #343: Multi-Agent Orchestrator Core
 */

// Agent Role Types
export type AgentRole = 
  | 'product-manager'
  | 'scrum-master'
  | 'developer'
  | 'qa';

// Agent Status
export type AgentStatus = 
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed'
  | 'error';

// MCP Tool Types
export interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, MCPParameter>;
  execute: (params: Record<string, unknown>) => Promise<MCPToolResult>;
}

export interface MCPParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  default?: unknown;
}

export interface MCPToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  duration?: number;
}

// Agent Definition
export interface Agent {
  id: string;
  role: AgentRole;
  name: string;
  description: string;
  capabilities: string[];
  tools: MCPTool[];
  status: AgentStatus;
}

// Agent Run Context
export interface AgentRunContext {
  runId: string;
  agentId: string;
  projectId: string;
  startedAt: Date;
  input: string;
  parameters?: Record<string, unknown>;
}

// Agent Run Result
export interface AgentRunResult {
  runId: string;
  agentId: string;
  status: 'success' | 'failure' | 'partial';
  output: string;
  artifacts?: AgentArtifact[];
  toolCalls: ToolCallRecord[];
  duration: number;
  completedAt: Date;
}

// Tool Call Record for Visualization
export interface ToolCallRecord {
  toolName: string;
  input: Record<string, unknown>;
  output: MCPToolResult;
  timestamp: Date;
  duration: number;
}

// Agent Artifact (generated files, issues, etc.)
export interface AgentArtifact {
  type: 'file' | 'github-issue' | 'test-result' | 'code-change';
  name: string;
  path?: string;
  content?: string;
  url?: string;
}

// Project Definition
export interface Project {
  id: string;
  name: string;
  description: string;
  repository?: string;
  createdAt: Date;
  agents: Agent[];
  runs: AgentRunResult[];
}

// Agent Configuration
export interface AgentConfig {
  role: AgentRole;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
}
