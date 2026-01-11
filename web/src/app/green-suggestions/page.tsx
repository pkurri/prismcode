'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface GreenSuggestion {
  id: string;
  file: string;
  line: number;
  pattern: string;
  issue: string;
  suggestion: string;
  codeExample: { before: string; after: string };
  savings: { energy: string; co2: string };
  category: 'algorithm' | 'caching' | 'io' | 'memory' | 'network';
  status: 'pending' | 'applied' | 'dismissed';
}

const mockSuggestions: GreenSuggestion[] = [
  {
    id: '1',
    file: 'src/api/users.ts',
    line: 45,
    pattern: 'Excessive API Calls',
    issue: 'Making individual API calls in a loop instead of batch request',
    suggestion: 'Use batch API endpoint to reduce network overhead',
    codeExample: {
      before: 'for (const id of ids) {\n  await fetchUser(id);\n}',
      after: 'const users = await fetchUsers(ids);',
    },
    savings: { energy: '~65%', co2: '~12g per 1000 calls' },
    category: 'network',
    status: 'pending',
  },
  {
    id: '2',
    file: 'src/utils/search.ts',
    line: 23,
    pattern: 'Inefficient Algorithm',
    issue: 'Linear search in large array',
    suggestion: 'Use Map or Set for O(1) lookup',
    codeExample: {
      before: 'array.find(item => item.id === id)',
      after: 'itemsMap.get(id)',
    },
    savings: { energy: '~80%', co2: '~5g per 1000 ops' },
    category: 'algorithm',
    status: 'pending',
  },
  {
    id: '3',
    file: 'src/components/List.tsx',
    line: 89,
    pattern: 'Missing Memoization',
    issue: 'Expensive computation on every render',
    suggestion: 'Memoize with useMemo hook',
    codeExample: {
      before: 'const sorted = items.sort(...)',
      after: 'const sorted = useMemo(() => items.sort(...), [items])',
    },
    savings: { energy: '~40%', co2: '~3g per session' },
    category: 'memory',
    status: 'applied',
  },
];

const categoryIcons: Record<string, string> = {
  algorithm: '🧮',
  caching: '💾',
  io: '📁',
  memory: '🧠',
  network: '🌐',
};

export default function GreenSuggestionsPage() {
  const [suggestions, setSuggestions] = useState(mockSuggestions);

  const applySuggestion = (id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 'applied' as const } : s));
  };

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;
  const appliedCount = suggestions.filter(s => s.status === 'applied').length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Green Code Suggestions
          </h1>
          <p className="text-muted-foreground">AI-powered recommendations for energy-efficient code</p>
        </div>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          🔍 Scan Codebase
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Suggestions</CardDescription>
            <CardTitle className="text-3xl">{suggestions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-amber-500">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Applied</CardDescription>
            <CardTitle className="text-3xl text-green-500">{appliedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardHeader className="pb-2">
            <CardDescription>Est. CO₂ Saved</CardDescription>
            <CardTitle className="text-3xl text-green-500">~20g</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Review and apply green code patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestions.map(sugg => (
            <div key={sugg.id} className={`p-4 rounded-lg ${sugg.status === 'applied' ? 'bg-green-500/5 border border-green-500/30' : 'bg-muted/30'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{categoryIcons[sugg.category]}</span>
                  <Badge variant="secondary" className="capitalize">{sugg.category}</Badge>
                  <span className="font-medium">{sugg.pattern}</span>
                </div>
                {sugg.status === 'pending' ? (
                  <Button size="sm" onClick={() => applySuggestion(sugg.id)}>✓ Apply</Button>
                ) : (
                  <Badge variant="default" className="bg-green-500">Applied</Badge>
                )}
              </div>
              
              <code className="text-sm text-muted-foreground">{sugg.file}:{sugg.line}</code>
              <p className="mt-2">{sugg.issue}</p>
              <p className="text-green-500 text-sm">💡 {sugg.suggestion}</p>

              <div className="grid gap-4 md:grid-cols-2 mt-3">
                <div>
                  <p className="text-xs text-red-500 mb-1">Before</p>
                  <pre className="p-2 rounded bg-red-500/10 text-sm font-mono overflow-x-auto">
                    {sugg.codeExample.before}
                  </pre>
                </div>
                <div>
                  <p className="text-xs text-green-500 mb-1">After</p>
                  <pre className="p-2 rounded bg-green-500/10 text-sm font-mono overflow-x-auto">
                    {sugg.codeExample.after}
                  </pre>
                </div>
              </div>

              <div className="flex gap-4 mt-3 text-sm">
                <span className="text-green-500">⚡ Energy: {sugg.savings.energy}</span>
                <span className="text-green-500">🌱 CO₂: {sugg.savings.co2}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
