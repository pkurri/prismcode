'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeviceFrame } from '@/components/mobile/device-frame';
import { 
  Smartphone, 
  Tablet, 
  RotateCw, 
  LayoutDashboard, 
  Activity, 
  Settings, 
  Code
} from 'lucide-react';

const PREVIEW_PAGES = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Activity Feed', path: '/activity', icon: Activity },
  { name: 'Sandbox', path: '/sandbox', icon: Code },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function MobilePreviewPage() {
  const [selectedDevice, setSelectedDevice] = useState<'iphone' | 'pixel' | 'ipad'>('iphone');
  const [currentPath, setCurrentPath] = useState('/');
  const [isRotated, setIsRotated] = useState(false);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-100 dark:bg-zinc-950">
      {/* Sidebar Controls */}
      <div className="w-80 border-r border-border/40 bg-background p-6 flex flex-col gap-8">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Preview Page
          </h2>
          <div className="space-y-2">
            {PREVIEW_PAGES.map((page) => (
              <Button
                key={page.path}
                variant={currentPath === page.path ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-3"
                onClick={() => setCurrentPath(page.path)}
              >
                <page.icon className="w-4 h-4" />
                {page.name}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Device
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={selectedDevice === 'iphone' ? 'default' : 'outline'}
              className="justify-start gap-2"
              onClick={() => setSelectedDevice('iphone')}
            >
              <Smartphone className="w-4 h-4" />
              iPhone
            </Button>
            <Button
              variant={selectedDevice === 'pixel' ? 'default' : 'outline'}
              className="justify-start gap-2"
              onClick={() => setSelectedDevice('pixel')}
            >
              <Smartphone className="w-4 h-4" />
              Pixel
            </Button>
            <Button
              variant={selectedDevice === 'ipad' ? 'default' : 'outline'}
              className="w-full justify-start gap-2"
              onClick={() => setSelectedDevice('ipad')}
            >
              <Tablet className="w-4 h-4" />
              iPad Air
            </Button>
          </div>
        </div>

        <div>
           <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Orientation
          </h2>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => setIsRotated(!isRotated)}
          >
            <RotateCw className={`w-4 h-4 transition-transform ${isRotated ? 'rotate-90' : ''}`} />
            {isRotated ? 'Landscape' : 'Portrait'}
          </Button>
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-auto p-12 flex items-center justify-center bg-dot-pattern">
        <div className="relative">
             <DeviceFrame 
               src={currentPath} 
               device={selectedDevice} 
               rotate={isRotated}
               className="transition-transform duration-500"
             />
        </div>
      </div>
    </div>
  );
}
