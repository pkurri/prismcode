import { NextRequest, NextResponse } from 'next/server';

// Environments API for Sandbox Management - implements #303
interface Environment {
  id: string;
  name: string;
  type: 'local' | 'cloud' | 'staging' | 'production';
  url: string;
  status: 'idle' | 'building' | 'running' | 'failed' | 'provisioning';
  branch?: string;
  lastDeploy?: string;
  healthCheck?: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    lastCheck: string;
  };
}

// Mock environments data
const environments: Map<string, Environment> = new Map([
  ['local', { id: 'local', name: 'Local Dev', type: 'local', url: 'http://localhost:3000', status: 'running', branch: 'feature/batch-21', lastDeploy: new Date().toISOString(), healthCheck: { status: 'healthy', latency: 5, lastCheck: new Date().toISOString() } }],
  ['staging', { id: 'staging', name: 'Staging', type: 'staging', url: 'https://staging.prismcode.dev', status: 'running', branch: 'main', lastDeploy: new Date(Date.now() - 3600000).toISOString(), healthCheck: { status: 'healthy', latency: 45, lastCheck: new Date().toISOString() } }],
  ['prod', { id: 'prod', name: 'Production', type: 'production', url: 'https://app.prismcode.dev', status: 'running', branch: 'release-v1.2', lastDeploy: new Date(Date.now() - 86400000).toISOString(), healthCheck: { status: 'healthy', latency: 32, lastCheck: new Date().toISOString() } }],
]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const envId = searchParams.get('id');
  const type = searchParams.get('type');

  if (envId) {
    const env = environments.get(envId);
    if (!env) return NextResponse.json({ error: 'Environment not found' }, { status: 404 });
    return NextResponse.json(env);
  }

  let envList = Array.from(environments.values());
  if (type) {
    envList = envList.filter(e => e.type === type);
  }

  return NextResponse.json({ environments: envList });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, id, config } = body;

    // Trigger a deployment
    if (action === 'deploy') {
      const env = environments.get(id);
      if (!env) return NextResponse.json({ error: 'Environment not found' }, { status: 404 });

      env.status = 'building';
      env.lastDeploy = new Date().toISOString();
      environments.set(id, env);

      // Simulate build process
      setTimeout(() => {
        const updatedEnv = environments.get(id);
        if (updatedEnv) {
          updatedEnv.status = 'running';
          environments.set(id, updatedEnv);
        }
      }, 5000);

      return NextResponse.json({ 
        message: 'Deployment triggered', 
        environment: env,
        buildId: `build-${Date.now()}`
      });
    }

    // Provision new environment
    if (action === 'create') {
      const newId = `env-${Date.now()}`;
      const newEnv: Environment = {
        id: newId,
        name: config.name || 'New Environment',
        type: config.type || 'cloud',
        url: config.url || `https://${newId}.prismcode.dev`,
        status: 'provisioning',
        branch: config.branch || 'main',
        lastDeploy: new Date().toISOString(),
      };
      
      environments.set(newId, newEnv);
      
      return NextResponse.json({ 
        success: true, 
        environment: newEnv 
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const envId = searchParams.get('id');

  if (!envId) return NextResponse.json({ error: 'id required' }, { status: 400 });
  if (!environments.has(envId)) return NextResponse.json({ error: 'Environment not found' }, { status: 404 });

  environments.delete(envId);
  return NextResponse.json({ success: true, message: 'Environment deleted' });
}
