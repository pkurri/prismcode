'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalysisResult {
  id: string;
  type: 'color' | 'spacing' | 'typography' | 'layout' | 'component';
  severity: 'info' | 'warning' | 'error';
  description: string;
  suggestion: string;
  cssCode?: string;
}

interface Comparison {
  id: string;
  name: string;
  designUrl: string;
  implementedUrl: string;
  matchScore: number;
  differences: number;
  analyzedAt: string;
}

const mockResults: AnalysisResult[] = [
  { id: '1', type: 'spacing', severity: 'warning', description: 'Button padding differs from design', suggestion: 'Increase horizontal padding by 4px', cssCode: 'padding: 12px 20px; /* was 12px 16px */' },
  { id: '2', type: 'color', severity: 'error', description: 'Primary color doesn\'t match design', suggestion: 'Update primary color to match Figma', cssCode: '--primary: hsl(262, 83%, 58%); /* was hsl(262, 80%, 55%) */' },
  { id: '3', type: 'typography', severity: 'info', description: 'Font size slightly larger', suggestion: 'Consider reducing heading size by 2px', cssCode: 'font-size: 28px; /* was 30px */' },
  { id: '4', type: 'layout', severity: 'warning', description: 'Card border radius differs', suggestion: 'Increase border radius to 12px', cssCode: 'border-radius: 12px; /* was 8px */' },
];

const mockComparisons: Comparison[] = [
  { id: '1', name: 'Dashboard Header', designUrl: '/design-1.png', implementedUrl: '/impl-1.png', matchScore: 92, differences: 4, analyzedAt: '2 hours ago' },
  { id: '2', name: 'Login Form', designUrl: '/design-2.png', implementedUrl: '/impl-2.png', matchScore: 88, differences: 7, analyzedAt: 'Yesterday' },
  { id: '3', name: 'Settings Page', designUrl: '/design-3.png', implementedUrl: '/impl-3.png', matchScore: 95, differences: 2, analyzedAt: 'Last week' },
];

const typeIcons: Record<string, string> = {
  color: '🎨',
  spacing: '📐',
  typography: '📝',
  layout: '📱',
  component: '🧩',
};

const severityColors: Record<string, string> = {
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  warning: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  error: 'bg-red-500/10 text-red-500 border-red-500/30',
};

export default function ScreenshotAnalysisPage() {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      analyzeImage();
    }
  };

  const analyzeImage = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setResults(mockResults);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Screenshot to Code
        </h1>
        <p className="text-muted-foreground">Upload designs to get CSS suggestions and detect visual regressions</p>
      </div>

      <Tabs defaultValue="analyze" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analyze">Analyze Screenshot</TabsTrigger>
          <TabsTrigger value="compare">Design Comparison</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="analyze">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Design Screenshot</CardTitle>
                <CardDescription>PNG, JPG, or Figma export</CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Uploaded design" className="max-h-64 mx-auto rounded" />
                  ) : (
                    <>
                      <span className="text-5xl">📷</span>
                      <p className="mt-4 font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground mt-1">Supports PNG, JPG, WEBP</p>
                    </>
                  )}
                </div>
                {uploadedImage && (
                  <Button 
                    onClick={analyzeImage} 
                    disabled={isAnalyzing} 
                    className="w-full mt-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                  >
                    {isAnalyzing ? '🔄 Analyzing with AI...' : '🤖 Analyze with GPT-4V'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>AI-detected differences and suggestions</CardDescription>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <span className="text-4xl">🔍</span>
                    <p className="mt-4">Upload a screenshot to analyze</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {results.map(result => (
                      <div key={result.id} className={`p-3 rounded-lg ${severityColors[result.severity].replace('text-', 'bg-').split(' ')[0]}/5 border ${severityColors[result.severity].split(' ')[2]}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span>{typeIcons[result.type]}</span>
                          <Badge variant="outline" className={severityColors[result.severity]}>
                            {result.type}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{result.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">💡 {result.suggestion}</p>
                        {result.cssCode && (
                          <pre className="mt-2 p-2 rounded bg-muted text-xs font-mono overflow-x-auto">
                            {result.cssCode}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compare">
          <Card>
            <CardHeader>
              <CardTitle>Design vs Implementation</CardTitle>
              <CardDescription>Compare Figma designs with actual implementation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockComparisons.map(comp => (
                  <Card key={comp.id} className="cursor-pointer hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded mb-3 flex items-center justify-center">
                        <span className="text-3xl">🖼️</span>
                      </div>
                      <h4 className="font-medium">{comp.name}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant={comp.matchScore >= 90 ? 'default' : 'secondary'}>
                          {comp.matchScore}% match
                        </Badge>
                        <span className="text-xs text-muted-foreground">{comp.differences} differences</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{comp.analyzedAt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Analysis History</CardTitle>
              <CardDescription>Previous screenshot analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <span className="text-4xl">📜</span>
                <p className="mt-4">Analysis history will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
