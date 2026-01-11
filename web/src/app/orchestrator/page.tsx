'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Agent {
  id: string;
  role: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  capabilities: string[];
  toolCount: number;
}

interface AgentRun {
  id: string;
  agentName: string;
  task: string;
  status: 'success' | 'failure' | 'running';
  duration: number;
  timestamp: string;
  toolCalls: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  agents: string[];
  runs: number;
  lastActivity: string;
}

const mockAgents: Agent[] = [
  { id: 'pm-001', role: 'product-manager', name: 'Product Manager Agent', description: 'Requirements, epics, user stories', status: 'idle', capabilities: ['Requirements', 'Epics', 'Stories'], toolCount: 3 },
  { id: 'sm-001', role: 'scrum-master', name: 'Scrum Master Agent', description: 'Sprint planning, progress tracking', status: 'idle', capabilities: ['Sprints', 'Tasks', 'Burndown'], toolCount: 3 },
  { id: 'dev-001', role: 'developer', name: 'Developer Agent', description: 'Code generation, file operations', status: 'running', capabilities: ['Code Gen', 'Refactor', 'Files'], toolCount: 4 },
  { id: 'qa-001', role: 'qa', name: 'QA Agent', description: 'Test generation, coverage analysis', status: 'completed', capabilities: ['Tests', 'Coverage', 'Bugs'], toolCount: 4 },
];

const mockRuns: AgentRun[] = [
  { id: 'run-1', agentName: 'Developer Agent', task: 'Generate agent type definitions', status: 'success', duration: 2500, timestamp: '5 mins ago', toolCalls: 4 },
  { id: 'run-2', agentName: 'QA Agent', task: 'Run test coverage analysis', status: 'success', duration: 15000, timestamp: '10 mins ago', toolCalls: 3 },
  { id: 'run-3', agentName: 'Product Manager Agent', task: 'Create epic for orchestrator', status: 'success', duration: 1200, timestamp: '15 mins ago', toolCalls: 2 },
  { id: 'run-4', agentName: 'Developer Agent', task: 'Implement orchestrator core', status: 'running', duration: 0, timestamp: 'Just now', toolCalls: 1 },
];

const mockProjects: Project[] = [
  { id: 'proj-1', name: 'PrismCode Platform', description: 'Multi-agent orchestration platform', agents: ['PM', 'SM', 'Dev', 'QA'], runs: 42, lastActivity: '5 mins ago' },
  { id: 'proj-2', name: 'GitHub Integration', description: 'Issue and PR automation', agents: ['PM', 'Dev'], runs: 12, lastActivity: '1 hour ago' },
];

const statusColors: Record<string, string> = {
  idle: 'bg-gray-500',
  running: 'bg-blue-500 animate-pulse',
  completed: 'bg-green-500',
  error: 'bg-red-500',
  success: 'bg-green-500',
  failure: 'bg-red-500',
};

const roleIcons: Record<string, string> = {
  'product-manager': '📋',
  'scrum-master': '🏃',
  'developer': '💻',
  'qa': '🧪',
};

export default function OrchestratorPage() {
  const [agents] = useState(mockAgents);
  const [runs] = useState(mockRuns);
  const [projects] = useState(mockProjects);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [taskInput, setTaskInput] = useState('');

  const executeTask = () => {
    if (!selectedAgent || !taskInput) return;
    console.log(`Executing task on ${selectedAgent.name}: ${taskInput}`);
    setTaskInput('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Agent Orchestrator
          </h1>
          <p className="text-muted-foreground">Multi-agent project orchestration platform</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-500 border-green-500/30">
            {agents.filter(a => a.status === 'running').length} agents running
          </Badge>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            + New Project
          </Button>
        </div>
      </div>

      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="runs">Recent Runs</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="execute">Execute Task</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {agents.map(agent => (
              <Card key={agent.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedAgent?.id === agent.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedAgent(agent)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{roleIcons[agent.role]}</span>
                    <span className={`w-3 h-3 rounded-full ${statusColors[agent.status]}`} />
                  </div>
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <CardDescription>{agent.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {agent.capabilities.map(cap => (
                      <Badge key={cap} variant="secondary" className="text-xs">{cap}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{agent.toolCount} MCP tools</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="runs">
          <Card>
            <CardHeader>
              <CardTitle>Recent Agent Runs</CardTitle>
              <CardDescription>Task execution history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {runs.map(run => (
                <div key={run.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-4">
                    <span className={`w-3 h-3 rounded-full ${statusColors[run.status]}`} />
                    <div>
                      <p className="font-medium">{run.task}</p>
                      <p className="text-sm text-muted-foreground">{run.agentName} • {run.toolCalls} tool calls</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{run.duration ? `${(run.duration / 1000).toFixed(1)}s` : '...'}</span>
                    <Badge variant={run.status === 'success' ? 'default' : run.status === 'running' ? 'secondary' : 'destructive'}>
                      {run.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{run.timestamp}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map(project => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle>{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {project.agents.map(a => (
                        <Badge key={a} variant="outline">{a}</Badge>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {project.runs} runs • {project.lastActivity}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="execute">
          <Card>
            <CardHeader>
              <CardTitle>Execute Agent Task</CardTitle>
              <CardDescription>Select an agent and describe your task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 md:grid-cols-4">
                {agents.map(agent => (
                  <Button
                    key={agent.id}
                    variant={selectedAgent?.id === agent.id ? 'default' : 'outline'}
                    onClick={() => setSelectedAgent(agent)}
                    className="h-auto py-4 flex-col"
                  >
                    <span className="text-2xl mb-1">{roleIcons[agent.role]}</span>
                    <span className="text-xs">{agent.name.replace(' Agent', '')}</span>
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  placeholder="Describe the task for the agent..."
                  className="flex-1 px-4 py-3 rounded-lg border border-border bg-background"
                />
                <Button onClick={executeTask} disabled={!selectedAgent || !taskInput} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                  🚀 Execute
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
