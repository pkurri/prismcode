'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface ReviewFinding {
  id: string;
  severity: 'critical' | 'warning' | 'suggestion' | 'positive';
  category: 'security' | 'performance' | 'style' | 'tests' | 'general';
  title: string;
  description: string;
  file: string;
  lineStart: number;
  lineEnd: number;
  suggestion?: string;
  status: 'open' | 'applied' | 'ignored';
}

const mockPR = {
  number: 342,
  title: 'feat: Add user authentication with OAuth2',
  author: 'developer1',
  branch: 'feat/oauth-auth',
  baseBranch: 'main',
  filesChanged: 12,
  additions: 456,
  deletions: 89,
  overallScore: 82,
  riskLevel: 'medium' as const,
  createdAt: '2 hours ago',
  reviewStatus: 'pending' as const,
};

const mockFindings: ReviewFinding[] = [
  {
    id: '1',
    severity: 'critical',
    category: 'security',
    title: 'Potential SQL injection vulnerability',
    description: 'User input is being directly interpolated into SQL query without proper sanitization.',
    file: 'src/api/users.ts',
    lineStart: 45,
    lineEnd: 48,
    suggestion: 'Use parameterized queries or an ORM to prevent SQL injection.',
    status: 'open',
  },
  {
    id: '2',
    severity: 'critical',
    category: 'security',
    title: 'Hardcoded API secret detected',
    description: 'API secret key is hardcoded in the source file. This should be moved to environment variables.',
    file: 'src/config/oauth.ts',
    lineStart: 12,
    lineEnd: 12,
    suggestion: 'Move sensitive keys to environment variables and use process.env.',
    status: 'open',
  },
  {
    id: '3',
    severity: 'warning',
    category: 'performance',
    title: 'N+1 query detected in user fetch',
    description: 'Each user fetch triggers additional queries for roles. Consider using eager loading.',
    file: 'src/services/auth.ts',
    lineStart: 78,
    lineEnd: 92,
    suggestion: 'Use include/join to fetch related data in a single query.',
    status: 'open',
  },
  {
    id: '4',
    severity: 'warning',
    category: 'tests',
    title: 'Missing test coverage for error paths',
    description: 'The error handling paths in authenticate() are not covered by unit tests.',
    file: 'src/services/auth.ts',
    lineStart: 34,
    lineEnd: 56,
    suggestion: 'Add unit tests for authentication failure scenarios.',
    status: 'open',
  },
  {
    id: '5',
    severity: 'suggestion',
    category: 'style',
    title: 'Consider using TypeScript strict mode',
    description: 'Several any types could be replaced with proper interfaces.',
    file: 'src/types/user.ts',
    lineStart: 1,
    lineEnd: 25,
    suggestion: 'Define explicit interfaces for User, Session, and Token types.',
    status: 'open',
  },
  {
    id: '6',
    severity: 'suggestion',
    category: 'general',
    title: 'Add JSDoc comments for public API',
    description: 'Public authentication functions lack documentation.',
    file: 'src/api/auth.ts',
    lineStart: 10,
    lineEnd: 45,
    suggestion: 'Add JSDoc comments describing parameters and return values.',
    status: 'open',
  },
  {
    id: '7',
    severity: 'positive',
    category: 'general',
    title: 'Good use of dependency injection',
    description: 'The authentication service properly uses dependency injection for testability.',
    file: 'src/services/auth.ts',
    lineStart: 15,
    lineEnd: 20,
    status: 'open',
  },
  {
    id: '8',
    severity: 'positive',
    category: 'security',
    title: 'Proper password hashing implementation',
    description: 'Bcrypt is correctly used with appropriate cost factor for password hashing.',
    file: 'src/utils/crypto.ts',
    lineStart: 8,
    lineEnd: 15,
    status: 'open',
  },
];

const severityColors = {
  critical: 'bg-red-500/10 text-red-600 border-red-500/30',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  suggestion: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  positive: 'bg-green-500/10 text-green-600 border-green-500/30',
};

const severityIcons = {
  critical: '🚨',
  warning: '⚠️',
  suggestion: '💡',
  positive: '✅',
};

const categoryIcons = {
  security: '🔒',
  performance: '⚡',
  style: '🎨',
  tests: '🧪',
  general: '📋',
};

const riskColors = {
  low: 'text-green-500',
  medium: 'text-amber-500',
  high: 'text-red-500',
};

export default function CodeReviewPage() {
  const [findings, setFindings] = useState(mockFindings);
  const [activeTab, setActiveTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const criticalCount = findings.filter(f => f.severity === 'critical' && f.status === 'open').length;
  const warningCount = findings.filter(f => f.severity === 'warning' && f.status === 'open').length;
  const suggestionCount = findings.filter(f => f.severity === 'suggestion' && f.status === 'open').length;
  const positiveCount = findings.filter(f => f.severity === 'positive').length;

  const filteredFindings = findings.filter(f => {
    if (activeTab !== 'all' && f.severity !== activeTab) return false;
    if (categoryFilter && f.category !== categoryFilter) return false;
    return true;
  });

  const handleApply = (id: string) => {
    setFindings(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'applied' as const } : f
    ));
  };

  const handleIgnore = (id: string) => {
    setFindings(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'ignored' as const } : f
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Code Review Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered code review for pull requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Configure</Button>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            New Review
          </Button>
        </div>
      </div>

      {/* PR Summary Card */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🔀</span>
                PR #{mockPR.number}: {mockPR.title}
              </CardTitle>
              <CardDescription className="mt-1">
                {mockPR.author} wants to merge {mockPR.branch} into {mockPR.baseBranch} · {mockPR.createdAt}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600">
              Pending Review
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-3xl font-bold">{mockPR.overallScore}</div>
              <p className="text-sm text-muted-foreground">Quality Score</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className={`text-3xl font-bold capitalize ${riskColors[mockPR.riskLevel]}`}>
                {mockPR.riskLevel}
              </div>
              <p className="text-sm text-muted-foreground">Risk Level</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-3xl font-bold">{mockPR.filesChanged}</div>
              <p className="text-sm text-muted-foreground">Files Changed</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-3xl font-bold text-green-500">+{mockPR.additions}</div>
              <p className="text-sm text-muted-foreground">Additions</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-3xl font-bold text-red-500">-{mockPR.deletions}</div>
              <p className="text-sm text-muted-foreground">Deletions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-red-500/30 bg-red-500/5 cursor-pointer hover:bg-red-500/10 transition-colors"
              onClick={() => setActiveTab('critical')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="text-3xl">🚨</div>
            <div>
              <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
              <p className="text-sm text-muted-foreground">Critical Issues</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/30 bg-amber-500/5 cursor-pointer hover:bg-amber-500/10 transition-colors"
              onClick={() => setActiveTab('warning')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="text-3xl">⚠️</div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{warningCount}</div>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/5 cursor-pointer hover:bg-blue-500/10 transition-colors"
              onClick={() => setActiveTab('suggestion')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="text-3xl">💡</div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{suggestionCount}</div>
              <p className="text-sm text-muted-foreground">Suggestions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5 cursor-pointer hover:bg-green-500/10 transition-colors"
              onClick={() => setActiveTab('positive')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="text-3xl">✅</div>
            <div>
              <div className="text-2xl font-bold text-green-600">{positiveCount}</div>
              <p className="text-sm text-muted-foreground">Positives</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Findings */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Review Findings</CardTitle>
            <div className="flex gap-2">
              {['security', 'performance', 'style', 'tests'].map(cat => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                  className="capitalize"
                >
                  {categoryIcons[cat as keyof typeof categoryIcons]} {cat}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({findings.length})</TabsTrigger>
              <TabsTrigger value="critical">Critical ({criticalCount})</TabsTrigger>
              <TabsTrigger value="warning">Warnings ({warningCount})</TabsTrigger>
              <TabsTrigger value="suggestion">Suggestions ({suggestionCount})</TabsTrigger>
              <TabsTrigger value="positive">Positives ({positiveCount})</TabsTrigger>
            </TabsList>

            <div className="space-y-3">
              {filteredFindings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No findings match your filters
                </div>
              ) : (
                filteredFindings.map(finding => (
                  <div
                    key={finding.id}
                    className={`p-4 rounded-lg border ${severityColors[finding.severity]} ${
                      finding.status !== 'open' ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{severityIcons[finding.severity]}</span>
                          <span className="text-lg">{categoryIcons[finding.category]}</span>
                          <h3 className="font-semibold">{finding.title}</h3>
                          {finding.status === 'applied' && (
                            <Badge variant="secondary" className="bg-green-500/20 text-green-600">Applied</Badge>
                          )}
                          {finding.status === 'ignored' && (
                            <Badge variant="secondary" className="bg-gray-500/20 text-gray-500">Ignored</Badge>
                          )}
                        </div>
                        <p className="text-sm opacity-80 mb-2">{finding.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <a href="#" className="text-primary hover:underline flex items-center gap-1">
                            📄 {finding.file}
                            <span className="text-muted-foreground">
                              L{finding.lineStart}-{finding.lineEnd}
                            </span>
                          </a>
                        </div>
                        {finding.suggestion && (
                          <div className="mt-3 p-3 rounded bg-background/50 border border-border/50">
                            <p className="text-sm font-medium mb-1">💡 Suggestion:</p>
                            <p className="text-sm opacity-80">{finding.suggestion}</p>
                          </div>
                        )}
                      </div>
                      {finding.status === 'open' && finding.severity !== 'positive' && (
                        <div className="flex flex-col gap-2">
                          {finding.suggestion && (
                            <Button 
                              size="sm" 
                              onClick={() => handleApply(finding.id)}
                              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                            >
                              Apply Fix
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleApply(finding.id)}>
                            Add Comment
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-muted-foreground"
                            onClick={() => handleIgnore(finding.id)}
                          >
                            Ignore
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Actions Footer */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Export Report</Button>
        <Button variant="outline">Request Changes</Button>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          Approve PR
        </Button>
      </div>
    </div>
  );
}
