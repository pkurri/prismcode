'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const nodes = [
  { id: 'n1', label: 'Authentication', connections: ['n2', 'n3'], expertise: ['OAuth', 'JWT'] },
  { id: 'n2', label: 'User Service', connections: ['n4'], expertise: ['CRUD', 'Profiles'] },
  { id: 'n3', label: 'API Gateway', connections: ['n2', 'n4', 'n5'], expertise: ['Routing', 'Rate Limiting'] },
  { id: 'n4', label: 'Database', connections: [], expertise: ['PostgreSQL', 'Queries'] },
  { id: 'n5', label: 'Cache', connections: ['n4'], expertise: ['Redis', 'Sessions'] },
];

export default function KnowledgeGraphPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Team Knowledge Graph
          </h1>
          <p className="text-muted-foreground">Visualize team expertise and project knowledge</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">+ Add Knowledge</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Knowledge Network</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center relative">
            {nodes.map((node, i) => (
              <div key={node.id} className="absolute p-3 bg-background border rounded-lg shadow-sm" style={{ left: `${20 + i * 18}%`, top: `${30 + (i % 2) * 30}%` }}>
                <p className="font-medium text-sm">{node.label}</p>
                <div className="flex gap-1 mt-1">{node.expertise.slice(0, 2).map(e => <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>{nodes.length}</CardTitle><CardDescription>Knowledge Nodes</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>12</CardTitle><CardDescription>Team Members</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle>48</CardTitle><CardDescription>Expertise Areas</CardDescription></CardHeader></Card>
      </div>
    </div>
  );
}
