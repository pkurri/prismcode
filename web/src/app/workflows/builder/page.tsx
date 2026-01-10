'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface NodeConfig {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  name: string;
  icon: string;
  config: Record<string, unknown>;
  schema: ConfigField[];
}

interface ConfigField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'number' | 'boolean';
  required: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  helpText?: string;
}

interface RunHistory {
  id: string;
  status: 'success' | 'failed' | 'running';
  startedAt: string;
  duration: string;
  trigger: string;
  steps: StepResult[];
}

interface StepResult {
  nodeId: string;
  nodeName: string;
  status: 'success' | 'failed' | 'skipped';
  duration: string;
  output?: string;
  error?: string;
}

// Node configurations with schemas
const nodeConfigs: Record<string, { schema: ConfigField[] }> = {
  github: {
    schema: [
      { name: 'event', label: 'Event Type', type: 'select', required: true, options: [
        { value: 'pull_request', label: 'Pull Request' },
        { value: 'push', label: 'Push' },
        { value: 'issue', label: 'Issue' },
        { value: 'release', label: 'Release' },
      ]},
      { name: 'action', label: 'Action', type: 'select', required: false, options: [
        { value: 'opened', label: 'Opened' },
        { value: 'closed', label: 'Closed' },
        { value: 'merged', label: 'Merged' },
        { value: 'synchronize', label: 'Updated' },
      ]},
      { name: 'branch', label: 'Branch Filter', type: 'text', required: false, placeholder: 'main, develop, feature/*' },
    ],
  },
  slack: {
    schema: [
      { name: 'channel', label: 'Channel', type: 'text', required: true, placeholder: '#deployments' },
      { name: 'message', label: 'Message Template', type: 'textarea', required: true, placeholder: '{{workflow.name}} completed with status: {{run.status}}' },
      { name: 'mention', label: 'Mention Users', type: 'text', required: false, placeholder: '@team-leads' },
    ],
  },
  http: {
    schema: [
      { name: 'url', label: 'URL', type: 'text', required: true, placeholder: 'https://api.example.com/webhook' },
      { name: 'method', label: 'Method', type: 'select', required: true, options: [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'DELETE', label: 'DELETE' },
      ]},
      { name: 'headers', label: 'Headers (JSON)', type: 'textarea', required: false, placeholder: '{"Authorization": "Bearer {{secrets.API_KEY}}"}' },
      { name: 'body', label: 'Body Template', type: 'textarea', required: false, placeholder: '{"status": "{{run.status}}"}' },
    ],
  },
  ai: {
    schema: [
      { name: 'model', label: 'AI Model', type: 'select', required: true, options: [
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
        { value: 'claude-3-sonnet', label: 'Claude 3.5 Sonnet' },
        { value: 'gemini-pro', label: 'Gemini 1.5 Pro' },
      ]},
      { name: 'task', label: 'Task Type', type: 'select', required: true, options: [
        { value: 'code-review', label: 'Code Review' },
        { value: 'generate-tests', label: 'Generate Tests' },
        { value: 'documentation', label: 'Documentation' },
        { value: 'refactor', label: 'Refactor Suggestions' },
      ]},
      { name: 'prompt', label: 'Custom Prompt', type: 'textarea', required: false, placeholder: 'Additional instructions for the AI...' },
    ],
  },
};

// Mock run history
const mockRunHistory: RunHistory[] = [
  {
    id: 'run-001',
    status: 'success',
    startedAt: '2 mins ago',
    duration: '45s',
    trigger: 'PR #342 opened',
    steps: [
      { nodeId: '1', nodeName: 'GitHub PR', status: 'success', duration: '1s' },
      { nodeId: '2', nodeName: 'AI Review', status: 'success', duration: '38s', output: 'Score: 85/100' },
      { nodeId: '3', nodeName: 'Score > 80?', status: 'success', duration: '0s' },
      { nodeId: '4', nodeName: 'Auto Approve', status: 'success', duration: '6s' },
    ],
  },
  {
    id: 'run-002',
    status: 'failed',
    startedAt: '15 mins ago',
    duration: '12s',
    trigger: 'PR #341 opened',
    steps: [
      { nodeId: '1', nodeName: 'GitHub PR', status: 'success', duration: '1s' },
      { nodeId: '2', nodeName: 'AI Review', status: 'failed', duration: '11s', error: 'API rate limit exceeded' },
    ],
  },
  {
    id: 'run-003',
    status: 'success',
    startedAt: '1 hour ago',
    duration: '52s',
    trigger: 'PR #340 opened',
    steps: [
      { nodeId: '1', nodeName: 'GitHub PR', status: 'success', duration: '1s' },
      { nodeId: '2', nodeName: 'AI Review', status: 'success', duration: '42s', output: 'Score: 72/100' },
      { nodeId: '3', nodeName: 'Score > 80?', status: 'success', duration: '0s' },
      { nodeId: '5', nodeName: 'Request Review', status: 'success', duration: '9s' },
    ],
  },
];

// Selected node for demo
const selectedNodeDemo: NodeConfig = {
  id: 'ai-review',
  type: 'action',
  name: 'AI Code Review',
  icon: '🧠',
  config: { model: 'gpt-4-turbo', task: 'code-review' },
  schema: nodeConfigs.ai.schema,
};

export default function WorkflowBuilderPage() {
  const [selectedNode, setSelectedNode] = useState<NodeConfig | null>(selectedNodeDemo);
  const [activeTab, setActiveTab] = useState('config');
  const [selectedRun, setSelectedRun] = useState<RunHistory | null>(null);
  const [nodeConfig, setNodeConfig] = useState(selectedNodeDemo.config);

  const handleConfigChange = (field: string, value: unknown) => {
    setNodeConfig({ ...nodeConfig, [field]: value });
  };

  const handleTestNode = () => {
    // Simulate testing node
    alert('Testing node with sample input...\n\nResult: Success!\nScore: 85/100');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">PR Review Automation</h1>
            <p className="text-sm text-muted-foreground">Edit workflow nodes and view run history</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Validate</Button>
            <Button variant="outline" size="sm">Test Run</Button>
            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
              Save & Deploy
            </Button>
          </div>
        </div>

        {/* Canvas Placeholder */}
        <div className="flex-1 bg-muted/20 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-30">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Nodes */}
          {[
            { id: 1, type: 'trigger', name: 'GitHub PR', x: 80, y: 120, icon: '🐙' },
            { id: 2, type: 'action', name: 'AI Review', x: 280, y: 120, icon: '🧠', selected: true },
            { id: 3, type: 'condition', name: 'Score > 80?', x: 480, y: 120, icon: '🔀' },
            { id: 4, type: 'action', name: 'Auto Approve', x: 680, y: 60, icon: '✅' },
            { id: 5, type: 'action', name: 'Request Review', x: 680, y: 180, icon: '👀' },
          ].map((node) => (
            <div
              key={node.id}
              className={`absolute w-36 p-3 rounded-lg border-2 shadow-sm cursor-pointer transition-all
                ${node.type === 'trigger' ? 'bg-blue-500/10 border-blue-500/30' : ''}
                ${node.type === 'action' ? 'bg-green-500/10 border-green-500/30' : ''}
                ${node.type === 'condition' ? 'bg-purple-500/10 border-purple-500/30' : ''}
                ${node.selected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}
              `}
              style={{ left: node.x, top: node.y }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{node.icon}</span>
                <span className="text-sm font-medium truncate">{node.name}</span>
              </div>
            </div>
          ))}

          {/* Connections (simplified) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path d="M 216 135 Q 248 135 262 135" stroke="#6366f1" strokeWidth="2" fill="none" />
            <path d="M 416 135 Q 448 135 462 135" stroke="#6366f1" strokeWidth="2" fill="none" />
            <path d="M 616 120 Q 648 85 662 75" stroke="#22c55e" strokeWidth="2" fill="none" />
            <path d="M 616 150 Q 648 185 662 195" stroke="#ef4444" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>

      {/* Right Sidebar - Configuration Panel */}
      <div className="w-96 border-l border-border/50 flex flex-col bg-background">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="history">Run History</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="flex-1 overflow-auto p-4 m-0">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center text-2xl">
                    {selectedNode.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedNode.name}</h3>
                    <Badge variant="secondary" className="capitalize">{selectedNode.type}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  {selectedNode.schema.map((field) => (
                    <div key={field.name}>
                      <label className="text-sm font-medium mb-1.5 flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
                          value={(nodeConfig[field.name] as string) || ''}
                          onChange={(e) => handleConfigChange(field.name, e.target.value)}
                        >
                          <option value="">Select...</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm min-h-[80px]"
                          placeholder={field.placeholder}
                          value={(nodeConfig[field.name] as string) || ''}
                          onChange={(e) => handleConfigChange(field.name, e.target.value)}
                        />
                      ) : (
                        <Input
                          type={field.type === 'number' ? 'number' : 'text'}
                          placeholder={field.placeholder}
                          value={(nodeConfig[field.name] as string) || ''}
                          onChange={(e) => handleConfigChange(field.name, e.target.value)}
                        />
                      )}
                      {field.helpText && (
                        <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                      )}
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleTestNode}>
                    🧪 Test Node
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <p>Select a node to configure</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-auto p-4 m-0">
            <div className="space-y-3">
              {mockRunHistory.map((run) => (
                <Card
                  key={run.id}
                  className={`cursor-pointer transition-all hover:shadow-sm ${selectedRun?.id === run.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedRun(selectedRun?.id === run.id ? null : run)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={run.status === 'success' ? 'default' : 'destructive'}>
                        {run.status === 'success' ? '✓' : '✗'} {run.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{run.startedAt}</span>
                    </div>
                    <p className="text-sm font-medium truncate">{run.trigger}</p>
                    <p className="text-xs text-muted-foreground">Duration: {run.duration}</p>

                    {selectedRun?.id === run.id && (
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase">Step Results</p>
                        {run.steps.map((step, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className={step.status === 'success' ? 'text-green-500' : step.status === 'failed' ? 'text-red-500' : 'text-gray-400'}>
                              {step.status === 'success' ? '✓' : step.status === 'failed' ? '✗' : '○'}
                            </span>
                            <span className="flex-1 truncate">{step.nodeName}</span>
                            <span className="text-xs text-muted-foreground">{step.duration}</span>
                          </div>
                        ))}
                        {run.steps.find(s => s.error) && (
                          <div className="p-2 bg-red-500/10 rounded text-xs text-red-500">
                            {run.steps.find(s => s.error)?.error}
                          </div>
                        )}
                        {run.steps.find(s => s.output) && (
                          <div className="p-2 bg-green-500/10 rounded text-xs text-green-600">
                            {run.steps.find(s => s.output)?.output}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
