'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const models = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    context: '128K',
    cost: '$$$',
    speed: 'Fast',
    quality: 'Excellent',
    capabilities: ['code', 'vision', 'reasoning'],
    status: 'active',
    recommended: true,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    context: '128K',
    cost: '$$$',
    speed: 'Medium',
    quality: 'Excellent',
    capabilities: ['code', 'reasoning'],
    status: 'active',
    recommended: false,
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    context: '200K',
    cost: '$$',
    speed: 'Fast',
    quality: 'Excellent',
    capabilities: ['code', 'reasoning'],
    status: 'active',
    recommended: true,
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    context: '200K',
    cost: '$$$',
    speed: 'Slow',
    quality: 'Best',
    capabilities: ['code', 'vision', 'reasoning'],
    status: 'active',
    recommended: false,
  },
  {
    id: 'gemini-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    context: '1M',
    cost: '$$',
    speed: 'Fast',
    quality: 'Great',
    capabilities: ['code', 'vision'],
    status: 'active',
    recommended: false,
  },
  {
    id: 'llama-3.2',
    name: 'Llama 3.2 70B',
    provider: 'Local/Ollama',
    context: '128K',
    cost: 'Free',
    speed: 'Variable',
    quality: 'Good',
    capabilities: ['code'],
    status: 'available',
    recommended: false,
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral',
    context: '32K',
    cost: '$',
    speed: 'Fast',
    quality: 'Good',
    capabilities: ['code'],
    status: 'available',
    recommended: false,
  },
  {
    id: 'codestral',
    name: 'Codestral',
    provider: 'Mistral',
    context: '32K',
    cost: '$',
    speed: 'Very Fast',
    quality: 'Great',
    capabilities: ['code'],
    status: 'active',
    recommended: true,
  },
];

const taskDefaults = [
  { task: 'Code Generation', model: 'claude-3.5-sonnet', icon: '💻' },
  { task: 'Code Review', model: 'gpt-4o', icon: '🔍' },
  { task: 'Documentation', model: 'gpt-4-turbo', icon: '📝' },
  { task: 'Test Generation', model: 'codestral', icon: '🧪' },
  { task: 'Chat/Q&A', model: 'claude-3.5-sonnet', icon: '💬' },
  { task: 'Debugging', model: 'gpt-4o', icon: '🐛' },
];

const usageData = [
  { date: 'Today', calls: 234, tokens: '1.2M', cost: '$4.56' },
  { date: 'Yesterday', calls: 189, tokens: '980K', cost: '$3.21' },
  { date: 'This Week', calls: 1245, tokens: '6.8M', cost: '$23.45' },
  { date: 'This Month', calls: 4567, tokens: '24M', cost: '$89.12' },
];

export default function ModelsPage() {
  const [selected, setSelected] = useState<(typeof models)[0] | null>(null);
  const [routingPolicy, setRoutingPolicy] = useState('balanced');

  const costColors: Record<string, string> = {
    Free: 'text-green-600',
    $: 'text-blue-600',
    $$: 'text-yellow-600',
    $$$: 'text-red-600',
  };
  const qualityColors: Record<string, string> = {
    Good: 'bg-blue-500',
    Great: 'bg-green-500',
    Excellent: 'bg-purple-500',
    Best: 'bg-violet-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            AI Models
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure and route AI models for optimal results
          </p>
        </div>
        <Button variant="outline">Add Custom Model</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Models Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Available Models</CardTitle>
              <Tabs value={routingPolicy} onValueChange={setRoutingPolicy}>
                <TabsList className="h-8">
                  <TabsTrigger value="cost" className="text-xs">
                    Cost
                  </TabsTrigger>
                  <TabsTrigger value="balanced" className="text-xs">
                    Balanced
                  </TabsTrigger>
                  <TabsTrigger value="quality" className="text-xs">
                    Quality
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Model</th>
                  <th className="text-left p-3 font-medium">Context</th>
                  <th className="text-left p-3 font-medium">Cost</th>
                  <th className="text-left p-3 font-medium">Quality</th>
                  <th className="text-left p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr
                    key={m.id}
                    className={`border-b hover:bg-muted/30 cursor-pointer transition-colors ${selected?.id === m.id ? 'bg-primary/5' : ''}`}
                    onClick={() => setSelected(m)}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{m.name}</span>
                        {m.recommended && <Badge className="text-[10px] h-4">Recommended</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">{m.provider}</span>
                    </td>
                    <td className="p-3 text-muted-foreground">{m.context}</td>
                    <td className={`p-3 font-medium ${costColors[m.cost]}`}>{m.cost}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${qualityColors[m.quality]}`} />
                        {m.quality}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={m.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {m.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Model Details / Task Defaults */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Per-Task Defaults</CardTitle>
              <CardDescription>Auto-route by task type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {taskDefaults.map((t) => (
                <div
                  key={t.task}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span>{t.icon}</span>
                    <span className="text-sm">{t.task}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {models.find((m) => m.id === t.model)?.name}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2">
                Configure Defaults
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Usage This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {usageData.map((u) => (
                <div key={u.date} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{u.date}</span>
                  <div className="text-right">
                    <p className="text-sm font-medium">{u.cost}</p>
                    <p className="text-xs text-muted-foreground">{u.tokens} tokens</p>
                  </div>
                </div>
              ))}
              <Separator />
              <Button variant="outline" size="sm" className="w-full">
                View Full Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selected Model Details */}
      {selected && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selected.name}</CardTitle>
                <CardDescription>
                  {selected.provider} · {selected.context} context
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Test Model</Button>
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                  {selected.status === 'active' ? 'Configure' : 'Activate'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Speed</p>
                <p className="font-medium">{selected.speed}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Quality</p>
                <p className="font-medium">{selected.quality}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Cost</p>
                <p className={`font-medium ${costColors[selected.cost]}`}>{selected.cost}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Capabilities</p>
                <div className="flex gap-1 mt-1">
                  {selected.capabilities.map((c) => (
                    <Badge key={c} variant="secondary" className="text-xs">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
