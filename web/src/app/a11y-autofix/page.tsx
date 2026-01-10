'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AccessibilityFix {
  id: string;
  type: 'alt-text' | 'contrast' | 'aria' | 'heading' | 'keyboard';
  element: string;
  original: string;
  suggested: string;
  confidence: number;
  status: 'pending' | 'applied' | 'rejected';
}

const mockFixes: AccessibilityFix[] = [
  { id: '1', type: 'alt-text', element: '<img src="hero.jpg">', original: '', suggested: 'A professional team collaborating in a modern office space', confidence: 92, status: 'pending' },
  { id: '2', type: 'contrast', element: '<button class="subtle">', original: 'color: #888', suggested: 'color: #595959 /* 4.5:1 ratio */', confidence: 100, status: 'pending' },
  { id: '3', type: 'aria', element: '<div role="button">', original: '', suggested: 'aria-label="Submit form"', confidence: 88, status: 'applied' },
  { id: '4', type: 'alt-text', element: '<img src="chart.png">', original: '', suggested: 'Bar chart showing monthly revenue growth from January to December 2024', confidence: 85, status: 'pending' },
  { id: '5', type: 'heading', element: '<h3>Details</h3>', original: 'h3', suggested: 'h2 /* Maintain heading hierarchy */', confidence: 95, status: 'pending' },
];

const typeIcons: Record<string, string> = {
  'alt-text': '🖼️',
  'contrast': '🎨',
  'aria': '🏷️',
  'heading': '📝',
  'keyboard': '⌨️',
};

export default function A11yAutoFixPage() {
  const [fixes, setFixes] = useState(mockFixes);
  const [isGenerating, setIsGenerating] = useState(false);

  const applyFix = (id: string) => {
    setFixes(prev => prev.map(f => f.id === id ? { ...f, status: 'applied' as const } : f));
  };

  const applyAll = () => {
    setFixes(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'applied' as const } : f));
  };

  const pendingCount = fixes.filter(f => f.status === 'pending').length;
  const appliedCount = fixes.filter(f => f.status === 'applied').length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            AI Accessibility Fixes
          </h1>
          <p className="text-muted-foreground">Auto-generate alt text, ARIA labels, and more</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 2000); }}>
            {isGenerating ? '🔄 Generating...' : '🤖 Generate Fixes'}
          </Button>
          <Button onClick={applyAll} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            ⚡ Apply All ({pendingCount})
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Generated</CardDescription>
            <CardTitle className="text-3xl">{fixes.length}</CardTitle>
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
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Confidence</CardDescription>
            <CardTitle className="text-3xl">{Math.round(fixes.reduce((s, f) => s + f.confidence, 0) / fixes.length)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Fixes</TabsTrigger>
          <TabsTrigger value="alt-text">Alt Text</TabsTrigger>
          <TabsTrigger value="contrast">Contrast</TabsTrigger>
          <TabsTrigger value="aria">ARIA</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Generated Fixes</CardTitle>
              <CardDescription>Review and apply AI-generated accessibility improvements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fixes.map(fix => (
                <div key={fix.id} className={`p-4 rounded-lg ${fix.status === 'applied' ? 'bg-green-500/5 border border-green-500/30' : 'bg-muted/30'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{typeIcons[fix.type]}</span>
                      <Badge variant="secondary" className="capitalize">{fix.type.replace('-', ' ')}</Badge>
                      <Badge variant="outline">{fix.confidence}% confidence</Badge>
                    </div>
                    {fix.status === 'pending' ? (
                      <Button size="sm" onClick={() => applyFix(fix.id)}>✓ Apply</Button>
                    ) : (
                      <Badge variant="default" className="bg-green-500">Applied</Badge>
                    )}
                  </div>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{fix.element}</code>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Original</p>
                      <p className="text-sm bg-red-500/10 p-2 rounded">{fix.original || '(empty)'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">AI Suggestion</p>
                      <p className="text-sm bg-green-500/10 p-2 rounded">{fix.suggested}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {['alt-text', 'contrast', 'aria'].map(type => (
          <TabsContent key={type} value={type}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{type.replace('-', ' ')} Fixes</CardTitle>
              </CardHeader>
              <CardContent>
                {fixes.filter(f => f.type === type).length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No {type} fixes</p>
                ) : (
                  <div className="space-y-3">
                    {fixes.filter(f => f.type === type).map(fix => (
                      <div key={fix.id} className="p-3 rounded-lg bg-muted/30 flex items-center justify-between">
                        <div>
                          <code className="text-sm">{fix.element}</code>
                          <p className="text-sm text-green-500 mt-1">{fix.suggested}</p>
                        </div>
                        <Button size="sm" variant="outline" disabled={fix.status === 'applied'}>
                          {fix.status === 'applied' ? '✓ Applied' : 'Apply'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
