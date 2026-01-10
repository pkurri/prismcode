'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const accessibilityScore = 78;

const issues = [
  { type: 'critical', count: 3, description: 'Missing alt text on images' },
  { type: 'serious', count: 8, description: 'Low color contrast' },
  { type: 'moderate', count: 12, description: 'Missing form labels' },
  { type: 'minor', count: 5, description: 'Missing skip links' },
];

const wcagResults = [
  { criterion: '1.1.1 Non-text Content', level: 'A', status: 'partial', issues: 3 },
  { criterion: '1.4.3 Contrast (Minimum)', level: 'AA', status: 'fail', issues: 8 },
  { criterion: '2.1.1 Keyboard', level: 'A', status: 'pass', issues: 0 },
  { criterion: '2.4.4 Link Purpose', level: 'A', status: 'pass', issues: 0 },
  { criterion: '4.1.2 Name, Role, Value', level: 'A', status: 'partial', issues: 5 },
];

export default function AccessibilityPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastFix, setLastFix] = useState<string | null>(null);

  const runScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  const applyFix = (id: string) => {
    setLastFix(id);
    setTimeout(() => setLastFix(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Accessibility
          </h1>
          <p className="text-muted-foreground mt-1">
            WCAG 2.1 AA compliance monitoring and auto-remediation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Screen Reader Simulator</Button>
          <Button
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
            onClick={runScan}
            disabled={isScanning}
          >
            {isScanning ? 'Scanning...' : 'Run Full Scan'}
          </Button>
        </div>
      </div>

      {lastFix && (
        <Card className="bg-green-500/10 border-green-500/50">
          <CardContent className="py-3 flex items-center justify-between">
            <p className="text-sm font-medium text-green-600">
              ✓ Optimization applied for {lastFix}. PR created.
            </p>
            <Button variant="ghost" size="sm" className="text-green-600">
              View PR
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Score Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 col-span-1 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A11y Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-4xl font-bold ${accessibilityScore >= 80 ? 'text-green-500' : accessibilityScore >= 60 ? 'text-amber-500' : 'text-red-500'}`}
            >
              {accessibilityScore}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall Compliance</p>
          </CardContent>
        </Card>

        {issues.slice(0, 3).map((issue) => (
          <Card key={issue.description} className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                {issue.type}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-4xl font-bold ${
                  issue.type === 'critical'
                    ? 'text-red-500'
                    : issue.type === 'serious'
                      ? 'text-amber-500'
                      : 'text-blue-500'
                }`}
              >
                {issue.count}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-1">{issue.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* WCAG Compliance */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">WCAG 2.1 Audit Results</CardTitle>
          <CardDescription>Systematic evaluation of success criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {wcagResults.map((result, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl border bg-muted/20 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-3 w-3 rounded-full ${
                    result.status === 'pass'
                      ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                      : result.status === 'partial'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  }`}
                />
                <div>
                  <p className="font-semibold text-sm">{result.criterion}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] h-4">
                      Level {result.level}
                    </Badge>
                    {result.issues > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {result.issues} issues detected
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    result.status === 'pass'
                      ? 'secondary'
                      : result.status === 'partial'
                        ? 'default'
                        : 'destructive'
                  }
                  className="text-xs"
                >
                  {result.status}
                </Badge>
                {result.issues > 0 && (
                  <Button size="sm" variant="outline" onClick={() => applyFix(result.criterion)}>
                    Auto-fix
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Remediation Center</CardTitle>
          <CardDescription>Rapidly fix common accessibility bottlenecks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              variant="outline"
              className="justify-start h-auto py-5 px-6 border-l-4 border-l-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/20"
              onClick={() => applyFix('Alt Text')}
            >
              <div className="text-left">
                <p className="font-bold text-sm">Add Missing Alt Text</p>
                <p className="text-xs text-muted-foreground mt-1">
                  3 images missing descriptive attributes
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-5 px-6 border-l-4 border-l-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20"
              onClick={() => applyFix('Contrast')}
            >
              <div className="text-left">
                <p className="font-bold text-sm">Fix Color Contrast</p>
                <p className="text-xs text-muted-foreground mt-1">
                  8 text elements failing minimum ratios
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-5 px-6 border-l-4 border-l-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              onClick={() => applyFix('Labels')}
            >
              <div className="text-left">
                <p className="font-bold text-sm">Add Form Labels</p>
                <p className="text-xs text-muted-foreground mt-1">
                  12 inputs missing explicit &lt;label&gt; tags
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-5 px-6 border-l-4 border-l-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
              onClick={() => applyFix('Skip Links')}
            >
              <div className="text-left">
                <p className="font-bold text-sm">Inject Skip Navigation</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Improve keyboard accessibility score by 15%
                </p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
