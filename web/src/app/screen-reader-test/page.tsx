'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ScreenReaderTest {
  id: string;
  page: string;
  reader: 'nvda' | 'voiceover' | 'jaws';
  status: 'passed' | 'failed' | 'warning';
  issues: ScreenReaderIssue[];
  duration: string;
}

interface ScreenReaderIssue {
  type: 'reading_order' | 'focus' | 'announcement' | 'navigation';
  element: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
}

const mockTests: ScreenReaderTest[] = [
  {
    id: '1',
    page: '/dashboard',
    reader: 'nvda',
    status: 'warning',
    issues: [
      { type: 'reading_order', element: '.sidebar', description: 'Sidebar content announced before main content', severity: 'major' },
      { type: 'announcement', element: '<button class="icon">', description: 'Button has no accessible name', severity: 'critical' },
    ],
    duration: '12s',
  },
  {
    id: '2',
    page: '/settings',
    reader: 'voiceover',
    status: 'passed',
    issues: [],
    duration: '8s',
  },
  {
    id: '3',
    page: '/checkout',
    reader: 'jaws',
    status: 'failed',
    issues: [
      { type: 'focus', element: '.modal', description: 'Focus not trapped in modal dialog', severity: 'critical' },
      { type: 'navigation', element: 'form', description: 'Form fields not in logical tab order', severity: 'major' },
    ],
    duration: '15s',
  },
];

const readerIcons: Record<string, string> = {
  nvda: '🔊',
  voiceover: '🍎',
  jaws: '🦈',
};

const statusColors: Record<string, string> = {
  passed: 'bg-green-500',
  failed: 'bg-red-500',
  warning: 'bg-amber-500',
};

const issueTypeIcons: Record<string, string> = {
  reading_order: '📖',
  focus: '🎯',
  announcement: '📢',
  navigation: '🧭',
};

export default function ScreenReaderTestPage() {
  const [tests] = useState(mockTests);
  const [isRunning, setIsRunning] = useState(false);

  const passedCount = tests.filter(t => t.status === 'passed').length;
  const totalIssues = tests.reduce((s, t) => s + t.issues.length, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Screen Reader Testing
          </h1>
          <p className="text-muted-foreground">Simulate NVDA, VoiceOver, and JAWS</p>
        </div>
        <Button onClick={() => { setIsRunning(true); setTimeout(() => setIsRunning(false), 2000); }} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          {isRunning ? '🔄 Running...' : '▶️ Run Tests'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tests</CardDescription>
            <CardTitle className="text-3xl">{tests.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Passed</CardDescription>
            <CardTitle className="text-3xl text-green-500">{passedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Issues Found</CardDescription>
            <CardTitle className="text-3xl text-amber-500">{totalIssues}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Coverage</CardDescription>
            <CardTitle className="text-3xl">85%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="readers">Screen Readers</TabsTrigger>
          <TabsTrigger value="flows">Navigation Flows</TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>Screen reader simulation results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tests.map(test => (
                <div key={test.id} className={`p-4 rounded-lg ${test.status === 'passed' ? 'bg-green-500/5 border border-green-500/30' : test.status === 'failed' ? 'bg-red-500/5 border border-red-500/30' : 'bg-amber-500/5 border border-amber-500/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${statusColors[test.status]}`} />
                      <span className="font-medium font-mono">{test.page}</span>
                      <Badge variant="outline">
                        {readerIcons[test.reader]} {test.reader.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{test.duration}</span>
                  </div>
                  
                  {test.issues.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {test.issues.map((issue, i) => (
                        <div key={i} className="p-3 rounded bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{issueTypeIcons[issue.type]}</span>
                            <Badge variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}>
                              {issue.severity}
                            </Badge>
                            <code className="text-xs">{issue.element}</code>
                          </div>
                          <p className="text-sm text-muted-foreground">{issue.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="readers">
          <Card>
            <CardHeader>
              <CardTitle>Supported Screen Readers</CardTitle>
              <CardDescription>Simulate behavior of popular assistive technology</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {[
                { name: 'NVDA', icon: '🔊', os: 'Windows', status: 'active' },
                { name: 'VoiceOver', icon: '🍎', os: 'macOS/iOS', status: 'active' },
                { name: 'JAWS', icon: '🦈', os: 'Windows', status: 'active' },
              ].map((reader, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30 text-center">
                  <span className="text-4xl">{reader.icon}</span>
                  <h3 className="font-bold mt-2">{reader.name}</h3>
                  <p className="text-sm text-muted-foreground">{reader.os}</p>
                  <Badge variant="default" className="mt-2 bg-green-500">{reader.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flows">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Flows</CardTitle>
              <CardDescription>Keyboard navigation test scenarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Login Flow', steps: 5, status: 'passed' },
                { name: 'Checkout Process', steps: 8, status: 'warning' },
                { name: 'Form Submission', steps: 6, status: 'passed' },
                { name: 'Modal Dialogs', steps: 4, status: 'failed' },
              ].map((flow, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{flow.name}</p>
                    <p className="text-sm text-muted-foreground">{flow.steps} steps</p>
                  </div>
                  <Badge variant={flow.status === 'passed' ? 'default' : flow.status === 'failed' ? 'destructive' : 'secondary'}>
                    {flow.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
