'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const metrics = {
  carbonSaved: 12.4,
  pipelinesOptimized: 8,
  energyReduced: 23,
  treesEquivalent: 0.5,
};

const pipelines = [
  { name: 'main-build', emissions: 45, region: 'us-east-1', status: 'optimized' },
  { name: 'test-suite', emissions: 28, region: 'us-east-1', status: 'warning' },
  { name: 'deploy-prod', emissions: 12, region: 'eu-west-1', status: 'green' },
  { name: 'e2e-tests', emissions: 67, region: 'us-east-1', status: 'needs-action' },
];

const suggestions = [
  { action: 'Move test-suite to eu-north-1', impact: '-35% emissions', difficulty: 'easy' },
  { action: 'Enable build caching', impact: '-20% runtime', difficulty: 'easy' },
  { action: 'Parallelize e2e tests', impact: '-45% duration', difficulty: 'medium' },
  { action: 'Schedule non-urgent builds off-peak', impact: '-15% carbon', difficulty: 'easy' },
];

export default function SustainabilityPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sustainability Dashboard</h1>
          <p className="text-muted-foreground">
            Track and reduce your code&apos;s carbon footprint
          </p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-600 to-green-600">Optimize All</Button>
      </div>

      {/* Impact Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Carbon Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-emerald-500">{metrics.carbonSaved}kg</div>
            <p className="text-sm text-muted-foreground">CO₂ this month</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Optimized Pipelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-500">{metrics.pipelinesOptimized}</div>
            <p className="text-sm text-muted-foreground">of 12 total</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Energy Reduced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-amber-500">{metrics.energyReduced}%</div>
            <p className="text-sm text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trees Equivalent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500">🌳 {metrics.treesEquivalent}</div>
            <p className="text-sm text-muted-foreground">monthly planting</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Analysis */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Pipeline Emissions</CardTitle>
          <CardDescription>Carbon footprint by CI/CD pipeline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pipelines.map((pipeline) => (
            <div
              key={pipeline.name}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-3 w-3 rounded-full ${
                    pipeline.status === 'green'
                      ? 'bg-green-500'
                      : pipeline.status === 'optimized'
                        ? 'bg-emerald-500'
                        : pipeline.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                  }`}
                />
                <div>
                  <p className="font-medium">{pipeline.name}</p>
                  <p className="text-sm text-muted-foreground">{pipeline.region}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">{pipeline.emissions}g CO₂/run</span>
                <Badge
                  variant={
                    pipeline.status === 'green' || pipeline.status === 'optimized'
                      ? 'secondary'
                      : pipeline.status === 'warning'
                        ? 'default'
                        : 'destructive'
                  }
                >
                  {pipeline.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Optimization Suggestions</CardTitle>
          <CardDescription>AI-powered recommendations to reduce carbon footprint</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.map((suggestion, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">{suggestion.action}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-sm text-emerald-500">{suggestion.impact}</span>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.difficulty}
                  </Badge>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Apply
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
