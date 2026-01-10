'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  activeIcon: string;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: '🏠', activeIcon: '🏡' },
  { href: '/agents', label: 'Agents', icon: '🤖', activeIcon: '🤖' },
  { href: '/workflows', label: 'Flows', icon: '⚡', activeIcon: '⚡' },
  { href: '/assistant', label: 'AI', icon: '💬', activeIcon: '💬' },
  { href: '/settings', label: 'More', icon: '☰', activeIcon: '☰' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-lg border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center flex-1 py-2 px-1
                transition-all duration-200 rounded-lg mx-0.5
                ${isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}
              `}
            >
              <span className="text-xl mb-0.5">
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-12 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Quick action floating button for mobile
export function MobileQuickAction() {
  return (
    <button
      className="fixed bottom-20 right-4 z-50 md:hidden w-14 h-14 rounded-full 
        bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg
        flex items-center justify-center text-2xl
        hover:scale-105 active:scale-95 transition-transform"
      aria-label="Quick action"
    >
      ✨
    </button>
  );
}

// Pull-to-refresh indicator for PWA
export function PullToRefresh() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-4 pointer-events-none">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
        <span className="animate-spin text-primary">↻</span>
      </div>
    </div>
  );
}
