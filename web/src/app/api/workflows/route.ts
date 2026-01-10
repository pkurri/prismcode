import { NextRequest, NextResponse } from 'next/server';

// Workflow Execution & Validation API
// Validates workflow definitions and tracks execution history

interface WorkflowDefinition {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  name: string;
  config?: Record<string, unknown>;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  nodeId?: string;
  code: string;
  message: string;
}

interface ValidationWarning {
  nodeId?: string;
  code: string;
  message: string;
}

interface ExecutionRun {
  id: string;
  workflowId: string;
  status: 'running' | 'success' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  trigger: string;
  steps: ExecutionStep[];
}

interface ExecutionStep {
  nodeId: string;
  nodeName: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  output?: unknown;
  error?: string;
}

// Mock execution history
const executionHistory: ExecutionRun[] = [
  {
    id: 'run-001',
    workflowId: 'wf-pr-review',
    status: 'success',
    startedAt: new Date(Date.now() - 120000).toISOString(),
    completedAt: new Date(Date.now() - 75000).toISOString(),
    trigger: 'PR #342 opened',
    steps: [
      { nodeId: 'n1', nodeName: 'GitHub PR', status: 'success', startedAt: new Date(Date.now() - 120000).toISOString(), completedAt: new Date(Date.now() - 118000).toISOString() },
      { nodeId: 'n2', nodeName: 'AI Review', status: 'success', startedAt: new Date(Date.now() - 118000).toISOString(), completedAt: new Date(Date.now() - 80000).toISOString(), output: { score: 85 } },
      { nodeId: 'n3', nodeName: 'Score Check', status: 'success', startedAt: new Date(Date.now() - 80000).toISOString(), completedAt: new Date(Date.now() - 79000).toISOString() },
      { nodeId: 'n4', nodeName: 'Auto Merge', status: 'success', startedAt: new Date(Date.now() - 79000).toISOString(), completedAt: new Date(Date.now() - 75000).toISOString() },
    ],
  },
  {
    id: 'run-002',
    workflowId: 'wf-pr-review',
    status: 'failed',
    startedAt: new Date(Date.now() - 900000).toISOString(),
    completedAt: new Date(Date.now() - 888000).toISOString(),
    trigger: 'PR #341 opened',
    steps: [
      { nodeId: 'n1', nodeName: 'GitHub PR', status: 'success' },
      { nodeId: 'n2', nodeName: 'AI Review', status: 'failed', error: 'API rate limit exceeded' },
    ],
  },
];

// Validate workflow definition
function validateWorkflow(workflow: WorkflowDefinition): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for empty workflow
  if (!workflow.nodes || workflow.nodes.length === 0) {
    errors.push({ code: 'EMPTY_WORKFLOW', message: 'Workflow must have at least one node' });
    return { valid: false, errors, warnings };
  }

  // Check for trigger
  const triggers = workflow.nodes.filter(n => n.type === 'trigger');
  if (triggers.length === 0) {
    errors.push({ code: 'NO_TRIGGER', message: 'Workflow must have at least one trigger' });
  }
  if (triggers.length > 1) {
    warnings.push({ code: 'MULTIPLE_TRIGGERS', message: 'Workflow has multiple triggers' });
  }

  // Check for unconnected nodes
  const connectedIds = new Set([
    ...workflow.edges.map(e => e.source),
    ...workflow.edges.map(e => e.target),
  ]);
  
  workflow.nodes.forEach(node => {
    if (!connectedIds.has(node.id) && workflow.nodes.length > 1) {
      errors.push({ nodeId: node.id, code: 'UNCONNECTED', message: `Node "${node.name}" is not connected` });
    }
  });

  // Check for cycles (simplified)
  const visited = new Set<string>();
  const stack = new Set<string>();
  
  function hasCycle(nodeId: string): boolean {
    if (stack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    
    visited.add(nodeId);
    stack.add(nodeId);
    
    const outgoing = workflow.edges.filter(e => e.source === nodeId);
    for (const edge of outgoing) {
      if (hasCycle(edge.target)) return true;
    }
    
    stack.delete(nodeId);
    return false;
  }

  for (const node of workflow.nodes) {
    if (hasCycle(node.id)) {
      errors.push({ code: 'CYCLE_DETECTED', message: 'Workflow contains a cycle' });
      break;
    }
  }

  // Check for required config
  workflow.nodes.forEach(node => {
    if (node.type === 'action' && (!node.config || Object.keys(node.config).length === 0)) {
      warnings.push({ nodeId: node.id, code: 'MISSING_CONFIG', message: `Node "${node.name}" has no configuration` });
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

// GET: Get workflow execution history or validate
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get('workflowId');
  const runId = searchParams.get('runId');

  if (runId) {
    const run = executionHistory.find(r => r.id === runId);
    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }
    return NextResponse.json(run);
  }

  if (workflowId) {
    const runs = executionHistory.filter(r => r.workflowId === workflowId);
    return NextResponse.json({ runs, total: runs.length });
  }

  return NextResponse.json({
    runs: executionHistory,
    total: executionHistory.length,
  });
}

// POST: Validate workflow or trigger execution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, workflow } = body;

    if (action === 'validate') {
      if (!workflow) {
        return NextResponse.json({ error: 'workflow required' }, { status: 400 });
      }
      
      const result = validateWorkflow(workflow as WorkflowDefinition);
      return NextResponse.json(result);
    }

    if (action === 'execute') {
      // In production, this would queue the workflow for execution
      const run: ExecutionRun = {
        id: `run-${Date.now()}`,
        workflowId: workflow?.id || 'unknown',
        status: 'running',
        startedAt: new Date().toISOString(),
        trigger: body.trigger || 'Manual',
        steps: [],
      };

      console.log('[Workflow Execute]', { runId: run.id, workflowId: run.workflowId });

      return NextResponse.json({
        message: 'Workflow execution started',
        run,
      }, { status: 202 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('[Workflow API Error]', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
