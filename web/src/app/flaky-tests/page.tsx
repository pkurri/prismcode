'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FlakyTest {
  id: string;
  name: string;
  file: string;
  flakyRate: number;
  rootCause: 'timing' | 'state' | 'network' | 'race_condition' | 'unknown';
  lastFlake: string;
  quarantined: boolean;
  suggestedFix?: string;
}

interface FlakyPattern {
  pattern: string;
  icon: string;
  count: number;
  description: string;
  autoFix: boolean;
}

const mockFlakyTests: FlakyTest[] = [
  { id: '1', name: 'User login completes within timeout', file: 'auth.e2e.ts', flakyRate: 15, rootCause: 'timing', lastFlake: '2 hours ago', quarantined: false, suggestedFix: 'Increase waitFor timeout from 3000ms to 5000ms' },
  { id: '2', name: 'Dashboard data loads correctly', file: 'dashboard.test.tsx', flakyRate: 12, rootCause: 'state', lastFlake: '5 hours ago', quarantined: false, suggestedFix: 'Reset mock store before each test' },
  { id: '3', name: 'API call retries on failure', file: 'api.test.ts', flakyRate: 8, rootCause: 'network', lastFlake: 'Yesterday', quarantined: true, suggestedFix: 'Mock network layer instead of real requests' },
  { id: '4', name: 'Animation completes before next', file: 'modal.test.tsx', flakyRate: 22, rootCause: 'race_condition', lastFlake: '1 hour ago', quarantined: false, suggestedFix: 'Wait for animation end event before assertion' },
  { id: '5', name: 'Form validation shows errors', file: 'form.test.tsx', flakyRate: 5, rootCause: 'timing', lastFlake: 'Last week', quarantined: true },
];

const mockPatterns: FlakyPattern[] = [
  { pattern: 'Timeout Issues', icon: '⏱️', count: 8, description: 'Tests fail due to insufficient wait times', autoFix: true },
  { pattern: 'State Pollution', icon: '🗑️', count: 5, description: 'Shared state between tests causes failures', autoFix: true },
  { pattern: 'Race Conditions', icon: '🏃', count: 4, description: 'Async operations complete in wrong order', autoFix: false },
  { pattern: 'Network Flakes', icon: '🌐', count: 3, description: 'Real network calls cause intermittent failures', autoFix: true },
];

const causeColors: Record<string, string> = {
  timing: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  state: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  network: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  race_condition: 'bg-red-500/10 text-red-500 border-red-500/30',
  unknown: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
};

export default function FlakyTestsPage() {
  const [flakyTests, setFlakyTests] = useState(mockFlakyTests);
  const [patterns] = useState(mockPatterns);

  const toggleQuarantine = (id: string) => {
    setFlakyTests(prev => prev.map(t => 
      t.id === id ? { ...t, quarantined: !t.quarantined } : t
    ));
  };

  const quarantinedCount = flakyTests.filter(t => t.quarantined).length;
  const activeCount = flakyTests.filter(t => !t.quarantined).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Flaky Test Detection
          </h1>
          <p className="text-muted-foreground">Identify, diagnose, and fix unreliable tests</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          🔍 Scan for Flaky Tests
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Flaky Tests</CardDescription>
            <CardTitle className="text-3xl text-amber-500">{flakyTests.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">detected this month</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active (Blocking)</CardDescription>
            <CardTitle className="text-3xl text-red-500">{activeCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">affecting CI</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Quarantined</CardDescription>
            <CardTitle className="text-3xl text-blue-500">{quarantinedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">safely isolated</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Auto-Fixable</CardDescription>
            <CardTitle className="text-3xl text-green-500">{patterns.filter(p => p.autoFix).reduce((s, p) => s + p.count, 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">can be healed</span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">Flaky Tests</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="healing">Auto-Healing</TabsTrigger>
        </TabsList>

        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle>Detected Flaky Tests</CardTitle>
              <CardDescription>Tests with intermittent failures in CI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {flakyTests.map(test => (
                <div key={test.id} className={`p-4 rounded-lg ${test.quarantined ? 'bg-muted/30 opacity-60' : 'bg-amber-500/5 border border-amber-500/30'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${causeColors[test.rootCause]}`}>
                        {test.rootCause.replace('_', ' ')}
                      </span>
                      {test.quarantined && <Badge variant="secondary">Quarantined</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-amber-500">{test.flakyRate}% flaky</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleQuarantine(test.id)}
                      >
                        {test.quarantined ? '🔓 Release' : '🔒 Quarantine'}
                      </Button>
                    </div>
                  </div>
                  <h4 className="font-medium">{test.name}</h4>
                  <p className="text-sm text-muted-foreground">{test.file} • Last flake: {test.lastFlake}</p>
                  {test.suggestedFix && (
                    <div className="mt-2 p-2 rounded bg-green-500/10 border border-green-500/30">
                      <p className="text-sm text-green-500">💡 {test.suggestedFix}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>Flakiness Patterns</CardTitle>
              <CardDescription>Common root causes detected</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {patterns.map((pattern, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{pattern.icon}</span>
                      <h4 className="font-medium">{pattern.pattern}</h4>
                    </div>
                    <Badge variant={pattern.autoFix ? 'default' : 'secondary'}>
                      {pattern.count} tests
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{pattern.description}</p>
                  {pattern.autoFix && (
                    <Button variant="outline" size="sm" className="mt-3">
                      ⚡ Auto-Fix All
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="healing">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Healing Scripts</CardTitle>
              <CardDescription>Automatic fixes for common flaky patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Increase Timeouts', desc: 'Automatically extend waitFor timeouts', tests: 8, ready: true },
                { name: 'Reset State', desc: 'Add beforeEach cleanup for shared state', tests: 5, ready: true },
                { name: 'Mock Network', desc: 'Replace real API calls with mocks', tests: 3, ready: true },
                { name: 'Fix Race Conditions', desc: 'Add proper async handling', tests: 4, ready: false },
              ].map((script, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <h4 className="font-medium">{script.name}</h4>
                    <p className="text-sm text-muted-foreground">{script.desc} • {script.tests} tests</p>
                  </div>
                  <Button variant={script.ready ? 'default' : 'outline'} disabled={!script.ready}>
                    {script.ready ? '⚡ Apply Fix' : 'Coming Soon'}
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
