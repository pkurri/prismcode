'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const deployments = [
  {
    id: 'dpl_1',
    name: 'Production',
    status: 'ready',
    url: 'https://prismcode.app',
    branch: 'main',
    commit: '8a794f3',
    time: '2 hours ago',
  },
  {
    id: 'dpl_2',
    name: 'Preview',
    status: 'ready',
    url: 'https://preview.prismcode.app',
    branch: 'feature/auth',
    commit: 'abc1234',
    time: '30 mins ago',
  },
  {
    id: 'dpl_3',
    name: 'Development',
    status: 'building',
    url: '',
    branch: 'main',
    commit: 'def5678',
    time: 'Just now',
  },
];

const environments = [
  {
    id: 'production',
    name: 'Production',
    url: 'prismcode.app',
    protected: true,
    lastDeploy: '2 hours ago',
  },
  {
    id: 'preview',
    name: 'Preview',
    url: 'preview.prismcode.app',
    protected: false,
    lastDeploy: '30 mins ago',
  },
  {
    id: 'development',
    name: 'Development',
    url: 'dev.prismcode.app',
    protected: false,
    lastDeploy: 'Just now',
  },
];

const statusColors: Record<string, string> = {
  ready: 'bg-green-500',
  building: 'bg-yellow-500 animate-pulse',
  error: 'bg-red-500',
  queued: 'bg-blue-500',
};

export default function DeployPage() {
  const [activeTab, setActiveTab] = useState('deployments');
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = (env: string) => {
    setDeploying(true);
    setTimeout(() => setDeploying(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Deploy
          </h1>
          <p className="text-muted-foreground mt-1">
            One-click deployment to Vercel, Netlify, and more
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
          onClick={() => handleDeploy('preview')}
          disabled={deploying}
        >
          {deploying ? 'Deploying...' : '🚀 Deploy to Preview'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'deployments' && (
        <div className="space-y-4">
          {deployments.map((d) => (
            <Card key={d.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`h-3 w-3 rounded-full ${statusColors[d.status]}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{d.name}</span>
                      <Badge variant="outline">{d.branch}</Badge>
                      <code className="text-xs text-muted-foreground">{d.commit}</code>
                    </div>
                    {d.url && (
                      <a
                        href={d.url}
                        target="_blank"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        {d.url}
                      </a>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{d.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={d.status === 'ready' ? 'default' : 'secondary'}>{d.status}</Badge>
                  {d.status === 'ready' && (
                    <>
                      <Button variant="outline" size="sm">
                        Redeploy
                      </Button>
                      <Button variant="outline" size="sm">
                        Rollback
                      </Button>
                    </>
                  )}
                  {d.status === 'building' && (
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'environments' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {environments.map((e) => (
            <Card key={e.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{e.name}</CardTitle>
                  {e.protected && <Badge variant="secondary">🔒 Protected</Badge>}
                </div>
                <CardDescription>{e.url}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Last deploy: {e.lastDeploy}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeploy(e.id)}
                    disabled={deploying}
                  >
                    Deploy
                  </Button>
                  <Button size="sm" variant="outline">
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deployment Providers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Vercel', status: 'connected', icon: '▲' },
              { name: 'Netlify', status: 'not connected', icon: '◆' },
              { name: 'Railway', status: 'not connected', icon: '🚂' },
              { name: 'AWS Amplify', status: 'not connected', icon: '☁️' },
            ].map((p) => (
              <div key={p.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{p.icon}</span>
                  <span className="font-medium">{p.name}</span>
                </div>
                {p.status === 'connected' ? (
                  <Badge variant="default">Connected</Badge>
                ) : (
                  <Button size="sm" variant="outline">
                    Connect
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
