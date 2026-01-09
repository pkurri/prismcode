'use client';

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
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accessibility</h1>
          <p className="text-muted-foreground">WCAG compliance and accessibility scanning</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Screen Reader Test</Button>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600">Run Full Scan</Button>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">A11y Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-4xl font-bold ${accessibilityScore >= 80 ? 'text-green-500' : accessibilityScore >= 60 ? 'text-amber-500' : 'text-red-500'}`}
            >
              {accessibilityScore}%
            </div>
            <p className="text-sm text-muted-foreground">WCAG 2.1 AA</p>
          </CardContent>
        </Card>

        {issues.slice(0, 3).map((issue) => (
          <Card key={issue.type} className="border-border/50">
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
              <p className="text-sm text-muted-foreground truncate">{issue.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* WCAG Compliance */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>WCAG 2.1 Compliance</CardTitle>
          <CardDescription>Success criteria evaluation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {wcagResults.map((result, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-4">
                <div
                  className={`h-3 w-3 rounded-full ${
                    result.status === 'pass'
                      ? 'bg-green-500'
                      : result.status === 'partial'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                  }`}
                />
                <div>
                  <p className="font-medium">{result.criterion}</p>
                  <Badge variant="outline" className="mt-1">
                    Level {result.level}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {result.issues > 0 && (
                  <span className="text-sm text-muted-foreground">{result.issues} issues</span>
                )}
                <Badge
                  variant={
                    result.status === 'pass'
                      ? 'secondary'
                      : result.status === 'partial'
                        ? 'default'
                        : 'destructive'
                  }
                >
                  {result.status}
                </Badge>
                {result.issues > 0 && (
                  <Button size="sm" variant="outline">
                    Fix
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common accessibility fixes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-medium">Add Missing Alt Text</p>
                <p className="text-sm text-muted-foreground">3 images need descriptions</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-medium">Fix Color Contrast</p>
                <p className="text-sm text-muted-foreground">8 elements below 4.5:1 ratio</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-medium">Add Form Labels</p>
                <p className="text-sm text-muted-foreground">12 inputs missing labels</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-4">
              <div className="text-left">
                <p className="font-medium">Add Skip Links</p>
                <p className="text-sm text-muted-foreground">Improve keyboard navigation</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
