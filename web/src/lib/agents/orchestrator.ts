/**
 * PrismCode Multi-Agent Orchestrator
 * GitHub Issue #343: Multi-Agent Orchestrator Core
 * 
 * Central orchestrator for managing agent lifecycle, routing, and execution.
 */

import { 
  Agent, 
  AgentRole, 
  AgentRunContext, 
  AgentRunResult, 
  AgentConfig,
  ToolCallRecord,
  AgentStatus
} from './types';

// Agent Registry - holds all registered agents
const agentRegistry = new Map<string, Agent>();

// Run History - tracks all agent runs
const runHistory: AgentRunResult[] = [];

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Register an agent with the orchestrator
 */
export function registerAgent(agent: Agent): void {
  agentRegistry.set(agent.id, agent);
  console.log(`[Orchestrator] Registered agent: ${agent.name} (${agent.role})`);
}

/**
 * Get an agent by ID
 */
export function getAgent(agentId: string): Agent | undefined {
  return agentRegistry.get(agentId);
}

/**
 * Get all agents by role
 */
export function getAgentsByRole(role: AgentRole): Agent[] {
  return Array.from(agentRegistry.values()).filter(a => a.role === role);
}

/**
 * Get all registered agents
 */
export function getAllAgents(): Agent[] {
  return Array.from(agentRegistry.values());
}

/**
 * Update agent status
 */
export function updateAgentStatus(agentId: string, status: AgentStatus): void {
  const agent = agentRegistry.get(agentId);
  if (agent) {
    agent.status = status;
    agentRegistry.set(agentId, agent);
  }
}

/**
 * Execute an agent run
 */
export async function executeAgentRun(
  agentId: string, 
  input: string, 
  parameters?: Record<string, unknown>
): Promise<AgentRunResult> {
  const agent = getAgent(agentId);
  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  const runId = generateId();
  const startTime = Date.now();
  const toolCalls: ToolCallRecord[] = [];

  // Create run context
  const context: AgentRunContext = {
    runId,
    agentId,
    projectId: 'default',
    startedAt: new Date(),
    input,
    parameters,
  };

  console.log(`[Orchestrator] Starting run ${runId} for agent ${agent.name}`);
  updateAgentStatus(agentId, 'running');

  try {
    // Simulate agent execution with tool calls
    // In production, this would invoke the actual AI model
    for (const tool of agent.tools.slice(0, 3)) {
      const toolStart = Date.now();
      const result = await tool.execute({});
      
      toolCalls.push({
        toolName: tool.name,
        input: {},
        output: result,
        timestamp: new Date(),
        duration: Date.now() - toolStart,
      });
    }

    const runResult: AgentRunResult = {
      runId,
      agentId,
      status: 'success',
      output: `Agent ${agent.name} completed task: ${input}`,
      toolCalls,
      duration: Date.now() - startTime,
      completedAt: new Date(),
    };

    runHistory.push(runResult);
    updateAgentStatus(agentId, 'completed');
    
    return runResult;
  } catch (error) {
    updateAgentStatus(agentId, 'error');
    
    const errorResult: AgentRunResult = {
      runId,
      agentId,
      status: 'failure',
      output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      toolCalls,
      duration: Date.now() - startTime,
      completedAt: new Date(),
    };

    runHistory.push(errorResult);
    return errorResult;
  }
}

/**
 * Get run history for an agent
 */
export function getAgentRunHistory(agentId: string): AgentRunResult[] {
  return runHistory.filter(r => r.agentId === agentId);
}

/**
 * Get all run history
 */
export function getAllRunHistory(): AgentRunResult[] {
  return [...runHistory];
}

/**
 * Create an agent from configuration
 */
export function createAgent(config: AgentConfig, name: string, description: string): Agent {
  const agent: Agent = {
    id: generateId(),
    role: config.role,
    name,
    description,
    capabilities: [],
    tools: [],
    status: 'idle',
  };

  registerAgent(agent);
  return agent;
}

/**
 * Route a task to the appropriate agent based on task type
 */
export function routeTask(taskType: string): Agent | undefined {
  const roleMapping: Record<string, AgentRole> = {
    'requirements': 'product-manager',
    'epic': 'product-manager',
    'sprint': 'scrum-master',
    'story': 'scrum-master',
    'code': 'developer',
    'implement': 'developer',
    'test': 'qa',
    'quality': 'qa',
  };

  const role = roleMapping[taskType.toLowerCase()];
  if (role) {
    const agents = getAgentsByRole(role);
    return agents[0]; // Return first available agent
  }

  return undefined;
}
