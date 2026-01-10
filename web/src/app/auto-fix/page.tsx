'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AutoFix {
  id: string;
  errorId: string;
  errorMessage: string;
  fixTitle: string;
  description: string;
  code: { before: string; after: string };
  confidence: number;
  tradeoffs: string[];
  status: 'pending' | 'applied' | 'rejected';
  hasTests: boolean;
}

const mockFixes: AutoFix[] = [
  {
    id: '1',
    errorId: 'err-1',
    errorMessage: 'Cannot read property "id" of undefined',
    fixTitle: 'Add null check with optional chaining',
    description: 'Replace direct property access with optional chaining to safely handle undefined values.',
    code: {
      before: `const userId = user.id;`,
      after: `const userId = user?.id;`,
    },
    confidence: 95,
    tradeoffs: ['Simple and safe', 'May hide deeper issues', 'Minimal performance impact'],
    status: 'pending',
    hasTests: true,
  },
  {
    id: '2',
    errorId: 'err-1',
    errorMessage: 'Cannot read property "id" of undefined',
    fixTitle: 'Add loading state check',
    description: 'Add explicit check for loading state before accessing user data.',
    code: {
      before: `return <div>{user.id}</div>;`,
      after: `if (!user) return <Loading />;\nreturn <div>{user.id}</div>;`,
    },
    confidence: 88,
    tradeoffs: ['More explicit handling', 'Better UX', 'Requires Loading component'],
    status: 'pending',
    hasTests: true,
  },
  {
    id: '3',
    errorId: 'err-2',
    errorMessage: 'Maximum update depth exceeded',
    fixTitle: 'Add dependency array to useEffect',
    description: 'The infinite loop is caused by missing dependency array in useEffect.',
    code: {
      before: `useEffect(() => {\n  setData(fetchData());\n});`,
      after: `useEffect(() => {\n  setData(fetchData());\n}, []);`,
    },
    confidence: 92,
    tradeoffs: ['Fixes infinite loop', 'May need additional deps', 'Standard React pattern'],
    status: 'applied',
    hasTests: true,
  },
];

export default function AutoFixPage() {
  const [fixes, setFixes] = useState(mockFixes);

  const applyFix = (id: string) => {
    setFixes(prev => prev.map(f => f.id === id ? { ...f, status: 'applied' as const } : f));
  };

  const rejectFix = (id: string) => {
    setFixes(prev => prev.map(f => f.id === id ? { ...f, status: 'rejected' as const } : f));
  };

  const pendingCount = fixes.filter(f => f.status === 'pending').length;
  const appliedCount = fixes.filter(f => f.status === 'applied').length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Autonomous Fix Generation
          </h1>
          <p className="text-muted-foreground">AI-generated fixes for detected bugs</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          🤖 Generate More Fixes
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-amber-500">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Applied</CardDescription>
            <CardTitle className="text-3xl text-green-500">{appliedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Confidence</CardDescription>
            <CardTitle className="text-3xl">{Math.round(fixes.reduce((s, f) => s + f.confidence, 0) / fixes.length)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Fixes */}
      <div className="space-y-4">
        {fixes.map(fix => (
          <Card key={fix.id} className={fix.status === 'applied' ? 'border-green-500/30 bg-green-500/5' : fix.status === 'rejected' ? 'opacity-50' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{fix.fixTitle}</CardTitle>
                  <CardDescription>For: {fix.errorMessage}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={fix.confidence >= 90 ? 'default' : 'secondary'}>
                    {fix.confidence}% confidence
                  </Badge>
                  {fix.hasTests && <Badge variant="outline" className="text-green-500 border-green-500/30">Has Tests</Badge>}
                  {fix.status !== 'pending' && (
                    <Badge variant={fix.status === 'applied' ? 'default' : 'secondary'}>
                      {fix.status}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{fix.description}</p>
              
              {/* Code Diff */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium mb-2 text-red-500">Before</p>
                  <pre className="p-3 rounded bg-red-500/5 border border-red-500/30 text-sm font-mono overflow-x-auto">
                    {fix.code.before}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2 text-green-500">After</p>
                  <pre className="p-3 rounded bg-green-500/5 border border-green-500/30 text-sm font-mono overflow-x-auto">
                    {fix.code.after}
                  </pre>
                </div>
              </div>

              {/* Trade-offs */}
              <div>
                <p className="text-sm font-medium mb-2">Trade-offs</p>
                <div className="flex gap-2 flex-wrap">
                  {fix.tradeoffs.map((t, i) => (
                    <Badge key={i} variant="outline">{t}</Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {fix.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => rejectFix(fix.id)}>✗ Reject</Button>
                  <Button onClick={() => applyFix(fix.id)}>✓ Apply Fix</Button>
                  <Button variant="outline">📝 Create PR</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
