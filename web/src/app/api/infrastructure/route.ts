import { NextRequest, NextResponse } from 'next/server';

// Infrastructure Provisioning API
// Manage cloud infrastructure, containers, and resources

interface InfraResource {
  id: string;
  name: string;
  type: 'container' | 'database' | 'storage' | 'cache' | 'queue' | 'function';
  provider: 'aws' | 'gcp' | 'azure' | 'vercel' | 'cloudflare';
  status: 'running' | 'stopped' | 'provisioning' | 'failed' | 'deleting';
  region: string;
  specs: Record<string, unknown>;
  cost?: { hourly: number; monthly: number };
  createdAt: string;
  updatedAt: string;
}

interface ProvisionRequest {
  type: InfraResource['type'];
  provider: InfraResource['provider'];
  name: string;
  region: string;
  specs: Record<string, unknown>;
}

// Mock resource store
const resources: Map<string, InfraResource> = new Map([
  ['res-001', { id: 'res-001', name: 'api-server', type: 'container', provider: 'aws', status: 'running', region: 'us-east-1', specs: { cpu: 2, memory: 4096, image: 'node:20' }, cost: { hourly: 0.05, monthly: 36 }, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString() }],
  ['res-002', { id: 'res-002', name: 'postgres-main', type: 'database', provider: 'aws', status: 'running', region: 'us-east-1', specs: { engine: 'postgres', version: '15', storage: 100 }, cost: { hourly: 0.12, monthly: 86 }, createdAt: new Date(Date.now() - 604800000).toISOString(), updatedAt: new Date().toISOString() }],
  ['res-003', { id: 'res-003', name: 'redis-cache', type: 'cache', provider: 'aws', status: 'running', region: 'us-east-1', specs: { engine: 'redis', memory: 1024 }, cost: { hourly: 0.02, monthly: 14 }, createdAt: new Date(Date.now() - 259200000).toISOString(), updatedAt: new Date().toISOString() }],
  ['res-004', { id: 'res-004', name: 'file-storage', type: 'storage', provider: 'aws', status: 'running', region: 'us-east-1', specs: { type: 's3', size: 50 }, cost: { hourly: 0.01, monthly: 7 }, createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date().toISOString() }],
]);

// Supported resource templates
const templates: Record<string, Partial<ProvisionRequest>> = {
  'web-server': { type: 'container', specs: { cpu: 1, memory: 2048, image: 'node:20' } },
  'api-server': { type: 'container', specs: { cpu: 2, memory: 4096, image: 'node:20' } },
  'postgres-small': { type: 'database', specs: { engine: 'postgres', version: '15', storage: 20 } },
  'postgres-medium': { type: 'database', specs: { engine: 'postgres', version: '15', storage: 100 } },
  'redis-small': { type: 'cache', specs: { engine: 'redis', memory: 512 } },
  'redis-medium': { type: 'cache', specs: { engine: 'redis', memory: 2048 } },
  's3-bucket': { type: 'storage', specs: { type: 's3', size: 10 } },
};

// GET: List resources or get specific resource
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get('resourceId');
  const type = searchParams.get('type');
  const view = searchParams.get('view');

  // Get specific resource
  if (resourceId) {
    const resource = resources.get(resourceId);
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    return NextResponse.json(resource);
  }

  // Get templates
  if (view === 'templates') {
    return NextResponse.json({ templates: Object.entries(templates).map(([id, t]) => ({ id, ...t })) });
  }

  // Get summary
  if (view === 'summary') {
    const resourceList = Array.from(resources.values());
    const totalCost = resourceList.reduce((sum, r) => sum + (r.cost?.monthly || 0), 0);
    const byType = resourceList.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return NextResponse.json({
      total: resources.size,
      running: resourceList.filter(r => r.status === 'running').length,
      totalMonthlyCost: totalCost,
      byType,
    });
  }

  // Filter by type
  let resourceList = Array.from(resources.values());
  if (type) {
    resourceList = resourceList.filter(r => r.type === type);
  }

  return NextResponse.json({
    resources: resourceList,
    total: resourceList.length,
  });
}

// POST: Provision new resource
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, templateId, ...provisionRequest } = body;

    // Provision from template
    if (action === 'provision_template') {
      const template = templates[templateId];
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }

      const resource: InfraResource = {
        id: `res-${Date.now()}`,
        name: provisionRequest.name || `${templateId}-${Date.now()}`,
        type: template.type as InfraResource['type'],
        provider: provisionRequest.provider || 'aws',
        status: 'provisioning',
        region: provisionRequest.region || 'us-east-1',
        specs: { ...template.specs, ...provisionRequest.specs },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      resources.set(resource.id, resource);

      console.log('[Infra Provisioning]', { resourceId: resource.id, template: templateId });

      return NextResponse.json({
        message: 'Resource provisioning started',
        resource,
      }, { status: 202 });
    }

    // Direct provision
    if (action === 'provision') {
      const { type, provider, name, region, specs } = provisionRequest as ProvisionRequest;

      if (!type || !name) {
        return NextResponse.json({ error: 'type and name required' }, { status: 400 });
      }

      const resource: InfraResource = {
        id: `res-${Date.now()}`,
        name,
        type,
        provider: provider || 'aws',
        status: 'provisioning',
        region: region || 'us-east-1',
        specs: specs || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      resources.set(resource.id, resource);

      console.log('[Infra Provisioning]', { resourceId: resource.id, type, name });

      return NextResponse.json({
        message: 'Resource provisioning started',
        resource,
      }, { status: 202 });
    }

    // Scale resource
    if (action === 'scale') {
      const { resourceId, specs } = body;
      const resource = resources.get(resourceId);
      
      if (!resource) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }

      resource.specs = { ...resource.specs, ...specs };
      resource.updatedAt = new Date().toISOString();
      resources.set(resourceId, resource);

      console.log('[Infra Scale]', { resourceId, specs });

      return NextResponse.json({
        message: 'Resource scaled',
        resource,
      });
    }

    // Start/Stop resource
    if (action === 'start' || action === 'stop') {
      const { resourceId } = body;
      const resource = resources.get(resourceId);
      
      if (!resource) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }

      resource.status = action === 'start' ? 'running' : 'stopped';
      resource.updatedAt = new Date().toISOString();
      resources.set(resourceId, resource);

      return NextResponse.json({
        message: `Resource ${action}ed`,
        resource,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('[Infra API Error]', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// DELETE: Delete resource
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resourceId = searchParams.get('resourceId');

  if (!resourceId) {
    return NextResponse.json({ error: 'resourceId required' }, { status: 400 });
  }

  const resource = resources.get(resourceId);
  if (!resource) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }

  resource.status = 'deleting';
  resources.set(resourceId, resource);

  // In production, actually delete after cleanup
  setTimeout(() => resources.delete(resourceId), 5000);

  console.log('[Infra Delete]', { resourceId });

  return NextResponse.json({
    message: 'Resource deletion initiated',
    resource,
  });
}
