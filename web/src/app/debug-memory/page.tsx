'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DebugPattern {
  id: string;
  name: string;
  category: 'null_reference' | 'async' | 'state' | 'memory' | 'type';
  occurrences: number;
  lastSeen: string;
  solutions: string[];
  projects: string[];
}

interface DebugSession {
  id: string;
  error: string;
  file: string;
  resolution: string;
  duration: string;
  timestamp: string;
}

const mockPatterns: DebugPattern[] = [
  {
    id: '1',
    name: 'Undefined Property Access',
    category: 'null_reference',
    occurrences: 45,
    lastSeen: '2 hours ago',
    solutions: ['Use optional chaining', 'Add null check', 'Use default values'],
    projects: ['web-app', 'mobile-app', 'api-server'],
  },
  {
    id: '2',
    name: 'Unhandled Promise Rejection',
    category: 'async',
    occurrences: 32,
    lastSeen: '1 day ago',
    solutions: ['Add try-catch', 'Use .catch()', 'Implement error boundary'],
    projects: ['web-app', 'api-server'],
  },
  {
    id: '3',
    name: 'React State Update After Unmount',
    category: 'state',
    occurrences: 18,
    lastSeen: '3 days ago',
    solutions: ['Add cleanup in useEffect', 'Use AbortController', 'Check mounted state'],
    projects: ['web-app'],
  },
  {
    id: '4',
    name: 'Memory Leak in Event Listeners',
    category: 'memory',
    occurrences: 12,
    lastSeen: '1 week ago',
    solutions: ['Remove listeners on cleanup', 'Use weak references', 'Dispose timers'],
    projects: ['web-app', 'desktop-app'],
  },
];

const mockSessions: DebugSession[] = [
  { id: '1', error: 'Cannot read property "id" of undefined', file: 'UserProfile.tsx', resolution: 'Added optional chaining', duration: '15m', timestamp: 'Today' },
  { id: '2', error: 'Maximum update depth exceeded', file: 'Dashboard.tsx', resolution: 'Fixed useEffect dependency', duration: '25m', timestamp: 'Yesterday' },
  { id: '3', error: 'Network request failed', file: 'api.ts', resolution: 'Added retry logic', duration: '10m', timestamp: '3 days ago' },
];

const categoryColors: Record<string, string> = {
  null_reference: 'bg-red-500/10 text-red-500',
  async: 'bg-blue-500/10 text-blue-500',
  state: 'bg-purple-500/10 text-purple-500',
  memory: 'bg-amber-500/10 text-amber-500',
  type: 'bg-green-500/10 text-green-500',
};

export default function DebugMemoryPage() {
  const [patterns] = useState(mockPatterns);
  const [sessions] = useState(mockSessions);

  const totalOccurrences = patterns.reduce((s, p) => s + p.occurrences, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Debugging Memory
          </h1>
          <p className="text-muted-foreground">Learn from past debugging sessions</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          📚 Export Playbook
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Patterns Identified</CardDescription>
            <CardTitle className="text-3xl">{patterns.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Occurrences</CardDescription>
            <CardTitle className="text-3xl">{totalOccurrences}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sessions Logged</CardDescription>
            <CardTitle className="text-3xl">{sessions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Projects Connected</CardDescription>
            <CardTitle className="text-3xl">4</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patterns">Bug Patterns</TabsTrigger>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
          <TabsTrigger value="playbooks">Team Playbooks</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Patterns</CardTitle>
              <CardDescription>Most common debugging scenarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {patterns.map(pattern => (
                <div key={pattern.id} className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={categoryColors[pattern.category]}>
                        {pattern.category.replace('_', ' ')}
                      </Badge>
                      <span className="font-medium">{pattern.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{pattern.occurrences} times</Badge>
                      <span className="text-sm text-muted-foreground">{pattern.lastSeen}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Common Solutions:</p>
                    <div className="flex gap-2 flex-wrap">
                      {pattern.solutions.map((sol, i) => (
                        <Badge key={i} variant="secondary">{sol}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    Projects: {pattern.projects.join(', ')}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Debug Sessions</CardTitle>
              <CardDescription>History of resolved issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-red-500">{session.error}</p>
                    <p className="text-sm text-muted-foreground font-mono">{session.file}</p>
                    <p className="text-sm text-green-500 mt-1">✓ {session.resolution}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{session.duration}</p>
                    <p className="text-xs text-muted-foreground">{session.timestamp}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playbooks">
          <Card>
            <CardHeader>
              <CardTitle>Team Playbooks</CardTitle>
              <CardDescription>Documented debugging guides</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Null Reference Errors', steps: 5, contributors: 3 },
                { name: 'Async/Await Debugging', steps: 8, contributors: 2 },
                { name: 'React State Issues', steps: 6, contributors: 4 },
              ].map((playbook, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">📖 {playbook.name}</p>
                    <p className="text-sm text-muted-foreground">{playbook.steps} steps • {playbook.contributors} contributors</p>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
