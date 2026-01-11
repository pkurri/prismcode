'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CarbonAnalysis {
  file: string;
  co2Grams: number;
  energyKwh: number;
  rating: 'A' | 'B' | 'C' | 'D' | 'E';
  hotspots: CarbonHotspot[];
}

interface CarbonHotspot {
  line: number;
  function: string;
  issue: string;
  impact: 'high' | 'medium' | 'low';
  suggestion: string;
  savings: number;
}

const mockAnalysis: CarbonAnalysis[] = [
  {
    file: 'src/api/data-processor.ts',
    co2Grams: 125,
    energyKwh: 0.42,
    rating: 'D',
    hotspots: [
      { line: 45, function: 'processAll', issue: 'Nested loops with O(n²) complexity', impact: 'high', suggestion: 'Use Map for O(n) lookup', savings: 45 },
      { line: 78, function: 'fetchData', issue: 'No request caching', impact: 'medium', suggestion: 'Add Redis caching layer', savings: 30 },
    ],
  },
  {
    file: 'src/utils/formatter.ts',
    co2Grams: 8,
    energyKwh: 0.02,
    rating: 'A',
    hotspots: [],
  },
  {
    file: 'src/components/Dashboard.tsx',
    co2Grams: 45,
    energyKwh: 0.15,
    rating: 'C',
    hotspots: [
      { line: 112, function: 'render', issue: 'Re-renders on every state change', impact: 'medium', suggestion: 'Memoize with React.memo', savings: 20 },
    ],
  },
];

const ratingColors: Record<string, string> = {
  A: 'bg-green-500 text-white',
  B: 'bg-lime-500 text-white',
  C: 'bg-amber-500 text-white',
  D: 'bg-orange-500 text-white',
  E: 'bg-red-500 text-white',
};

const impactColors: Record<string, string> = {
  high: 'text-red-500',
  medium: 'text-amber-500',
  low: 'text-blue-500',
};

export default function CarbonAnalyzerPage() {
  const [analysis] = useState(mockAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const totalCO2 = analysis.reduce((s, a) => s + a.co2Grams, 0);
  const totalHotspots = analysis.reduce((s, a) => s + a.hotspots.length, 0);
  const potentialSavings = analysis.flatMap(a => a.hotspots).reduce((s, h) => s + h.savings, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Carbon Footprint Analyzer
          </h1>
          <p className="text-muted-foreground">Measure and reduce your code's environmental impact</p>
        </div>
        <Button onClick={() => { setIsAnalyzing(true); setTimeout(() => setIsAnalyzing(false), 2000); }} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          {isAnalyzing ? '🔄 Analyzing...' : '🌱 Analyze Code'}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <CardHeader className="pb-2">
            <CardDescription>Total CO₂</CardDescription>
            <CardTitle className="text-3xl">{totalCO2}g</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">per 1000 executions</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Files Analyzed</CardDescription>
            <CardTitle className="text-3xl">{analysis.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Hotspots</CardDescription>
            <CardTitle className="text-3xl text-amber-500">{totalHotspots}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Potential Savings</CardDescription>
            <CardTitle className="text-3xl text-green-500">{potentialSavings}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="files" className="space-y-4">
        <TabsList>
          <TabsTrigger value="files">File Analysis</TabsTrigger>
          <TabsTrigger value="hotspots">All Hotspots</TabsTrigger>
          <TabsTrigger value="compare">PR Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>File Carbon Ratings</CardTitle>
              <CardDescription>Sorted by environmental impact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.sort((a, b) => b.co2Grams - a.co2Grams).map((file, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded flex items-center justify-center font-bold ${ratingColors[file.rating]}`}>
                        {file.rating}
                      </span>
                      <span className="font-medium font-mono text-sm">{file.file}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{file.co2Grams}g CO₂</span>
                      <span className="text-sm text-muted-foreground ml-2">({file.energyKwh} kWh)</span>
                    </div>
                  </div>
                  {file.hotspots.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {file.hotspots.map((h, j) => (
                        <div key={j} className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-sm">
                          <div className="flex items-center gap-2">
                            <span className={impactColors[h.impact]}>●</span>
                            <span className="font-mono">L{h.line}: {h.function}()</span>
                          </div>
                          <p className="text-muted-foreground">{h.issue}</p>
                          <p className="text-green-500">💡 {h.suggestion} (-{h.savings}%)</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotspots">
          <Card>
            <CardHeader>
              <CardTitle>Carbon Hotspots</CardTitle>
              <CardDescription>All energy-intensive code patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.flatMap(a => a.hotspots.map(h => ({ ...h, file: a.file }))).sort((a, b) => b.savings - a.savings).map((h, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={impactColors[h.impact]}>{h.impact}</Badge>
                      <span className="font-mono text-sm">{h.file}:{h.line}</span>
                    </div>
                    <p>{h.issue}</p>
                    <p className="text-sm text-green-500 mt-1">{h.suggestion}</p>
                  </div>
                  <Badge variant="default" className="bg-green-500">-{h.savings}%</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare">
          <Card>
            <CardHeader>
              <CardTitle>PR Carbon Comparison</CardTitle>
              <CardDescription>Compare environmental impact before/after changes</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <span className="text-4xl">🌿</span>
              <p className="mt-4 text-muted-foreground">Select a PR to compare carbon impact</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
