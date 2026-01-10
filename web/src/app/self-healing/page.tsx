'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PipelineRun {
  id: string;
  name: string;
  status: 'success' | 'failed' | 'healed' | 'running';
  healingActions: HealingAction[];
  duration: string;
  startedAt: string;
}

interface HealingAction {
  id: string;
  type: 'retry' | 'rollback' | 'cache_clear' | 'config_fix' | 'quarantine';
  description: string;
  status: 'applied' | 'pending' | 'skipped';
  impact: string;
}

interface HealingRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  successRate: number;
}

const mockPipelines: PipelineRun[] = [
  { id: '1', name: 'main → production', status: 'healed', healingActions: [{ id: 'a1', type: 'retry', description: 'Retried flaky test: auth.e2e.ts', status: 'applied', impact: 'Test passed on retry 2' }], duration: '4m 23s', startedAt: '10 mins ago' },
  { id: '2', name: 'feature/auth → staging', status: 'success', healingActions: [], duration: '3m 12s', startedAt: '25 mins ago' },
  { id: '3', name: 'hotfix/api → production', status: 'healed', healingActions: [{ id: 'a2', type: 'cache_clear', description: 'Cleared build cache', status: 'applied', impact: 'Resolved stale dependency' }, { id: 'a3', type: 'retry', description: 'Retried deployment', status: 'applied', impact: 'Deployment succeeded' }], duration: '6m 45s', startedAt: '1 hour ago' },
  { id: '4', name: 'develop → staging', status: 'failed', healingActions: [{ id: 'a4', type: 'rollback', description: 'Auto-rollback triggered', status: 'applied', impact: 'Reverted to last stable' }], duration: '2m 10s', startedAt: '2 hours ago' },
];

const mockRules: HealingRule[] = [
  { id: '1', name: 'Flaky Test Retry', trigger: 'Test fails with known flaky pattern', action: 'Retry up to 3 times', enabled: true, successRate: 92 },
  { id: '2', name: 'Cache Invalidation', trigger: 'Build fails after dependency update', action: 'Clear node_modules cache', enabled: true, successRate: 88 },
  { id: '3', name: 'Auto Rollback', trigger: 'Deployment health check fails', action: 'Rollback to previous version', enabled: true, successRate: 100 },
  { id: '4', name: 'Config Repair', trigger: 'Environment variable missing', action: 'Apply default from template', enabled: false, successRate: 75 },
  { id: '5', name: 'Test Quarantine', trigger: 'Same test fails 5+ times in week', action: 'Move to quarantine suite', enabled: true, successRate: 95 },
];

const statusColors: Record<string, string> = {
  success: 'bg-green-500',
  failed: 'bg-red-500',
  healed: 'bg-blue-500',
  running: 'bg-amber-500 animate-pulse',
};

const actionIcons: Record<string, string> = {
  retry: '🔄',
  rollback: '⏪',
  cache_clear: '🗑️',
  config_fix: '🔧',
  quarantine: '🔒',
};

export default function SelfHealingPage() {
  const [pipelines] = useState(mockPipelines);
  const [rules, setRules] = useState(mockRules);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const healedCount = pipelines.filter(p => p.status === 'healed').length;
  const totalActions = pipelines.reduce((s, p) => s + p.healingActions.length, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Self-Healing CI/CD
          </h1>
          <p className="text-muted-foreground">Automatic pipeline repair and optimization</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          + Add Healing Rule
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pipelines Today</CardDescription>
            <CardTitle className="text-3xl">{pipelines.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Self-Healed</CardDescription>
            <CardTitle className="text-3xl text-blue-500">{healedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Healing Actions</CardDescription>
            <CardTitle className="text-3xl text-green-500">{totalActions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-3xl">94%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="pipelines" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipelines">Recent Pipelines</TabsTrigger>
          <TabsTrigger value="rules">Healing Rules</TabsTrigger>
          <TabsTrigger value="history">Healing History</TabsTrigger>
        </TabsList>

        <TabsContent value="pipelines">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Runs</CardTitle>
              <CardDescription>Recent CI/CD runs with healing status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pipelines.map(pipeline => (
                <div key={pipeline.id} className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${statusColors[pipeline.status]}`} />
                      <h4 className="font-medium">{pipeline.name}</h4>
                      <Badge variant={pipeline.status === 'healed' ? 'default' : 'secondary'}>
                        {pipeline.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{pipeline.duration} • {pipeline.startedAt}</span>
                  </div>
                  {pipeline.healingActions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {pipeline.healingActions.map(action => (
                        <div key={action.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{actionIcons[action.type]}</span>
                          <span>{action.description}</span>
                          <Badge variant="outline" className="text-xs">{action.impact}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Healing Rules</CardTitle>
              <CardDescription>Automated repair configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {rules.map(rule => (
                <div key={rule.id} className={`flex items-center justify-between p-4 rounded-lg ${rule.enabled ? 'bg-green-500/5 border border-green-500/30' : 'bg-muted/30'}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      <Badge variant="secondary" className="text-xs">{rule.successRate}% success</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>When:</strong> {rule.trigger}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Then:</strong> {rule.action}
                    </p>
                  </div>
                  <Button 
                    variant={rule.enabled ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleRule(rule.id)}
                  >
                    {rule.enabled ? '✓ Enabled' : 'Disabled'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Healing History</CardTitle>
              <CardDescription>All automated repairs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <span className="text-4xl">🔧</span>
                <p className="mt-4">Detailed healing logs will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
