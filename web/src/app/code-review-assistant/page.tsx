'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReviewComment {
  id: string;
  file: string;
  line: number;
  severity: 'error' | 'warning' | 'info' | 'suggestion';
  message: string;
  suggestedFix?: string;
}

const mockComments: ReviewComment[] = [
  { id: '1', file: 'src/components/Button.tsx', line: 15, severity: 'warning', message: 'Consider using useMemo for expensive computation', suggestedFix: 'const memoized = useMemo(() => compute(), [deps]);' },
  { id: '2', file: 'src/lib/api.ts', line: 42, severity: 'error', message: 'Missing error handling for API call', suggestedFix: 'try { await fetch() } catch (e) { handleError(e); }' },
  { id: '3', file: 'src/utils/helpers.ts', line: 8, severity: 'suggestion', message: 'This function could be simplified', suggestedFix: 'return arr.filter(Boolean);' },
  { id: '4', file: 'src/app/page.tsx', line: 23, severity: 'info', message: 'Consider extracting this into a separate component' },
];

const severityColors: Record<string, string> = {
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
  suggestion: 'bg-green-500',
};

export default function CodeReviewAssistantPage() {
  const [comments] = useState(mockComments);
  const [selectedComment, setSelectedComment] = useState<ReviewComment | null>(null);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            AI Code Review Assistant
          </h1>
          <p className="text-muted-foreground">AI-powered code review with intelligent suggestions</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-red-500">{comments.filter(c => c.severity === 'error').length} errors</Badge>
          <Badge variant="outline" className="text-yellow-500">{comments.filter(c => c.severity === 'warning').length} warnings</Badge>
          <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            🔍 Analyze Code
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-2xl">{comments.length}</CardTitle><CardDescription>Total Issues</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-2xl text-red-500">{comments.filter(c => c.severity === 'error').length}</CardTitle><CardDescription>Errors</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-2xl text-yellow-500">{comments.filter(c => c.severity === 'warning').length}</CardTitle><CardDescription>Warnings</CardDescription></CardHeader></Card>
        <Card><CardHeader><CardTitle className="text-2xl text-green-500">{comments.filter(c => c.suggestedFix).length}</CardTitle><CardDescription>Auto-Fixable</CardDescription></CardHeader></Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Issues</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="warnings">Warnings</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              {comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-4 p-4 border-b cursor-pointer hover:bg-muted/30" onClick={() => setSelectedComment(comment)}>
                  <span className={`w-3 h-3 mt-1.5 rounded-full ${severityColors[comment.severity]}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm text-muted-foreground">{comment.file}:{comment.line}</code>
                      <Badge variant="secondary" className="text-xs">{comment.severity}</Badge>
                    </div>
                    <p className="text-sm">{comment.message}</p>
                    {comment.suggestedFix && (
                      <pre className="mt-2 p-2 text-xs bg-muted rounded">{comment.suggestedFix}</pre>
                    )}
                  </div>
                  {comment.suggestedFix && (
                    <Button size="sm" variant="outline">Apply Fix</Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
