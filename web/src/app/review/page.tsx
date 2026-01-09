'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// Mock PR data for demonstration
const mockPRs = [
  {
    id: 1,
    title: 'feat: Add user authentication flow',
    author: 'alice',
    branch: 'feature/auth',
    status: 'open',
    score: 82,
    risk: 'medium',
    findings: [
      {
        type: 'critical',
        category: 'security',
        message: 'Potential SQL injection in user query',
        file: 'src/auth/user.ts',
        line: 45,
      },
      {
        type: 'warning',
        category: 'performance',
        message: 'Consider caching user session data',
        file: 'src/auth/session.ts',
        line: 23,
      },
      {
        type: 'suggestion',
        category: 'style',
        message: 'Extract magic number to constant',
        file: 'src/auth/config.ts',
        line: 12,
      },
    ],
  },
  {
    id: 2,
    title: 'fix: Resolve memory leak in data processing',
    author: 'bob',
    branch: 'bugfix/memory-leak',
    status: 'open',
    score: 94,
    risk: 'low',
    findings: [
      {
        type: 'positive',
        category: 'quality',
        message: 'Good use of cleanup patterns',
        file: 'src/processing/stream.ts',
        line: 78,
      },
      {
        type: 'suggestion',
        category: 'tests',
        message: 'Consider adding edge case tests',
        file: 'tests/processing.test.ts',
        line: 34,
      },
    ],
  },
  {
    id: 3,
    title: 'refactor: Modernize database layer',
    author: 'charlie',
    branch: 'refactor/database',
    status: 'open',
    score: 67,
    risk: 'high',
    findings: [
      {
        type: 'critical',
        category: 'breaking',
        message: 'Breaking change in API contract',
        file: 'src/db/models.ts',
        line: 156,
      },
      {
        type: 'critical',
        category: 'security',
        message: 'Exposed database credentials in config',
        file: 'src/db/config.ts',
        line: 8,
      },
      {
        type: 'warning',
        category: 'performance',
        message: 'N+1 query pattern detected',
        file: 'src/db/queries.ts',
        line: 89,
      },
      {
        type: 'warning',
        category: 'tests',
        message: 'Missing migration tests',
        file: 'src/db/migrations/',
        line: 0,
      },
    ],
  },
];

const severityColors = {
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  suggestion: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  positive: 'bg-green-500/10 text-green-500 border-green-500/20',
};

const riskColors = {
  low: 'bg-green-500/10 text-green-600 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  high: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const categoryIcons: Record<string, React.ReactNode> = {
  security: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  performance: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  style: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  ),
  tests: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
      <path d="M12.02 2c5.523 0 10 4.477 10 10s-4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10" />
    </svg>
  ),
  quality: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  ),
  breaking: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

export default function CodeReviewPage() {
  const [selectedPR, setSelectedPR] = useState(mockPRs[0]);
  const [filter, setFilter] = useState<string>('all');

  const filteredFindings =
    filter === 'all' ? selectedPR.findings : selectedPR.findings.filter((f) => f.type === filter);

  const getCounts = () => ({
    critical: selectedPR.findings.filter((f) => f.type === 'critical').length,
    warning: selectedPR.findings.filter((f) => f.type === 'warning').length,
    suggestion: selectedPR.findings.filter((f) => f.type === 'suggestion').length,
    positive: selectedPR.findings.filter((f) => f.type === 'positive').length,
  });

  const counts = getCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Code Review Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered code review feedback for your pull requests
          </p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Sync PRs
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PR List */}
        <Card className="lg:col-span-1 border-border/40 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Open Pull Requests</CardTitle>
            <CardDescription>Select a PR to review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockPRs.map((pr) => (
              <button
                key={pr.id}
                onClick={() => setSelectedPR(pr)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedPR.id === pr.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/40 hover:border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{pr.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {pr.author} · {pr.branch}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${riskColors[pr.risk as keyof typeof riskColors]}`}
                  >
                    {pr.risk}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pr.score >= 80
                          ? 'bg-green-500'
                          : pr.score >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${pr.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{pr.score}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Review Details */}
        <Card className="lg:col-span-2 border-border/40 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{selectedPR.title}</CardTitle>
                <CardDescription className="mt-1">
                  Opened by @{selectedPR.author} on {selectedPR.branch}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                    selectedPR.score >= 80
                      ? 'bg-green-500/10 text-green-600'
                      : selectedPR.score >= 60
                        ? 'bg-yellow-500/10 text-yellow-600'
                        : 'bg-red-500/10 text-red-600'
                  }`}
                >
                  <span className="text-2xl font-bold">{selectedPR.score}</span>
                  <span className="text-xs">Score</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Critical', count: counts.critical, color: 'text-red-500 bg-red-500/10' },
                {
                  label: 'Warnings',
                  count: counts.warning,
                  color: 'text-yellow-500 bg-yellow-500/10',
                },
                {
                  label: 'Suggestions',
                  count: counts.suggestion,
                  color: 'text-blue-500 bg-blue-500/10',
                },
                {
                  label: 'Positives',
                  count: counts.positive,
                  color: 'text-green-500 bg-green-500/10',
                },
              ].map((stat) => (
                <div key={stat.label} className={`p-3 rounded-lg ${stat.color}`}>
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-xs opacity-80">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
              <TabsList className="grid w-full grid-cols-5 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="critical">Critical</TabsTrigger>
                <TabsTrigger value="warning">Warnings</TabsTrigger>
                <TabsTrigger value="suggestion">Suggestions</TabsTrigger>
                <TabsTrigger value="positive">Positives</TabsTrigger>
              </TabsList>

              <TabsContent value={filter} className="space-y-3">
                {filteredFindings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mx-auto mb-3 opacity-50"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                    <p className="font-medium">No findings in this category</p>
                  </div>
                ) : (
                  filteredFindings.map((finding, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${severityColors[finding.type as keyof typeof severityColors]}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {categoryIcons[finding.category] || categoryIcons.quality}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{finding.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {finding.file}:{finding.line}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            View
                          </Button>
                          {finding.type === 'suggestion' && (
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-primary text-primary-foreground"
                            >
                              Apply
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/40">
              <Button variant="outline">Mark Ignored</Button>
              <Button variant="outline">Add to PR Comment</Button>
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                Apply All Safe Fixes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
