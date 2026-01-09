'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const debtSummary = { totalDebt: 124.5, trend: -8.3, grade: 'B+' };

const breakdown = [
  { category: 'Complexity', hours: 45, percentage: 36, color: 'bg-red-500' },
  { category: 'Duplication', hours: 28, percentage: 22, color: 'bg-orange-500' },
  { category: 'Coverage', hours: 32, percentage: 26, color: 'bg-yellow-500' },
  { category: 'Documentation', hours: 19.5, percentage: 16, color: 'bg-blue-500' },
];

const hotspots = [
  { file: 'src/auth/session.ts', complexity: 28, debt: 4.5, changes: 15, score: 0.87 },
  { file: 'src/db/queries.ts', complexity: 24, debt: 3.2, changes: 12, score: 0.72 },
  { file: 'src/api/handlers.ts', complexity: 19, debt: 2.1, changes: 8, score: 0.45 },
  { file: 'src/utils/parser.ts', complexity: 15, debt: 1.8, changes: 5, score: 0.32 },
];

const refactoringPRs = [
  {
    id: 'pr_1',
    title: 'Refactor session.ts - Extract method',
    status: 'ready',
    impact: '-15% complexity',
  },
  { id: 'pr_2', title: 'Remove dead code in utils', status: 'ready', impact: '-200 lines' },
  {
    id: 'pr_3',
    title: 'Split handlers.ts into modules',
    status: 'pending',
    impact: '-20% coupling',
  },
];

export default function TechDebtPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Tech Debt
          </h1>
          <p className="text-muted-foreground mt-1">Technical debt visualization and refactoring</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          Analyze Codebase
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Debt</p>
            <p className="text-3xl font-bold">{debtSummary.totalDebt}h</p>
            <p className="text-sm text-green-600">↓ {Math.abs(debtSummary.trend)}% this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Health Grade</p>
            <p className="text-3xl font-bold">{debtSummary.grade}</p>
            <p className="text-sm text-muted-foreground">Good condition</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Auto-Fix PRs</p>
            <p className="text-3xl font-bold">
              {refactoringPRs.filter((p) => p.status === 'ready').length}
            </p>
            <p className="text-sm text-muted-foreground">Ready to merge</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
          <TabsTrigger value="refactoring">Auto-Refactor</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Debt Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {breakdown.map((b) => (
              <div key={b.category} className="space-y-2">
                <div className="flex justify-between">
                  <span>{b.category}</span>
                  <span className="text-muted-foreground">
                    {b.hours}h ({b.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${b.color}`} style={{ width: `${b.percentage}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'hotspots' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4">File</th>
                  <th className="p-4">Complexity</th>
                  <th className="p-4">Debt (h)</th>
                  <th className="p-4">Changes</th>
                  <th className="p-4">Score</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {hotspots.map((h) => (
                  <tr key={h.file} className="border-b">
                    <td className="p-4 font-mono text-sm">{h.file}</td>
                    <td className="p-4 text-center">
                      <Badge variant={h.complexity > 20 ? 'destructive' : 'secondary'}>
                        {h.complexity}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">{h.debt}h</td>
                    <td className="p-4 text-center">{h.changes}</td>
                    <td className="p-4 text-center">{(h.score * 100).toFixed(0)}%</td>
                    <td className="p-4">
                      <Button size="sm" variant="outline">
                        Refactor
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'refactoring' && (
        <div className="space-y-4">
          {refactoringPRs.map((pr) => (
            <Card key={pr.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{pr.title}</p>
                  <p className="text-sm text-muted-foreground">Impact: {pr.impact}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={pr.status === 'ready' ? 'default' : 'secondary'}>
                    {pr.status}
                  </Badge>
                  {pr.status === 'ready' && (
                    <Button size="sm" className="bg-green-600 text-white">
                      Merge
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
