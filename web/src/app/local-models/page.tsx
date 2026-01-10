'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LocalModel {
  id: string;
  name: string;
  provider: 'ollama' | 'lm_studio';
  size: string;
  capabilities: string[];
  status: 'running' | 'stopped' | 'downloading';
  performance: { tokensPerSecond: number; memory: string };
}

interface ModelConfig {
  task: string;
  selectedModel: string;
  fallbackModel?: string;
  offline: boolean;
}

const mockLocalModels: LocalModel[] = [
  { id: '1', name: 'codellama:13b', provider: 'ollama', size: '7.3 GB', capabilities: ['code-completion', 'code-review'], status: 'running', performance: { tokensPerSecond: 32, memory: '8 GB' } },
  { id: '2', name: 'deepseek-coder:6.7b', provider: 'ollama', size: '3.8 GB', capabilities: ['code-completion', 'debugging'], status: 'running', performance: { tokensPerSecond: 48, memory: '4 GB' } },
  { id: '3', name: 'llama3:8b', provider: 'ollama', size: '4.7 GB', capabilities: ['chat', 'code-review'], status: 'stopped', performance: { tokensPerSecond: 45, memory: '6 GB' } },
  { id: '4', name: 'mistral:7b-instruct', provider: 'lm_studio', size: '4.1 GB', capabilities: ['chat', 'code-completion'], status: 'running', performance: { tokensPerSecond: 52, memory: '5 GB' } },
];

const mockTaskConfigs: ModelConfig[] = [
  { task: 'Code Completion', selectedModel: 'codellama:13b', fallbackModel: 'deepseek-coder:6.7b', offline: true },
  { task: 'Code Review', selectedModel: 'codellama:13b', offline: true },
  { task: 'Chat', selectedModel: 'llama3:8b', fallbackModel: 'mistral:7b-instruct', offline: false },
  { task: 'Debugging', selectedModel: 'deepseek-coder:6.7b', offline: true },
];

const providerIcons: Record<string, string> = {
  ollama: '🦙',
  lm_studio: '🎨',
};

const statusColors: Record<string, string> = {
  running: 'bg-green-500',
  stopped: 'bg-gray-400',
  downloading: 'bg-blue-500 animate-pulse',
};

export default function LocalModelsPage() {
  const [models, setModels] = useState(mockLocalModels);
  const [taskConfigs] = useState(mockTaskConfigs);

  const toggleModel = (id: string) => {
    setModels(prev => prev.map(m => 
      m.id === id ? { ...m, status: m.status === 'running' ? 'stopped' as const : 'running' as const } : m
    ));
  };

  const runningCount = models.filter(m => m.status === 'running').length;
  const totalMemory = models.filter(m => m.status === 'running').reduce((s, m) => s + parseInt(m.performance.memory), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Local Models
          </h1>
          <p className="text-muted-foreground">Privacy-first AI with Ollama & LM Studio</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          + Download Model
        </Button>
      </div>

      {/* Status Banner */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🔒</span>
              <div>
                <p className="font-medium">Privacy Mode Active</p>
                <p className="text-sm text-muted-foreground">All AI processing stays on your machine</p>
              </div>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{runningCount}</p>
                <p className="text-xs text-muted-foreground">Models Running</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{totalMemory} GB</p>
                <p className="text-xs text-muted-foreground">Memory Used</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Installed Models</TabsTrigger>
          <TabsTrigger value="routing">Task Routing</TabsTrigger>
          <TabsTrigger value="download">Download</TabsTrigger>
        </TabsList>

        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Local Models</CardTitle>
              <CardDescription>Models installed on your machine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {models.map(model => (
                <div key={model.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{providerIcons[model.provider]}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium font-mono">{model.name}</h4>
                        <Badge variant="secondary">{model.size}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {model.capabilities.map(cap => (
                          <Badge key={cap} variant="outline" className="text-xs">{cap}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {model.status === 'running' && (
                      <span className="text-sm text-muted-foreground">
                        {model.performance.tokensPerSecond} tok/s • {model.performance.memory}
                      </span>
                    )}
                    <span className={`w-3 h-3 rounded-full ${statusColors[model.status]}`} />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleModel(model.id)}
                    >
                      {model.status === 'running' ? '⏹️ Stop' : '▶️ Start'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routing">
          <Card>
            <CardHeader>
              <CardTitle>Task Routing</CardTitle>
              <CardDescription>Configure which model handles each task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {taskConfigs.map((config, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <h4 className="font-medium">{config.task}</h4>
                    <p className="text-sm text-muted-foreground">
                      Primary: {config.selectedModel}
                      {config.fallbackModel && ` • Fallback: ${config.fallbackModel}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {config.offline && (
                      <Badge variant="default" className="bg-green-500">🔒 Offline</Badge>
                    )}
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="download">
          <Card>
            <CardHeader>
              <CardTitle>Download Models</CardTitle>
              <CardDescription>Popular models for coding tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {[
                { name: 'CodeLlama 34B', size: '19 GB', desc: 'Best for complex code generation' },
                { name: 'DeepSeek Coder 33B', size: '18 GB', desc: 'Excellent for debugging' },
                { name: 'StarCoder2 15B', size: '9 GB', desc: 'Multi-language support' },
                { name: 'Phi-3 Mini', size: '2.3 GB', desc: 'Lightweight and fast' },
              ].map((model, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{model.name}</p>
                    <p className="text-sm text-muted-foreground">{model.size} • {model.desc}</p>
                  </div>
                  <Button variant="outline" size="sm">📥 Download</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
