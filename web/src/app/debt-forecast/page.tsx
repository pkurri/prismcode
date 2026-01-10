'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DebtForecast {
  month: string;
  score: number;
  projected: number;
}

interface DebtHotspot {
  file: string;
  currentDebt: number;
  projectedDebt: number;
  growthRate: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface RefactoringROI {
  file: string;
  estimatedHours: number;
  projectedSavings: number;
  breakEvenWeeks: number;
  recommendation: string;
}

const mockForecasts: DebtForecast[] = [
  { month: 'Jan', score: 45, projected: 45 },
  { month: 'Feb', score: 48, projected: 48 },
  { month: 'Mar', score: 52, projected: 52 },
  { month: 'Apr', score: 0, projected: 56 },
  { month: 'May', score: 0, projected: 61 },
  { month: 'Jun', score: 0, projected: 67 },
];

const mockHotspots: DebtHotspot[] = [
  { file: 'src/api/legacy-handler.ts', currentDebt: 85, projectedDebt: 95, growthRate: 12, priority: 'critical' },
  { file: 'src/components/Dashboard.tsx', currentDebt: 72, projectedDebt: 80, growthRate: 8, priority: 'high' },
  { file: 'src/utils/validators.ts', currentDebt: 55, projectedDebt: 62, growthRate: 5, priority: 'medium' },
  { file: 'src/hooks/useAuth.ts', currentDebt: 38, projectedDebt: 42, growthRate: 3, priority: 'low' },
];

const mockROI: RefactoringROI[] = [
  { file: 'legacy-handler.ts', estimatedHours: 16, projectedSavings: 240, breakEvenWeeks: 4, recommendation: 'High priority - blocking multiple features' },
  { file: 'Dashboard.tsx', estimatedHours: 8, projectedSavings: 80, breakEvenWeeks: 6, recommendation: 'Medium priority - performance improvements' },
  { file: 'validators.ts', estimatedHours: 4, projectedSavings: 40, breakEvenWeeks: 5, recommendation: 'Low priority - quality of life' },
];

const priorityColors: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-500 border-red-500/30',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  low: 'bg-green-500/10 text-green-500 border-green-500/30',
};

export default function DebtForecastPage() {
  const [forecasts] = useState(mockForecasts);
  const [hotspots] = useState(mockHotspots);
  const [roi] = useState(mockROI);
  const [scenario, setScenario] = useState<'baseline' | 'aggressive' | 'minimal'>('baseline');

  const currentDebt = 52;
  const projectedDebt = scenario === 'aggressive' ? 35 : scenario === 'minimal' ? 75 : 67;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Debt Forecasting
          </h1>
          <p className="text-muted-foreground">Predict and plan technical debt reduction</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          📊 Generate Report
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Debt Score</CardDescription>
            <CardTitle className="text-3xl text-amber-500">{currentDebt}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>6-Month Projection</CardDescription>
            <CardTitle className={`text-3xl ${projectedDebt > currentDebt ? 'text-red-500' : 'text-green-500'}`}>
              {projectedDebt}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Critical Hotspots</CardDescription>
            <CardTitle className="text-3xl text-red-500">{hotspots.filter(h => h.priority === 'critical').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Est. Refactor Hours</CardDescription>
            <CardTitle className="text-3xl">{roi.reduce((s, r) => s + r.estimatedHours, 0)}h</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Scenario Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Forecast Scenario</span>
            <div className="flex gap-2">
              {(['minimal', 'baseline', 'aggressive'] as const).map(s => (
                <Button
                  key={s}
                  variant={scenario === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setScenario(s)}
                  className="capitalize"
                >
                  {s} Refactoring
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecast">Forecast Chart</TabsTrigger>
          <TabsTrigger value="hotspots">Debt Hotspots</TabsTrigger>
          <TabsTrigger value="roi">ROI Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>Debt Trajectory</CardTitle>
              <CardDescription>Historical and projected debt scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-4">
                {forecasts.map((f, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col gap-1">
                      {f.projected > 0 && (
                        <div 
                          className={`w-full rounded-t ${f.score === 0 ? 'bg-violet-500/50' : 'bg-violet-500'}`}
                          style={{ height: `${f.projected * 2}px` }}
                        />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{f.month}</span>
                    <span className="text-sm font-medium">{f.projected || f.score}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-8 mt-4">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-violet-500" />
                  <span className="text-sm">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-violet-500/50" />
                  <span className="text-sm">Projected</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotspots">
          <Card>
            <CardHeader>
              <CardTitle>Debt Hotspots</CardTitle>
              <CardDescription>Files with compounding debt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {hotspots.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium font-mono text-sm">{h.file}</span>
                      <Badge variant="outline" className={priorityColors[h.priority]}>{h.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      📈 {h.growthRate}% monthly growth
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Current:</span> <span className="font-medium">{h.currentDebt}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">In 6mo:</span> <span className={`font-medium ${h.projectedDebt > h.currentDebt ? 'text-red-500' : ''}`}>{h.projectedDebt}</span>
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi">
          <Card>
            <CardHeader>
              <CardTitle>Refactoring ROI</CardTitle>
              <CardDescription>Cost-benefit analysis for debt reduction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {roi.map((r, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium font-mono">{r.file}</span>
                    <Badge variant="default">{r.breakEvenWeeks} week break-even</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center my-3">
                    <div>
                      <p className="text-2xl font-bold">{r.estimatedHours}h</p>
                      <p className="text-xs text-muted-foreground">Effort</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-500">{r.projectedSavings}h</p>
                      <p className="text-xs text-muted-foreground">Savings/Year</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{Math.round(r.projectedSavings / r.estimatedHours)}x</p>
                      <p className="text-xs text-muted-foreground">ROI</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.recommendation}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
