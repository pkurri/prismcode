'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const environments = [
  { id: 'local', name: 'Local Dev', status: 'running', url: 'localhost:3000', lastDeploy: 'Now' },
  {
    id: 'dev',
    name: 'Cloud Dev',
    status: 'running',
    url: 'dev.prismcode.app',
    lastDeploy: '5m ago',
  },
  {
    id: 'staging',
    name: 'Staging',
    status: 'running',
    url: 'staging.prismcode.app',
    lastDeploy: '2h ago',
  },
  { id: 'prod', name: 'Production', status: 'idle', url: 'prismcode.app', lastDeploy: '1d ago' },
];

const consoleLogs = [
  { time: '15:24:01', type: 'info', msg: 'App compiled successfully' },
  { time: '15:24:02', type: 'log', msg: 'Ready on localhost:3000' },
  { time: '15:24:05', type: 'warn', msg: 'React Hook useEffect has missing dependencies' },
  { time: '15:24:08', type: 'log', msg: 'API connected: /api/health' },
  { time: '15:24:12', type: 'error', msg: 'Failed to load resource: 404' },
];

const viewports = [
  { id: 'desktop', name: 'Desktop', width: '100%', icon: '🖥️' },
  { id: 'tablet', name: 'Tablet', width: '768px', icon: '📱' },
  { id: 'mobile', name: 'Mobile', width: '375px', icon: '📱' },
];

export default function SandboxPage() {
  const [selectedEnv, setSelectedEnv] = useState(environments[0]);
  const [viewport, setViewport] = useState('desktop');
  const [showConsole, setShowConsole] = useState(true);

  const statusColors: Record<string, string> = {
    running: 'bg-green-500',
    building: 'bg-yellow-500 animate-pulse',
    failed: 'bg-red-500',
    idle: 'bg-gray-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Preview Sandbox
          </h1>
          <p className="text-muted-foreground mt-1">
            Live preview your application in different environments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowConsole(!showConsole)}>
            {showConsole ? 'Hide' : 'Show'} Console
          </Button>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            Open in New Tab
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Environment Selector */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Environments</CardTitle>
            <CardDescription>Select preview target</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {environments.map((env) => (
              <button
                key={env.id}
                onClick={() => setSelectedEnv(env)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${selectedEnv.id === env.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${statusColors[env.status]}`} />
                    <span className="font-medium text-sm">{env.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {env.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{env.url}</p>
                <p className="text-xs text-muted-foreground">Last: {env.lastDeploy}</p>
              </button>
            ))}
            <Separator className="my-3" />
            <Button variant="outline" size="sm" className="w-full">
              + New Environment
            </Button>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Viewport Controls */}
          <Card>
            <CardContent className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tabs value={viewport} onValueChange={setViewport}>
                  <TabsList className="h-8">
                    {viewports.map((v) => (
                      <TabsTrigger key={v.id} value={v.id} className="text-xs gap-1">
                        <span>{v.icon}</span> {v.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  ↻ Refresh
                </Button>
                <Badge variant="secondary" className="text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5" />
                  {selectedEnv.url}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Preview Frame */}
          <Card className="overflow-hidden">
            <div
              className="bg-white dark:bg-zinc-900 mx-auto transition-all duration-300 border-x border-border"
              style={{ width: viewports.find((v) => v.id === viewport)?.width || '100%' }}
            >
              <div className="h-[500px] flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/60">
                <div className="text-center">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                    P
                  </div>
                  <p className="text-lg font-semibold">PrismCode Preview</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEnv.name} - {selectedEnv.url}
                  </p>
                  <Badge className="mt-3" variant="outline">
                    <span
                      className={`h-2 w-2 rounded-full mr-2 ${statusColors[selectedEnv.status]}`}
                    />
                    {selectedEnv.status === 'running' ? 'Live' : selectedEnv.status}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Console Panel */}
          {showConsole && (
            <Card>
              <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Console</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    3 logs
                  </Badge>
                  <Badge variant="secondary" className="text-xs text-yellow-600">
                    1 warn
                  </Badge>
                  <Badge variant="secondary" className="text-xs text-red-600">
                    1 error
                  </Badge>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                <div className="bg-zinc-950 text-zinc-100 font-mono text-xs p-3 max-h-[150px] overflow-y-auto">
                  {consoleLogs.map((log, i) => (
                    <div
                      key={i}
                      className={`py-0.5 ${log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-zinc-400'}`}
                    >
                      <span className="text-zinc-600">{log.time}</span> [{log.type}] {log.msg}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
