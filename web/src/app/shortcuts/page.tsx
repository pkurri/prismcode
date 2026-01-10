'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Shortcut {
  id: string;
  keys: string[];
  action: string;
  category: string;
  customizable: boolean;
}

interface Command {
  id: string;
  name: string;
  shortcut?: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { id: '1', keys: ['⌘', 'K'], action: 'Open Command Palette', category: 'General', customizable: true },
  { id: '2', keys: ['⌘', 'S'], action: 'Save File', category: 'Editor', customizable: true },
  { id: '3', keys: ['⌘', 'P'], action: 'Quick Open File', category: 'Navigation', customizable: true },
  { id: '4', keys: ['⌘', 'Shift', 'F'], action: 'Search in Files', category: 'Search', customizable: true },
  { id: '5', keys: ['⌘', '/'], action: 'Toggle Comment', category: 'Editor', customizable: true },
  { id: '6', keys: ['⌘', 'D'], action: 'Add Selection', category: 'Editor', customizable: true },
  { id: '7', keys: ['⌘', 'B'], action: 'Toggle Sidebar', category: 'View', customizable: true },
  { id: '8', keys: ['⌘', 'J'], action: 'Toggle Terminal', category: 'View', customizable: true },
  { id: '9', keys: ['⌘', 'Shift', 'P'], action: 'Command Palette', category: 'General', customizable: true },
  { id: '10', keys: ['⌘', 'Enter'], action: 'Run Code', category: 'Execution', customizable: true },
  { id: '11', keys: ['⌘', 'Shift', 'A'], action: 'Ask AI', category: 'AI', customizable: true },
  { id: '12', keys: ['⌘', 'Shift', 'R'], action: 'AI Review', category: 'AI', customizable: true },
];

const commands: Command[] = [
  { id: 'c1', name: 'New File', shortcut: '⌘N', category: 'File' },
  { id: 'c2', name: 'Open File', shortcut: '⌘O', category: 'File' },
  { id: 'c3', name: 'Save All', shortcut: '⌘⇧S', category: 'File' },
  { id: 'c4', name: 'Close Tab', shortcut: '⌘W', category: 'File' },
  { id: 'c5', name: 'Find', shortcut: '⌘F', category: 'Edit' },
  { id: 'c6', name: 'Replace', shortcut: '⌘H', category: 'Edit' },
  { id: 'c7', name: 'Go to Line', shortcut: '⌘G', category: 'Navigation' },
  { id: 'c8', name: 'Go to Symbol', shortcut: '⌘⇧O', category: 'Navigation' },
  { id: 'c9', name: 'Git: Commit', category: 'Git' },
  { id: 'c10', name: 'Git: Push', category: 'Git' },
  { id: 'c11', name: 'AI: Generate Code', category: 'AI' },
  { id: 'c12', name: 'AI: Explain Selection', category: 'AI' },
  { id: 'c13', name: 'Run Tests', shortcut: '⌘⇧T', category: 'Testing' },
  { id: 'c14', name: 'Deploy to Staging', category: 'Deploy' },
];

const categories = ['All', 'General', 'Editor', 'Navigation', 'View', 'AI', 'Execution'];

export default function KeyboardShortcutsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPalette, setShowPalette] = useState(false);

  const filteredShortcuts = shortcuts.filter(s => 
    (selectedCategory === 'All' || s.category === selectedCategory) &&
    (s.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
     s.keys.join(' ').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCommands = commands.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Keyboard Shortcuts
          </h1>
          <p className="text-muted-foreground">Master your workflow with keyboard shortcuts</p>
        </div>
        <Button onClick={() => setShowPalette(true)} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          ⌘K Command Palette
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search shortcuts..."
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">⌘K</span>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="shortcuts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
          <TabsTrigger value="commands">All Commands</TabsTrigger>
        </TabsList>

        <TabsContent value="shortcuts">
          <Card>
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
              <CardDescription>Click on any shortcut to customize</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredShortcuts.map(shortcut => (
                <div 
                  key={shortcut.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">{shortcut.category}</Badge>
                    <span>{shortcut.action}</span>
                  </div>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, i) => (
                      <kbd 
                        key={i} 
                        className="px-2 py-1 rounded bg-muted border border-border text-sm font-mono"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commands">
          <Card>
            <CardHeader>
              <CardTitle>All Commands</CardTitle>
              <CardDescription>Browse all available commands</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredCommands.map(command => (
                <div 
                  key={command.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">{command.category}</Badge>
                    <span>{command.name}</span>
                  </div>
                  {command.shortcut && (
                    <span className="text-sm text-muted-foreground font-mono">{command.shortcut}</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Command Palette Modal */}
      {showPalette && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[20vh] z-50" onClick={() => setShowPalette(false)}>
          <Card className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-0">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <span className="text-muted-foreground">⌘</span>
                <input
                  type="text"
                  autoFocus
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent outline-none"
                />
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                {commands.slice(0, 8).map(command => (
                  <button
                    key={command.id}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-muted text-left"
                    onClick={() => setShowPalette(false)}
                  >
                    <span>{command.name}</span>
                    {command.shortcut && (
                      <span className="text-xs text-muted-foreground">{command.shortcut}</span>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
