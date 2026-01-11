'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  agents: string[];
  status: 'active' | 'inactive' | 'error';
  lastRun?: string;
  runs: number;
}

interface WorkflowStep {
  id: string;
  name: string;
  agent: string;
  tool: string;
  config: Record<string, string>;
}

const mockWorkflows: Workflow[] = [
  { id: 'wf-1', name: 'Project Kickoff', description: 'Initialize a new project with epics and stories', trigger: 'Manual', agents: ['PM', 'SM'], status: 'active', lastRun: '2 hours ago', runs: 15 },
  { id: 'wf-2', name: 'PR Review Automation', description: 'Auto-generate tests and run coverage on new PRs', trigger: 'GitHub PR', agents: ['Dev', 'QA'], status: 'active', lastRun: '30 mins ago', runs: 142 },
  { id: 'wf-3', name: 'Sprint Planning', description: 'Decompose epics into stories and estimate', trigger: 'Scheduled', agents: ['SM', 'Dev'], status: 'active', lastRun: 'Yesterday', runs: 8 },
  { id: 'wf-4', name: 'Bug Triage', description: 'Analyze bug reports and suggest fixes', trigger: 'GitHub Issue', agents: ['QA', 'Dev'], status: 'inactive', runs: 0 },
];

const mockSteps: WorkflowStep[] = [
  { id: '1', name: 'Gather Requirements', agent: 'PM', tool: 'gather_requirements', config: { context: 'project' } },
  { id: '2', name: 'Create Epic', agent: 'PM', tool: 'create_epic', config: { labels: 'epic,planning' } },
  { id: '3', name: 'Decompose Stories', agent: 'SM', tool: 'decompose_story', config: { maxTasks: '5' } },
  { id: '4', name: 'Generate Code', agent: 'Dev', tool: 'generate_code', config: { language: 'typescript' } },
  { id: '5', name: 'Generate Tests', agent: 'QA', tool: 'generate_tests', config: { coverage: '80' } },
];

const triggerIcons: Record<string, string> = {
  'Manual': '👆',
  'GitHub PR': '🔀',
  'GitHub Issue': '🐛',
  'Scheduled': '⏰',
};

const agentColors: Record<string, string> = {
  'PM': 'bg-blue-500/10 text-blue-500',
  'SM': 'bg-green-500/10 text-green-500',
  'Dev': 'bg-purple-500/10 text-purple-500',
  'QA': 'bg-amber-500/10 text-amber-500',
};

export default function WorkflowAutomationPage() {
  const [workflows] = useState(mockWorkflows);
  const [steps] = useState(mockSteps);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Workflow Automation
          </h1>
          <p className="text-muted-foreground">Automate multi-agent workflows for common tasks</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          + New Workflow
        </Button>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="history">Run History</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows">
          <div className="grid gap-4 md:grid-cols-2">
            {workflows.map(wf => (
              <Card key={wf.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedWorkflow?.id === wf.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedWorkflow(wf)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{wf.name}</CardTitle>
                    <Badge variant={wf.status === 'active' ? 'default' : wf.status === 'inactive' ? 'secondary' : 'destructive'}>
                      {wf.status}
                    </Badge>
                  </div>
                  <CardDescription>{wf.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{triggerIcons[wf.trigger]}</span>
                      <span className="text-sm text-muted-foreground">{wf.trigger}</span>
                    </div>
                    <div className="flex gap-1">
                      {wf.agents.map(a => (
                        <Badge key={a} variant="secondary" className={agentColors[a]}>{a}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                    <span>{wf.runs} runs</span>
                    {wf.lastRun && <span>Last: {wf.lastRun}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="builder">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Builder</CardTitle>
              <CardDescription>Design multi-agent automation pipelines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={step.id} className="relative">
                    {i > 0 && <div className="absolute left-6 -top-4 h-4 w-0.5 bg-muted" />}
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{step.name}</span>
                          <Badge variant="secondary" className={agentColors[step.agent]}>{step.agent}</Badge>
                        </div>
                        <code className="text-sm text-muted-foreground">{step.tool}</code>
                      </div>
                      <Button variant="ghost" size="sm">⚙️</Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">+ Add Step</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Run History</CardTitle>
              <CardDescription>Past workflow executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">PR Review Automation</p>
                      <p className="text-sm text-muted-foreground">PR #12{i} - feat: add auth</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="default">success</Badge>
                      <span className="text-sm text-muted-foreground">{i} hours ago</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
