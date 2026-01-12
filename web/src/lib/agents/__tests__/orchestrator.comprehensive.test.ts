import { 
  registerAgent, 
  getAgent, 
  executeAgentRun, 
  createAgent, 
  routeTask,
  getAllAgents
} from '../orchestrator';
import { AgentConfig, Agent } from '../types';

describe('Orchestrator Comprehensive', () => {
  it('registers and retrieves agents', () => {
    const agent: Agent = {
      id: 'test-agent',
      name: 'Test Agent',
      role: 'developer',
      description: 'A test agent',
      status: 'idle',
      capabilities: [],
      tools: []
    };
    
    registerAgent(agent);
    expect(getAgent('test-agent')).toEqual(agent);
    expect(getAllAgents()).toContain(agent);
  });

  it('creates agents from config', () => {
    const config: AgentConfig = {
      role: 'qa',
      model: 'gpt-4',
      temperature: 0.7
    };
    
    const agent = createAgent(config, 'New QA', 'Created from config');
    expect(agent.role).toBe('qa');
    expect(agent.id).toBeDefined();
    expect(getAgent(agent.id)).toBeDefined();
  });

  it('routes tasks correctly', () => {
    // Ensure we have agents for routing
    createAgent({ role: 'developer', model: 'gpt-4' }, 'Dev Bot', 'Dev');
    createAgent({ role: 'qa', model: 'gpt-4' }, 'QA Bot', 'QA');
    createAgent({ role: 'product-manager', model: 'gpt-4' }, 'PM Bot', 'PM');

    expect(routeTask('code')?.role).toBe('developer');
    expect(routeTask('test')?.role).toBe('qa');
    expect(routeTask('requirements')?.role).toBe('product-manager');
    expect(routeTask('unknown')).toBeUndefined();
  });

  it('executes agent run successfully', async () => {
    const mockTool = {
      name: 'mock_tool',
      description: 'A mock tool',
      parameters: {},
      execute: jest.fn().mockResolvedValue({ success: true, data: 'tool output' })
    };

    const agent: Agent = {
      id: 'runner-agent',
      name: 'Runner',
      role: 'developer',
      description: 'Runner',
      status: 'idle',
      capabilities: [],
      tools: [mockTool]
    };

    registerAgent(agent);

    const result = await executeAgentRun('runner-agent', 'Do something');
    
    expect(result.status).toBe('success');
    expect(result.agentId).toBe('runner-agent');
    expect(mockTool.execute).toHaveBeenCalled();
    expect(result.toolCalls[0].output).toEqual({ success: true, data: 'tool output' });
  });

  it('handles execution errors', async () => {
     // Non-existent agent
     await expect(executeAgentRun('missing-id', 'input')).rejects.toThrow('Agent not found');
  });
});
