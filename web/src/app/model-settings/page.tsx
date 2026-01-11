'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

interface Model {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'meta' | 'mistral';
  capabilities: string[];
  costPerMixedToken: number; // approximate blended cost
  speed: 'fast' | 'medium' | 'slow';
  contextWindow: number;
}

const availableModels: Model[] = [
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', capabilities: ['reasoning', 'coding'], costPerMixedToken: 0.02, speed: 'medium', contextWindow: 128000 },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic', capabilities: ['reasoning', 'writing'], costPerMixedToken: 0.03, speed: 'slow', contextWindow: 200000 },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', capabilities: ['multimodal', 'context'], costPerMixedToken: 0.007, speed: 'medium', contextWindow: 1000000 },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', capabilities: ['chat', 'fast'], costPerMixedToken: 0.001, speed: 'fast', contextWindow: 16000 },
  { id: 'haiku', name: 'Claude 3 Haiku', provider: 'anthropic', capabilities: ['chat', 'fast'], costPerMixedToken: 0.0005, speed: 'fast', contextWindow: 200000 },
];

export default function ModelSettingsPage() {
  const [routingStrategy, setRoutingStrategy] = useState<'performance' | 'cost' | 'balanced'>('balanced');
  const [activeModels, setActiveModels] = useState<string[]>(['gpt-4-turbo', 'claude-3-opus', 'gemini-1.5-pro']);
  
  const toggleModel = (id: string) => {
    setActiveModels(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Model Orchestration</h1>
        <p className="text-muted-foreground mt-1">
          Configure which Large Language Models utilize across the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Routing Strategy</CardTitle>
              <CardDescription>How the orchestration engine selects a model for a task</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-2 bg-muted p-1 rounded-lg">
                  {['performance', 'balanced', 'cost'].map((strategy) => (
                    <button
                      key={strategy}
                      onClick={() => setRoutingStrategy(strategy as any)}
                      className={`py-2 px-4 rounded-md text-sm font-medium transition-all ${
                        routingStrategy === strategy
                          ? 'bg-background shadow text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Performance Bias</span>
                    <span className="text-muted-foreground">{routingStrategy === 'performance' ? 'High' : routingStrategy === 'cost' ? 'Low' : 'Medium'}</span>
                  </div>
                  <Slider 
                    value={[routingStrategy === 'performance' ? 90 : routingStrategy === 'cost' ? 10 : 50]} 
                    max={100} 
                    step={10} 
                    className="cursor-not-allowed opacity-80" 
                  />
                  <p className="text-xs text-muted-foreground">
                    {routingStrategy === 'performance' && "Prioritizes the most capable models (GPT-4, Opus) regardless of latency or cost."}
                    {routingStrategy === 'cost' && "Prioritizes cheaper, faster models (Haiku, GPT-3.5) for most tasks."}
                    {routingStrategy === 'balanced' && "Dynamically switches based on task complexity estimation."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task-Specific Routing</CardTitle>
              <CardDescription>Override default routing for specific capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { task: 'Complex Code Refactoring', model: 'GPT-4 Turbo' },
                { task: 'Unit Test Generation', model: 'Clause 3 Haiku' },
                { task: 'Documentation Writing', model: 'Gemini 1.5 Pro' },
                { task: 'Chat / Q&A', model: 'GPT-3.5 Turbo' },
              ].map((route, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium text-sm">{route.task}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Routed to</span>
                    <Badge variant="outline">{route.model}</Badge>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">⚙️</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Registry</CardTitle>
              <CardDescription>Enable or disable specific provider models</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableModels.map((model) => (
                <div key={model.id} className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-sm">{model.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{model.provider} · {model.contextWindow / 1000}k</div>
                  </div>
                  <Switch 
                    checked={activeModels.includes(model.id)}
                    onCheckedChange={() => toggleModel(model.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage provider credentials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {['OpenAI', 'Anthropic', 'Google', 'Mistral'].map((provider) => (
                <div key={provider} className="flex items-center justify-between p-2 rounded bg-muted/30">
                  <span className="text-sm font-medium">{provider}</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">Connected</Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full text-xs">Manage Keys</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
