import { NextRequest, NextResponse } from 'next/server';

// Deployments API
// Manage deployments, environments, and deployment history

interface Environment {
  id: string;
  name: string;
  type: 'production' | 'staging' | 'preview' | 'development';
  url: string;
  status: 'healthy' | 'deploying' | 'failed' | 'stopped';
  branch: string;
  version?: string;
  lastDeployAt: string;
  config: Record<string, unknown>;
}

interface Deployment {
  id: string;
  envId: string;
  status: 'pending' | 'building' | 'deploying' | 'success' | 'failed' | 'cancelled';
  branch: string;
  commit: string;
  author: string;
  message: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  logs: string[];
}

// Mock data stores
const environments: Map<string, Environment> = new Map([
  ['prod', { id: 'prod', name: 'Production', type: 'production', url: 'https://prismcode.dev', status: 'healthy', branch: 'main', version: 'v2.4.1', lastDeployAt: new Date(Date.now() - 7200000).toISOString(), config: { autoDeploy: false } }],
  ['staging', { id: 'staging', name: 'Staging', type: 'staging', url: 'https://staging.prismcode.dev', status: 'healthy', branch: 'main', version: 'v2.4.2-beta', lastDeployAt: new Date(Date.now() - 1800000).toISOString(), config: { autoDeploy: true } }],
  ['dev', { id: 'dev', name: 'Development', type: 'development', url: 'http://localhost:3000', status: 'healthy', branch: 'develop', lastDeployAt: new Date().toISOString(), config: {} }],
]);

const deployments: Map<string, Deployment> = new Map();

// GET: List environments or deployments
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const envId = searchParams.get('envId');
  const deployId = searchParams.get('deployId');
  const view = searchParams.get('view');

  // Get specific deployment
  if (deployId) {
    const deploy = deployments.get(deployId);
    if (!deploy) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 });
    }
    return NextResponse.json(deploy);
  }

  // Get environment with its deployments
  if (envId) {
    const env = environments.get(envId);
    if (!env) {
      return NextResponse.json({ error: 'Environment not found' }, { status: 404 });
    }
    const envDeployments = Array.from(deployments.values())
      .filter(d => d.envId === envId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    return NextResponse.json({ environment: env, deployments: envDeployments });
  }

  // Summary view
  if (view === 'summary') {
    return NextResponse.json({
      environments: Array.from(environments.values()),
      stats: {
        totalDeployments: deployments.size,
        successRate: 95.5,
        avgDurationMs: 105000,
      },
    });
  }

  // List all environments
  return NextResponse.json({
    environments: Array.from(environments.values()),
    total: environments.size,
  });
}

// POST: Trigger deployment or create preview environment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, envId, branch, commit, prNumber } = body;

    // Trigger deployment
    if (action === 'deploy') {
      const env = environments.get(envId);
      if (!env) {
        return NextResponse.json({ error: 'Environment not found' }, { status: 404 });
      }

      if (env.status === 'deploying') {
        return NextResponse.json({ error: 'Deployment already in progress' }, { status: 409 });
      }

      const deployment: Deployment = {
        id: `deploy-${Date.now()}`,
        envId,
        status: 'building',
        branch: branch || env.branch,
        commit: commit || `${Math.random().toString(36).substring(2, 9)}`,
        author: 'API User',
        message: body.message || 'Triggered via API',
        startedAt: new Date().toISOString(),
        logs: ['Starting deployment...', 'Cloning repository...'],
      };

      deployments.set(deployment.id, deployment);
      env.status = 'deploying';
      environments.set(envId, env);

      console.log('[Deployment Started]', { deployId: deployment.id, envId, branch: deployment.branch });

      return NextResponse.json({
        message: 'Deployment started',
        deployment,
      }, { status: 202 });
    }

    // Create preview environment for PR
    if (action === 'create_preview') {
      if (!prNumber || !branch) {
        return NextResponse.json({ error: 'prNumber and branch required' }, { status: 400 });
      }

      const previewId = `preview-${prNumber}`;
      const preview: Environment = {
        id: previewId,
        name: `PR #${prNumber} Preview`,
        type: 'preview',
        url: `https://pr-${prNumber}.prismcode.dev`,
        status: 'deploying',
        branch,
        lastDeployAt: new Date().toISOString(),
        config: { prNumber },
      };

      environments.set(previewId, preview);

      console.log('[Preview Created]', { previewId, prNumber, branch });

      return NextResponse.json({
        message: 'Preview environment created',
        environment: preview,
      }, { status: 201 });
    }

    // Rollback deployment
    if (action === 'rollback') {
      const env = environments.get(envId);
      if (!env) {
        return NextResponse.json({ error: 'Environment not found' }, { status: 404 });
      }

      // Find previous successful deployment
      const prevDeploy = Array.from(deployments.values())
        .filter(d => d.envId === envId && d.status === 'success')
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[1];

      if (!prevDeploy) {
        return NextResponse.json({ error: 'No previous deployment to rollback to' }, { status: 400 });
      }

      console.log('[Rollback Initiated]', { envId, toCommit: prevDeploy.commit });

      return NextResponse.json({
        message: 'Rollback initiated',
        rollingBackTo: prevDeploy,
      }, { status: 202 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('[Deployment API Error]', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// DELETE: Cancel deployment or delete preview environment
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const envId = searchParams.get('envId');
  const deployId = searchParams.get('deployId');

  // Cancel deployment
  if (deployId) {
    const deploy = deployments.get(deployId);
    if (!deploy) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 });
    }

    if (!['pending', 'building', 'deploying'].includes(deploy.status)) {
      return NextResponse.json({ error: 'Deployment cannot be cancelled' }, { status: 400 });
    }

    deploy.status = 'cancelled';
    deploy.completedAt = new Date().toISOString();
    deployments.set(deployId, deploy);

    const env = environments.get(deploy.envId);
    if (env) {
      env.status = 'healthy';
      environments.set(deploy.envId, env);
    }

    return NextResponse.json({ message: 'Deployment cancelled', deployment: deploy });
  }

  // Delete preview environment
  if (envId) {
    const env = environments.get(envId);
    if (!env) {
      return NextResponse.json({ error: 'Environment not found' }, { status: 404 });
    }

    if (env.type !== 'preview') {
      return NextResponse.json({ error: 'Can only delete preview environments' }, { status: 400 });
    }

    environments.delete(envId);
    return NextResponse.json({ message: 'Preview environment deleted' });
  }

  return NextResponse.json({ error: 'envId or deployId required' }, { status: 400 });
}
