'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Session {
  id: string;
  name: string;
  participants: number;
  status: 'active' | 'ended';
  createdAt: string;
}

const sessions: Session[] = [
  { id: 's1', name: 'Feature Review', participants: 3, status: 'active', createdAt: '10 mins ago' },
  { id: 's2', name: 'Bug Investigation', participants: 2, status: 'active', createdAt: '25 mins ago' },
  { id: 's3', name: 'Code Review Session', participants: 4, status: 'ended', createdAt: '2 hours ago' },
];

export default function SessionSharingPage() {
  const [shareLink, setShareLink] = useState('');

  const createSession = () => {
    setShareLink(`https://prismcode.dev/session/${Date.now()}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Live Collaboration Sessions
          </h1>
          <p className="text-muted-foreground">Share your workspace and collaborate in real-time</p>
        </div>
        <Button onClick={createSession} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          + New Session
        </Button>
      </div>

      {shareLink && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">Session Created!</p>
              <code className="text-sm text-muted-foreground">{shareLink}</code>
            </div>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(shareLink)}>Copy Link</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map(session => (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{session.name}</CardTitle>
                <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>{session.status}</Badge>
              </div>
              <CardDescription>{session.participants} participants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{session.createdAt}</span>
                <Button variant="outline" size="sm">{session.status === 'active' ? 'Join' : 'View'}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
