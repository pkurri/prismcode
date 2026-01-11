'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: Date;
}

const mockStats = [
  { label: 'Files Indexed', value: '1,248' },
  { label: 'Lines of Code', value: '142k' },
  { label: 'Last Indexed', value: '2m ago' },
];

export default function AskPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your Codebase Assistant. I have indexed the entire `prismcode` repository. Ask me anything about the architecture, authentication, or agent system.',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleAsk = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg.content }),
      });
      const data = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error searching the codebase. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "How does authentication work?",
    "Explain the Agent architecture",
    "Where are the E2E tests?",
    "Show me the Prisma schema"
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - Context Stats */}
      <div className="w-80 border-r border-border/40 bg-muted/10 p-6 hidden lg:block">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <span>🧠</span> Knowledge Base
        </h2>
        <div className="grid grid-cols-1 gap-4 mb-8">
          {mockStats.map(stat => (
            <div key={stat.label} className="bg-background p-3 rounded-lg border border-border/40 shadow-sm">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              <div className="text-lg font-bold mt-1 text-primary">{stat.value}</div>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-medium text-muted-foreground mb-3">Indexed Directories</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-foreground/80">
            <span className="text-blue-500">📁</span> web/src/app
          </div>
          <div className="flex items-center gap-2 text-foreground/80">
            <span className="text-blue-500">📁</span> packages/agents
          </div>
          <div className="flex items-center gap-2 text-foreground/80">
            <span className="text-blue-500">📁</span> prisma
          </div>
          <div className="flex items-center gap-2 text-foreground/80">
            <span className="text-blue-500">📁</span> documentation
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex gap-4 max-w-3xl mx-auto ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs shrink-0 mt-1">
                  AI
                </div>
              )}
              
              <div
                className={`flex-1 rounded-2xl p-4 md:p-6 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground max-w-[80%]'
                    : 'bg-muted/30 border border-border/40'
                }`}
              >
                <div className={`prose dark:prose-invert max-w-none text-sm leading-relaxed ${msg.role === 'user' ? 'text-primary-foreground' : ''}`}>
                   <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/20">
                    <div className="text-xs font-medium text-muted-foreground uppercase mb-2">Sources</div>
                    <div className="flex flex-wrap gap-2">
                       {msg.sources.map(src => (
                         <Badge key={src} variant="outline" className="bg-background/50 hover:bg-background cursor-pointer font-mono text-[10px]">
                           {src}
                         </Badge>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-3xl mx-auto">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs shrink-0 animate-pulse">
                  AI
               </div>
               <div className="bg-muted/20 border border-border/20 rounded-2xl p-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"></span>
               </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border/40 bg-background/80 backdrop-blur-sm p-4 md:p-6">
           <div className="max-w-3xl mx-auto">
              {messages.length === 1 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-3 py-1.5 rounded-full border border-border/60 bg-muted/10 hover:bg-muted/30 text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              
              <form onSubmit={handleAsk} className="relative group">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question about the codebase..."
                  className="w-full pl-5 pr-14 py-4 rounded-xl border border-border bg-muted/10 focus:bg-background focus:ring-2 focus:ring-violet-500/20 outline-none transition-all shadow-sm"
                />
                <Button 
                   type="submit" 
                   size="icon"
                   disabled={!query.trim() || isLoading}
                   className="absolute right-2 top-2 w-10 h-10 rounded-lg bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                >
                  ↑
                </Button>
              </form>
              <div className="text-center mt-2 text-[10px] text-muted-foreground/50">
                AI can make mistakes. Check code references.
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
