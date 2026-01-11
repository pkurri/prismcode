'use client';

import { cn } from '@/lib/utils';

interface DeviceFrameProps {
  src: string;
  device: 'iphone' | 'pixel' | 'ipad';
  className?: string;
  rotate?: boolean;
}

const devices = {
  iphone: {
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    frameColor: 'bg-zinc-900',
    bezel: 'rounded-[3rem] border-[8px] border-zinc-900',
    notch: 'w-32 h-8 bg-zinc-900 rounded-b-2xl absolute top-0 left-1/2 -translate-x-1/2 z-10',
  },
  pixel: {
    name: 'Pixel 7',
    width: 412,
    height: 915,
    frameColor: 'bg-zinc-800',
    bezel: 'rounded-[2rem] border-[8px] border-zinc-800',
    notch: 'w-4 h-4 bg-zinc-900 rounded-full absolute top-4 left-1/2 -translate-x-1/2 z-10',
  },
  ipad: {
    name: 'iPad Air',
    width: 820,
    height: 1180,
    frameColor: 'bg-zinc-800',
    bezel: 'rounded-[2rem] border-[12px] border-zinc-800',
    notch: '', // No notch
  },
};

export function DeviceFrame({ src, device, className, rotate = false }: DeviceFrameProps) {
  const config = devices[device];
  const isLandscape = rotate;

  const width = isLandscape ? config.height : config.width;
  const height = isLandscape ? config.width : config.height;

  return (
    <div 
      className={cn(
        "relative shadow-2xl transition-all duration-500 ease-in-out bg-white overflow-hidden",
        config.bezel,
        className
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {/* Notch/Camera */}
      {!rotate && <div className={config.notch} />}

      {/* Screen Content */}
      <iframe
        src={src}
        className="w-full h-full border-0 bg-white"
        title={`Preview on ${config.name}`}
      />
      
      {/* Home Bar Indicator (iOS style) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full pointer-events-none" />
    </div>
  );
}
