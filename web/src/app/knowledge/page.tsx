'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface KnowledgeEntry {
  id: string;
  type: 'convention' | 'decision' | 'faq' | 'pattern' | 'onboarding';
  title: string;
  content: string;
  source: string;
  confidence: number;
  createdAt: string;
  tags: string[];
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  snippet: string;
  relevance: number;
}

const mockKnowledge: KnowledgeEntry[] = [
  { id: '1', type: 'convention', title: 'Component Naming', content: 'All React components should use PascalCase and be placed in dedicated folders with index.ts exports.', source: 'Team Discussion #234', confidence: 95, createdAt: '2 weeks ago', tags: ['react', 'components', 'naming'] },
  { id: '2', type: 'decision', title: 'State Management Choice', content: 'We use Zustand for global state instead of Redux due to simpler API and smaller bundle size.', source: 'ADR-015', confidence: 98, createdAt: '1 month ago', tags: ['state', 'zustand', 'architecture'] },
  { id: '3', type: 'pattern', title: 'API Error Handling', content: 'All API calls should wrap responses in a try-catch and use the ErrorBoundary for UI fallbacks.', source: 'Code Review PR #156', confidence: 92, createdAt: '3 weeks ago', tags: ['api', 'errors', 'patterns'] },
  { id: '4', type: 'faq', title: 'How to add a new page?', content: 'Create a new folder in app/ with a page.tsx file. The folder name becomes the route.', source: 'FAQ Auto-generated', confidence: 99, createdAt: '1 week ago', tags: ['next.js', 'routing', 'onboarding'] },
  { id: '5', type: 'onboarding', title: 'Dev Environment Setup', content: 'Run npm install, copy .env.example to .env.local, and start with npm run dev.', source: 'README.md', confidence: 100, createdAt: '2 months ago', tags: ['setup', 'onboarding', 'development'] },
];

const typeIcons: Record<string, string> = {
  convention: '📐',
  decision: '🎯',
  faq: '❓',
  pattern: '🧩',
  onboarding: '🚀',
};

export default function KnowledgeGraphPage() {
  const [knowledge] = useState(mockKnowledge);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [aiResponse, setAiResponse] = useState('');

  const filteredKnowledge = knowledge.filter(k => 
    (selectedType === 'all' || k.type === selectedType) &&
    (k.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     k.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
     k.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const askAI = async () => {
    if (!searchQuery) return;
    // Simulate AI response
    setAiResponse('Based on team knowledge: ' + knowledge[0].content);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Team Knowledge Graph
        </h1>
        <p className="text-muted-foreground">AI-powered institutional memory for your team</p>
      </div>

      {/* AI Search */}
      <Card className="bg-gradient-to-r from-violet-600/5 to-purple-600/5 border-violet-500/30">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask anything about team conventions, decisions, or patterns..."
                className="w-full px-4 py-3 rounded-lg border border-border bg-background"
                onKeyDown={(e) => e.key === 'Enter' && askAI()}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl">🤖</span>
            </div>
            <Button onClick={askAI} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
              Ask AI
            </Button>
          </div>
          {aiResponse && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50">
              <p className="text-sm">{aiResponse}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Knowledge</CardDescription>
            <CardTitle className="text-3xl">{knowledge.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conventions</CardDescription>
            <CardTitle className="text-3xl">{knowledge.filter(k => k.type === 'convention').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Decisions (ADRs)</CardDescription>
            <CardTitle className="text-3xl">{knowledge.filter(k => k.type === 'decision').length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>FAQs</CardDescription>
            <CardTitle className="text-3xl">{knowledge.filter(k => k.type === 'faq').length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="add">Add Knowledge</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          {/* Type Filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {['all', 'convention', 'decision', 'pattern', 'faq', 'onboarding'].map(type => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="capitalize"
              >
                {type !== 'all' && <span className="mr-1">{typeIcons[type]}</span>}
                {type}
              </Button>
            ))}
          </div>

          {/* Knowledge List */}
          <div className="space-y-3">
            {filteredKnowledge.map(entry => (
              <Card key={entry.id} className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{typeIcons[entry.type]}</span>
                      <div>
                        <h3 className="font-semibold">{entry.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{entry.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">{entry.source}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{entry.createdAt}</span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {entry.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={`${entry.confidence >= 95 ? 'text-green-500 border-green-500/30' : 'text-amber-500 border-amber-500/30'}`}>
                        {entry.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="onboarding">
          <Card>
            <CardHeader>
              <CardTitle>🚀 New Team Member Onboarding</CardTitle>
              <CardDescription>Essential knowledge for getting started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {knowledge.filter(k => k.type === 'onboarding' || k.tags.includes('onboarding')).map((entry, i) => (
                <div key={entry.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{entry.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{entry.content}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add Team Knowledge</CardTitle>
              <CardDescription>Contribute to the team knowledge base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <select className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background">
                  <option value="convention">Convention</option>
                  <option value="decision">Decision (ADR)</option>
                  <option value="pattern">Pattern</option>
                  <option value="faq">FAQ</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <input type="text" className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background" placeholder="e.g., Error Handling Convention" />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <textarea className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background min-h-[100px]" placeholder="Describe the convention, decision, or pattern..." />
              </div>
              <div>
                <label className="text-sm font-medium">Tags</label>
                <input type="text" className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background" placeholder="react, components, patterns (comma separated)" />
              </div>
              <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                Add to Knowledge Base
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
