'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestions = [
  'Analyze my code for bugs',
  'Generate tests for utils/',
  'Find performance issues',
  'Fix accessibility problems',
  'Explain this error',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm PrismCode AI Assistant. I can help you analyze code, generate tests, find bugs, and improve your codebase. What would you like to work on?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const getAIResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('bug') || q.includes('error')) {
      return "I can analyze your code for potential bugs. To get started:\n\n1. **Select a file or directory** to analyze\n2. I'll scan for common issues like null references, async errors, and type mismatches\n3. You'll get actionable suggestions with auto-fix options\n\nWould you like me to analyze a specific file or your entire project?";
    }
    if (q.includes('test')) {
      return "I can generate comprehensive tests for your code!\n\n**My capabilities:**\n- Unit tests with Jest/Vitest\n- Integration tests\n- Edge case coverage\n- Mock generation\n\nPoint me to a file or function, and I'll generate tests with high coverage.";
    }
    if (q.includes('performance')) {
      return 'Let me analyze your codebase for performance issues:\n\n🔍 **Areas I check:**\n- Memory leaks\n- Unnecessary re-renders\n- Bundle size optimization\n- Database query efficiency\n\nShall I run a full performance audit?';
    }
    return "I understand you want help with that! I can:\n\n• Analyze code for issues\n• Generate tests\n• Suggest improvements\n• Fix accessibility problems\n• Debug errors\n\nCould you be more specific about what you'd like me to help with?";
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">Your intelligent coding companion</p>
        </div>
        <Badge variant="outline" className="gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          GPT-4 Active
        </Badge>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden border-border/50">
        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback
                  className={
                    message.role === 'assistant'
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                      : 'bg-muted'
                  }
                >
                  {message.role === 'assistant' ? 'AI' : 'U'}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted/50 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Suggestions */}
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="shrink-0 text-xs"
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your code..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
