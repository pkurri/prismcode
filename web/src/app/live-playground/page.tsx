'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function LivePlaygroundPage() {
  const [code, setCode] = useState(`function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));`);
  const [output, setOutput] = useState('');

  const runCode = () => {
    try {
      // Simulated execution
      setOutput('> Hello, World!');
    } catch (e) {
      setOutput(`Error: ${e}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Live Code Playground
          </h1>
          <p className="text-muted-foreground">Write, run, and preview code in real-time</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">JavaScript</Badge>
          <Button onClick={runCode} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            ▶️ Run
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Code Editor</CardTitle>
            <CardDescription>Write your code here</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 p-4 font-mono text-sm bg-muted rounded-lg resize-none"
              spellCheck={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>Execution results</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="w-full h-64 p-4 font-mono text-sm bg-muted rounded-lg overflow-auto">
              {output || 'Click "Run" to execute code...'}
            </pre>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Live preview of UI components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
            Live preview will appear here
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
