'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const piiReport = {
  scanned: 234,
  detections: [
    {
      type: 'Email',
      count: 3,
      status: 'warning',
      files: ['src/test/fixtures.ts', 'src/utils/seed.ts'],
    },
    { type: 'Phone', count: 1, status: 'warning', files: ['src/test/mocks.ts'] },
    { type: 'SSN', count: 0, status: 'clean', files: [] },
    { type: 'Credit Card', count: 0, status: 'clean', files: [] },
  ],
};

const auditLogs = [
  {
    id: 1,
    action: 'code.generate',
    user: 'prasad',
    time: '15:00',
    details: 'Generated auth flow',
    risk: 'low',
  },
  {
    id: 2,
    action: 'deploy.production',
    user: 'system',
    time: '14:30',
    details: 'Auto-deploy main',
    risk: 'medium',
  },
  {
    id: 3,
    action: 'secret.access',
    user: 'prasad',
    time: '14:00',
    details: 'Accessed API keys',
    risk: 'high',
  },
  {
    id: 4,
    action: 'pr.merge',
    user: 'alice',
    time: '13:45',
    details: 'Merged PR #317',
    risk: 'low',
  },
];

const licenses = {
  summary: { allowed: 145, warning: 3, blocked: 0 },
  issues: [
    {
      package: 'some-gpl-lib@1.2.3',
      license: 'GPL-3.0',
      status: 'warning',
      reason: 'Copyleft license',
    },
    {
      package: 'another-lib@2.0.0',
      license: 'LGPL-2.1',
      status: 'warning',
      reason: 'Weak copyleft',
    },
    {
      package: 'old-package@0.9.0',
      license: 'Unknown',
      status: 'warning',
      reason: 'No license found',
    },
  ],
};

const riskColors: Record<string, string> = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
};

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('pii');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Compliance
          </h1>
          <p className="text-muted-foreground mt-1">
            PII detection, audit logs, and license compliance
          </p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          Run Compliance Scan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">PII Detections</p>
            <p className="text-3xl font-bold">
              {piiReport.detections.reduce((a, b) => a + b.count, 0)}
            </p>
            <p className="text-sm text-yellow-600">Needs review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">License Issues</p>
            <p className="text-3xl font-bold">{licenses.summary.warning}</p>
            <p className="text-sm text-yellow-600">{licenses.summary.blocked} blocked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Audit Events (24h)</p>
            <p className="text-3xl font-bold">{auditLogs.length}</p>
            <p className="text-sm text-muted-foreground">All logged</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pii">PII Detection</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'pii' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">PII Detection Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {piiReport.detections.map((d) => (
              <div key={d.type} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span>{d.type}</span>
                  <Badge variant={d.status === 'clean' ? 'default' : 'destructive'}>
                    {d.count} found
                  </Badge>
                </div>
                {d.count > 0 && (
                  <Button size="sm" variant="outline">
                    View Files
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'audit' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4">Time</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Risk</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((l) => (
                  <tr key={l.id} className="border-b">
                    <td className="p-4 text-muted-foreground">{l.time}</td>
                    <td className="p-4">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{l.action}</code>
                    </td>
                    <td className="p-4">{l.user}</td>
                    <td className="p-4 text-sm">{l.details}</td>
                    <td className="p-4">
                      <span className={`inline-block h-2 w-2 rounded-full ${riskColors[l.risk]}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'licenses' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">License Issues ({licenses.issues.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {licenses.issues.map((l, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <code className="text-sm">{l.package}</code>
                  <p className="text-xs text-muted-foreground">
                    {l.license} - {l.reason}
                  </p>
                </div>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                  {l.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
