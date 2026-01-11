'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DebugMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  codeBlock?: string;
}

interface BreakpointSuggestion {
  file: string;
  line: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

const mockMessages: DebugMessage[] = [
  { id: '1', role: 'user', content: 'Why is user undefined here?', timestamp: '2:34 PM' },
  { id: '2', role: 'assistant', content: 'The `user` variable is undefined because the `fetchUser` async call hasn\'t completed before you access it. The component renders immediately, but the data fetch is asynchronous.', timestamp: '2:34 PM' },
  { id: '3', role: 'assistant', content: 'Here\'s how to fix it:', timestamp: '2:34 PM', codeBlock: 'if (!user) return <Loading />;\n// or use optional chaining\nconst name = user?.name ?? "Guest";' },
  { id: '4', role: 'user', content: 'Can you suggest where to add breakpoints?', timestamp: '2:35 PM' },
  { id: '5', role: 'assistant', content: 'I\'ve identified 3 strategic breakpoint locations based on the data flow:', timestamp: '2:35 PM' },
];

const mockBreakpoints: BreakpointSuggestion[] = [
  { file: 'UserProfile.tsx', line: 15, reason: 'Before async fetch - verify call is made', priority: 'high' },
  { file: 'UserProfile.tsx', line: 23, reason: 'After state update - check user value', priority: 'high' },
  { file: 'api/users.ts', line: 8, reason: 'API response handling', priority: 'medium' },
];

const priorityColors: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-green-500',
};

export default function LiveDebugPage() {
  const [messages, setMessages] = useState(mockMessages);
  const [breakpoints] = useState(mockBreakpoints);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      id: String(prev.length + 1),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: String(prev.length + 1),
        role: 'assistant',
        content: 'I\'m analyzing your code. Let me trace the execution flow...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Live Debug Assistant
          </h1>
          <p className="text-muted-foreground">AI companion for real-time debugging</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-500 border-green-500/30">
            🟢 VS Code Connected
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Debug Chat</CardTitle>
            <CardDescription>Ask questions about your code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="h-80 overflow-y-auto space-y-4 p-4 rounded-lg bg-muted/30">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p>{msg.content}</p>
                    {msg.codeBlock && (
                      <pre className="mt-2 p-2 rounded bg-background/50 text-sm font-mono overflow-x-auto">
                        {msg.codeBlock}
                      </pre>
                    )}
                    <span className="text-xs opacity-60 mt-1 block">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about your code..."
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background"
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </CardContent>
        </Card>

        {/* Breakpoints Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Suggested Breakpoints</CardTitle>
            <CardDescription>Optimal debug locations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {breakpoints.map((bp, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${priorityColors[bp.priority]}`} />
                  <span className="font-mono text-sm">{bp.file}:{bp.line}</span>
                </div>
                <p className="text-sm text-muted-foreground">{bp.reason}</p>
                <Button variant="outline" size="sm" className="mt-2 w-full">
                  Set Breakpoint
                </Button>
              </div>
            ))}

            <hr className="my-4" />

            {/* Variable State */}
            <div>
              <h4 className="font-medium mb-2">Current Variables</h4>
              <div className="space-y-2 font-mono text-sm">
                {[
                  { name: 'user', value: 'undefined', type: 'object' },
                  { name: 'isLoading', value: 'true', type: 'boolean' },
                  { name: 'error', value: 'null', type: 'object' },
                ].map((v, i) => (
                  <div key={i} className="flex justify-between p-2 rounded bg-muted/50">
                    <span className="text-blue-500">{v.name}</span>
                    <span className={v.value === 'undefined' ? 'text-red-500' : ''}>{v.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Flow</CardTitle>
          <CardDescription>AI-traced code execution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 overflow-x-auto py-2">
            {[
              { step: 1, name: 'Component Mount', status: 'done' },
              { step: 2, name: 'useEffect Triggered', status: 'done' },
              { step: 3, name: 'fetchUser Called', status: 'done' },
              { step: 4, name: 'Render (user=undefined)', status: 'error' },
              { step: 5, name: 'API Response', status: 'pending' },
              { step: 6, name: 'setState', status: 'pending' },
            ].map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={`p-3 rounded-lg text-center min-w-[120px] ${
                  s.status === 'done' ? 'bg-green-500/10 border border-green-500/30' :
                  s.status === 'error' ? 'bg-red-500/10 border border-red-500/30' :
                  'bg-muted/30'
                }`}>
                  <span className="text-xs text-muted-foreground">Step {s.step}</span>
                  <p className="text-sm font-medium">{s.name}</p>
                </div>
                {i < 5 && <span className="mx-2 text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
