'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface AIModel {
  id: string;
  provider: string;
  name: string;
  contextWindow: number;
  pricing: { input: number; output: number };
  latencyMs: number;
  capabilities: string[];
  quality: string;
  status: 'available' | 'beta' | 'deprecated';
}

interface TaskDefaults {
  task: string;
  label: string;
  icon: string;
  defaultModel: string;
  description: string;
}

interface UsageStats {
  model: string;
  calls: number;
  tokens: number;
  cost: number;
}

const taskDefaults: TaskDefaults[] = [
  { task: 'code-generation', label: 'Code Generation', icon: '💻', defaultModel: 'claude-3-sonnet', description: 'Writing new code, functions, and components' },
  { task: 'code-review', label: 'Code Review', icon: '🔍', defaultModel: 'gpt-4-turbo', description: 'Analyzing PRs for issues and improvements' },
  { task: 'docs', label: 'Documentation', icon: '📝', defaultModel: 'claude-3-sonnet', description: 'Generating and updating documentation' },
  { task: 'tests', label: 'Test Generation', icon: '🧪', defaultModel: 'deepseek-coder', description: 'Creating unit and integration tests' },
  { task: 'chat', label: 'Chat & Q&A', icon: '💬', defaultModel: 'gpt-4o', description: 'Conversational AI assistance' },
];

const mockUsageStats: UsageStats[] = [
  { model: 'claude-3-sonnet', calls: 1245, tokens: 2500000, cost: 12.50 },
  { model: 'gpt-4-turbo', calls: 856, tokens: 1800000, cost: 45.00 },
  { model: 'deepseek-coder', calls: 432, tokens: 950000, cost: 0.35 },
  { model: 'gpt-4o', calls: 678, tokens: 1200000, cost: 9.60 },
  { model: 'gemini-pro', calls: 234, tokens: 480000, cost: 1.20 },
];

const strategies = [
  { id: 'quality', label: 'Quality', icon: '⭐', description: 'Best results, higher cost' },
  { id: 'speed', label: 'Speed', icon: '⚡', description: 'Fastest response times' },
  { id: 'cost', label: 'Cost', icon: '💰', description: 'Most economical option' },
];

export default function AIModelsPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState('quality');
  const [taskModelMap, setTaskModelMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch models from the orchestration API
    fetch('/api/ai/orchestration')
      .then(res => res.json())
      .then(data => {
        setModels(data.models || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Initialize task defaults
    const defaults: Record<string, string> = {};
    taskDefaults.forEach(t => { defaults[t.task] = t.defaultModel; });
    setTaskModelMap(defaults);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'anthropic': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'google': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'deepseek': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          AI Model Selection
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure which AI models are used for different tasks
        </p>
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList>
          <TabsTrigger value="models">Available Models</TabsTrigger>
          <TabsTrigger value="routing">Task Routing</TabsTrigger>
          <TabsTrigger value="usage">Usage Dashboard</TabsTrigger>
        </TabsList>

        {/* Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <p className="text-muted-foreground col-span-full">Loading models...</p>
            ) : (
              models.map((model) => (
                <Card key={model.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getProviderColor(model.provider)}>
                        {model.provider}
                      </Badge>
                      <Badge variant={model.status === 'available' ? 'default' : 'secondary'}>
                        {model.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{model.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Context</p>
                        <p className="font-medium">{formatNumber(model.contextWindow)} tokens</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Latency</p>
                        <p className="font-medium">{model.latencyMs}ms avg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Input</p>
                        <p className="font-medium">${model.pricing.input}/1K</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Output</p>
                        <p className="font-medium">${model.pricing.output}/1K</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex flex-wrap gap-1">
                      {model.capabilities.slice(0, 4).map((cap) => (
                        <Badge key={cap} variant="secondary" className="text-xs">{cap}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Task Routing Tab */}
        <TabsContent value="routing" className="space-y-6">
          {/* Strategy Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Routing Strategy</CardTitle>
              <CardDescription>Choose how models are selected for tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {strategies.map((strategy) => (
                  <button
                    key={strategy.id}
                    onClick={() => setSelectedStrategy(strategy.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedStrategy === strategy.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{strategy.icon}</div>
                    <h3 className="font-semibold">{strategy.label}</h3>
                    <p className="text-sm text-muted-foreground">{strategy.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Per-Task Defaults */}
          <Card>
            <CardHeader>
              <CardTitle>Task Defaults</CardTitle>
              <CardDescription>Override model selection per task type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {taskDefaults.map((task) => (
                <div key={task.task} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{task.icon}</span>
                    <div>
                      <h4 className="font-medium">{task.label}</h4>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                  <select
                    value={taskModelMap[task.task] || task.defaultModel}
                    onChange={(e) => setTaskModelMap({ ...taskModelMap, [task.task]: e.target.value })}
                    className="px-3 py-2 rounded-md border border-border bg-background text-sm"
                  >
                    <option value="">Auto ({selectedStrategy})</option>
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                </div>
              ))}
              <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Dashboard Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total API Calls</CardDescription>
                <CardTitle className="text-3xl">3,445</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">↑ 12% from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Tokens Used</CardDescription>
                <CardTitle className="text-3xl">6.9M</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">↓ 3% from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Cost</CardDescription>
                <CardTitle className="text-3xl">$68.65</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">This billing period</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg Latency</CardDescription>
                <CardTitle className="text-3xl">847ms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Across all models</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usage by Model</CardTitle>
              <CardDescription>Recent activity across all AI models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUsageStats.map((stat) => {
                  const model = models.find(m => m.id === stat.model);
                  const totalCalls = mockUsageStats.reduce((acc, s) => acc + s.calls, 0);
                  const percentage = Math.round((stat.calls / totalCalls) * 100);
                  
                  return (
                    <div key={stat.model} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model?.name || stat.model}</span>
                          <Badge variant="outline" className="text-xs">
                            {model?.provider || 'unknown'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {stat.calls.toLocaleString()} calls · {formatNumber(stat.tokens)} tokens · ${stat.cost.toFixed(2)}
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
