'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GeneratedTest {
  id: string;
  functionName: string;
  testType: 'unit' | 'integration' | 'edge_case' | 'property';
  code: string;
  confidence: number;
  status: 'pending' | 'accepted' | 'rejected';
}

interface SourceFile {
  name: string;
  path: string;
  coverage: number;
  uncoveredFunctions: string[];
}

const mockGeneratedTests: GeneratedTest[] = [
  { id: '1', functionName: 'calculateTotal', testType: 'unit', code: `test('calculateTotal returns correct sum', () => {\n  expect(calculateTotal([10, 20, 30])).toBe(60);\n});`, confidence: 95, status: 'pending' },
  { id: '2', functionName: 'calculateTotal', testType: 'edge_case', code: `test('calculateTotal handles empty array', () => {\n  expect(calculateTotal([])).toBe(0);\n});`, confidence: 92, status: 'pending' },
  { id: '3', functionName: 'validateEmail', testType: 'unit', code: `test('validateEmail accepts valid email', () => {\n  expect(validateEmail('test@example.com')).toBe(true);\n});`, confidence: 98, status: 'accepted' },
  { id: '4', functionName: 'validateEmail', testType: 'edge_case', code: `test('validateEmail rejects invalid format', () => {\n  expect(validateEmail('not-an-email')).toBe(false);\n});`, confidence: 96, status: 'accepted' },
  { id: '5', functionName: 'fetchUserData', testType: 'integration', code: `test('fetchUserData returns user from API', async () => {\n  const user = await fetchUserData('123');\n  expect(user.id).toBe('123');\n});`, confidence: 88, status: 'pending' },
];

const mockSourceFiles: SourceFile[] = [
  { name: 'utils.ts', path: 'src/lib/utils.ts', coverage: 75, uncoveredFunctions: ['calculateTotal', 'formatDate'] },
  { name: 'validators.ts', path: 'src/lib/validators.ts', coverage: 90, uncoveredFunctions: ['validatePhone'] },
  { name: 'api.ts', path: 'src/lib/api.ts', coverage: 60, uncoveredFunctions: ['fetchUserData', 'updateSettings', 'deleteAccount'] },
];

const testTypeColors: Record<string, string> = {
  unit: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  integration: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  edge_case: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  property: 'bg-green-500/10 text-green-500 border-green-500/30',
};

export default function TestGenerationPage() {
  const [tests, setTests] = useState(mockGeneratedTests);
  const [files] = useState(mockSourceFiles);
  const [isGenerating, setIsGenerating] = useState(false);

  const acceptTest = (id: string) => {
    setTests(prev => prev.map(t => t.id === id ? { ...t, status: 'accepted' as const } : t));
  };

  const rejectTest = (id: string) => {
    setTests(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' as const } : t));
  };

  const generateTests = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  const pendingCount = tests.filter(t => t.status === 'pending').length;
  const acceptedCount = tests.filter(t => t.status === 'accepted').length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            AI Test Generation
          </h1>
          <p className="text-muted-foreground">Automatically generate tests from your code</p>
        </div>
        <Button onClick={generateTests} disabled={isGenerating} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          {isGenerating ? '🔄 Generating...' : '🤖 Generate Tests'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Generated</CardDescription>
            <CardTitle className="text-3xl">{tests.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-amber-500">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Accepted</CardDescription>
            <CardTitle className="text-3xl text-green-500">{acceptedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Confidence</CardDescription>
            <CardTitle className="text-3xl">{Math.round(tests.reduce((s, t) => s + t.confidence, 0) / tests.length)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">Generated Tests</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Gaps</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle>Generated Tests</CardTitle>
              <CardDescription>Review and accept AI-generated tests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tests.map(test => (
                <div key={test.id} className={`p-4 rounded-lg ${test.status === 'accepted' ? 'bg-green-500/5 border border-green-500/30' : test.status === 'rejected' ? 'bg-muted/30 opacity-50' : 'bg-muted/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={testTypeColors[test.testType]}>
                        {test.testType.replace('_', ' ')}
                      </Badge>
                      <span className="font-medium">{test.functionName}()</span>
                      <Badge variant="secondary">{test.confidence}% confidence</Badge>
                    </div>
                    {test.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => rejectTest(test.id)}>✗ Reject</Button>
                        <Button size="sm" onClick={() => acceptTest(test.id)}>✓ Accept</Button>
                      </div>
                    )}
                    {test.status !== 'pending' && (
                      <Badge variant={test.status === 'accepted' ? 'default' : 'secondary'}>
                        {test.status}
                      </Badge>
                    )}
                  </div>
                  <pre className="p-3 rounded bg-muted text-sm font-mono overflow-x-auto">
                    {test.code}
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage">
          <Card>
            <CardHeader>
              <CardTitle>Coverage Gaps</CardTitle>
              <CardDescription>Functions needing test coverage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {files.map(file => (
                <div key={file.path} className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium font-mono">{file.name}</h4>
                      <p className="text-sm text-muted-foreground">{file.path}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${file.coverage >= 80 ? 'bg-green-500' : file.coverage >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${file.coverage}%` }} />
                      </div>
                      <span className="text-sm">{file.coverage}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {file.uncoveredFunctions.map(fn => (
                      <Badge key={fn} variant="secondary" className="font-mono text-xs">
                        {fn}()
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-3">
                    🤖 Generate Tests for Uncovered
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Generation Settings</CardTitle>
              <CardDescription>Configure test generation preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Generate Edge Cases', desc: 'Include tests for boundary conditions', enabled: true },
                { name: 'Property-Based Tests', desc: 'Generate generative tests with random inputs', enabled: false },
                { name: 'Follow Project Style', desc: 'Match existing test conventions', enabled: true },
                { name: 'Auto-Accept High Confidence', desc: 'Automatically accept tests with 95%+ confidence', enabled: false },
              ].map((setting, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{setting.name}</p>
                    <p className="text-sm text-muted-foreground">{setting.desc}</p>
                  </div>
                  <Button variant={setting.enabled ? 'default' : 'outline'} size="sm">
                    {setting.enabled ? '✓ On' : 'Off'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
