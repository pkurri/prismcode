'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Simulated Mobile View Component
export default function MobileDashboardPage() {
  const [activeTab, setActiveTab] = useState('home');
  
  return (
    <div className="flex justify-center bg-gray-100 min-h-[calc(100vh-4rem)] p-4">
      {/* Mobile Device Frame */}
      <div className="w-[375px] h-[812px] bg-background border-8 border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col">
        {/* Status Bar */}
        <div className="h-10 bg-background flex items-center justify-between px-6 text-xs font-medium border-b">
          <span>9:41</span>
          <div className="flex gap-2">
            <span>Signal</span>
            <span>WiFi</span>
            <span>100%</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-muted/10 p-4 scrollbar-hide pb-20">
          {activeTab === 'home' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Good Morning,<br/>Alex</h2>
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                  A
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { icon: '📝', label: 'New Issue' },
                  { icon: '🚀', label: 'Deploy' },
                  { icon: '🔍', label: 'Search' },
                  { icon: '🤖', label: 'Ask AI' },
                ].map((action, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 min-w-[72px]">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl">
                      {action.icon}
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Recent Activity</h3>
                {[
                  { title: 'PR #342 Merged', sub: 'Authentication Flow', time: '2m ago', type: 'success' },
                  { title: 'Build Failed', sub: 'main branch', time: '15m ago', type: 'error' },
                  { title: 'New Comment', sub: 'on Incident #89', time: '1h ago', type: 'info' },
                ].map((item, i) => (
                  <Card key={i} className="border-none shadow-sm">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        item.type === 'success' ? 'bg-green-500' : 
                        item.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.sub}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-violet-600 text-white border-none shadow-lg">
                  <CardContent className="p-4">
                    <p className="text-violet-200 text-xs mb-1">Open Issues</p>
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-xs mt-2 text-violet-100 flex items-center gap-1">
                      <span>↑ 2</span> <span className="opacity-70">since yesterday</span>
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                  <CardContent className="p-4">
                    <p className="text-muted-foreground text-xs mb-1">Velocity</p>
                    <p className="text-3xl font-bold text-gray-900">24</p>
                    <p className="text-xs mt-2 text-green-500 flex items-center gap-1">
                      <span>↑ 12%</span> <span className="text-muted-foreground">this sprint</span>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'issues' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Issues</h2>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} className="border-none shadow-sm">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-mono text-muted-foreground">ISS-{100+i}</span>
                        <Badge variant="outline">High</Badge>
                      </div>
                      <p className="font-medium text-sm">Update authentication middleware for improved security</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t px-6 pb-6 pt-2 flex items-center justify-between">
          {[
            { id: 'home', icon: '🏠', label: 'Home' },
            { id: 'issues', icon: '🎫', label: 'Issues' },
            { id: 'create', icon: '➕', label: 'New', main: true },
            { id: 'agents', icon: '🤖', label: 'Agents' },
            { id: 'profile', icon: '👤', label: 'Me' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === item.id ? 'text-violet-600' : 'text-gray-400'
              }`}
            >
              {item.main ? (
                <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white text-xl shadow-lg -mt-6 mb-1">
                  {item.icon}
                </div>
              ) : (
                <span className="text-xl">{item.icon}</span>
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-900 rounded-full" />
      </div>
      
      <div className="ml-8 self-center max-w-xs">
        <h1 className="text-2xl font-bold mb-4">Mobile-First Experience</h1>
        <p className="text-muted-foreground mb-4">
          PrismCode PWA is designed for developers on the go. Manage issues, review code, and trigger agents from anywhere.
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">📱 Native-like interactions</li>
          <li className="flex items-center gap-2">👆 Swipe gestures enabled</li>
          <li className="flex items-center gap-2">🌑 Dark mode optimization</li>
          <li className="flex items-center gap-2">🔔 Push notifications support</li>
        </ul>
      </div>
    </div>
  );
}
