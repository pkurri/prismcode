'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FileRisk {
  file: string;
  riskScore: number;
  factors: string[];
  recentBugs: number;
  complexity: number;
  churn: number;
}

interface PredictedBug {
  id: string;
  file: string;
  function: string;
  probability: number;
  reason: string;
  suggestedAction: string;
}

const mockFileRisks: FileRisk[] = [
  { file: 'src/components/Dashboard.tsx', riskScore: 78, factors: ['High churn', 'Complex logic', 'Many dependencies'], recentBugs: 5, complexity: 42, churn: 89 },
  { file: 'src/api/authentication.ts', riskScore: 72, factors: ['Security-sensitive', 'Recent changes', 'Low coverage'], recentBugs: 3, complexity: 38, churn: 67 },
  { file: 'src/hooks/usePayment.ts', riskScore: 65, factors: ['Business-critical', 'External dependencies'], recentBugs: 2, complexity: 28, churn: 45 },
  { file: 'src/utils/formatter.ts', riskScore: 25, factors: ['Pure functions', 'Well tested'], recentBugs: 0, complexity: 12, churn: 15 },
];

const mockPredictions: PredictedBug[] = [
  { id: '1', file: 'Dashboard.tsx', function: 'handleDataFetch', probability: 82, reason: 'Complex async logic with multiple state updates', suggestedAction: 'Add error boundary and loading states' },
  { id: '2', file: 'authentication.ts', function: 'refreshToken', probability: 68, reason: 'Edge case handling for expired sessions', suggestedAction: 'Add retry logic with exponential backoff' },
  { id: '3', file: 'usePayment.ts', function: 'processPayment', probability: 55, reason: 'External API dependency without timeout', suggestedAction: 'Add timeout and fallback handling' },
];

const riskColors = (score: number) => {
  if (score >= 70) return 'text-red-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-green-500';
};

export default function BugPredictionPage() {
  const [fileRisks] = useState(mockFileRisks);
  const [predictions] = useState(mockPredictions);

  const highRiskCount = fileRisks.filter(f => f.riskScore >= 70).length;
  const avgRisk = Math.round(fileRisks.reduce((s, f) => s + f.riskScore, 0) / fileRisks.length);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Bug Prediction
          </h1>
          <p className="text-muted-foreground">AI-powered risk analysis for your codebase</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          🔮 Analyze Changes
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Files Analyzed</CardDescription>
            <CardTitle className="text-3xl">{fileRisks.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>High Risk</CardDescription>
            <CardTitle className="text-3xl text-red-500">{highRiskCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Risk Score</CardDescription>
            <CardTitle className={`text-3xl ${riskColors(avgRisk)}`}>{avgRisk}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Predictions</CardDescription>
            <CardTitle className="text-3xl">{predictions.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="files" className="space-y-4">
        <TabsList>
          <TabsTrigger value="files">File Risk Analysis</TabsTrigger>
          <TabsTrigger value="predictions">Bug Predictions</TabsTrigger>
          <TabsTrigger value="changes">Pending Changes</TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>File Risk Scores</CardTitle>
              <CardDescription>Ordered by bug likelihood</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {fileRisks.map((file, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium font-mono text-sm">{file.file}</span>
                    <span className={`text-2xl font-bold ${riskColors(file.riskScore)}`}>
                      {file.riskScore}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span>🐛 {file.recentBugs} recent bugs</span>
                    <span>📊 {file.complexity} complexity</span>
                    <span>🔄 {file.churn}% churn</span>
                  </div>
                  <div className="flex gap-2">
                    {file.factors.map((factor, j) => (
                      <Badge key={j} variant="outline" className="text-xs">{factor}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions">
          <Card>
            <CardHeader>
              <CardTitle>Predicted Bugs</CardTitle>
              <CardDescription>Functions likely to have issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {predictions.map(pred => (
                <div key={pred.id} className={`p-4 rounded-lg border ${pred.probability >= 70 ? 'bg-red-500/5 border-red-500/30' : pred.probability >= 50 ? 'bg-amber-500/5 border-amber-500/30' : 'bg-muted/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">{pred.function}()</span>
                      <span className="text-sm text-muted-foreground ml-2">in {pred.file}</span>
                    </div>
                    <Badge variant={pred.probability >= 70 ? 'destructive' : 'secondary'}>
                      {pred.probability}% probability
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{pred.reason}</p>
                  <div className="p-2 rounded bg-green-500/10 border border-green-500/30">
                    <span className="text-sm text-green-500">💡 {pred.suggestedAction}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changes">
          <Card>
            <CardHeader>
              <CardTitle>Analyze Pending Changes</CardTitle>
              <CardDescription>Get risk scores before committing</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12 text-muted-foreground">
              <span className="text-4xl">📝</span>
              <p className="mt-4">No uncommitted changes detected</p>
              <p className="text-sm">Make changes to see risk analysis</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
