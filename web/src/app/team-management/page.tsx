'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  avatar?: string;
  status: 'active' | 'invite_pending' | 'inactive';
  lastActive?: string;
  contributions: {
    commits: number;
    prs: number;
    reviews: number;
  };
}

interface ActivityItem {
  id: string;
  userId: string;
  type: 'commit' | 'pr' | 'review' | 'deploy' | 'comment';
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const mockTeam: TeamMember[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@prismcode.dev', role: 'owner', status: 'active', lastActive: 'Just now', contributions: { commits: 234, prs: 45, reviews: 123 } },
  { id: '2', name: 'Alex Thompson', email: 'alex@prismcode.dev', role: 'admin', status: 'active', lastActive: '10 mins ago', contributions: { commits: 189, prs: 38, reviews: 89 } },
  { id: '3', name: 'Jordan Rivera', email: 'jordan@prismcode.dev', role: 'developer', status: 'active', lastActive: '1 hour ago', contributions: { commits: 156, prs: 28, reviews: 67 } },
  { id: '4', name: 'Taylor Kim', email: 'taylor@prismcode.dev', role: 'developer', status: 'active', lastActive: '2 hours ago', contributions: { commits: 98, prs: 19, reviews: 45 } },
  { id: '5', name: 'Morgan Lee', email: 'morgan@example.com', role: 'developer', status: 'invite_pending', lastActive: '-', contributions: { commits: 0, prs: 0, reviews: 0 } },
  { id: '6', name: 'Casey Davis', email: 'casey@prismcode.dev', role: 'viewer', status: 'inactive', lastActive: 'Last week', contributions: { commits: 12, prs: 2, reviews: 8 } },
];

const mockActivity: ActivityItem[] = [
  { id: '1', userId: '1', type: 'commit', description: 'Merged PR #342: Implement auth flow', timestamp: '10 mins ago' },
  { id: '2', userId: '2', type: 'review', description: 'Approved PR #341: Add user settings', timestamp: '30 mins ago' },
  { id: '3', userId: '3', type: 'pr', description: 'Opened PR #343: Fix navigation bug', timestamp: '1 hour ago' },
  { id: '4', userId: '1', type: 'deploy', description: 'Deployed v2.4.1 to staging', timestamp: '2 hours ago' },
  { id: '5', userId: '4', type: 'commit', description: 'Updated documentation for API endpoints', timestamp: '3 hours ago' },
];

const roleColors: Record<string, string> = {
  owner: 'bg-violet-500/10 text-violet-500 border-violet-500/30',
  admin: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  developer: 'bg-green-500/10 text-green-500 border-green-500/30',
  viewer: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
};

const activityIcons: Record<string, string> = {
  commit: '📝',
  pr: '🔀',
  review: '✅',
  deploy: '🚀',
  comment: '💬',
};

export default function TeamManagementPage() {
  const [team] = useState(mockTeam);
  const [activity] = useState(mockActivity);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('developer');

  const activeMembers = team.filter(m => m.status === 'active').length;
  const totalContributions = team.reduce((sum, m) => sum + m.contributions.commits + m.contributions.prs + m.contributions.reviews, 0);

  const inviteMember = () => {
    console.log('Inviting:', { email: inviteEmail, role: inviteRole });
    setInviteEmail('');
    // In production, send invite via API
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Team Management
          </h1>
          <p className="text-muted-foreground">{activeMembers} active members</p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          + Invite Member
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Team Size</CardDescription>
            <CardTitle className="text-3xl">{team.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">{activeMembers} active</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Commits</CardDescription>
            <CardTitle className="text-3xl">{team.reduce((s, m) => s + m.contributions.commits, 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-green-500">+45 this week</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pull Requests</CardDescription>
            <CardTitle className="text-3xl">{team.reduce((s, m) => s + m.contributions.prs, 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-muted-foreground">all time</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Code Reviews</CardDescription>
            <CardTitle className="text-3xl">{team.reduce((s, m) => s + m.contributions.reviews, 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-blue-500">avg 3.2/day</span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="invite">Invite</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team and their roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {team.map(member => (
                <div key={member.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.name}</p>
                        <Badge variant="outline" className={roleColors[member.role]}>
                          {member.role}
                        </Badge>
                        {member.status === 'invite_pending' && (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">Last active</p>
                      <p className={member.status === 'active' ? 'text-green-500' : ''}>{member.lastActive}</p>
                    </div>
                    <div className="text-right text-sm hidden md:block">
                      <p className="text-muted-foreground">Contributions</p>
                      <p>{member.contributions.commits + member.contributions.prs + member.contributions.reviews}</p>
                    </div>
                    <Button variant="ghost" size="sm">⋮</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Team contributions and actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.map(item => {
                const member = team.find(m => m.id === item.userId);
                return (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <span className="text-xl">{activityIcons[item.type]}</span>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{member?.name}</span>{' '}
                        {item.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invite">
          <Card>
            <CardHeader>
              <CardTitle>Invite New Member</CardTitle>
              <CardDescription>Send an invitation to join your team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
                  className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background"
                >
                  <option value="developer">Developer</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <Button 
                onClick={inviteMember}
                disabled={!inviteEmail}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white"
              >
                Send Invitation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
