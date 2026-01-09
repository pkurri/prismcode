import { NextResponse } from 'next/server';

// Mock data - connects to workflow-templates backend module
const workflowsData = {
  workflows: [
    {
      id: 1,
      name: 'PR Review Automation',
      status: 'active',
      runs: 156,
      lastRun: '2 mins ago',
      nodes: 5,
    },
    {
      id: 2,
      name: 'Deploy to Staging',
      status: 'active',
      runs: 89,
      lastRun: '15 mins ago',
      nodes: 4,
    },
    {
      id: 3,
      name: 'Security Scan Weekly',
      status: 'paused',
      runs: 12,
      lastRun: '2 days ago',
      nodes: 3,
    },
  ],
  history: [
    {
      id: 1,
      workflow: 'PR Review Automation',
      status: 'success',
      duration: '45s',
      time: '2 mins ago',
    },
    {
      id: 2,
      workflow: 'Deploy to Staging',
      status: 'success',
      duration: '2m 30s',
      time: '15 mins ago',
    },
    {
      id: 3,
      workflow: 'PR Review Automation',
      status: 'failed',
      duration: '12s',
      time: '1 hour ago',
    },
  ],
  templates: [
    { id: 'pr-review', name: 'PR Review', desc: 'Auto-review PRs with AI', nodes: 4 },
    { id: 'deploy', name: 'Deploy Pipeline', desc: 'Build, test, deploy', nodes: 6 },
    { id: 'security', name: 'Security Scan', desc: 'Vulnerability scanning', nodes: 3 },
  ],
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: workflowsData,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, workflowId, workflow } = body;

  switch (action) {
    case 'create':
      return NextResponse.json({
        success: true,
        workflowId: `wf_${Date.now()}`,
        message: 'Workflow created',
      });
    case 'run':
      return NextResponse.json({
        success: true,
        runId: `run_${Date.now()}`,
        message: `Workflow ${workflowId} started`,
      });
    case 'pause':
      return NextResponse.json({
        success: true,
        message: `Workflow ${workflowId} paused`,
      });
    case 'validate':
      return NextResponse.json({
        success: true,
        valid: true,
        errors: [],
      });
    case 'save':
      return NextResponse.json({
        success: true,
        message: `Workflow saved: ${workflow?.name}`,
      });
    default:
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  }
}
