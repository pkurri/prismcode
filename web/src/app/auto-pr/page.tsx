'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AutoPR {
  id: string;
  type: 'security' | 'dependency' | 'lint' | 'style';
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  files: number;
  status: 'draft' | 'open' | 'merged' | 'closed';
  autoMerge: boolean;
  createdAt: string;
}

interface VulnerabilityFix {
  id: string;
  package: string;
  currentVersion: string;
  fixedVersion: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cve?: string;
}

const mockPRs: AutoPR[] = [
  { id: '1', type: 'security', title: 'Fix CVE-2024-1234 in lodash', description: 'Updates lodash from 4.17.20 to 4.17.21 to fix prototype pollution vulnerability', riskLevel: 'low', files: 2, status: 'open', autoMerge: true, createdAt: '2 hours ago' },
  { id: '2', type: 'dependency', title: 'Update React to 18.3.0', description: 'Major version update with breaking changes. Includes migration guide.', riskLevel: 'high', files: 15, status: 'draft', autoMerge: false, createdAt: '5 hours ago' },
  { id: '3', type: 'lint', title: 'Fix ESLint violations', description: 'Auto-fixed 23 lint errors across 8 files', riskLevel: 'low', files: 8, status: 'merged', autoMerge: true, createdAt: 'Yesterday' },
  { id: '4', type: 'style', title: 'Format code with Prettier', description: 'Applied consistent formatting to all TypeScript files', riskLevel: 'low', files: 42, status: 'merged', autoMerge: true, createdAt: '2 days ago' },
];

const mockVulnerabilities: VulnerabilityFix[] = [
  { id: '1', package: 'lodash', currentVersion: '4.17.20', fixedVersion: '4.17.21', severity: 'high', cve: 'CVE-2024-1234' },
  { id: '2', package: 'axios', currentVersion: '0.21.1', fixedVersion: '1.6.0', severity: 'medium', cve: 'CVE-2023-5678' },
  { id: '3', package: 'webpack', currentVersion: '5.75.0', fixedVersion: '5.89.0', severity: 'low' },
];

const typeIcons: Record<string, string> = {
  security: '🔒',
  dependency: '📦',
  lint: '🧹',
  style: '✨',
};

const riskColors: Record<string, string> = {
  low: 'bg-green-500/10 text-green-500 border-green-500/30',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  high: 'bg-red-500/10 text-red-500 border-red-500/30',
};

const severityColors: Record<string, string> = {
  critical: 'bg-red-600/10 text-red-600 border-red-600/30',
  high: 'bg-red-500/10 text-red-500 border-red-500/30',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
};

export default function AutoPRPage() {
  const [prs] = useState(mockPRs);
  const [vulnerabilities] = useState(mockVulnerabilities);

  const openCount = prs.filter(p => p.status === 'open' || p.status === 'draft').length;
  const mergedCount = prs.filter(p => p.status === 'merged').length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Auto-Fix PRs
          </h1>
          <p className="text-muted-foreground">Automatic pull requests for security and maintenance</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          🔍 Scan for Issues
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total PRs</CardDescription>
            <CardTitle className="text-3xl">{prs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open</CardDescription>
            <CardTitle className="text-3xl text-amber-500">{openCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Merged</CardDescription>
            <CardTitle className="text-3xl text-green-500">{mergedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vulnerabilities</CardDescription>
            <CardTitle className="text-3xl text-red-500">{vulnerabilities.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="prs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="prs">Pull Requests</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="prs">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Generated PRs</CardTitle>
              <CardDescription>Review and merge automated fixes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {prs.map(pr => (
                <div key={pr.id} className={`p-4 rounded-lg ${pr.status === 'merged' ? 'bg-green-500/5 border border-green-500/30' : 'bg-muted/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{typeIcons[pr.type]}</span>
                      <span className="font-medium">{pr.title}</span>
                      <Badge variant="outline" className={riskColors[pr.riskLevel]}>
                        {pr.riskLevel} risk
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {pr.autoMerge && <Badge variant="secondary">Auto-merge</Badge>}
                      <Badge variant={pr.status === 'merged' ? 'default' : pr.status === 'open' ? 'secondary' : 'outline'}>
                        {pr.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{pr.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{pr.files} files • {pr.createdAt}</span>
                    {pr.status !== 'merged' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View PR</Button>
                        {pr.status === 'open' && <Button size="sm">Merge</Button>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vulnerabilities">
          <Card>
            <CardHeader>
              <CardTitle>Security Vulnerabilities</CardTitle>
              <CardDescription>Detected issues with available fixes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {vulnerabilities.map(vuln => (
                <div key={vuln.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium font-mono">{vuln.package}</span>
                      <Badge variant="outline" className={severityColors[vuln.severity]}>
                        {vuln.severity}
                      </Badge>
                      {vuln.cve && <Badge variant="secondary">{vuln.cve}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {vuln.currentVersion} → {vuln.fixedVersion}
                    </p>
                  </div>
                  <Button size="sm">Create Fix PR</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Merge Settings</CardTitle>
              <CardDescription>Configure automatic merging behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Auto-merge security patches', desc: 'Low-risk security updates', enabled: true },
                { name: 'Auto-merge lint fixes', desc: 'Code style and linting', enabled: true },
                { name: 'Auto-merge minor updates', desc: 'Non-breaking dependency updates', enabled: false },
                { name: 'Require passing tests', desc: 'Only merge if all tests pass', enabled: true },
              ].map((setting, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{setting.name}</p>
                    <p className="text-sm text-muted-foreground">{setting.desc}</p>
                  </div>
                  <Button variant={setting.enabled ? 'default' : 'outline'} size="sm">
                    {setting.enabled ? '✓ On' : 'Off'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
