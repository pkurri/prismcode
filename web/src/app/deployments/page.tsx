'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DeploymentEnv {
  id: string;
  name: string;
  type: 'production' | 'staging' | 'preview' | 'development';
  url: string;
  status: 'healthy' | 'deploying' | 'failed' | 'stopped';
  branch: string;
  lastDeploy: string;
  version?: string;
}

interface Deployment {
  id: string;
  envId: string;
  status: 'success' | 'failed' | 'in_progress' | 'queued' | 'cancelled';
  branch: string;
  commit: string;
  author: string;
  message: string;
  timestamp: string;
  duration?: string;
  logs?: string[];
}

const environments: DeploymentEnv[] = [
  { id: 'prod', name: 'Production', type: 'production', url: 'https://prismcode.dev', status: 'healthy', branch: 'main', lastDeploy: '2 hours ago', version: 'v2.4.1' },
  { id: 'staging', name: 'Staging', type: 'staging', url: 'https://staging.prismcode.dev', status: 'healthy', branch: 'main', lastDeploy: '30 mins ago', version: 'v2.4.2-beta' },
  { id: 'preview-342', name: 'PR #342 Preview', type: 'preview', url: 'https://pr-342.prismcode.dev', status: 'deploying', branch: 'feature/auth', lastDeploy: 'Now' },
  { id: 'dev', name: 'Development', type: 'development', url: 'http://localhost:3000', status: 'healthy', branch: 'develop', lastDeploy: 'Just now' },
];

const deployments: Deployment[] = [
  { id: '1', envId: 'staging', status: 'success', branch: 'main', commit: 'e45243e', author: 'Sarah Chen', message: 'Fix: navigation bug in mobile view', timestamp: '30 mins ago', duration: '1m 45s' },
  { id: '2', envId: 'prod', status: 'success', branch: 'main', commit: 'a1b2c3d', author: 'Alex Thompson', message: 'Release: v2.4.1 with performance improvements', timestamp: '2 hours ago', duration: '2m 12s' },
  { id: '3', envId: 'preview-342', status: 'in_progress', branch: 'feature/auth', commit: '7b0fd6d', author: 'Jordan Rivera', message: 'Add: OAuth2 authentication flow', timestamp: 'Just now' },
  { id: '4', envId: 'staging', status: 'failed', branch: 'develop', commit: 'f9e8d7c', author: 'Taylor Kim', message: 'Update: API endpoints for v3', timestamp: '3 hours ago', duration: '0m 45s' },
  { id: '5', envId: 'prod', status: 'success', branch: 'main', commit: '5g6h7i8', author: 'Sarah Chen', message: 'Hotfix: rate limiting issue', timestamp: 'Yesterday', duration: '1m 30s' },
];

const envTypeColors: Record<string, string> = {
  production: 'bg-red-500/10 text-red-500 border-red-500/30',
  staging: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  preview: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  development: 'bg-green-500/10 text-green-500 border-green-500/30',
};

const statusColors: Record<string, string> = {
  healthy: 'bg-green-500',
  deploying: 'bg-blue-500 animate-pulse',
  failed: 'bg-red-500',
  stopped: 'bg-gray-400',
  success: 'text-green-500',
  in_progress: 'text-blue-500',
  queued: 'text-gray-500',
  cancelled: 'text-gray-500',
};

export default function DeploymentsDashboardPage() {
  const [selectedEnv, setSelectedEnv] = useState<DeploymentEnv | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Deployments
          </h1>
          <p className="text-muted-foreground">Monitor and manage your environments</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          🚀 Deploy Now
        </Button>
      </div>

      {/* Environment Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {environments.map(env => (
          <Card 
            key={env.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${selectedEnv?.id === env.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedEnv(env)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className={envTypeColors[env.type]}>
                  {env.type}
                </Badge>
                <span className={`w-3 h-3 rounded-full ${statusColors[env.status]}`} />
              </div>
              <h3 className="font-semibold mb-1">{env.name}</h3>
              <p className="text-xs text-muted-foreground truncate mb-2">{env.url}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>🔀 {env.branch}</span>
                <span>{env.lastDeploy}</span>
              </div>
              {env.version && (
                <Badge variant="secondary" className="mt-2 text-xs">{env.version}</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Deployment History</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deployments</CardTitle>
              <CardDescription>Track deployment status across all environments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {deployments.map(deploy => {
                const env = environments.find(e => e.id === deploy.envId);
                return (
                  <div key={deploy.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-content-center text-sm ${
                        deploy.status === 'success' ? 'bg-green-500/20 text-green-500' :
                        deploy.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                        deploy.status === 'in_progress' ? 'bg-blue-500/20 text-blue-500' : 'bg-gray-500/20'
                      }`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {deploy.status === 'success' ? '✓' : deploy.status === 'failed' ? '✗' : deploy.status === 'in_progress' ? '⟳' : '○'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{env?.name}</p>
                          <Badge variant="secondary" className="text-xs">{deploy.branch}</Badge>
                          <code className="text-xs text-muted-foreground">{deploy.commit}</code>
                        </div>
                        <p className="text-sm text-muted-foreground">{deploy.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">by {deploy.author}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p>{deploy.timestamp}</p>
                      {deploy.duration && <p className="text-muted-foreground">{deploy.duration}</p>}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Deployment Logs</CardTitle>
                  <CardDescription>Live output from the latest deployment</CardDescription>
                </div>
                <Badge variant="secondary">PR #342 Preview</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-[#1a1a1a] rounded-lg p-4 font-mono text-sm text-gray-300 max-h-80 overflow-y-auto">
                <p><span className="text-gray-500">[12:45:32]</span> <span className="text-blue-400">→</span> Starting deployment...</p>
                <p><span className="text-gray-500">[12:45:33]</span> <span className="text-green-400">✓</span> Cloning repository...</p>
                <p><span className="text-gray-500">[12:45:35]</span> <span className="text-green-400">✓</span> Installing dependencies...</p>
                <p><span className="text-gray-500">[12:45:48]</span> <span className="text-green-400">✓</span> Running build...</p>
                <p><span className="text-gray-500">[12:46:15]</span> <span className="text-green-400">✓</span> Build completed (27s)</p>
                <p><span className="text-gray-500">[12:46:16]</span> <span className="text-blue-400">→</span> Deploying to preview environment...</p>
                <p><span className="text-gray-500">[12:46:18]</span> <span className="text-gray-500">  </span> Uploading assets (142 files)...</p>
                <p><span className="text-gray-500">[12:46:25]</span> <span className="text-blue-400">→</span> Configuring edge network...</p>
                <p className="animate-pulse"><span className="text-gray-500">[12:46:30]</span> <span className="text-blue-400">⟳</span> Waiting for health check...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Settings</CardTitle>
              <CardDescription>Configure deployment behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'autoDeploy', label: 'Auto Deploy', desc: 'Automatically deploy on push to main', enabled: true },
                { key: 'previewPRs', label: 'Preview PRs', desc: 'Create preview deployments for pull requests', enabled: true },
                { key: 'rollback', label: 'Auto Rollback', desc: 'Automatically rollback on health check failure', enabled: false },
                { key: 'notifications', label: 'Slack Notifications', desc: 'Send deployment status to Slack', enabled: true },
              ].map(setting => (
                <div key={setting.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.desc}</p>
                  </div>
                  <button className={`w-12 h-6 rounded-full transition-colors ${setting.enabled ? 'bg-primary' : 'bg-muted'}`}>
                    <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${setting.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
