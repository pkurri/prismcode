'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const analysisResults = {
  score: 87,
  issues: [
    { type: 'error', message: 'Possible null reference', file: 'src/utils/api.ts', line: 45 },
    {
      type: 'warning',
      message: "Unused variable 'temp'",
      file: 'src/components/Form.tsx',
      line: 23,
    },
    { type: 'warning', message: 'Missing error boundary', file: 'src/app/page.tsx', line: 1 },
    { type: 'info', message: 'Consider memoization', file: 'src/hooks/useData.ts', line: 12 },
  ],
  complexity: [
    { file: 'src/utils/parser.ts', score: 24, status: 'high' },
    { file: 'src/components/Table.tsx', score: 18, status: 'medium' },
    { file: 'src/api/handler.ts', score: 15, status: 'medium' },
  ],
  dependencies: [
    { name: 'lodash', version: '4.17.21', status: 'ok' },
    { name: 'axios', version: '1.5.0', status: 'update', newVersion: '1.6.2' },
    { name: 'moment', version: '2.29.4', status: 'deprecated', suggestion: 'Use date-fns' },
  ],
};

export default function AnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Code Analysis</h1>
          <p className="text-muted-foreground">Deep analysis of your codebase quality and health</p>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-violet-600 to-purple-600"
        >
          {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </div>

      {/* Score Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quality Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500">{analysisResults.score}%</div>
            <p className="text-sm text-muted-foreground">+3% from last week</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-500">
              {analysisResults.issues.filter((i) => i.type === 'error').length}
            </div>
            <p className="text-sm text-muted-foreground">Critical issues</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-amber-500">
              {analysisResults.issues.filter((i) => i.type === 'warning').length}
            </div>
            <p className="text-sm text-muted-foreground">Should address</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-500">
              {analysisResults.issues.filter((i) => i.type === 'info').length}
            </div>
            <p className="text-sm text-muted-foreground">Improvements</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="complexity">Complexity</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
        </TabsList>

        <TabsContent value="issues">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Detected Issues</CardTitle>
              <CardDescription>Problems found in your codebase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysisResults.issues.map((issue, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        issue.type === 'error'
                          ? 'destructive'
                          : issue.type === 'warning'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {issue.type}
                    </Badge>
                    <div>
                      <p className="font-medium">{issue.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {issue.file}:{issue.line}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Fix
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complexity">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Code Complexity</CardTitle>
              <CardDescription>Files with high cyclomatic complexity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysisResults.complexity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <p className="font-medium">{item.file}</p>
                    <p className="text-sm text-muted-foreground">Complexity score: {item.score}</p>
                  </div>
                  <Badge variant={item.status === 'high' ? 'destructive' : 'secondary'}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dependencies">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Dependency Health</CardTitle>
              <CardDescription>Status of your project dependencies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysisResults.dependencies.map((dep, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{dep.name}</p>
                      <p className="text-sm text-muted-foreground">v{dep.version}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dep.status === 'update' && (
                      <span className="text-sm text-muted-foreground">→ v{dep.newVersion}</span>
                    )}
                    {dep.status === 'deprecated' && (
                      <span className="text-sm text-amber-500">{dep.suggestion}</span>
                    )}
                    <Badge
                      variant={
                        dep.status === 'ok'
                          ? 'secondary'
                          : dep.status === 'deprecated'
                            ? 'destructive'
                            : 'default'
                      }
                    >
                      {dep.status}
                    </Badge>
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
