'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const nodeTypes = [
  {
    id: 'trigger-github',
    type: 'trigger',
    name: 'GitHub Event',
    icon: '🐙',
    desc: 'PR opened, pushed, merged',
  },
  {
    id: 'trigger-schedule',
    type: 'trigger',
    name: 'Schedule',
    icon: '⏰',
    desc: 'Cron-based triggers',
  },
  {
    id: 'trigger-webhook',
    type: 'trigger',
    name: 'Webhook',
    icon: '🔗',
    desc: 'HTTP webhook listener',
  },
  {
    id: 'action-ai',
    type: 'action',
    name: 'AI Analysis',
    icon: '🧠',
    desc: 'Run AI code analysis',
  },
  { id: 'action-test', type: 'action', name: 'Run Tests', icon: '🧪', desc: 'Execute test suite' },
  {
    id: 'action-deploy',
    type: 'action',
    name: 'Deploy',
    icon: '🚀',
    desc: 'Deploy to environment',
  },
  { id: 'action-notify', type: 'action', name: 'Notify', icon: '💬', desc: 'Send notification' },
  {
    id: 'condition-branch',
    type: 'condition',
    name: 'Branch',
    icon: '🔀',
    desc: 'Conditional branching',
  },
  {
    id: 'condition-approve',
    type: 'condition',
    name: 'Approval',
    icon: '✅',
    desc: 'Wait for approval',
  },
];

const workflows = [
  {
    id: 1,
    name: 'PR Review Automation',
    status: 'active',
    runs: 156,
    lastRun: '2 mins ago',
    nodes: 5,
  },
  {
    id: 2,
    name: 'Deploy to Staging',
    status: 'active',
    runs: 89,
    lastRun: '15 mins ago',
    nodes: 4,
  },
  {
    id: 3,
    name: 'Security Scan Weekly',
    status: 'paused',
    runs: 12,
    lastRun: '2 days ago',
    nodes: 3,
  },
];

const runHistory = [
  {
    id: 1,
    workflow: 'PR Review Automation',
    status: 'success',
    duration: '45s',
    time: '2 mins ago',
  },
  {
    id: 2,
    workflow: 'Deploy to Staging',
    status: 'success',
    duration: '2m 30s',
    time: '15 mins ago',
  },
  {
    id: 3,
    workflow: 'PR Review Automation',
    status: 'failed',
    duration: '12s',
    time: '1 hour ago',
  },
  {
    id: 4,
    workflow: 'Security Scan Weekly',
    status: 'success',
    duration: '5m 12s',
    time: '2 days ago',
  },
];

const canvasNodes = [
  { id: 1, type: 'trigger', name: 'GitHub PR', x: 100, y: 150 },
  { id: 2, type: 'action', name: 'AI Review', x: 300, y: 150 },
  { id: 3, type: 'condition', name: 'Score > 80?', x: 500, y: 150 },
  { id: 4, type: 'action', name: 'Auto Approve', x: 700, y: 80 },
  { id: 5, type: 'action', name: 'Request Review', x: 700, y: 220 },
];

export default function WorkflowsPage() {
  const [selectedNode, setSelectedNode] = useState<(typeof nodeTypes)[0] | null>(null);
  const [activeTab, setActiveTab] = useState('canvas');

  const typeColors: Record<string, string> = {
    trigger: 'bg-blue-500/10 border-blue-500/30 text-blue-600',
    action: 'bg-green-500/10 border-green-500/30 text-green-600',
    condition: 'bg-purple-500/10 border-purple-500/30 text-purple-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Workflow Builder
          </h1>
          <p className="text-muted-foreground mt-1">
            Visual automation for your development processes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Import</Button>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            New Workflow
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="workflows">My Workflows</TabsTrigger>
          <TabsTrigger value="history">Run History</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'canvas' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Node Palette */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Node Palette</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['trigger', 'action', 'condition'].map((type) => (
                <div key={type}>
                  <h4 className="text-xs font-medium uppercase text-muted-foreground mb-2">
                    {type}s
                  </h4>
                  <div className="space-y-2">
                    {nodeTypes
                      .filter((n) => n.type === type)
                      .map((node) => (
                        <div
                          key={node.id}
                          draggable
                          className={`p-3 rounded-lg border cursor-grab hover:shadow-sm transition-all ${typeColors[type]} ${selectedNode?.id === node.id ? 'ring-2 ring-primary' : ''}`}
                          onClick={() => setSelectedNode(node)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{node.icon}</span>
                            <div>
                              <p className="text-sm font-medium">{node.name}</p>
                              <p className="text-xs opacity-70">{node.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Canvas Area */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Workflow Canvas</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Zoom In
                </Button>
                <Button variant="outline" size="sm">
                  Zoom Out
                </Button>
                <Button variant="outline" size="sm">
                  Auto-Layout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-[400px] bg-muted/30 rounded-lg border-2 border-dashed border-border overflow-hidden">
                {/* Grid Background */}
                <svg className="absolute inset-0 w-full h-full opacity-30">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-muted-foreground"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                {/* Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path
                    d="M 180 165 Q 240 165 260 165"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-muted-foreground"
                  />
                  <path
                    d="M 380 165 Q 440 165 460 165"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-muted-foreground"
                  />
                  <path
                    d="M 580 150 Q 640 100 660 95"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-green-500"
                  />
                  <path
                    d="M 580 180 Q 640 220 660 235"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-red-500"
                  />
                </svg>

                {/* Nodes */}
                {canvasNodes.map((node) => (
                  <div
                    key={node.id}
                    className={`absolute w-32 p-3 rounded-lg border-2 shadow-sm cursor-move transition-shadow hover:shadow-md ${typeColors[node.type]}`}
                    style={{ left: node.x, top: node.y }}
                  >
                    <p className="text-sm font-medium text-center">{node.name}</p>
                  </div>
                ))}

                {/* Drop hint */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
                  Drag nodes from the palette to build your workflow
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline">Validate</Button>
                <Button variant="outline">Test Run</Button>
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                  Save & Deploy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'workflows' && (
        <div className="grid gap-4">
          {workflows.map((wf) => (
            <Card key={wf.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${wf.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}
                  >
                    <span className="text-xl">⚡</span>
                  </div>
                  <div>
                    <p className="font-medium">{wf.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {wf.nodes} nodes · {wf.runs} runs · Last: {wf.lastRun}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={wf.status === 'active' ? 'default' : 'secondary'}>
                    {wf.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    Run
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium">Workflow</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-sm font-medium">Duration</th>
                  <th className="text-left p-4 text-sm font-medium">Time</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {runHistory.map((run) => (
                  <tr key={run.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-4">{run.workflow}</td>
                    <td className="p-4">
                      <Badge variant={run.status === 'success' ? 'default' : 'destructive'}>
                        {run.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{run.duration}</td>
                    <td className="p-4 text-muted-foreground">{run.time}</td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
