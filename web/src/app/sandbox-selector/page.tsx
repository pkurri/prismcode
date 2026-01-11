'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const sandboxes = [
  { id: 'sb-1', name: 'React Sandbox', runtime: 'Node 20', status: 'running', port: 3001 },
  { id: 'sb-2', name: 'Python FastAPI', runtime: 'Python 3.11', status: 'stopped', port: 8000 },
  { id: 'sb-3', name: 'Go Service', runtime: 'Go 1.21', status: 'running', port: 8080 },
];

export default function SandboxSelectorPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Sandbox Environments
          </h1>
          <p className="text-muted-foreground">Select and manage sandbox environments</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          + Create Sandbox
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="running">Running</TabsTrigger>
          <TabsTrigger value="stopped">Stopped</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid gap-4 md:grid-cols-3">
            {sandboxes.map(sb => (
              <Card key={sb.id} className={`cursor-pointer ${selected === sb.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelected(sb.id)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{sb.name}</CardTitle>
                    <Badge variant={sb.status === 'running' ? 'default' : 'secondary'}>{sb.status}</Badge>
                  </div>
                  <CardDescription>{sb.runtime}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Port: {sb.port}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
