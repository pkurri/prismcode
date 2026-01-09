'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const vulnerabilities = [
  {
    id: 1,
    severity: 'critical',
    title: 'SQL Injection in user query',
    file: 'src/db/queries.ts',
    line: 45,
    source: 'snyk',
    fixable: true,
  },
  {
    id: 2,
    severity: 'high',
    title: 'Exposed API keys in config',
    file: 'src/config.ts',
    line: 12,
    source: 'snyk',
    fixable: true,
  },
  {
    id: 3,
    severity: 'medium',
    title: 'XSS vulnerability in markdown renderer',
    file: 'src/utils/markdown.ts',
    line: 89,
    source: 'sonarqube',
    fixable: false,
  },
  {
    id: 4,
    severity: 'low',
    title: 'Outdated dependency: lodash',
    file: 'package.json',
    line: 23,
    source: 'dependabot',
    fixable: true,
  },
];

const scanHistory = [
  { id: 1, date: '2024-01-09 15:00', status: 'completed', findings: 4, duration: '2m 34s' },
  { id: 2, date: '2024-01-08 12:00', status: 'completed', findings: 6, duration: '2m 12s' },
  { id: 3, date: '2024-01-07 09:00', status: 'completed', findings: 5, duration: '2m 45s' },
];

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-600 border-red-500/30',
  high: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  low: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
};

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('vulnerabilities');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const filtered =
    selectedSeverity === 'all'
      ? vulnerabilities
      : vulnerabilities.filter((v) => v.severity === selectedSeverity);

  const counts = {
    critical: vulnerabilities.filter((v) => v.severity === 'critical').length,
    high: vulnerabilities.filter((v) => v.severity === 'high').length,
    medium: vulnerabilities.filter((v) => v.severity === 'medium').length,
    low: vulnerabilities.filter((v) => v.severity === 'low').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Security
          </h1>
          <p className="text-muted-foreground mt-1">Vulnerability scanning and security insights</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          Run Scan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Critical', count: counts.critical, color: 'text-red-600 bg-red-500/10' },
          { label: 'High', count: counts.high, color: 'text-orange-600 bg-orange-500/10' },
          { label: 'Medium', count: counts.medium, color: 'text-yellow-600 bg-yellow-500/10' },
          { label: 'Low', count: counts.low, color: 'text-blue-600 bg-blue-500/10' },
        ].map((s) => (
          <Card
            key={s.label}
            className={`cursor-pointer hover:shadow-md transition-shadow ${selectedSeverity === s.label.toLowerCase() ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedSeverity(s.label.toLowerCase())}
          >
            <CardContent className="pt-6">
              <div className={`inline-flex items-center justify-center p-2 rounded-lg ${s.color}`}>
                <span className="text-2xl font-bold">{s.count}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="history">Scan History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'vulnerabilities' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Active Vulnerabilities</CardTitle>
              <Button
                variant="link"
                className="h-auto p-0"
                onClick={() => setSelectedSeverity('all')}
              >
                Show All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/50"
              >
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className={severityColors[v.severity]}>
                    {v.severity}
                  </Badge>
                  <div>
                    <p className="font-medium">{v.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {v.file}:{v.line}
                    </p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {v.source}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                  {v.fixable && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      Auto-Fix
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Findings</th>
                  <th className="text-left p-4">Duration</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {scanHistory.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="p-4">{s.date}</td>
                    <td className="p-4">
                      <Badge variant="default">{s.status}</Badge>
                    </td>
                    <td className="p-4">{s.findings} issues</td>
                    <td className="p-4 text-muted-foreground">{s.duration}</td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        View Report
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Security Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Snyk', status: 'connected', icon: '🛡️' },
              { name: 'SonarQube', status: 'connected', icon: '📊' },
              { name: 'Dependabot', status: 'connected', icon: '🤖' },
            ].map((i) => (
              <div key={i.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{i.icon}</span>
                  <span className="font-medium">{i.name}</span>
                </div>
                <Badge variant="default">{i.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
