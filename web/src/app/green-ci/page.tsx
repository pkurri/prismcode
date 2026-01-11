'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CarbonWindow {
  time: string;
  intensity: 'low' | 'medium' | 'high';
  gCO2: number;
  recommended: boolean;
}

interface CIRun {
  id: string;
  pipeline: string;
  scheduledFor: string;
  originalCO2: number;
  optimizedCO2: number;
  status: 'scheduled' | 'running' | 'completed' | 'delayed';
}

interface Optimization {
  type: string;
  description: string;
  savings: string;
  enabled: boolean;
}

const mockWindows: CarbonWindow[] = [
  { time: '02:00 - 06:00', intensity: 'low', gCO2: 120, recommended: true },
  { time: '06:00 - 10:00', intensity: 'medium', gCO2: 280, recommended: false },
  { time: '10:00 - 14:00', intensity: 'high', gCO2: 420, recommended: false },
  { time: '14:00 - 18:00', intensity: 'medium', gCO2: 310, recommended: false },
  { time: '18:00 - 22:00', intensity: 'low', gCO2: 180, recommended: true },
  { time: '22:00 - 02:00', intensity: 'low', gCO2: 95, recommended: true },
];

const mockRuns: CIRun[] = [
  { id: '1', pipeline: 'main → production', scheduledFor: '02:30 (low carbon)', originalCO2: 450, optimizedCO2: 180, status: 'scheduled' },
  { id: '2', pipeline: 'feature/auth → staging', scheduledFor: 'Now (delayed from 14:00)', originalCO2: 320, optimizedCO2: 120, status: 'running' },
  { id: '3', pipeline: 'develop → staging', scheduledFor: '22:15 (low carbon)', originalCO2: 280, optimizedCO2: 95, status: 'scheduled' },
];

const mockOptimizations: Optimization[] = [
  { type: 'Smart Scheduling', description: 'Delay non-urgent builds to low-carbon windows', savings: '~40% CO₂', enabled: true },
  { type: 'Test Caching', description: 'Skip unchanged tests to reduce compute', savings: '~25% energy', enabled: true },
  { type: 'Dependency Caching', description: 'Cache npm/pip packages across builds', savings: '~15% time', enabled: true },
  { type: 'Parallel Optimization', description: 'Right-size parallel workers for efficiency', savings: '~20% energy', enabled: false },
];

const intensityColors: Record<string, string> = {
  low: 'bg-green-500',
  medium: 'bg-amber-500',
  high: 'bg-red-500',
};

export default function GreenCIPage() {
  const [windows] = useState(mockWindows);
  const [runs] = useState(mockRuns);
  const [optimizations, setOptimizations] = useState(mockOptimizations);

  const toggleOptimization = (type: string) => {
    setOptimizations(prev => prev.map(o => o.type === type ? { ...o, enabled: !o.enabled } : o));
  };

  const totalSaved = runs.reduce((s, r) => s + (r.originalCO2 - r.optimizedCO2), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Green CI/CD
          </h1>
          <p className="text-muted-foreground">Carbon-aware build scheduling</p>
        </div>
        <Badge variant="default" className="bg-green-500 text-lg px-4 py-2">
          🌱 {totalSaved}g CO₂ saved today
        </Badge>
      </div>

      {/* Carbon Intensity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Grid Carbon Intensity</CardTitle>
          <CardDescription>Best times to run builds (local grid data)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {windows.map((w, i) => (
              <div key={i} className={`flex-1 p-3 rounded text-center ${w.recommended ? 'ring-2 ring-green-500' : ''}`}>
                <div className={`h-16 rounded mb-2 ${intensityColors[w.intensity]}`} style={{ opacity: 0.3 + (w.gCO2 / 500) }} />
                <p className="text-xs font-medium">{w.time}</p>
                <p className="text-xs text-muted-foreground">{w.gCO2}g/kWh</p>
                {w.recommended && <Badge variant="default" className="mt-1 bg-green-500 text-xs">Best</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="runs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="runs">Scheduled Runs</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="runs">
          <Card>
            <CardHeader>
              <CardTitle>CI/CD Runs</CardTitle>
              <CardDescription>Carbon-optimized build schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {runs.map(run => (
                <div key={run.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{run.pipeline}</p>
                    <p className="text-sm text-muted-foreground">{run.scheduledFor}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm">
                        <span className="line-through text-muted-foreground">{run.originalCO2}g</span>
                        <span className="text-green-500 ml-2">→ {run.optimizedCO2}g</span>
                      </p>
                      <p className="text-xs text-green-500">-{Math.round((1 - run.optimizedCO2 / run.originalCO2) * 100)}% CO₂</p>
                    </div>
                    <Badge variant={run.status === 'running' ? 'default' : 'secondary'}>
                      {run.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimizations">
          <Card>
            <CardHeader>
              <CardTitle>Green Optimizations</CardTitle>
              <CardDescription>Energy-saving features for CI/CD</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {optimizations.map((opt, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-lg ${opt.enabled ? 'bg-green-500/5 border border-green-500/30' : 'bg-muted/30'}`}>
                  <div>
                    <p className="font-medium">{opt.type}</p>
                    <p className="text-sm text-muted-foreground">{opt.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-green-500 border-green-500/30">{opt.savings}</Badge>
                    <Button 
                      variant={opt.enabled ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => toggleOptimization(opt.type)}
                    >
                      {opt.enabled ? '✓ On' : 'Off'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Green CI Settings</CardTitle>
              <CardDescription>Configure carbon-aware behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Enable Smart Scheduling', desc: 'Delay non-critical builds', enabled: true },
                { name: 'Use Electricity Maps API', desc: 'Get real-time grid data', enabled: true },
                { name: 'Auto-delay high-carbon builds', desc: 'Wait for greener windows', enabled: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                  <Button variant={s.enabled ? 'default' : 'outline'} size="sm">
                    {s.enabled ? '✓ On' : 'Off'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
