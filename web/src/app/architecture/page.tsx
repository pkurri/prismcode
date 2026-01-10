'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ArchComponent {
  id: string;
  name: string;
  type: 'service' | 'database' | 'queue' | 'frontend' | 'api';
  inDiagram: boolean;
  inCode: boolean;
  connections: string[];
}

interface DriftIssue {
  id: string;
  type: 'missing_component' | 'extra_component' | 'wrong_connection' | 'missing_connection';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}

const mockComponents: ArchComponent[] = [
  { id: '1', name: 'API Gateway', type: 'api', inDiagram: true, inCode: true, connections: ['Auth Service', 'User Service'] },
  { id: '2', name: 'Auth Service', type: 'service', inDiagram: true, inCode: true, connections: ['Database', 'Redis'] },
  { id: '3', name: 'User Service', type: 'service', inDiagram: true, inCode: true, connections: ['Database'] },
  { id: '4', name: 'Database', type: 'database', inDiagram: true, inCode: true, connections: [] },
  { id: '5', name: 'Redis', type: 'database', inDiagram: true, inCode: true, connections: [] },
  { id: '6', name: 'Message Queue', type: 'queue', inDiagram: true, inCode: false, connections: [] },
  { id: '7', name: 'Analytics Service', type: 'service', inDiagram: false, inCode: true, connections: ['Database'] },
];

const mockDriftIssues: DriftIssue[] = [
  { id: '1', type: 'missing_component', severity: 'high', description: 'Message Queue defined in diagram but not found in code', suggestion: 'Implement RabbitMQ or SQS integration' },
  { id: '2', type: 'extra_component', severity: 'medium', description: 'Analytics Service exists in code but not in diagram', suggestion: 'Update architecture diagram to include Analytics Service' },
  { id: '3', type: 'missing_connection', severity: 'low', description: 'User Service should connect to Redis per diagram', suggestion: 'Add Redis caching to User Service' },
];

const typeIcons: Record<string, string> = {
  service: '🔧',
  database: '🗄️',
  queue: '📬',
  frontend: '🖥️',
  api: '🌐',
};

const severityColors: Record<string, string> = {
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  high: 'bg-red-500/10 text-red-500 border-red-500/30',
};

export default function ArchitecturePage() {
  const [components] = useState(mockComponents);
  const [driftIssues] = useState(mockDriftIssues);
  const [diagramSource, setDiagramSource] = useState('mermaid');

  const inSync = components.filter(c => c.inDiagram && c.inCode).length;
  const outOfSync = components.filter(c => c.inDiagram !== c.inCode).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Architecture Validation
          </h1>
          <p className="text-muted-foreground">Compare code structure against architecture diagrams</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📤 Upload Diagram</Button>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            🔄 Validate
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Components</CardDescription>
            <CardTitle className="text-3xl">{components.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Sync</CardDescription>
            <CardTitle className="text-3xl text-green-500">{inSync}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Drift Issues</CardDescription>
            <CardTitle className="text-3xl text-amber-500">{outOfSync}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sync Score</CardDescription>
            <CardTitle className="text-3xl">{Math.round((inSync / components.length) * 100)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="validation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="generate">Generate Diagram</TabsTrigger>
        </TabsList>

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle>Architectural Drift</CardTitle>
              <CardDescription>Differences between diagram and implementation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {driftIssues.map(issue => (
                <div key={issue.id} className={`p-4 rounded-lg border ${severityColors[issue.severity]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className={severityColors[issue.severity]}>
                      {issue.severity} • {issue.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="font-medium">{issue.description}</p>
                  <p className="text-sm text-muted-foreground mt-1">💡 {issue.suggestion}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components">
          <Card>
            <CardHeader>
              <CardTitle>Component Mapping</CardTitle>
              <CardDescription>Diagram vs Code structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {components.map(comp => (
                <div key={comp.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  comp.inDiagram && comp.inCode ? 'bg-green-500/5 border border-green-500/30' :
                  !comp.inDiagram && comp.inCode ? 'bg-amber-500/5 border border-amber-500/30' :
                  'bg-red-500/5 border border-red-500/30'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{typeIcons[comp.type]}</span>
                    <div>
                      <p className="font-medium">{comp.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Connects to: {comp.connections.length > 0 ? comp.connections.join(', ') : 'none'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={comp.inDiagram ? 'default' : 'secondary'}>
                      {comp.inDiagram ? '✓ Diagram' : '✗ Diagram'}
                    </Badge>
                    <Badge variant={comp.inCode ? 'default' : 'secondary'}>
                      {comp.inCode ? '✓ Code' : '✗ Code'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Generate from Code</CardTitle>
              <CardDescription>Create architecture diagram from your codebase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {['mermaid', 'plantuml', 'c4'].map(format => (
                  <Button
                    key={format}
                    variant={diagramSource === format ? 'default' : 'outline'}
                    onClick={() => setDiagramSource(format)}
                    className="capitalize"
                  >
                    {format}
                  </Button>
                ))}
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <pre className="text-sm font-mono overflow-x-auto">
{`graph TD
  A[API Gateway] --> B[Auth Service]
  A --> C[User Service]
  B --> D[(Database)]
  B --> E[(Redis)]
  C --> D
  F[Analytics Service] --> D
`}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">📋 Copy</Button>
                <Button variant="outline">📥 Download</Button>
                <Button>📊 Visualize</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
