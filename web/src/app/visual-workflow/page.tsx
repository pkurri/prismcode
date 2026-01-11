'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const workflowNodes = [
  { id: 'start', name: 'Start', type: 'trigger', x: 50, y: 100 },
  { id: 'fetch', name: 'Fetch Data', type: 'action', x: 200, y: 100 },
  { id: 'process', name: 'Process', type: 'action', x: 350, y: 100 },
  { id: 'end', name: 'End', type: 'output', x: 500, y: 100 },
];

export default function VisualWorkflowBuilderPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Visual Workflow Builder
          </h1>
          <p className="text-muted-foreground">Design automation workflows visually</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Save</Button>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">▶️ Run</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Nodes</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {['Trigger', 'Action', 'Condition', 'Loop', 'Output'].map(n => (
              <div key={n} className="p-2 bg-muted rounded cursor-move text-sm">{n}</div>
            ))}
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader><CardTitle>Canvas</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/30 rounded-lg relative border-2 border-dashed">
              {workflowNodes.map((node, i) => (
                <div key={node.id} className="absolute p-3 bg-background border rounded-lg shadow-sm" style={{ left: node.x, top: node.y }}>
                  <Badge variant="secondary" className="text-xs mb-1">{node.type}</Badge>
                  <p className="text-sm font-medium">{node.name}</p>
                </div>
              ))}
              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {workflowNodes.slice(0, -1).map((node, i) => (
                  <line key={i} x1={node.x + 80} y1={node.y + 30} x2={workflowNodes[i + 1].x} y2={workflowNodes[i + 1].y + 30} stroke="currentColor" strokeOpacity={0.3} strokeWidth={2} />
                ))}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
