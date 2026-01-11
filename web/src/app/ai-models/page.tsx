'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const models = [
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', status: 'active', cost: '$0.01/1k', speed: '800ms' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', status: 'active', cost: '$0.015/1k', speed: '1200ms' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', status: 'active', cost: '$0.0025/1k', speed: '500ms' },
  { id: 'codellama-34b', name: 'CodeLlama 34B', provider: 'Local', status: 'available', cost: 'Free', speed: '200ms' },
];

export default function AIModelDashboardPage() {
  const [strategy, setStrategy] = useState('quality');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            AI Model Selection
          </h1>
          <p className="text-muted-foreground">Configure AI model routing and preferences</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          + Add Model
        </Button>
      </div>

      <div className="flex gap-2">
        {['quality', 'speed', 'cost'].map(s => (
          <Button key={s} variant={strategy === s ? 'default' : 'outline'} onClick={() => setStrategy(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {models.map(model => (
          <Card key={model.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{model.name}</CardTitle>
                <Badge variant={model.status === 'active' ? 'default' : 'secondary'}>{model.status}</Badge>
              </div>
              <CardDescription>{model.provider}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span>Cost: {model.cost}</span>
                <span>Latency: {model.speed}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
