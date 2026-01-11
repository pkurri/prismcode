'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ToolCall {
  id: string;
  toolName: string;
  agentName: string;
  input: string;
  output: string;
  status: 'success' | 'failure' | 'running';
  duration: number;
  timestamp: string;
}

interface AgentRun {
  id: string;
  agentName: string;
  agentRole: string;
  task: string;
  status: 'running' | 'success' | 'failure';
  startTime: string;
  endTime?: string;
  toolCalls: ToolCall[];
}

const mockToolCalls: ToolCall[] = [
  { id: '1', toolName: 'gather_requirements', agentName: 'PM Agent', input: '{"input": "User auth flow"}', output: '{"requirements": [...]}', status: 'success', duration: 450, timestamp: '15:42:01' },
  { id: '2', toolName: 'create_epic', agentName: 'PM Agent', input: '{"title": "Auth Epic"}', output: '{"issueNumber": 354}', status: 'success', duration: 320, timestamp: '15:42:03' },
  { id: '3', toolName: 'decompose_story', agentName: 'SM Agent', input: '{"storyId": "STORY-1"}', output: '{"tasks": [...]}', status: 'success', duration: 380, timestamp: '15:42:05' },
  { id: '4', toolName: 'generate_code', agentName: 'Dev Agent', input: '{"spec": "Login form"}', output: '{"code": "..."}', status: 'success', duration: 1200, timestamp: '15:42:08' },
  { id: '5', toolName: 'write_file', agentName: 'Dev Agent', input: '{"path": "src/..."}', output: '{"bytesWritten": 2048}', status: 'success', duration: 50, timestamp: '15:42:10' },
  { id: '6', toolName: 'generate_tests', agentName: 'QA Agent', input: '{"componentPath": "..."}', output: '{"testCount": 5}', status: 'running', duration: 0, timestamp: '15:42:12' },
];

const mockRuns: AgentRun[] = [
  { id: 'run-1', agentName: 'Product Manager', agentRole: 'product-manager', task: 'Create authentication epic', status: 'success', startTime: '15:41:55', endTime: '15:42:04', toolCalls: mockToolCalls.slice(0, 2) },
  { id: 'run-2', agentName: 'Scrum Master', agentRole: 'scrum-master', task: 'Decompose stories', status: 'success', startTime: '15:42:04', endTime: '15:42:06', toolCalls: mockToolCalls.slice(2, 3) },
  { id: 'run-3', agentName: 'Developer', agentRole: 'developer', task: 'Implement login form', status: 'success', startTime: '15:42:06', endTime: '15:42:11', toolCalls: mockToolCalls.slice(3, 5) },
  { id: 'run-4', agentName: 'QA Agent', agentRole: 'qa', task: 'Generate tests', status: 'running', startTime: '15:42:11', toolCalls: mockToolCalls.slice(5) },
];

const statusColors: Record<string, string> = {
  success: 'bg-green-500',
  failure: 'bg-red-500',
  running: 'bg-blue-500 animate-pulse',
};

const roleIcons: Record<string, string> = {
  'product-manager': '📋',
  'scrum-master': '🏃',
  'developer': '💻',
  'qa': '🧪',
};

export default function AgentVisualizationPage() {
  const [runs] = useState(mockRuns);
  const [toolCalls] = useState(mockToolCalls);
  const [selectedRun, setSelectedRun] = useState<AgentRun | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Agent Run Visualization
          </h1>
          <p className="text-muted-foreground">Monitor agent runs and MCP tool calls in real-time</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-blue-500 border-blue-500/30">
            🔄 {runs.filter(r => r.status === 'running').length} running
          </Badge>
          <Button variant="outline">Clear History</Button>
        </div>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tool-calls">Tool Calls</TabsTrigger>
          <TabsTrigger value="agents">Agent Runs</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Execution Timeline</CardTitle>
              <CardDescription>Visual timeline of agent runs and tool calls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
                <div className="space-y-4 pl-8">
                  {toolCalls.map((call, i) => (
                    <div key={call.id} className="relative">
                      <div className={`absolute -left-6 w-3 h-3 rounded-full ${statusColors[call.status]} ring-4 ring-background`} />
                      <div className="p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{call.agentName}</Badge>
                            <code className="text-sm font-mono">{call.toolName}</code>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{call.duration}ms</span>
                            <span className="text-xs text-muted-foreground">{call.timestamp}</span>
                          </div>
                        </div>
                        <div className="grid gap-2 md:grid-cols-2 text-xs">
                          <div>
                            <p className="text-muted-foreground mb-1">Input</p>
                            <pre className="p-2 rounded bg-background/50 overflow-x-auto">{call.input}</pre>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Output</p>
                            <pre className="p-2 rounded bg-background/50 overflow-x-auto">{call.output}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tool-calls">
          <Card>
            <CardHeader>
              <CardTitle>MCP Tool Calls</CardTitle>
              <CardDescription>All tool invocations with inputs and outputs</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4">Tool</th>
                    <th className="text-left p-4">Agent</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Duration</th>
                    <th className="text-left p-4">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {toolCalls.map(call => (
                    <tr key={call.id} className="border-b">
                      <td className="p-4 font-mono text-sm">{call.toolName}</td>
                      <td className="p-4">{call.agentName}</td>
                      <td className="p-4">
                        <Badge variant={call.status === 'success' ? 'default' : call.status === 'running' ? 'secondary' : 'destructive'}>
                          {call.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">{call.duration ? `${call.duration}ms` : '...'}</td>
                      <td className="p-4 text-muted-foreground">{call.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <div className="grid gap-4 md:grid-cols-2">
            {runs.map(run => (
              <Card key={run.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedRun?.id === run.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedRun(run)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{roleIcons[run.agentRole]}</span>
                      <CardTitle className="text-base">{run.agentName}</CardTitle>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${statusColors[run.status]}`} />
                  </div>
                  <CardDescription>{run.task}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{run.toolCalls.length} tool calls</span>
                    <span className="text-muted-foreground">{run.startTime} - {run.endTime || 'running'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
