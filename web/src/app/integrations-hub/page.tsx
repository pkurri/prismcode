'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const integrations = [
  { id: 'github', name: 'GitHub', icon: '🐙', status: 'connected', category: 'vcs' },
  { id: 'slack', name: 'Slack', icon: '💬', status: 'disconnected', category: 'communication' },
  { id: 'jira', name: 'Jira', icon: '📋', status: 'connected', category: 'project' },
  { id: 'linear', name: 'Linear', icon: '📐', status: 'available', category: 'project' },
  { id: 'notion', name: 'Notion', icon: '📝', status: 'available', category: 'docs' },
  { id: 'discord', name: 'Discord', icon: '🎮', status: 'available', category: 'communication' },
];

export default function IntegrationsHubPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Integrations Hub
          </h1>
          <p className="text-muted-foreground">Connect your favorite tools</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {integrations.map(int => (
          <Card key={int.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{int.icon}</span>
                <div>
                  <CardTitle>{int.name}</CardTitle>
                  <CardDescription>{int.category}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant={int.status === 'connected' ? 'default' : 'secondary'}>{int.status}</Badge>
                <Button variant="outline" size="sm">
                  {int.status === 'connected' ? 'Configure' : 'Connect'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
