'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Bot, 
  Code2, 
  LayoutDashboard, 
  Settings, 
  Shield, 
  TestTube2, 
  Users, 
  Workflow, 
  Zap, 
  BarChart3, 
  Video, 
  Server, 
  Leaf, 
  Search, 
  FileText,
  Smartphone,
  Eye,
  History,
  GitPullRequest
} from 'lucide-react';

// Navigation Structure
const navigationGroups = [
  {
    label: 'Platform',
    items: [
      { title: 'Dashboard', href: '/', icon: LayoutDashboard },
      { title: 'Activity Feed', href: '/activity', icon: History },
      { title: 'Notifications', href: '/notifications', icon: Zap },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { title: 'AI Assistant', href: '/assistant', icon: Bot },
      { title: 'Ask Codebase', href: '/ask', icon: Search },
      { title: 'Model Settings', href: '/model-settings', icon: Settings },
      { title: 'Orchestration', href: '/ai-analytics', icon: Workflow },
      { title: 'Local Models', href: '/local-models', icon: Server },
      { title: 'Knowledge', href: '/knowledge', icon: FileText },
    ],
  },
  {
    label: 'Code Quality',
    items: [
      { title: 'Quality Dashboard', href: '/quality-dashboard', icon: BarChart3 },
      { title: 'Code Review', href: '/review', icon: GitPullRequest },
      { title: 'Test Lab', href: '/tests', icon: TestTube2 },
      { title: 'Debug Assistant', href: '/live-debug', icon: Search },
      { title: 'Security Scan', href: '/security', icon: Shield },
    ],
  },
  {
    label: 'DevOps & Infra',
    items: [
      { title: 'Environments', href: '/environments', icon: Server },
      { title: 'Infrastructure', href: '/infrastructure', icon: Code2 },
      { title: 'Deployments', href: '/deployments', icon: Zap },
      { title: 'Sustainability', href: '/sustainability-dashboard', icon: Leaf },
      { title: 'Compliance', href: '/compliance', icon: FileText },
    ],
  },
  {
    label: 'Collaboration',
    items: [
      { title: 'Team', href: '/team', icon: Users },
      { title: 'Video Calls', href: '/video-call', icon: Video },
      { title: 'Live Sessions', href: '/live-session', icon: Eye },
      { title: 'Integrations', href: '/integrations', icon: Workflow },
    ],
  },
  {
    label: 'Tools',
    items: [
      { title: 'Workflow Builder', href: '/workflows/canvas', icon: Workflow },
      { title: 'Sandbox', href: '/sandbox', icon: Code2 },
      { title: 'Mobile Preview', href: '/mobile', icon: Smartphone },
      { title: 'Visual Preview', href: '/visual-preview', icon: Eye },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-border/40 bg-gradient-to-b from-background to-muted/20">
          <SidebarHeader className="border-b border-border/40 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold shadow-lg">
                P
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight">PrismCode</h1>
                <p className="text-xs text-muted-foreground">AI Code Intelligence</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2 gap-4">
            {navigationGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider px-2">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          className="group relative overflow-hidden rounded-lg transition-all duration-200 hover:bg-accent/50"
                        >
                          <Link href={item.href} className="flex items-center gap-3 px-3 py-2">
                            <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-data-[active=true]:text-primary transition-colors" />
                            <span className="font-medium">{item.title}</span>
                            {pathname === item.href && (
                              <div className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-primary" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t border-border/40 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg p-2 hover:bg-accent/50 transition-colors">
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarImage src="/avatar.png" alt="User" />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm font-medium">
                      PK
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Prasad Kurri</p>
                    <p className="text-xs text-muted-foreground">Pro Workspace</p>
                  </div>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team-Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="flex h-14 items-center gap-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 sticky top-0 z-10">
            <SidebarTrigger className="-ml-2" />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-xs font-normal bg-background/50">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                System Healthy
              </Badge>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6 bg-muted/5">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

