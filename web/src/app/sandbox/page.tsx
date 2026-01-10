'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  icon: string;
}

const devicePresets: DevicePreset[] = [
  { name: 'Mobile', width: 390, height: 844, icon: '📱' },
  { name: 'Tablet', width: 768, height: 1024, icon: '📲' },
  { name: 'Desktop', width: 1280, height: 800, icon: '🖥️' },
  { name: 'Wide', width: 1920, height: 1080, icon: '🖵' },
];

interface ConsoleLog {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: string;
  source?: string;
}

const mockConsoleLogs: ConsoleLog[] = [
  { id: '1', type: 'info', message: '[HMR] Waiting for update signal from WDS...', timestamp: '12:34:56', source: 'webpack' },
  { id: '2', type: 'log', message: 'App initialized successfully', timestamp: '12:34:57', source: 'App.tsx' },
  { id: '3', type: 'warn', message: 'React Query devtools enabled in production', timestamp: '12:34:58', source: 'react-query' },
  { id: '4', type: 'log', message: 'Fetching user data...', timestamp: '12:35:01', source: 'api.ts' },
  { id: '5', type: 'log', message: 'User data loaded: 1 user', timestamp: '12:35:02', source: 'api.ts' },
];

const logColors = {
  log: 'text-foreground',
  error: 'text-red-500',
  warn: 'text-amber-500',
  info: 'text-blue-500',
};

export default function SandboxPage() {
  const [selectedDevice, setSelectedDevice] = useState(devicePresets[0]);
  const [customWidth, setCustomWidth] = useState(390);
  const [customHeight, setCustomHeight] = useState(844);
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('http://localhost:3000');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState(mockConsoleLogs);
  const [activePanel, setActivePanel] = useState<'preview' | 'console'>('preview');
  const [zoom, setZoom] = useState(100);

  const currentWidth = isCustomSize ? customWidth : selectedDevice.width;
  const currentHeight = isCustomSize ? customHeight : selectedDevice.height;

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
      setConsoleLogs([
        ...consoleLogs,
        { id: Date.now().toString(), type: 'info', message: '[HMR] App hot updated', timestamp: new Date().toLocaleTimeString(), source: 'webpack' },
      ]);
    }, 1000);
  };

  const handleDeviceSelect = (device: DevicePreset) => {
    setSelectedDevice(device);
    setIsCustomSize(false);
  };

  const clearConsole = () => {
    setConsoleLogs([]);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Preview Sandbox
          </h1>
          <p className="text-sm text-muted-foreground">
            Live preview with hot reload
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={hasError ? 'text-red-500 border-red-500/50' : 'text-green-500 border-green-500/50'}>
            <span className={`w-2 h-2 rounded-full mr-2 ${hasError ? 'bg-red-500' : 'bg-green-500'}`} />
            {hasError ? 'Error' : 'Running'}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? '↻' : '🔄'} Refresh
          </Button>
          <Button variant="outline" size="sm">
            ↗️ Open
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel (placeholder) */}
        <div className="w-1/2 border-r border-border/50 flex flex-col">
          <div className="p-2 bg-muted/30 border-b border-border/50 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">src/App.tsx</Badge>
            <span className="text-xs text-muted-foreground">Modified</span>
          </div>
          <div className="flex-1 bg-[#1e1e1e] p-4 overflow-auto font-mono text-sm">
            <pre className="text-gray-300">
{`import React from 'react';
import { Dashboard } from './components/Dashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Dashboard />
      </div>
    </QueryClientProvider>
  );
}`}
            </pre>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-1/2 flex flex-col">
          {/* Device Toolbar */}
          <div className="p-2 bg-muted/30 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {devicePresets.map((device) => (
                <Button
                  key={device.name}
                  variant={!isCustomSize && selectedDevice.name === device.name ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleDeviceSelect(device)}
                  className="text-xs"
                >
                  {device.icon} {device.name}
                </Button>
              ))}
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Button
                variant={isCustomSize ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setIsCustomSize(true)}
                className="text-xs"
              >
                📐 Custom
              </Button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{currentWidth}×{currentHeight}</span>
              <select 
                value={zoom} 
                onChange={(e) => setZoom(Number(e.target.value))}
                className="bg-transparent border border-border/50 rounded px-1 py-0.5"
              >
                <option value={50}>50%</option>
                <option value={75}>75%</option>
                <option value={100}>100%</option>
                <option value={125}>125%</option>
              </select>
            </div>
          </div>

          {/* Preview Iframe */}
          <div className="flex-1 bg-[#2a2a2a] overflow-auto flex items-start justify-center p-4">
            <div 
              className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
              style={{
                width: currentWidth * (zoom / 100),
                height: currentHeight * (zoom / 100),
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
              }}
            >
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin text-4xl mb-2">⚙️</div>
                    <p className="text-gray-500">Loading preview...</p>
                  </div>
                </div>
              ) : hasError ? (
                <div className="w-full h-full flex items-center justify-center bg-red-50 p-8">
                  <div className="text-center">
                    <div className="text-5xl mb-4">❌</div>
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Build Error</h3>
                    <p className="text-red-500 text-sm mb-4">Failed to compile</p>
                    <code className="block bg-red-100 p-3 rounded text-xs text-left text-red-700">
                      Error: Cannot find module './Dashboard'
                    </code>
                  </div>
                </div>
              ) : (
                <iframe
                  src="about:blank"
                  className="w-full h-full border-0"
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin"
                  style={{ background: '#fff' }}
                />
              )}
            </div>
          </div>

          {/* Console Panel */}
          <div className="h-48 border-t border-border/50 flex flex-col">
            <div className="p-2 bg-muted/30 flex items-center justify-between">
              <Tabs value={activePanel} onValueChange={(v) => setActivePanel(v as 'preview' | 'console')}>
                <TabsList className="h-7">
                  <TabsTrigger value="console" className="text-xs h-6">
                    Console ({consoleLogs.length})
                  </TabsTrigger>
                  <TabsTrigger value="network" className="text-xs h-6">
                    Network
                  </TabsTrigger>
                  <TabsTrigger value="elements" className="text-xs h-6">
                    Elements
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="ghost" size="sm" onClick={clearConsole} className="text-xs h-6">
                🗑️ Clear
              </Button>
            </div>
            <div className="flex-1 overflow-auto bg-[#1e1e1e] p-2 font-mono text-xs">
              {consoleLogs.length === 0 ? (
                <p className="text-gray-500">Console is empty</p>
              ) : (
                consoleLogs.map((log) => (
                  <div key={log.id} className={`py-0.5 flex items-start gap-2 ${logColors[log.type]}`}>
                    <span className="text-gray-500">{log.timestamp}</span>
                    <span className="text-gray-600">[{log.source}]</span>
                    <span>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
