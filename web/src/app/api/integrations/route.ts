import { NextResponse } from 'next/server';

// Mock data - connects to integrations, oauth, linear-integration, jira-integration modules
const integrationsData = {
  connected: [
    {
      id: 'github',
      name: 'GitHub',
      status: 'connected',
      lastSync: '2 mins ago',
      scopes: ['repo', 'workflow'],
    },
    {
      id: 'jira',
      name: 'Jira',
      status: 'connected',
      lastSync: '15 mins ago',
      scopes: ['read', 'write'],
    },
    {
      id: 'slack',
      name: 'Slack',
      status: 'connected',
      lastSync: '1 min ago',
      scopes: ['chat:write'],
    },
    {
      id: 'vercel',
      name: 'Vercel',
      status: 'connected',
      lastSync: '5 mins ago',
      scopes: ['deployments'],
    },
    { id: 'snyk', name: 'Snyk', status: 'connected', lastSync: '30 mins ago', scopes: ['scan'] },
  ],
  available: [
    { id: 'gitlab', name: 'GitLab', category: 'version-control' },
    { id: 'linear', name: 'Linear', category: 'project-management' },
    { id: 'discord', name: 'Discord', category: 'communication' },
    { id: 'netlify', name: 'Netlify', category: 'deployment' },
    { id: 'sonarqube', name: 'SonarQube', category: 'security' },
  ],
  webhooks: [
    {
      id: 1,
      url: 'https://api.prismcode.dev/webhook/github',
      events: ['push', 'pr'],
      active: true,
    },
    {
      id: 2,
      url: 'https://api.prismcode.dev/webhook/jira',
      events: ['issue.created'],
      active: true,
    },
  ],
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: integrationsData,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, integrationId } = body;

  switch (action) {
    case 'connect':
      return NextResponse.json({
        success: true,
        authUrl: `https://oauth.provider.com/authorize?client_id=prismcode&integration=${integrationId}`,
      });
    case 'disconnect':
      return NextResponse.json({
        success: true,
        message: `Disconnected ${integrationId}`,
      });
    case 'sync':
      return NextResponse.json({
        success: true,
        message: `Sync started for ${integrationId}`,
        jobId: `sync_${Date.now()}`,
      });
    case 'test':
      return NextResponse.json({
        success: true,
        status: 'healthy',
        latency: '124ms',
      });
    default:
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  }
}
