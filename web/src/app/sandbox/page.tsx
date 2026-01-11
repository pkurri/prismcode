'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PreviewFrame } from '@/components/sandbox/preview-frame';

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

const DEFAULT_CODE = `export default function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 font-sans">
      <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
        PrismCode Sandbox
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md text-center">
        Enter a prompt above to generate a new UI component, or edit this code directly.
      </p>
      <div className="flex gap-4">
        <button className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition">
          Get Started
        </button>
        <button className="px-6 py-2 bg-white text-black border border-gray-200 rounded-full hover:bg-gray-50 transition">
          Learn More
        </button>
      </div>
    </div>
  );
}`;

export default function SandboxPage() {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState(DEFAULT_CODE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(devicePresets[2]); // Desktop default
  const [activeTab, setActiveTab] = useState('preview');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-ui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      if (data.code) {
        setCode(data.code);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeviceSelect = (device: DevicePreset) => {
    setSelectedDevice(device);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background">
      {/* AIS Prompt Bar */}
      <div className="border-b border-border/40 bg-muted/10 p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <span className="text-muted-foreground">✨</span>
            </div>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Describe a UI component to generate (e.g., 'login form', 'dashboard stats', 'pricing table')..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
              disabled={isGenerating}
            />
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || !prompt.trim()}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white min-w-[120px]"
          >
            {isGenerating ? (
              <>
                <span className="animate-spin mr-2">↻</span> Generating...
              </>
            ) : (
              'Generate UI'
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        <div className="w-1/2 border-r border-border/40 flex flex-col bg-[#1e1e1e]">
          <div className="px-4 py-2 bg-[#2d2d2d] border-b border-[#404040] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 text-xs font-mono">TSX</span>
              <span className="text-gray-400 text-xs">GeneratedComponent.tsx</span>
            </div>
            <button 
              onClick={() => setCode(DEFAULT_CODE)}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Reset
            </button>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-[#1e1e1e] text-gray-300 font-mono text-sm p-4 resize-none outline-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Preview Pane */}
        <div className="w-1/2 flex flex-col bg-slate-50 dark:bg-slate-950">
          <div className="px-4 py-2 border-b border-border/40 flex items-center justify-between bg-background">
            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg">
              {devicePresets.map((device) => (
                <button
                  key={device.name}
                  onClick={() => handleDeviceSelect(device)}
                  className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                    selectedDevice.name === device.name 
                      ? 'bg-white shadow text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{device.icon}</span>
                  <span className="hidden xl:inline">{device.name}</span>
                </button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {selectedDevice.width} × {selectedDevice.height}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-8 flex items-start justify-center">
            <div 
              style={{ width: selectedDevice.width, height: selectedDevice.height }}
              className="bg-background shadow-2xl rounded-xl border border-border/50 overflow-hidden shrink-0 transition-all duration-300"
            >
              <PreviewFrame code={code} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
