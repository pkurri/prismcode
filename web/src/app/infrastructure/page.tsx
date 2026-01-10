'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface InfraResource {
  id: string;
  name: string;
  type: 'container' | 'database' | 'storage' | 'cache' | 'queue' | 'function';
  provider: 'aws' | 'gcp' | 'azure';
  status: 'running' | 'stopped' | 'provisioning' | 'failed';
  region: string;
  specs: Record<string, unknown>;
  cost?: { hourly: number; monthly: number };
}

interface Template {
  id: string;
  type: string;
  specs: Record<string, unknown>;
}

const mockResources: InfraResource[] = [
  { id: 'res-001', name: 'api-server', type: 'container', provider: 'aws', status: 'running', region: 'us-east-1', specs: { cpu: 2, memory: 4096 }, cost: { hourly: 0.05, monthly: 36 } },
  { id: 'res-002', name: 'postgres-main', type: 'database', provider: 'aws', status: 'running', region: 'us-east-1', specs: { engine: 'postgres', storage: 100 }, cost: { hourly: 0.12, monthly: 86 } },
  { id: 'res-003', name: 'redis-cache', type: 'cache', provider: 'aws', status: 'running', region: 'us-east-1', specs: { memory: 1024 }, cost: { hourly: 0.02, monthly: 14 } },
  { id: 'res-004', name: 'file-storage', type: 'storage', provider: 'aws', status: 'running', region: 'us-east-1', specs: { size: 50 }, cost: { hourly: 0.01, monthly: 7 } },
  { id: 'res-005', name: 'worker-queue', type: 'queue', provider: 'aws', status: 'stopped', region: 'us-east-1', specs: { type: 'sqs' }, cost: { hourly: 0, monthly: 2 } },
];

const templates: Template[] = [
  { id: 'web-server', type: 'container', specs: { cpu: 1, memory: 2048 } },
  { id: 'api-server', type: 'container', specs: { cpu: 2, memory: 4096 } },
  { id: 'postgres-small', type: 'database', specs: { engine: 'postgres', storage: 20 } },
  { id: 'redis-small', type: 'cache', specs: { memory: 512 } },
];

const typeIcons: Record<string, string> = {
  container: '📦',
  database: '🗄️',
  storage: '💾',
  cache: '⚡',
  queue: '📬',
  function: '⚙️',
};

const statusColors: Record<string, string> = {
  running: 'bg-green-500',
  stopped: 'bg-gray-400',
  provisioning: 'bg-blue-500 animate-pulse',
  failed: 'bg-red-500',
};

export default function InfrastructurePage() {
  const [resources, setResources] = useState(mockResources);
  const [showProvision, setShowProvision] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const totalCost = resources.reduce((sum, r) => sum + (r.cost?.monthly || 0), 0);
  const runningCount = resources.filter(r => r.status === 'running').length;

  const provisionResource = (template: Template) => {
    const newResource: InfraResource = {
      id: `res-${Date.now()}`,
      name: `${template.id}-${Date.now().toString().slice(-4)}`,
      type: template.type as InfraResource['type'],
      provider: 'aws',
      status: 'provisioning',
      region: 'us-east-1',
      specs: template.specs,
    };
    setResources([newResource, ...resources]);
    setShowProvision(false);
    
    // Simulate provisioning complete
    setTimeout(() => {
      setResources(prev => prev.map(r => 
        r.id === newResource.id ? { ...r, status: 'running' as const } : r
      ));
    }, 3000);
  };

  const toggleResource = (id: string) => {
    setResources(prev => prev.map(r => 
      r.id === id ? { ...r, status: r.status === 'running' ? 'stopped' as const : 'running' as const } : r
    ));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Infrastructure
          </h1>
          <p className="text-muted-foreground">Manage your cloud resources</p>
        </div>
        <Button onClick={() => setShowProvision(true)} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          + Provision Resource
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Resources</CardDescription>
            <CardTitle className="text-3xl">{resources.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-green-500">{runningCount} running</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Cost</CardDescription>
            <CardTitle className="text-3xl">${totalCost.toFixed(0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">estimated</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Regions</CardDescription>
            <CardTitle className="text-3xl">1</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">us-east-1</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Provider</CardDescription>
            <CardTitle className="text-3xl">AWS</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">primary</span>
          </CardContent>
        </Card>
      </div>

      {/* Resource List */}
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>All provisioned infrastructure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {resources.map(resource => (
            <div key={resource.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                  {typeIcons[resource.type]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{resource.name}</h4>
                    <Badge variant="secondary" className="text-xs capitalize">{resource.type}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {resource.region} • {JSON.stringify(resource.specs).slice(1, 40)}...
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {resource.cost && (
                  <span className="text-sm text-muted-foreground">${resource.cost.monthly}/mo</span>
                )}
                <span className={`w-3 h-3 rounded-full ${statusColors[resource.status]}`} />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleResource(resource.id)}
                >
                  {resource.status === 'running' ? '⏹️ Stop' : '▶️ Start'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Provision Modal */}
      {showProvision && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Provision New Resource</CardTitle>
              <CardDescription>Choose a template to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => provisionResource(template)}
                  className="w-full flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 text-left transition-colors"
                >
                  <span className="text-2xl">{typeIcons[template.type]}</span>
                  <div>
                    <p className="font-medium capitalize">{template.id.replace('-', ' ')}</p>
                    <p className="text-sm text-muted-foreground">{JSON.stringify(template.specs)}</p>
                  </div>
                </button>
              ))}
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setShowProvision(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
