import { NextRequest, NextResponse } from 'next/server';

// Agent Management API
// Manage AI agent fleet, tasks, and execution

interface Agent {
  id: string;
  name: string;
  type: 'code' | 'review' | 'test' | 'docs' | 'refactor' | 'security';
  status: 'idle' | 'running' | 'completed' | 'failed' | 'blocked';
  currentTaskId?: string;
  config: Record<string, unknown>;
  stats: {
    tasksCompleted: number;
    tasksFailed: number;
    avgDurationMs: number;
    lastActiveAt?: string;
  };
}

interface AgentTask {
  id: string;
  agentId: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
}

// Mock data store
const agents: Map<string, Agent> = new Map([
  ['code-gen', { id: 'code-gen', name: 'Code Generator', type: 'code', status: 'idle', config: { model: 'gpt-4-turbo' }, stats: { tasksCompleted: 156, tasksFailed: 3, avgDurationMs: 150000 } }],
  ['reviewer', { id: 'reviewer', name: 'Code Reviewer', type: 'review', status: 'idle', config: { model: 'claude-3-sonnet' }, stats: { tasksCompleted: 342, tasksFailed: 2, avgDurationMs: 45000 } }],
  ['test-gen', { id: 'test-gen', name: 'Test Generator', type: 'test', status: 'idle', config: { model: 'gpt-4-turbo' }, stats: { tasksCompleted: 89, tasksFailed: 3, avgDurationMs: 75000 } }],
  ['docs-gen', { id: 'docs-gen', name: 'Documentation Writer', type: 'docs', status: 'idle', config: { model: 'claude-3-sonnet' }, stats: { tasksCompleted: 67, tasksFailed: 1, avgDurationMs: 200000 } }],
  ['security', { id: 'security', name: 'Security Scanner', type: 'security', status: 'idle', config: { model: 'gpt-4-turbo' }, stats: { tasksCompleted: 234, tasksFailed: 0, avgDurationMs: 105000 } }],
]);

const tasks: Map<string, AgentTask> = new Map();

// GET: List agents or get specific agent/task
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId');
  const taskId = searchParams.get('taskId');
  const view = searchParams.get('view');

  // Get specific task
  if (taskId) {
    const task = tasks.get(taskId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(task);
  }

  // Get specific agent
  if (agentId) {
    const agent = agents.get(agentId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    
    // Get agent with its tasks
    const agentTasks = Array.from(tasks.values()).filter(t => t.agentId === agentId);
    return NextResponse.json({ agent, tasks: agentTasks });
  }

  // List all agents with summary
  if (view === 'summary') {
    const summary = {
      totalAgents: agents.size,
      activeAgents: Array.from(agents.values()).filter(a => a.status === 'running').length,
      idleAgents: Array.from(agents.values()).filter(a => a.status === 'idle').length,
      blockedAgents: Array.from(agents.values()).filter(a => a.status === 'blocked').length,
      totalTasksCompleted: Array.from(agents.values()).reduce((sum, a) => sum + a.stats.tasksCompleted, 0),
      pendingTasks: Array.from(tasks.values()).filter(t => t.status === 'pending').length,
    };
    return NextResponse.json(summary);
  }

  // List all agents
  return NextResponse.json({
    agents: Array.from(agents.values()),
    total: agents.size,
  });
}

// POST: Create task or control agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, agentId, task } = body;

    // Start a new task
    if (action === 'start_task') {
      if (!agentId || !task?.name) {
        return NextResponse.json({ error: 'agentId and task.name required' }, { status: 400 });
      }

      const agent = agents.get(agentId);
      if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }

      if (agent.status === 'running') {
        return NextResponse.json({ error: 'Agent is already running a task' }, { status: 409 });
      }

      const newTask: AgentTask = {
        id: `task-${Date.now()}`,
        agentId,
        name: task.name,
        description: task.description,
        status: 'running',
        input: task.input || {},
        startedAt: new Date().toISOString(),
      };

      tasks.set(newTask.id, newTask);
      agent.status = 'running';
      agent.currentTaskId = newTask.id;
      agents.set(agentId, agent);

      console.log('[Agent Task Started]', { taskId: newTask.id, agentId, name: task.name });

      return NextResponse.json({ 
        message: 'Task started',
        task: newTask,
      }, { status: 202 });
    }

    // Pause agent
    if (action === 'pause') {
      const agent = agents.get(agentId);
      if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }

      if (agent.status !== 'running') {
        return NextResponse.json({ error: 'Agent is not running' }, { status: 400 });
      }

      agent.status = 'blocked';
      agents.set(agentId, agent);

      return NextResponse.json({ message: 'Agent paused', agent });
    }

    // Resume agent
    if (action === 'resume') {
      const agent = agents.get(agentId);
      if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }

      if (agent.currentTaskId) {
        agent.status = 'running';
      } else {
        agent.status = 'idle';
      }
      agents.set(agentId, agent);

      return NextResponse.json({ message: 'Agent resumed', agent });
    }

    // Cancel task
    if (action === 'cancel_task') {
      const { taskId } = body;
      const task = tasks.get(taskId);
      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      task.status = 'cancelled';
      task.completedAt = new Date().toISOString();
      tasks.set(taskId, task);

      const agent = agents.get(task.agentId);
      if (agent && agent.currentTaskId === taskId) {
        agent.status = 'idle';
        agent.currentTaskId = undefined;
        agents.set(task.agentId, agent);
      }

      return NextResponse.json({ message: 'Task cancelled', task });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('[Agent API Error]', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PUT: Update agent configuration
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, config } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'agentId required' }, { status: 400 });
    }

    const agent = agents.get(agentId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    agent.config = { ...agent.config, ...config };
    agents.set(agentId, agent);

    return NextResponse.json({ message: 'Agent updated', agent });

  } catch (error) {
    console.error('[Agent Update Error]', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}
