'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ReviewFinding {
  id: string;
  severity: 'critical' | 'warning' | 'suggestion' | 'positive';
  category: 'security' | 'performance' | 'style' | 'tests' | 'general';
  title: string;
  description: string;
  file: string;
  lineStart: number;
}

interface CodeReviewAssistantProps {
  prId?: string;
  diff?: string;
  repo?: string;
  onApplyFix?: (findingId: string) => void;
}

export function CodeReviewAssistant({ prId, diff, repo, onApplyFix }: CodeReviewAssistantProps) {
  const [findings, setFindings] = useState<ReviewFinding[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const runAnalysis = async () => {
    if (!diff && !prId) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/code-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo: repo || 'unknown',
          prNumber: prId ? parseInt(prId) : 0,
          diff: diff || 'mock diff content', // fallback for demo
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFindings(data.findings || []);
        setScore(data.overallScore);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-run analysis if diff provided on mount
  useEffect(() => {
    if (diff) {
      runAnalysis();
    }
  }, [diff]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'warning': return 'text-amber-600 bg-amber-100 border-amber-200';
      case 'positive': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-blue-600 bg-blue-100 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚫';
      case 'warning': return '⚠️';
      case 'positive': return '✅';
      default: return '💡';
    }
  };

  return (
    <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
      <CardHeader className="pb-3 px-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              🤖 AI Review
              {score !== null && (
                <Badge variant="outline" className={score > 80 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}>
                  Score: {score}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Automated insights & suggestions</CardDescription>
          </div>
          <Button size="sm" onClick={runAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? 'Analyzing...' : 'Re-run'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 px-0 overflow-hidden">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3">
            <div className="animate-spin text-3xl">⚙️</div>
            <p className="text-sm text-muted-foreground">Scanning code patterns...</p>
          </div>
        ) : findings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No issues detected or analysis not run.</p>
            {!diff && <p className="text-xs text-muted-foreground mt-2">Select a file to analyze.</p>}
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {findings.map((finding) => (
                <div 
                  key={finding.id} 
                  className={`p-3 rounded-lg border text-sm ${
                    finding.severity === 'critical' ? 'bg-red-50/50 border-red-200/50' : 'bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 font-medium">
                      <span className="text-lg">{getSeverityIcon(finding.severity)}</span>
                      <span>{finding.title}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {finding.category}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mt-1 text-xs">
                    {finding.description}
                  </p>
                  
                  {finding.file !== 'general' && (
                    <div className="mt-2 text-xs font-mono bg-muted/50 p-1 rounded px-2 w-fit">
                      {finding.file}:{finding.lineStart}
                    </div>
                  )}

                  {finding.severity !== 'positive' && onApplyFix && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 h-7 text-xs w-full justify-start text-primary"
                      onClick={() => onApplyFix(finding.id)}
                    >
                      ✨ Apply AI Fix
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
