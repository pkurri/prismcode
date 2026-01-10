'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Model {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  pricing: { input: number; output: number };
  speed: number;
  quality: number;
  bestFor: string[];
  status: 'available' | 'beta' | 'deprecated';
}

interface UsageRecord {
  date: string;
  model: string;
  tokens: number;
  cost: number;
  calls: number;
}

// Mock analytics data
const mockUsageByDay = [
  { date: 'Mon', tokens: 125000, cost: 3.25, calls: 45 },
  { date: 'Tue', tokens: 189000, cost: 5.12, calls: 67 },
  { date: 'Wed', tokens: 156000, cost: 4.28, calls: 52 },
  { date: 'Thu', tokens: 234000, cost: 6.45, calls: 78 },
  { date: 'Fri', tokens: 198000, cost: 5.67, calls: 61 },
  { date: 'Sat', tokens: 87000, cost: 2.12, calls: 28 },
  { date: 'Sun', tokens: 65000, cost: 1.56, calls: 19 },
];

const mockModelBreakdown = [
  { model: 'GPT-4o', calls: 156, tokens: 450000, cost: 15.75, successRate: 99.2 },
  { model: 'Claude 3.5 Sonnet', calls: 124, tokens: 380000, cost: 8.40, successRate: 98.8 },
  { model: 'DeepSeek Coder', calls: 89, tokens: 220000, cost: 0.08, successRate: 97.5 },
  { model: 'Gemini 1.5 Pro', calls: 45, tokens: 95000, cost: 0.24, successRate: 99.1 },
];

const mockTaskBreakdown = [
  { task: 'Code Generation', icon: '💻', calls: 189, avgLatency: 2.3, successRate: 98.4 },
  { task: 'Code Review', icon: '🔍', calls: 134, avgLatency: 3.8, successRate: 99.1 },
  { task: 'Documentation', icon: '📝', calls: 67, avgLatency: 1.9, successRate: 99.5 },
  { task: 'Test Generation', icon: '🧪', calls: 45, avgLatency: 2.8, successRate: 97.8 },
  { task: 'Chat', icon: '💬', calls: 234, avgLatency: 1.2, successRate: 99.8 },
];

export default function AIAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    fetch('/api/ai/orchestration')
      .then(res => res.json())
      .then(data => setModels(data.models || []))
      .catch(() => {});
  }, []);

  const totalTokens = mockUsageByDay.reduce((sum, d) => sum + d.tokens, 0);
  const totalCost = mockUsageByDay.reduce((sum, d) => sum + d.cost, 0);
  const totalCalls = mockUsageByDay.reduce((sum, d) => sum + d.calls, 0);
  const maxTokens = Math.max(...mockUsageByDay.map(d => d.tokens));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            AI Analytics
          </h1>
          <p className="text-muted-foreground">Monitor AI model usage, costs, and performance</p>
        </div>
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map(range => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total API Calls</CardDescription>
            <CardTitle className="text-3xl">{totalCalls.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-green-500">↑ 12% from last week</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tokens Used</CardDescription>
            <CardTitle className="text-3xl">{(totalTokens / 1000000).toFixed(2)}M</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">~{(totalTokens / totalCalls).toFixed(0)} per call</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Cost</CardDescription>
            <CardTitle className="text-3xl">${totalCost.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">${(totalCost / totalCalls).toFixed(4)} per call</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-3xl text-green-500">98.7%</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">5 failures this week</span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage Over Time</TabsTrigger>
          <TabsTrigger value="models">By Model</TabsTrigger>
          <TabsTrigger value="tasks">By Task</TabsTrigger>
        </TabsList>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Token Usage Trend</CardTitle>
              <CardDescription>Daily token consumption over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-2">
                {mockUsageByDay.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-1">{(day.tokens / 1000).toFixed(0)}K</span>
                      <div 
                        className="w-full bg-gradient-to-t from-violet-600 to-purple-400 rounded-t hover:opacity-80 transition-opacity"
                        style={{ height: `${(day.tokens / maxTokens) * 180}px` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{day.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Usage by Model</CardTitle>
              <CardDescription>Performance breakdown per AI model</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockModelBreakdown.map((m, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-2xl font-bold">{m.calls}</p>
                        <p className="text-xs text-muted-foreground">calls</p>
                      </div>
                      <div>
                        <p className="font-semibold">{m.model}</p>
                        <p className="text-sm text-muted-foreground">{(m.tokens / 1000).toFixed(0)}K tokens</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">${m.cost.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">cost</p>
                      </div>
                      <div className="text-center">
                        <p className={`font-medium ${m.successRate > 98 ? 'text-green-500' : 'text-amber-500'}`}>
                          {m.successRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">success</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Usage by Task Type</CardTitle>
              <CardDescription>Performance breakdown per task category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockTaskBreakdown.map((t, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{t.icon}</span>
                      <h3 className="font-semibold">{t.task}</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Calls</p>
                        <p className="font-medium">{t.calls}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Latency</p>
                        <p className="font-medium">{t.avgLatency}s</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success</p>
                        <p className="font-medium text-green-500">{t.successRate}%</p>
                      </div>
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
