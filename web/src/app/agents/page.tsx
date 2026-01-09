'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const activeAgents = [
  {
    id: '1',
    name: 'RefactorBot',
    type: 'refactor',
    status: 'busy',
    task: 'Migrating utils.ts to TS',
    progress: 45,
    load: 80,
  },
  {
    id: '2',
    name: 'TestGen-1',
    type: 'testing',
    status: 'idle',
    task: 'Waiting for tasks',
    progress: 0,
    load: 10,
  },
  {
    id: '3',
    name: 'SecurityScanner',
    type: 'security',
    status: 'running',
    task: 'Scanning dependencies',
    progress: 78,
    load: 60,
  },
  {
    id: '4',
    name: 'DocsUpdater',
    type: 'docs',
    status: 'idle',
    task: 'Waiting for tasks',
    progress: 0,
    load: 5,
  },
];

const metrics = [
  { label: 'Total Agents', value: '4', change: '+1' },
  { label: 'Task Queue', value: '14', change: '-3' },
  { label: 'Avg Completion', value: '4m 12s', change: '-30s' },
  { label: 'Efficiency', value: '92%', change: '+5%' },
];

const statusColors: Record<string, string> = {
  busy: 'bg-blue-500',
  idle: 'bg-gray-400',
  running: 'bg-green-500',
  error: 'bg-red-500',
};

export default function AgentsPage() {
  const [agents, setAgents] = useState(activeAgents);

  const spawnAgent = () => {
    // Simulate spawn
    const newAgent = {
      id: Date.now().toString(),
      name: `Agent-${Math.floor(Math.random() * 100)}`,
      type: 'general',
      status: 'initializing',
      task: 'Booting...',
      progress: 0,
      load: 0,
    };
    setAgents([...agents, newAgent]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Agent Orchestration
          </h1>
          <p className="text-muted-foreground mt-1">Manage and monitor autonomous agent pool</p>
        </div>
        <Button
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
          onClick={spawnAgent}
        >
          + Spawn Agent
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{m.value}</p>
                <span
                  className={`text-xs ${m.change.startsWith('+') ? 'text-green-500' : 'text-blue-500'}`}
                >
                  {m.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-2`}>
              <Badge
                variant={agent.status === 'idle' ? 'secondary' : 'default'}
                className={statusColors[agent.status] || 'bg-primary'}
              >
                {agent.status}
              </Badge>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs">
                  AI
                </div>
                {agent.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{agent.type}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Load</span>
                  <span className="font-medium">{agent.load}%</span>
                </div>
                <Progress value={agent.load} className="h-1" />
              </div>

              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                <p className="text-muted-foreground mb-1">Current Task</p>
                <p className="font-medium truncate">{agent.task}</p>
                {agent.progress > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={agent.progress} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground">{agent.progress}%</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm">
                  Logs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Term
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
