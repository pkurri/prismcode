'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RootCauseAnalysis {
  id: string;
  error: string;
  stackTrace: string[];
  rootCause: string;
  confidence: number;
  relatedFiles: string[];
  blastRadius: 'low' | 'medium' | 'high';
  suggestedFixes: string[];
}

interface RecentError {
  id: string;
  message: string;
  file: string;
  line: number;
  occurrences: number;
  lastSeen: string;
  analyzed: boolean;
}

const mockAnalysis: RootCauseAnalysis = {
  id: '1',
  error: 'TypeError: Cannot read property "id" of undefined',
  stackTrace: [
    'at UserProfile.render (UserProfile.tsx:45)',
    'at Dashboard.componentDidMount (Dashboard.tsx:23)',
    'at processTickAndRejections (internal/process/task_queues.js:95:5)',
  ],
  rootCause: 'User data is being accessed before the async fetch completes. The useEffect hook lacks proper loading state handling.',
  confidence: 92,
  relatedFiles: ['src/components/UserProfile.tsx', 'src/hooks/useUser.ts', 'src/api/users.ts'],
  blastRadius: 'medium',
  suggestedFixes: [
    'Add loading state check before accessing user properties',
    'Use optional chaining (user?.id)',
    'Add error boundary to catch render errors',
  ],
};

const mockErrors: RecentError[] = [
  { id: '1', message: 'Cannot read property "id" of undefined', file: 'UserProfile.tsx', line: 45, occurrences: 23, lastSeen: '5 mins ago', analyzed: true },
  { id: '2', message: 'Network request failed', file: 'api.ts', line: 78, occurrences: 12, lastSeen: '15 mins ago', analyzed: false },
  { id: '3', message: 'Maximum update depth exceeded', file: 'Dashboard.tsx', line: 112, occurrences: 5, lastSeen: '1 hour ago', analyzed: false },
  { id: '4', message: 'Invalid hook call', file: 'Modal.tsx', line: 23, occurrences: 3, lastSeen: '2 hours ago', analyzed: true },
];

const blastRadiusColors: Record<string, string> = {
  low: 'bg-green-500/10 text-green-500 border-green-500/30',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  high: 'bg-red-500/10 text-red-500 border-red-500/30',
};

export default function RootCauseAnalysisPage() {
  const [analysis, setAnalysis] = useState<RootCauseAnalysis | null>(null);
  const [errors] = useState(mockErrors);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeError = (errorId: string) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Root Cause Analysis
        </h1>
        <p className="text-muted-foreground">AI-powered error diagnosis and debugging</p>
      </div>

      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Recent Errors</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="paste">Paste Stack Trace</TabsTrigger>
        </TabsList>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>Click to analyze root cause</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {errors.map(error => (
                <div key={error.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50" onClick={() => analyzeError(error.id)}>
                  <div>
                    <p className="font-medium text-red-500">{error.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {error.file}:{error.line} • {error.occurrences} occurrences • {error.lastSeen}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {error.analyzed && <Badge variant="secondary">Analyzed</Badge>}
                    <Button variant="outline" size="sm">🔍 Analyze</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          {isAnalyzing ? (
            <Card>
              <CardContent className="text-center py-16">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="mt-4">Analyzing error with AI...</p>
              </CardContent>
            </Card>
          ) : analysis ? (
            <div className="space-y-4">
              {/* Error Summary */}
              <Card className="border-red-500/30 bg-red-500/5">
                <CardHeader>
                  <CardTitle className="text-red-500">Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-lg">{analysis.error}</code>
                </CardContent>
              </Card>

              {/* Root Cause */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Root Cause</CardTitle>
                    <Badge variant="outline" className={blastRadiusColors[analysis.blastRadius]}>
                      {analysis.blastRadius} blast radius
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{analysis.rootCause}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Confidence:</span>
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${analysis.confidence}%` }} />
                    </div>
                    <span className="text-sm">{analysis.confidence}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Stack Trace */}
              <Card>
                <CardHeader>
                  <CardTitle>Stack Trace</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded p-4 font-mono text-sm space-y-1">
                    {analysis.stackTrace.map((line, i) => (
                      <p key={i} className={i === 0 ? 'text-red-500' : 'text-muted-foreground'}>{line}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Suggested Fixes */}
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Fixes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {analysis.suggestedFixes.map((fix, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/30">
                      <span className="text-green-500">💡</span>
                      <span>{fix}</span>
                    </div>
                  ))}
                  <Button className="w-full mt-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                    🤖 Generate Auto-Fix PR
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-16 text-muted-foreground">
                <span className="text-4xl">🔍</span>
                <p className="mt-4">Select an error to analyze</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="paste">
          <Card>
            <CardHeader>
              <CardTitle>Paste Stack Trace</CardTitle>
              <CardDescription>Paste an error stack trace for analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                placeholder="Paste your stack trace here..."
                className="w-full h-48 p-4 rounded-lg border border-border bg-background font-mono text-sm"
              />
              <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                🔍 Analyze Stack Trace
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
