'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Notification {
  id: string;
  type: 'build' | 'pr' | 'agent' | 'deploy' | 'security' | 'mention';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationPrefs {
  buildComplete: boolean;
  prReview: boolean;
  agentBlocked: boolean;
  agentCompleted: boolean;
  deploySuccess: boolean;
  deployFailed: boolean;
  securityAlert: boolean;
  teamMention: boolean;
}

const mockNotifications: Notification[] = [
  { id: '1', type: 'build', title: 'Build Completed', message: 'main branch build passed in 2m 34s', time: '2 mins ago', read: false, actionUrl: '/tests' },
  { id: '2', type: 'pr', title: 'PR Review Ready', message: 'PR #342: Add auth flow - AI review complete (85/100)', time: '15 mins ago', read: false, actionUrl: '/code-review' },
  { id: '3', type: 'agent', title: 'Agent Completed', message: 'Code refactor agent finished: 5 files updated', time: '1 hour ago', read: true, actionUrl: '/agents' },
  { id: '4', type: 'deploy', title: 'Deployment Successful', message: 'v2.4.0 deployed to staging', time: '2 hours ago', read: true, actionUrl: '/deploy' },
  { id: '5', type: 'security', title: 'Security Alert', message: 'High severity vulnerability in lodash@4.17.20', time: '3 hours ago', read: false, actionUrl: '/security' },
  { id: '6', type: 'mention', title: 'Team Mention', message: '@you mentioned in PR #340 discussion', time: 'Yesterday', read: true },
];

const defaultPrefs: NotificationPrefs = {
  buildComplete: true,
  prReview: true,
  agentBlocked: true,
  agentCompleted: true,
  deploySuccess: true,
  deployFailed: true,
  securityAlert: true,
  teamMention: true,
};

const notificationTypeIcons: Record<string, string> = {
  build: '🔨',
  pr: '🔍',
  agent: '🤖',
  deploy: '🚀',
  security: '🔒',
  mention: '💬',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const togglePref = (key: keyof NotificationPrefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const enablePush = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPushEnabled(true);
        // In production, register service worker and subscribe to push
        new Notification('PrismCode', { 
          body: 'Push notifications enabled!',
          icon: '/icons/icon-192x192.png'
        });
      }
    } catch (err) {
      console.error('Push notification error:', err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          {!pushEnabled && (
            <Button variant="outline" onClick={enablePush}>
              🔔 Enable Push
            </Button>
          )}
          <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            Mark All Read
          </Button>
        </div>
      </div>

      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inbox">
            Inbox {unreadCount > 0 && <Badge className="ml-2">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Notifications</CardTitle>
                <div className="flex gap-1">
                  <Button 
                    variant={filter === 'all' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={filter === 'unread' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setFilter('unread')}
                  >
                    Unread
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredNotifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No notifications</p>
              ) : (
                filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-lg flex items-start gap-3 cursor-pointer transition-colors ${
                      n.read ? 'bg-muted/30' : 'bg-primary/5 border-l-2 border-primary'
                    }`}
                    onClick={() => markAsRead(n.id)}
                  >
                    <span className="text-2xl">{notificationTypeIcons[n.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {n.title}
                        </h4>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                    </div>
                    {n.actionUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={n.actionUrl}>View →</a>
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose which notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'buildComplete', label: 'Build Complete', desc: 'When CI builds finish', icon: '🔨' },
                { key: 'prReview', label: 'PR Review Ready', desc: 'When AI review completes', icon: '🔍' },
                { key: 'agentBlocked', label: 'Agent Blocked', desc: 'When an agent needs input', icon: '🚧' },
                { key: 'agentCompleted', label: 'Agent Completed', desc: 'When an agent finishes', icon: '🤖' },
                { key: 'deploySuccess', label: 'Deploy Success', desc: 'Successful deployments', icon: '🚀' },
                { key: 'deployFailed', label: 'Deploy Failed', desc: 'Failed deployments', icon: '❌' },
                { key: 'securityAlert', label: 'Security Alerts', desc: 'Vulnerability warnings', icon: '🔒' },
                { key: 'teamMention', label: 'Team Mentions', desc: 'When someone mentions you', icon: '💬' },
              ].map(({ key, label, desc, icon }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePref(key as keyof NotificationPrefs)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      prefs[key as keyof NotificationPrefs] ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        prefs[key as keyof NotificationPrefs] ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}

              <Button className="w-full mt-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
