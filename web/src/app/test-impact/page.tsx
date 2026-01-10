'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TestImpact {
  testName: string;
  testFile: string;
  impactScore: number;
  affectedBy: string[];
  estimatedDuration: number;
  lastResult: 'pass' | 'fail' | 'skip';
}

interface ChangeSet {
  file: string;
  linesChanged: number;
  affectedTests: number;
}

const mockChanges: ChangeSet[] = [
  { file: 'src/components/Dashboard.tsx', linesChanged: 45, affectedTests: 8 },
  { file: 'src/lib/api.ts', linesChanged: 23, affectedTests: 15 },
  { file: 'src/hooks/useAuth.ts', linesChanged: 12, affectedTests: 6 },
];

const mockImpactedTests: TestImpact[] = [
  { testName: 'Dashboard renders correctly', testFile: 'Dashboard.test.tsx', impactScore: 95, affectedBy: ['Dashboard.tsx'], estimatedDuration: 1.2, lastResult: 'pass' },
  { testName: 'API client handles errors', testFile: 'api.test.ts', impactScore: 88, affectedBy: ['api.ts'], estimatedDuration: 0.8, lastResult: 'pass' },
  { testName: 'Auth hook redirects unauthorized', testFile: 'useAuth.test.ts', impactScore: 92, affectedBy: ['useAuth.ts'], estimatedDuration: 0.5, lastResult: 'fail' },
  { testName: 'Dashboard fetches data', testFile: 'Dashboard.test.tsx', impactScore: 85, affectedBy: ['Dashboard.tsx', 'api.ts'], estimatedDuration: 2.1, lastResult: 'pass' },
  { testName: 'Login flow completes', testFile: 'auth.e2e.ts', impactScore: 78, affectedBy: ['useAuth.ts'], estimatedDuration: 15.0, lastResult: 'pass' },
  { testName: 'API retry logic works', testFile: 'api.test.ts', impactScore: 72, affectedBy: ['api.ts'], estimatedDuration: 1.5, lastResult: 'pass' },
];

const mockStats = {
  totalTests: 344,
  impactedTests: 29,
  skippedTests: 315,
  estimatedTime: '2m 15s',
  fullSuiteTime: '12m 30s',
  timeSaved: '10m 15s',
  savingsPercent: 82,
};

export default function TestImpactPage() {
  const [changes] = useState(mockChanges);
  const [impactedTests] = useState(mockImpactedTests);
  const [runningAnalysis, setRunningAnalysis] = useState(false);

  const analyzeImpact = () => {
    setRunningAnalysis(true);
    setTimeout(() => setRunningAnalysis(false), 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Test Impact Analysis
          </h1>
          <p className="text-muted-foreground">Run only the tests affected by your changes</p>
        </div>
        <Button onClick={analyzeImpact} disabled={runningAnalysis} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          {runningAnalysis ? '🔄 Analyzing...' : '🔍 Analyze Changes'}
        </Button>
      </div>

      {/* Savings Summary */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{mockStats.savingsPercent}%</p>
              <p className="text-sm text-muted-foreground">Tests Skipped</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{mockStats.impactedTests}</p>
              <p className="text-sm text-muted-foreground">Impacted Tests</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{mockStats.estimatedTime}</p>
              <p className="text-sm text-muted-foreground">Estimated Time</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{mockStats.timeSaved}</p>
              <p className="text-sm text-muted-foreground">Time Saved</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="impacted" className="space-y-4">
        <TabsList>
          <TabsTrigger value="impacted">Impacted Tests</TabsTrigger>
          <TabsTrigger value="changes">Changed Files</TabsTrigger>
          <TabsTrigger value="graph">Dependency Graph</TabsTrigger>
        </TabsList>

        <TabsContent value="impacted">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tests to Run</CardTitle>
                  <CardDescription>Sorted by likelihood to fail</CardDescription>
                </div>
                <Button variant="outline">▶️ Run Impacted Only</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {impactedTests.map((test, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${test.lastResult === 'pass' ? 'bg-green-500' : test.lastResult === 'fail' ? 'bg-red-500' : 'bg-gray-400'}`} />
                    <div>
                      <p className="font-medium">{test.testName}</p>
                      <p className="text-xs text-muted-foreground">{test.testFile}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline" className={`${test.impactScore > 85 ? 'text-red-500 border-red-500/30' : test.impactScore > 70 ? 'text-amber-500 border-amber-500/30' : 'text-blue-500 border-blue-500/30'}`}>
                      {test.impactScore}% impact
                    </Badge>
                    <span className="text-muted-foreground">{test.estimatedDuration}s</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changes">
          <Card>
            <CardHeader>
              <CardTitle>Changed Files</CardTitle>
              <CardDescription>Files modified in this branch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {changes.map((change, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium font-mono text-sm">{change.file}</p>
                    <p className="text-xs text-muted-foreground">{change.linesChanged} lines changed</p>
                  </div>
                  <Badge variant="secondary">{change.affectedTests} tests affected</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="graph">
          <Card>
            <CardHeader>
              <CardTitle>Test Dependency Graph</CardTitle>
              <CardDescription>Visualize how tests depend on source files</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <span className="text-6xl">🕸️</span>
                <p className="mt-4 text-muted-foreground">Interactive graph visualization coming soon</p>
                <p className="text-sm text-muted-foreground">Shows connections between source files and test files</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
