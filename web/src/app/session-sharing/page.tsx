'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'active' | 'idle' | 'away';
  cursor?: { file: string; line: number };
}

interface Session {
  id: string;
  name: string;
  owner: string;
  participants: Participant[];
  createdAt: string;
  expiresAt?: string;
  isRecording: boolean;
  permissions: 'view' | 'edit' | 'admin';
}

const mockSession: Session = {
  id: 'session-abc123',
  name: 'Feature Development Session',
  owner: 'Sarah Chen',
  participants: [
    { id: '1', name: 'Sarah Chen', role: 'owner', status: 'active', cursor: { file: 'App.tsx', line: 45 } },
    { id: '2', name: 'Alex Thompson', role: 'editor', status: 'active', cursor: { file: 'Dashboard.tsx', line: 23 } },
    { id: '3', name: 'Jordan Rivera', role: 'editor', status: 'idle' },
    { id: '4', name: 'AI Agent', role: 'viewer', status: 'active' },
  ],
  createdAt: '2 hours ago',
  expiresAt: '22 hours',
  isRecording: false,
  permissions: 'edit',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-500',
  idle: 'bg-amber-500',
  away: 'bg-gray-400',
};

const roleColors: Record<string, string> = {
  owner: 'text-violet-500',
  editor: 'text-blue-500',
  viewer: 'text-gray-500',
};

export default function SessionSharingPage() {
  const [session] = useState(mockSession);
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [permissions, setPermissions] = useState<'view' | 'edit' | 'admin'>('edit');
  const [expiresIn, setExpiresIn] = useState('24h');

  const generateShareLink = () => {
    const link = `https://prismcode.dev/join/${session.id}?p=${permissions}`;
    setShareLink(link);
    setShowShareModal(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Session Sharing
          </h1>
          <p className="text-muted-foreground">Collaborate in real-time with your team</p>
        </div>
        <Button onClick={generateShareLink} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          🔗 Share Session
        </Button>
      </div>

      {/* Current Session Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{session.name}</CardTitle>
              <CardDescription>Created {session.createdAt} by {session.owner}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {session.isRecording && (
                <Badge variant="destructive" className="animate-pulse">🔴 Recording</Badge>
              )}
              <Badge variant="secondary">Expires in {session.expiresAt}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Session ID:</span>
            <code className="px-2 py-1 rounded bg-muted text-sm">{session.id}</code>
            <Button variant="ghost" size="sm">📋 Copy</Button>
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      <Card>
        <CardHeader>
          <CardTitle>Active Collaborators ({session.participants.length})</CardTitle>
          <CardDescription>People currently in this session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {session.participants.map(participant => (
            <div key={participant.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {participant.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${statusColors[participant.status]}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{participant.name}</span>
                    <span className={`text-xs ${roleColors[participant.role]}`}>({participant.role})</span>
                  </div>
                  {participant.cursor ? (
                    <p className="text-xs text-muted-foreground">
                      📍 {participant.cursor.file}:{participant.cursor.line}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground capitalize">{participant.status}</p>
                  )}
                </div>
              </div>
              {participant.role !== 'owner' && (
                <Button variant="ghost" size="sm">⋮</Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Session Controls */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-4 text-center">
            <span className="text-3xl">🎥</span>
            <p className="font-medium mt-2">Start Recording</p>
            <p className="text-xs text-muted-foreground">Capture session for playback</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-4 text-center">
            <span className="text-3xl">📧</span>
            <p className="font-medium mt-2">Invite via Email</p>
            <p className="text-xs text-muted-foreground">Send direct invitations</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-all border-red-500/30">
          <CardContent className="p-4 text-center">
            <span className="text-3xl">🚪</span>
            <p className="font-medium mt-2 text-red-500">End Session</p>
            <p className="text-xs text-muted-foreground">Close for all participants</p>
          </CardContent>
        </Card>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>🔗 Share This Workspace</CardTitle>
              <CardDescription>Invite others to collaborate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Permissions</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['view', 'edit', 'admin'] as const).map(perm => (
                    <button
                      key={perm}
                      onClick={() => setPermissions(perm)}
                      className={`p-2 rounded border text-center capitalize ${
                        permissions === perm ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                    >
                      {perm === 'view' && '👁️'}
                      {perm === 'edit' && '✏️'}
                      {perm === 'admin' && '👑'}
                      <span className="block text-xs mt-1">{perm}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Expires In</label>
                <select
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-md border border-border bg-background"
                >
                  <option value="1h">1 hour</option>
                  <option value="24h">24 hours</option>
                  <option value="7d">7 days</option>
                  <option value="never">Never</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-md border border-border bg-muted text-sm"
                />
                <Button onClick={copyLink}>📋 Copy</Button>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setShowShareModal(false)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
