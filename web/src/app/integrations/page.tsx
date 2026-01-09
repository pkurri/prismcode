'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const integrations = [
  {
    id: 'github',
    name: 'GitHub',
    desc: 'Connect repos, sync issues, automate PRs',
    category: 'version-control',
    status: 'connected',
    lastSync: '2 mins ago',
    logo: '🐙',
    features: ['PR Analysis', 'Issue Sync', 'Actions'],
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    desc: 'GitLab CI/CD pipeline management',
    category: 'version-control',
    status: 'disconnected',
    lastSync: null,
    logo: '🦊',
    features: ['MR Analysis', 'Pipelines'],
  },
  {
    id: 'jira',
    name: 'Jira',
    desc: 'Sync issues and track progress',
    category: 'project-management',
    status: 'connected',
    lastSync: '15 mins ago',
    logo: '📋',
    features: ['Issue Sync', 'Sprints'],
  },
  {
    id: 'linear',
    name: 'Linear',
    desc: 'Modern issue tracking with PR linking',
    category: 'project-management',
    status: 'needs-setup',
    lastSync: null,
    logo: '⚡',
    features: ['Issue Sync', 'Cycles'],
  },
  {
    id: 'slack',
    name: 'Slack',
    desc: 'Notifications and bot commands',
    category: 'communication',
    status: 'connected',
    lastSync: '1 min ago',
    logo: '💬',
    features: ['Notifications', 'Commands'],
  },
  {
    id: 'vercel',
    name: 'Vercel',
    desc: 'Auto-deploy previews and production',
    category: 'deployment',
    status: 'connected',
    lastSync: '5 mins ago',
    logo: '▲',
    features: ['Preview Deploys', 'Env Sync'],
  },
  {
    id: 'snyk',
    name: 'Snyk',
    desc: 'Security vulnerability scanning',
    category: 'security',
    status: 'connected',
    lastSync: '30 mins ago',
    logo: '🔒',
    features: ['Vuln Scanning', 'Auto-fix'],
  },
  {
    id: 'sonarqube',
    name: 'SonarQube',
    desc: 'Code quality analysis platform',
    category: 'security',
    status: 'needs-setup',
    lastSync: null,
    logo: '📊',
    features: ['Quality Gates', 'Coverage'],
  },
];

const categories = [
  { id: 'all', name: 'All' },
  { id: 'version-control', name: 'Version Control' },
  { id: 'project-management', name: 'Projects' },
  { id: 'communication', name: 'Communication' },
  { id: 'deployment', name: 'Deploy' },
  { id: 'security', name: 'Security' },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  connected: { label: 'Connected', color: 'bg-green-500/10 text-green-600' },
  disconnected: { label: 'Not Connected', color: 'bg-muted text-muted-foreground' },
  'needs-setup': { label: 'Needs Setup', color: 'bg-yellow-500/10 text-yellow-600' },
};

export default function IntegrationsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<(typeof integrations)[0] | null>(null);

  const filtered = integrations.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || i.category === category;
    return matchSearch && matchCat;
  });

  const connectedCount = integrations.filter((i) => i.status === 'connected').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Integrations Hub
          </h1>
          <p className="text-muted-foreground mt-1">Connect your favorite tools</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
          {connectedCount} Connected
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search integrations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList>
            {categories.map((c) => (
              <TabsTrigger key={c.id} value={c.id}>
                {c.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((i) => (
            <Card
              key={i.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selected?.id === i.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelected(i)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                    {i.logo}
                  </div>
                  <div>
                    <CardTitle className="text-base">{i.name}</CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-xs mt-1 ${statusConfig[i.status].color}`}
                    >
                      {statusConfig[i.status].label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">{i.desc}</p>
                {i.lastSync && (
                  <p className="text-xs text-muted-foreground mt-2">Last sync: {i.lastSync}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit sticky top-6">
          {selected ? (
            <>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center text-4xl">
                    {selected.logo}
                  </div>
                  <div>
                    <CardTitle>{selected.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {selected.category.replace('-', ' ')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.features.map((f) => (
                      <Badge key={f} variant="secondary">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator />
                {selected.status === 'connected' ? (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full">
                      Configure
                    </Button>
                    <Button variant="destructive" className="w-full">
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                    Connect {selected.name}
                  </Button>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Select an integration</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
