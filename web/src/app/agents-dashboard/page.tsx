'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Agent {
  id: string;
  name: string;
  type: 'code' | 'review' | 'test' | 'docs' | 'refactor' | 'security';
  status: 'idle' | 'running' | 'completed' | 'failed' | 'blocked';
  currentTask?: string;
  progress?: number;
  startedAt?: string;
  completedAt?: string;
  stats: {
    tasksCompleted: number;
    avgDuration: string;
    successRate: number;
  };
}

interface AgentTask {
  id: string;
  agentId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  duration?: string;
  timestamp: string;
}

const mockAgents: Agent[] = [
  { 
    id: 'code-gen', 
    name: 'Code Generator', 
    type: 'code', 
    status: 'running',
    currentTask: 'Implementing user authentication flow',
    progress: 65,
    startedAt: '5 mins ago',
    stats: { tasksCompleted: 156, avgDuration: '2m 30s', successRate: 98.2 }
  },
  { 
    id: 'reviewer', 
    name: 'Code Reviewer', 
    type: 'review', 
    status: 'idle',
    stats: { tasksCompleted: 342, avgDuration: '45s', successRate: 99.5 }
  },
  { 
    id: 'test-gen', 
    name: 'Test Generator', 
    type: 'test', 
    status: 'completed',
    currentTask: 'Generated 12 unit tests for auth module',
    completedAt: '2 mins ago',
    stats: { tasksCompleted: 89, avgDuration: '1m 15s', successRate: 96.8 }
  },
  { 
    id: 'docs-gen', 
    name: 'Documentation Writer', 
    type: 'docs', 
    status: 'blocked',
    currentTask: 'Waiting for code review approval',
    stats: { tasksCompleted: 67, avgDuration: '3m 20s', successRate: 99.1 }
  },
  { 
    id: 'refactor', 
    name: 'Refactor Agent', 
    type: 'refactor', 
    status: 'idle',
    stats: { tasksCompleted: 45, avgDuration: '5m 10s', successRate: 94.5 }
  },
  { 
    id: 'security', 
    name: 'Security Scanner', 
    type: 'security', 
    status: 'running',
    currentTask: 'Scanning dependencies for vulnerabilities',
    progress: 80,
    startedAt: '1 min ago',
    stats: { tasksCompleted: 234, avgDuration: '1m 45s', successRate: 100 }
  },
];

const mockTasks: AgentTask[] = [
  { id: '1', agentId: 'code-gen', name: 'Implement login form', status: 'completed', duration: '2m 15s', timestamp: '10 mins ago' },
  { id: '2', agentId: 'reviewer', name: 'Review PR #342', status: 'completed', duration: '35s', timestamp: '15 mins ago' },
  { id: '3', agentId: 'test-gen', name: 'Generate auth tests', status: 'completed', output: '12 tests created', duration: '1m 30s', timestamp: '20 mins ago' },
  { id: '4', agentId: 'security', name: 'Scan npm packages', status: 'running', timestamp: '1 min ago' },
  { id: '5', agentId: 'code-gen', name: 'Add password reset', status: 'running', timestamp: '5 mins ago' },
];

const agentTypeIcons: Record<string, string> = {
  code: '💻',
  review: '🔍',
  test: '🧪',
  docs: '📝',
  refactor: '🔄',
  security: '🔒',
};

const statusColors: Record<string, string> = {
  idle: 'bg-gray-400',
  running: 'bg-green-500 animate-pulse',
  completed: 'bg-blue-500',
  failed: 'bg-red-500',
  blocked: 'bg-amber-500',
};

export default function AgentsDashboardPage() {
  const [agents] = useState(mockAgents);
  const [tasks] = useState(mockTasks);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const runningAgents = agents.filter(a => a.status === 'running').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.stats.tasksCompleted, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            AI Agents
          </h1>
          <p className="text-muted-foreground">Monitor and control your AI agent fleet</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          + New Agent Task
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Agents</CardDescription>
            <CardTitle className="text-3xl text-green-500">{runningAgents}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">of {agents.length} total</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tasks Completed</CardDescription>
            <CardTitle className="text-3xl">{totalTasks.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-green-500">+23 today</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Success Rate</CardDescription>
            <CardTitle className="text-3xl text-blue-500">97.8%</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">across all agents</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Blocked</CardDescription>
            <CardTitle className="text-3xl text-amber-500">{agents.filter(a => a.status === 'blocked').length}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">need attention</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Agent List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold">Agent Fleet</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {agents.map(agent => (
              <Card 
                key={agent.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${selectedAgent?.id === agent.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedAgent(agent)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{agentTypeIcons[agent.type]}</span>
                      <h3 className="font-medium">{agent.name}</h3>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${statusColors[agent.status]}`} />
                  </div>
                  
                  {agent.currentTask && (
                    <p className="text-sm text-muted-foreground truncate mb-2">{agent.currentTask}</p>
                  )}
                  
                  {agent.progress !== undefined && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${agent.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{agent.progress}% complete</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>{agent.stats.tasksCompleted} tasks</span>
                    <span>{agent.stats.successRate}% success</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              {tasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-2 rounded bg-muted/30">
                  <span className="text-lg">{agentTypeIcons[agents.find(a => a.id === task.agentId)?.type || 'code']}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={task.status === 'completed' ? 'default' : task.status === 'running' ? 'secondary' : 'destructive'} className="text-[10px]">
                        {task.status}
                      </Badge>
                      {task.duration && <span>{task.duration}</span>}
                      <span>{task.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{agentTypeIcons[selectedAgent.type]}</span>
                <div>
                  <CardTitle>{selectedAgent.name}</CardTitle>
                  <CardDescription className="capitalize">{selectedAgent.status}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedAgent.status === 'running' && (
                  <Button variant="outline">⏸️ Pause</Button>
                )}
                {selectedAgent.status === 'idle' && (
                  <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">▶️ Start Task</Button>
                )}
                {selectedAgent.status === 'blocked' && (
                  <Button variant="outline">🔓 Unblock</Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold">{selectedAgent.stats.tasksCompleted}</p>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold">{selectedAgent.stats.avgDuration}</p>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-green-500">{selectedAgent.stats.successRate}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold capitalize">{selectedAgent.status}</p>
                <p className="text-sm text-muted-foreground">Current Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
