'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const teamMembers = [
  {
    id: 'u1',
    name: 'Prasad Kurri',
    email: 'pkurri@example.com',
    role: 'owner',
    avatar: 'PK',
    status: 'online',
  },
  {
    id: 'u2',
    name: 'Alice Smith',
    email: 'alice@example.com',
    role: 'admin',
    avatar: 'AS',
    status: 'offline',
  },
  {
    id: 'u3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'developer',
    avatar: 'BJ',
    status: 'online',
  },
  {
    id: 'u4',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'viewer',
    avatar: 'CB',
    status: 'away',
  },
];

const auditLogs = [
  {
    id: 'log_1',
    timestamp: '2 mins ago',
    user: 'Prasad Kurri',
    action: 'role.update',
    resource: 'Alice Smith',
    details: 'Admin -> Owner',
  },
  {
    id: 'log_2',
    timestamp: '1 hour ago',
    user: 'Alice Smith',
    action: 'member.invite',
    resource: 'charlie@example.com',
    details: 'Viewer role',
  },
  {
    id: 'log_3',
    timestamp: '2 hours ago',
    user: 'System',
    action: 'policy.enforced',
    resource: 'RBAC',
    details: 'Nightly permission sync',
  },
  {
    id: 'log_4',
    timestamp: '5 hours ago',
    user: 'Prasad Kurri',
    action: 'project.create',
    resource: 'PrismCode Next',
    details: 'Public repository',
  },
];

const roles = [
  {
    id: 'role_owner',
    name: 'Owner',
    description: 'Full account access including billing and team management',
  },
  { id: 'role_admin', name: 'Admin', description: 'Can manage most settings and team members' },
  {
    id: 'role_developer',
    name: 'Developer',
    description: 'Can read and write to projects and use agents',
  },
  { id: 'role_viewer', name: 'Viewer', description: 'Read-only access to projects and issues' },
];

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState('members');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Team Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage team members, roles, and view activity audit logs
          </p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          Invite Member
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Members currently in the PrismCode Core team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4">
                        <Badge variant="outline" className="capitalize">
                          {member.role}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Status: {member.status}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {role.name}
                    {role.id === 'role_owner' && <Badge className="bg-violet-600">Built-in</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Permissions
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Card className="border-dashed flex items-center justify-center p-6 bg-muted/20">
              <Button variant="ghost" className="flex flex-col h-auto py-4 gap-2">
                <span className="text-2xl">+</span>
                <span>Create Custom Role</span>
              </Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Security and activity trail for the team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-muted-foreground/20 ml-3 pl-8 space-y-8">
                {auditLogs.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full bg-violet-600 border-4 border-background" />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{log.user}</span>
                        <code className="bg-muted px-1 rounded text-xs text-primary">
                          {log.action}
                        </code>
                        <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                      </div>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Resource: </span>
                        <span className="font-medium">{log.resource}</span>
                      </p>
                      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        {log.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Button variant="ghost" size="sm">
                  Download Audit History (CSV)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
