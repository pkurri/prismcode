'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const testSuites = [
  { name: 'Unit Tests', passed: 245, failed: 2, skipped: 3, coverage: 87 },
  { name: 'Integration Tests', passed: 58, failed: 0, skipped: 1, coverage: 72 },
  { name: 'E2E Tests', passed: 34, failed: 1, skipped: 0, coverage: 65 },
];

const recentRuns = [
  { id: 1, branch: 'main', status: 'passed', duration: '2m 34s', time: '10 min ago' },
  { id: 2, branch: 'feat/auth', status: 'failed', duration: '1m 45s', time: '25 min ago' },
  { id: 3, branch: 'main', status: 'passed', duration: '2m 28s', time: '1 hour ago' },
  { id: 4, branch: 'fix/bug-123', status: 'passed', duration: '2m 12s', time: '2 hours ago' },
];

const flakyTests = [
  { name: 'UserAuth.login should handle timeout', file: 'auth.test.ts', flakyRate: 15 },
  { name: 'API.fetchData should retry on failure', file: 'api.test.ts', flakyRate: 8 },
];

export default function TestsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Intelligence</h1>
          <p className="text-muted-foreground">AI-powered test analysis and generation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Generate Tests</Button>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600">Run All Tests</Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">344</div>
            <p className="text-sm text-green-500">+12 this week</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500">99.1%</div>
            <p className="text-sm text-muted-foreground">3 failing</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-500">81%</div>
            <p className="text-sm text-muted-foreground">+2% from target</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">2m 23s</div>
            <p className="text-sm text-green-500">-15s optimized</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="suites" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="runs">Recent Runs</TabsTrigger>
          <TabsTrigger value="flaky">Flaky Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="suites">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Test Suites</CardTitle>
              <CardDescription>Overview of all test categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testSuites.map((suite) => (
                <div key={suite.name} className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{suite.name}</h3>
                    <Badge variant="secondary">{suite.coverage}% coverage</Badge>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-500">✓ {suite.passed} passed</span>
                    <span className="text-red-500">✗ {suite.failed} failed</span>
                    <span className="text-muted-foreground">○ {suite.skipped} skipped</span>
                  </div>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${(suite.passed / (suite.passed + suite.failed + suite.skipped)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runs">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Recent Test Runs</CardTitle>
              <CardDescription>Latest CI/CD test executions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${run.status === 'passed' ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                    <div>
                      <p className="font-medium">{run.branch}</p>
                      <p className="text-sm text-muted-foreground">{run.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{run.duration}</span>
                    <Badge variant={run.status === 'passed' ? 'secondary' : 'destructive'}>
                      {run.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flaky">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Flaky Test Detection</CardTitle>
              <CardDescription>Tests with inconsistent results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {flakyTests.map((test, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <p className="font-medium">{test.name}</p>
                    <p className="text-sm text-muted-foreground">{test.file}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-500">{test.flakyRate}% flaky</span>
                    <Button size="sm" variant="outline">
                      Investigate
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
