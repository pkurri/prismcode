'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Activity {
  id: string;
  type: 'commit' | 'pr' | 'review' | 'deploy' | 'agent' | 'test' | 'security' | 'comment';
  title: string;
  description: string;
  user: string;
  timestamp: string;
  metadata?: {
    branch?: string;
    status?: string;
    score?: number;
  };
}

interface Stat {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const recentActivity: Activity[] = [
  { id: '1', type: 'pr', title: 'PR #343 Opened', description: 'Add OAuth2 authentication', user: 'Sarah Chen', timestamp: '10 mins ago', metadata: { branch: 'feature/auth', status: 'review_required' } },
  { id: '2', type: 'agent', title: 'Agent Task Completed', description: 'Code Generator finished implementing auth flow', user: 'AI Agent', timestamp: '15 mins ago', metadata: { score: 92 } },
  { id: '3', type: 'review', title: 'PR #342 Approved', description: 'Fix navigation bug approved by Alex', user: 'Alex Thompson', timestamp: '30 mins ago', metadata: { score: 88 } },
  { id: '4', type: 'deploy', title: 'Deployment Successful', description: 'v2.4.1 deployed to staging', user: 'CI/CD', timestamp: '1 hour ago', metadata: { status: 'success' } },
  { id: '5', type: 'test', title: 'Tests Passed', description: 'All 344 tests passing on main', user: 'CI/CD', timestamp: '1 hour ago', metadata: { status: 'success' } },
  { id: '6', type: 'security', title: 'Security Scan Complete', description: 'No vulnerabilities found', user: 'Security Bot', timestamp: '2 hours ago', metadata: { status: 'success' } },
  { id: '7', type: 'commit', title: 'New Commits', description: '5 commits pushed to develop', user: 'Jordan Rivera', timestamp: '3 hours ago', metadata: { branch: 'develop' } },
];

const stats: Stat[] = [
  { label: 'Open PRs', value: 8, change: '+2 today', trend: 'up' },
  { label: 'Active Agents', value: 3, change: 'of 6 total', trend: 'neutral' },
  { label: 'Test Coverage', value: '82%', change: '+2% this week', trend: 'up' },
  { label: 'Build Time', value: '2m 34s', change: '-15s avg', trend: 'down' },
];

const quickActions = [
  { label: 'New PR', icon: '🔀', href: '/code-review' },
  { label: 'Run Tests', icon: '🧪', href: '/tests' },
  { label: 'Deploy', icon: '🚀', href: '/deployments' },
  { label: 'Start Agent', icon: '🤖', href: '/agents-dashboard' },
  { label: 'AI Review', icon: '🔍', href: '/code-review' },
  { label: 'View Logs', icon: '📋', href: '/deployments' },
];

const activityIcons: Record<string, string> = {
  commit: '📝',
  pr: '🔀',
  review: '✅',
  deploy: '🚀',
  agent: '🤖',
  test: '🧪',
  security: '🔒',
  comment: '💬',
};

export default function ActivityFeedPage() {
  const [filter, setFilter] = useState<string>('all');
  
  const filteredActivity = filter === 'all' 
    ? recentActivity 
    : recentActivity.filter(a => a.type === filter);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Activity Feed
        </h1>
        <p className="text-muted-foreground">Real-time project activity and quick actions</p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-blue-500' : 'text-muted-foreground'}`}>
                {stat.change}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {quickActions.map(action => (
              <Button 
                key={action.label} 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-1"
                asChild
              >
                <a href={action.href}>
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-xs">{action.label}</span>
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <div className="flex gap-1">
              {['all', 'pr', 'agent', 'deploy', 'test'].map(f => (
                <Button 
                  key={f} 
                  variant={filter === f ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="capitalize"
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filteredActivity.map(activity => (
            <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-xl">
                {activityIcons[activity.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">{activity.title}</p>
                  {activity.metadata?.branch && (
                    <Badge variant="secondary" className="text-xs">{activity.metadata.branch}</Badge>
                  )}
                  {activity.metadata?.score && (
                    <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                      {activity.metadata.score}/100
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{activity.user}</span>
                  <span>•</span>
                  <span>{activity.timestamp}</span>
                </div>
              </div>
              <Button variant="ghost" size="sm">View →</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
