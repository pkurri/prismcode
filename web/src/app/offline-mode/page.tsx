'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PendingAction {
  id: string;
  type: string;
  details: string;
  timestamp: string;
  status: 'pending' | 'syncing' | 'failed';
}

export default function OfflineModePage() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([
    { id: '1', type: 'Comment', details: 'Added comment on PR #342', timestamp: '2 mins ago', status: 'pending' },
    { id: '2', type: 'Review', details: 'Approved PR #340', timestamp: '5 mins ago', status: 'pending' },
    { id: '3', type: 'Task', details: 'Updated status of Issue #105', timestamp: '1 hour ago', status: 'failed' },
  ]);

  // Simulate online/offline toggle
  const toggleConnection = () => {
    setIsOnline(!isOnline);
  };

  const retrySync = () => {
    setPendingActions(prev => prev.map(a => ({ ...a, status: 'syncing' })));
    setTimeout(() => {
      setPendingActions([]); // Simulate clear queue
    }, 2000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Offline Sync Center
          </h1>
          <p className="text-muted-foreground">Manage your offline actions and sync status</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-medium text-sm">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <Button variant="outline" onClick={toggleConnection}>
            Toggle Connection
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className={!isOnline ? 'border-red-500/30 bg-red-500/5' : ''}>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Network connectivity and PWA status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Network</span>
              <Badge variant={isOnline ? 'default' : 'destructive'}>
                {isOnline ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Service Worker</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Cache Storage</span>
              <Badge variant="outline">24.5 MB Used</Badge>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                 {isOnline ? 'You are connected to the PrismCode cloud. Changes sync immediately.' : 'You are currently offline. Changes are saved locally and will sync when connection is restored.'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sync Queue</CardTitle>
            <CardDescription>{pendingActions.length} actions pending synchronization</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingActions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <span className="text-4xl block mb-2">✅</span>
                <p>All changes synced!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingActions.map(action => (
                  <div key={action.id} className="flex items-center justify-between p-3 rounded bg-muted/30">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{action.type}</Badge>
                        <span className="text-sm">{action.details}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{action.timestamp}</p>
                    </div>
                    {action.status === 'syncing' ? (
                      <span className="text-xs text-blue-500 animate-pulse">Syncing...</span>
                    ) : action.status === 'failed' ? (
                      <Badge variant="destructive">Failed</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                ))}
                
                <Button 
                  className="w-full mt-2" 
                  disabled={!isOnline}
                  onClick={retrySync}
                >
                  {isOnline ? 'Sync Now' : 'Connect to Sync'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Offline Capabilities</CardTitle>
          <CardDescription>What you can do without internet connection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: '📄', title: 'View Documentation', desc: 'Docs are cached for offline reading', available: true },
              { icon: '🎫', title: 'Create Issues', desc: 'Draft issues are saved locally', available: true },
              { icon: '📝', title: 'Code Review', desc: 'Review downloaded PRs offline', available: true },
              { icon: '🔍', title: 'Search', desc: 'Search requires cloud connection', available: false },
              { icon: '🤖', title: 'AI Stats', desc: 'Real-time agent stats need connection', available: false },
              { icon: '🚀', title: 'Deploy', desc: 'Cannot trigger deploys offline', available: false },
            ].map((feature, i) => (
              <div key={i} className={`p-4 rounded-lg border flex items-start gap-3 ${feature.available ? 'bg-green-50/50' : 'bg-gray-50/50 opacity-60'}`}>
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h3 className="font-medium text-sm flex items-center gap-2">
                    {feature.title}
                    {feature.available ? (
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">OFFLINE</span>
                    ) : (
                      <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">ONLINE ONLY</span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
