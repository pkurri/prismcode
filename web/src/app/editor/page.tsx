'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EditorFile {
  name: string;
  path: string;
  language: string;
  content: string;
  modified: boolean;
}

interface EditorTheme {
  id: string;
  name: string;
  type: 'dark' | 'light';
}

const themes: EditorTheme[] = [
  { id: 'vs-dark', name: 'Dark+', type: 'dark' },
  { id: 'dracula', name: 'Dracula', type: 'dark' },
  { id: 'monokai', name: 'Monokai', type: 'dark' },
  { id: 'github-dark', name: 'GitHub Dark', type: 'dark' },
  { id: 'vs-light', name: 'Light+', type: 'light' },
];

const sampleFiles: EditorFile[] = [
  {
    name: 'App.tsx',
    path: 'src/App.tsx',
    language: 'typescript',
    content: `import React from 'react';
import { Dashboard } from './components/Dashboard';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <Dashboard />
      </div>
    </AuthProvider>
  );
}`,
    modified: false,
  },
  {
    name: 'Dashboard.tsx',
    path: 'src/components/Dashboard.tsx',
    language: 'typescript',
    content: `import { Card } from '@/components/ui/card';

export function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Card>
        <p>Welcome to PrismCode!</p>
      </Card>
    </div>
  );
}`,
    modified: true,
  },
  {
    name: 'api.ts',
    path: 'src/lib/api.ts',
    language: 'typescript',
    content: `const API_BASE = '/api';

export async function fetchData<T>(endpoint: string): Promise<T> {
  const res = await fetch(\`\${API_BASE}\${endpoint}\`);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function postData<T>(endpoint: string, data: unknown): Promise<T> {
  const res = await fetch(\`\${API_BASE}\${endpoint}\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to post');
  return res.json();
}`,
    modified: false,
  },
];

const languageIcons: Record<string, string> = {
  typescript: '📘',
  javascript: '📒',
  python: '🐍',
  rust: '🦀',
  go: '🐹',
  html: '🌐',
  css: '🎨',
  json: '📋',
};

export default function EditorPage() {
  const [files, setFiles] = useState(sampleFiles);
  const [activeFile, setActiveFile] = useState(sampleFiles[0]);
  const [theme, setTheme] = useState(themes[0]);
  const [fontSize, setFontSize] = useState(14);
  const [minimap, setMinimap] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const handleContentChange = (content: string) => {
    setActiveFile(prev => ({ ...prev, content, modified: true }));
    setFiles(prev => prev.map(f => 
      f.path === activeFile.path ? { ...f, content, modified: true } : f
    ));
  };

  const saveFile = () => {
    setActiveFile(prev => ({ ...prev, modified: false }));
    setFiles(prev => prev.map(f => 
      f.path === activeFile.path ? { ...f, modified: false } : f
    ));
    // In production, save to backend
    console.log('Saving file:', activeFile.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      saveFile();
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Toolbar */}
      <div className="h-10 border-b border-border/50 flex items-center justify-between px-2 bg-background">
        <div className="flex items-center gap-1">
          {files.map(file => (
            <button
              key={file.path}
              onClick={() => setActiveFile(file)}
              className={`px-3 py-1.5 text-sm flex items-center gap-1.5 rounded-t border-b-2 transition-colors ${
                activeFile.path === file.path 
                  ? 'bg-muted border-primary text-foreground' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{languageIcons[file.language] || '📄'}</span>
              <span>{file.name}</span>
              {file.modified && <span className="w-2 h-2 rounded-full bg-amber-500" />}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
            ⚙️
          </Button>
          <Button variant="ghost" size="sm" onClick={saveFile} disabled={!activeFile.modified}>
            💾 Save
          </Button>
          <Button variant="ghost" size="sm">
            ▶️ Run
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* File Explorer */}
        <div className="w-56 border-r border-border/50 bg-muted/20 overflow-y-auto">
          <div className="p-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Explorer
          </div>
          <div className="space-y-0.5 px-2">
            {files.map(file => (
              <button
                key={file.path}
                onClick={() => setActiveFile(file)}
                className={`w-full text-left px-2 py-1 text-sm rounded flex items-center gap-2 ${
                  activeFile.path === file.path ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                }`}
              >
                <span>{languageIcons[file.language] || '📄'}</span>
                <span className="truncate">{file.path}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Breadcrumb */}
          <div className="h-6 px-3 flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 border-b border-border/30">
            <span>📁 src</span>
            <span>/</span>
            <span>{activeFile.name}</span>
            <Badge variant="secondary" className="ml-2 text-[10px]">{activeFile.language}</Badge>
          </div>

          {/* Code Editor (Monaco placeholder - in production use @monaco-editor/react) */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 flex">
              {/* Line Numbers */}
              <div className="w-12 bg-muted/30 text-right pr-2 pt-2 select-none">
                {activeFile.content.split('\n').map((_, i) => (
                  <div key={i} className="text-xs text-muted-foreground leading-6">{i + 1}</div>
                ))}
              </div>
              
              {/* Editor */}
              <textarea
                ref={editorRef}
                value={activeFile.content}
                onChange={(e) => handleContentChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-[#1e1e1e] text-gray-100 p-2 font-mono resize-none outline-none"
                style={{ fontSize: `${fontSize}px`, lineHeight: '24px' }}
                spellCheck={false}
              />

              {/* Minimap (simplified) */}
              {minimap && (
                <div className="w-24 bg-muted/20 overflow-hidden">
                  <div className="transform scale-[0.15] origin-top-left whitespace-pre font-mono text-[10px] text-muted-foreground p-1">
                    {activeFile.content}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Bar */}
          <div className="h-6 border-t border-border/50 bg-muted/30 px-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Ln 1, Col 1</span>
              <span>{activeFile.language}</span>
              <span>UTF-8</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Spaces: 2</span>
              <span>{theme.name}</span>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-64 border-l border-border/50 bg-background p-4">
            <h3 className="font-medium mb-4">Editor Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Theme</label>
                <select
                  value={theme.id}
                  onChange={(e) => setTheme(themes.find(t => t.id === e.target.value) || themes[0])}
                  className="w-full mt-1 px-2 py-1 rounded border border-border bg-background text-sm"
                >
                  {themes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Font Size: {fontSize}px</label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Minimap</span>
                <button
                  onClick={() => setMinimap(!minimap)}
                  className={`w-10 h-5 rounded-full transition-colors ${minimap ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${minimap ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Word Wrap</span>
                <button
                  onClick={() => setWordWrap(!wordWrap)}
                  className={`w-10 h-5 rounded-full transition-colors ${wordWrap ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${wordWrap ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
