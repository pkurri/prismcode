import { NextRequest, NextResponse } from 'next/server';

// Types for integration connectors
type AuthType = 'oauth2' | 'api_key' | 'basic' | 'token';

interface IntegrationConfig {
  id: string;
  name: string;
  provider: string;
  logo: string;
  description: string;
  authType: AuthType;
  scopes: string[];
  capabilities: {
    triggers: TriggerDefinition[];
    actions: ActionDefinition[];
  };
  oauthConfig?: {
    authUrl: string;
    tokenUrl: string;
    clientId?: string;
  };
  status: 'available' | 'beta' | 'deprecated';
}

interface TriggerDefinition {
  id: string;
  name: string;
  description: string;
  schema: Record<string, unknown>;
}

interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
}

interface ConnectedIntegration {
  id: string;
  integrationId: string;
  organizationId: string;
  status: 'connected' | 'error' | 'expired';
  connectedAt: string;
  lastHealthCheck: string;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  metadata?: Record<string, string>;
}

// Integration Registry - Available integrations
const integrationRegistry: IntegrationConfig[] = [
  {
    id: 'github',
    name: 'GitHub',
    provider: 'github',
    logo: '🐙',
    description: 'Connect to GitHub for repository management, PR automation, and issue tracking',
    authType: 'oauth2',
    scopes: ['repo', 'read:org', 'read:user', 'workflow', 'admin:repo_hook'],
    capabilities: {
      triggers: [
        { id: 'pr_opened', name: 'Pull Request Opened', description: 'Triggered when a new PR is opened', schema: { prNumber: 'number', repo: 'string' } },
        { id: 'pr_merged', name: 'Pull Request Merged', description: 'Triggered when a PR is merged', schema: { prNumber: 'number', repo: 'string' } },
        { id: 'issue_created', name: 'Issue Created', description: 'Triggered when a new issue is created', schema: { issueNumber: 'number', repo: 'string' } },
        { id: 'push', name: 'Push to Branch', description: 'Triggered on push to specified branch', schema: { branch: 'string', commits: 'array' } },
      ],
      actions: [
        { id: 'create_pr', name: 'Create Pull Request', description: 'Create a new pull request', inputSchema: { title: 'string', body: 'string', head: 'string', base: 'string' }, outputSchema: { prNumber: 'number', url: 'string' } },
        { id: 'add_comment', name: 'Add Comment', description: 'Add a comment to an issue or PR', inputSchema: { issueNumber: 'number', body: 'string' }, outputSchema: { commentId: 'number' } },
        { id: 'merge_pr', name: 'Merge Pull Request', description: 'Merge a pull request', inputSchema: { prNumber: 'number', method: 'string' }, outputSchema: { merged: 'boolean', sha: 'string' } },
        { id: 'create_issue', name: 'Create Issue', description: 'Create a new issue', inputSchema: { title: 'string', body: 'string', labels: 'array' }, outputSchema: { issueNumber: 'number', url: 'string' } },
      ],
    },
    oauthConfig: {
      authUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
    },
    status: 'available',
  },
  {
    id: 'slack',
    name: 'Slack',
    provider: 'slack',
    logo: '💬',
    description: 'Send notifications, receive commands, and automate team communication',
    authType: 'oauth2',
    scopes: ['chat:write', 'commands', 'channels:read', 'users:read'],
    capabilities: {
      triggers: [
        { id: 'slash_command', name: 'Slash Command', description: 'Triggered by a slash command', schema: { command: 'string', text: 'string', userId: 'string' } },
        { id: 'mention', name: 'Bot Mention', description: 'Triggered when bot is mentioned', schema: { channel: 'string', text: 'string', userId: 'string' } },
      ],
      actions: [
        { id: 'send_message', name: 'Send Message', description: 'Send a message to a channel', inputSchema: { channel: 'string', text: 'string', blocks: 'array' }, outputSchema: { ts: 'string', channel: 'string' } },
        { id: 'send_dm', name: 'Send Direct Message', description: 'Send a DM to a user', inputSchema: { userId: 'string', text: 'string' }, outputSchema: { ts: 'string', channel: 'string' } },
        { id: 'add_reaction', name: 'Add Reaction', description: 'Add an emoji reaction', inputSchema: { channel: 'string', timestamp: 'string', emoji: 'string' }, outputSchema: { ok: 'boolean' } },
      ],
    },
    oauthConfig: {
      authUrl: 'https://slack.com/oauth/v2/authorize',
      tokenUrl: 'https://slack.com/api/oauth.v2.access',
    },
    status: 'available',
  },
  {
    id: 'jira',
    name: 'Jira',
    provider: 'atlassian',
    logo: '📋',
    description: 'Sync issues, manage sprints, and connect development workflow with project management',
    authType: 'oauth2',
    scopes: ['read:jira-work', 'write:jira-work', 'read:sprint:jira-software'],
    capabilities: {
      triggers: [
        { id: 'issue_created', name: 'Issue Created', description: 'Triggered when an issue is created', schema: { issueKey: 'string', project: 'string' } },
        { id: 'issue_updated', name: 'Issue Updated', description: 'Triggered when an issue is updated', schema: { issueKey: 'string', fields: 'object' } },
        { id: 'sprint_started', name: 'Sprint Started', description: 'Triggered when a sprint starts', schema: { sprintId: 'number', sprintName: 'string' } },
      ],
      actions: [
        { id: 'create_issue', name: 'Create Issue', description: 'Create a Jira issue', inputSchema: { project: 'string', issueType: 'string', summary: 'string' }, outputSchema: { issueKey: 'string', url: 'string' } },
        { id: 'update_status', name: 'Update Issue Status', description: 'Transition issue to new status', inputSchema: { issueKey: 'string', status: 'string' }, outputSchema: { success: 'boolean' } },
        { id: 'add_comment', name: 'Add Comment', description: 'Add a comment to an issue', inputSchema: { issueKey: 'string', body: 'string' }, outputSchema: { commentId: 'string' } },
      ],
    },
    oauthConfig: {
      authUrl: 'https://auth.atlassian.com/authorize',
      tokenUrl: 'https://auth.atlassian.com/oauth/token',
    },
    status: 'available',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    provider: 'vercel',
    logo: '▲',
    description: 'Deploy previews, manage production deployments, and sync environment variables',
    authType: 'oauth2',
    scopes: ['deployments', 'projects', 'env-vars'],
    capabilities: {
      triggers: [
        { id: 'deploy_started', name: 'Deployment Started', description: 'Triggered when a deployment starts', schema: { deploymentId: 'string', project: 'string' } },
        { id: 'deploy_complete', name: 'Deployment Complete', description: 'Triggered when a deployment completes', schema: { deploymentId: 'string', url: 'string', status: 'string' } },
        { id: 'deploy_failed', name: 'Deployment Failed', description: 'Triggered when a deployment fails', schema: { deploymentId: 'string', error: 'string' } },
      ],
      actions: [
        { id: 'trigger_deploy', name: 'Trigger Deployment', description: 'Trigger a new deployment', inputSchema: { project: 'string', target: 'string' }, outputSchema: { deploymentId: 'string', url: 'string' } },
        { id: 'rollback', name: 'Rollback Deployment', description: 'Rollback to previous deployment', inputSchema: { project: 'string', deploymentId: 'string' }, outputSchema: { success: 'boolean', url: 'string' } },
        { id: 'update_env', name: 'Update Environment Variable', description: 'Update an environment variable', inputSchema: { project: 'string', key: 'string', value: 'string' }, outputSchema: { success: 'boolean' } },
      ],
    },
    oauthConfig: {
      authUrl: 'https://vercel.com/integrations/prismcode/new',
      tokenUrl: 'https://api.vercel.com/v2/oauth/access_token',
    },
    status: 'available',
  },
  {
    id: 'linear',
    name: 'Linear',
    provider: 'linear',
    logo: '⚡',
    description: 'Modern issue tracking with cycle management and PR linking',
    authType: 'oauth2',
    scopes: ['read', 'write', 'issues:create', 'comments:create'],
    capabilities: {
      triggers: [
        { id: 'issue_created', name: 'Issue Created', description: 'Triggered when an issue is created', schema: { issueId: 'string', title: 'string' } },
        { id: 'issue_completed', name: 'Issue Completed', description: 'Triggered when an issue is completed', schema: { issueId: 'string' } },
        { id: 'cycle_started', name: 'Cycle Started', description: 'Triggered when a cycle starts', schema: { cycleId: 'string', name: 'string' } },
      ],
      actions: [
        { id: 'create_issue', name: 'Create Issue', description: 'Create a Linear issue', inputSchema: { title: 'string', description: 'string', teamId: 'string' }, outputSchema: { issueId: 'string', url: 'string' } },
        { id: 'update_issue', name: 'Update Issue', description: 'Update an existing issue', inputSchema: { issueId: 'string', title: 'string', state: 'string' }, outputSchema: { success: 'boolean' } },
        { id: 'link_pr', name: 'Link Pull Request', description: 'Link a PR to an issue', inputSchema: { issueId: 'string', prUrl: 'string' }, outputSchema: { success: 'boolean' } },
      ],
    },
    oauthConfig: {
      authUrl: 'https://linear.app/oauth/authorize',
      tokenUrl: 'https://api.linear.app/oauth/token',
    },
    status: 'available',
  },
  {
    id: 'snyk',
    name: 'Snyk',
    provider: 'snyk',
    logo: '🔒',
    description: 'Security vulnerability scanning with automatic fix suggestions',
    authType: 'token',
    scopes: ['org.read', 'project.read', 'project.test'],
    capabilities: {
      triggers: [
        { id: 'vulnerability_found', name: 'Vulnerability Found', description: 'Triggered when a new vulnerability is found', schema: { severity: 'string', package: 'string' } },
        { id: 'scan_complete', name: 'Scan Complete', description: 'Triggered when a scan completes', schema: { projectId: 'string', issueCount: 'number' } },
      ],
      actions: [
        { id: 'run_scan', name: 'Run Security Scan', description: 'Trigger a security scan', inputSchema: { projectId: 'string' }, outputSchema: { scanId: 'string', status: 'string' } },
        { id: 'create_fix_pr', name: 'Create Fix PR', description: 'Create a PR with vulnerability fixes', inputSchema: { projectId: 'string', issueId: 'string' }, outputSchema: { prUrl: 'string' } },
        { id: 'ignore_issue', name: 'Ignore Issue', description: 'Ignore a specific vulnerability', inputSchema: { issueId: 'string', reason: 'string' }, outputSchema: { success: 'boolean' } },
      ],
    },
    status: 'available',
  },
];

// Mock connected integrations (in production, from database)
const connectedIntegrations: ConnectedIntegration[] = [
  { id: 'conn-001', integrationId: 'github', organizationId: 'org-001', status: 'connected', connectedAt: new Date(Date.now() - 86400000 * 30).toISOString(), lastHealthCheck: new Date(Date.now() - 30000).toISOString(), healthStatus: 'healthy', latency: 45 },
  { id: 'conn-002', integrationId: 'slack', organizationId: 'org-001', status: 'connected', connectedAt: new Date(Date.now() - 86400000 * 15).toISOString(), lastHealthCheck: new Date(Date.now() - 15000).toISOString(), healthStatus: 'healthy', latency: 30 },
  { id: 'conn-003', integrationId: 'jira', organizationId: 'org-001', status: 'connected', connectedAt: new Date(Date.now() - 86400000 * 7).toISOString(), lastHealthCheck: new Date(Date.now() - 60000).toISOString(), healthStatus: 'healthy', latency: 120 },
  { id: 'conn-004', integrationId: 'vercel', organizationId: 'org-001', status: 'connected', connectedAt: new Date(Date.now() - 86400000 * 3).toISOString(), lastHealthCheck: new Date(Date.now() - 120000).toISOString(), healthStatus: 'healthy', latency: 80 },
  { id: 'conn-005', integrationId: 'snyk', organizationId: 'org-001', status: 'connected', connectedAt: new Date(Date.now() - 86400000 * 10).toISOString(), lastHealthCheck: new Date(Date.now() - 300000).toISOString(), healthStatus: 'degraded', latency: 250 },
];

// GET: List integrations or get specific integration details
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const integrationId = searchParams.get('id');
  const view = searchParams.get('view'); // 'registry', 'connected', 'health'
  const organizationId = searchParams.get('orgId') || 'org-001';

  // Get integration registry
  if (view === 'registry' || !view) {
    if (integrationId) {
      const integration = integrationRegistry.find(i => i.id === integrationId);
      if (!integration) {
        return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
      }
      return NextResponse.json(integration);
    }
    return NextResponse.json({
      integrations: integrationRegistry,
      total: integrationRegistry.length,
    });
  }

  // Get connected integrations
  if (view === 'connected') {
    const orgConnections = connectedIntegrations.filter(c => c.organizationId === organizationId);
    const enriched = orgConnections.map(conn => ({
      ...conn,
      integration: integrationRegistry.find(i => i.id === conn.integrationId),
    }));
    return NextResponse.json({
      connections: enriched,
      total: enriched.length,
    });
  }

  // Get health status for all connected integrations
  if (view === 'health') {
    const orgConnections = connectedIntegrations.filter(c => c.organizationId === organizationId);
    const health = orgConnections.map(conn => ({
      integrationId: conn.integrationId,
      name: integrationRegistry.find(i => i.id === conn.integrationId)?.name,
      status: conn.healthStatus,
      lastCheck: conn.lastHealthCheck,
      latency: conn.latency,
    }));
    return NextResponse.json({
      health,
      healthyCount: health.filter(h => h.status === 'healthy').length,
      degradedCount: health.filter(h => h.status === 'degraded').length,
      unhealthyCount: health.filter(h => h.status === 'unhealthy').length,
    });
  }

  return NextResponse.json({ error: 'Invalid view parameter' }, { status: 400 });
}

// POST: Initiate OAuth flow or connect with API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { integrationId, authType, credentials, organizationId = 'org-001' } = body;

    // Validate integration exists
    const integration = integrationRegistry.find(i => i.id === integrationId);
    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    // Handle OAuth flow initiation
    if (integration.authType === 'oauth2') {
      if (!integration.oauthConfig) {
        return NextResponse.json({ error: 'OAuth not configured for this integration' }, { status: 500 });
      }
      
      const state = `${organizationId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const authUrl = new URL(integration.oauthConfig.authUrl);
      authUrl.searchParams.set('client_id', integration.oauthConfig.clientId || 'PRISMCODE_CLIENT_ID');
      authUrl.searchParams.set('scope', integration.scopes.join(' '));
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('redirect_uri', 'https://prismcode.dev/api/connectors/callback');
      
      return NextResponse.json({
        authUrl: authUrl.toString(),
        state,
        message: 'Redirect user to authUrl to complete OAuth flow',
      });
    }

    // Handle API key / token based auth
    if (authType === 'api_key' || authType === 'token') {
      if (!credentials?.apiKey && !credentials?.token) {
        return NextResponse.json({ error: 'API key or token required' }, { status: 400 });
      }

      // In production: validate credentials and store encrypted
      const connectionId = `conn-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      console.log('[Integration Connected]', {
        connectionId,
        integrationId,
        organizationId,
        authType,
      });

      return NextResponse.json({
        connectionId,
        integrationId,
        status: 'connected',
        message: 'Integration connected successfully',
      }, { status: 201 });
    }

    return NextResponse.json({ error: 'Unsupported auth type' }, { status: 400 });

  } catch (error) {
    console.error('[Connector Error]', error);
    return NextResponse.json({ error: 'Failed to connect integration' }, { status: 500 });
  }
}

// DELETE: Disconnect an integration
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const connectionId = searchParams.get('connectionId');

  if (!connectionId) {
    return NextResponse.json({ error: 'connectionId required' }, { status: 400 });
  }

  // In production: revoke tokens and delete from database
  console.log('[Integration Disconnected]', { connectionId });

  return NextResponse.json({
    message: 'Integration disconnected successfully',
    connectionId,
  });
}

// PATCH: Run health check or update connection settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectionId, action } = body;

    if (!connectionId) {
      return NextResponse.json({ error: 'connectionId required' }, { status: 400 });
    }

    if (action === 'health_check') {
      // Simulate health check
      const latency = Math.floor(Math.random() * 200) + 20;
      const status = latency < 150 ? 'healthy' : latency < 300 ? 'degraded' : 'unhealthy';

      console.log('[Health Check]', { connectionId, latency, status });

      return NextResponse.json({
        connectionId,
        healthStatus: status,
        latency,
        checkedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('[Connector Update Error]', error);
    return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 });
  }
}
