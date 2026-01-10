'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LiveSession {
  id: string;
  name: string;
  host: string;
  participants: SessionParticipant[];
  file: string;
  isRecording: boolean;
  hasVoice: boolean;
  createdAt: string;
}

interface SessionParticipant {
  id: string;
  name: string;
  color: string;
  cursor?: { line: number; column: number };
  isActive: boolean;
}

interface Recording {
  id: string;
  sessionName: string;
  host: string;
  duration: string;
  createdAt: string;
}

const mockSessions: LiveSession[] = [
  { 
    id: '1', 
    name: 'Auth Feature Development', 
    host: 'Sarah Chen',
    participants: [
      { id: 'p1', name: 'Sarah Chen', color: '#8B5CF6', cursor: { line: 45, column: 12 }, isActive: true },
      { id: 'p2', name: 'Alex Thompson', color: '#3B82F6', cursor: { line: 23, column: 8 }, isActive: true },
    ],
    file: 'src/auth/login.tsx',
    isRecording: true,
    hasVoice: true,
    createdAt: '15 mins ago'
  },
];

const mockRecordings: Recording[] = [
  { id: 'r1', sessionName: 'API Refactoring', host: 'Jordan Rivera', duration: '1h 23m', createdAt: 'Yesterday' },
  { id: 'r2', sessionName: 'Bug Fix Session', host: 'Taylor Kim', duration: '45m', createdAt: '2 days ago' },
  { id: 'r3', sessionName: 'Code Review', host: 'Sarah Chen', duration: '30m', createdAt: 'Last week' },
];

export default function LiveSessionPage() {
  const [sessions] = useState(mockSessions);
  const [recordings] = useState(mockRecordings);
  const [shareLink, setShareLink] = useState('');

  const createSession = () => {
    setShareLink(`https://prismcode.dev/live/session-${Date.now().toString(36)}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Live Code Sessions
          </h1>
          <p className="text-muted-foreground">Real-time collaborative coding with your team</p>
        </div>
        <Button onClick={createSession} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          + Start Session
        </Button>
      </div>

      {shareLink && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Created!</p>
                <p className="text-sm text-muted-foreground">Share this link with your team</p>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={shareLink} 
                  readOnly 
                  className="px-3 py-2 rounded border border-border bg-background text-sm w-80"
                />
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(shareLink)}>
                  📋 Copy
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Sessions</TabsTrigger>
          <TabsTrigger value="recordings">Recordings</TabsTrigger>
          <TabsTrigger value="join">Join Session</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <span className="text-6xl">🎯</span>
                <p className="mt-4 text-lg font-medium">No active sessions</p>
                <p className="text-muted-foreground">Start a session to begin pair programming</p>
                <Button onClick={createSession} className="mt-4">Start Session</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sessions.map(session => (
                <Card key={session.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{session.name}</CardTitle>
                        <CardDescription>Hosted by {session.host} • {session.createdAt}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.isRecording && <Badge variant="destructive" className="animate-pulse">🔴 Recording</Badge>}
                        {session.hasVoice && <Badge variant="secondary">🎤 Voice</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Code Preview */}
                    <div className="rounded-lg bg-muted p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-mono text-muted-foreground">{session.file}</span>
                      </div>
                      <div className="space-y-1 font-mono text-sm relative">
                        {[40, 41, 42, 43, 44, 45, 46, 47, 48].map(line => (
                          <div key={line} className="flex relative">
                            <span className="w-10 text-muted-foreground text-right mr-4">{line}</span>
                            <span className="text-foreground">
                              {line === 45 ? "  const handleLogin = async () => {" : 
                               line === 46 ? "    try {" : 
                               line === 47 ? "      await auth.signIn(email, password);" : 
                               line === 43 ? "  const [email, setEmail] = useState('');" : "    // ..."}
                            </span>
                            {session.participants.map(p => p.cursor?.line === line && (
                              <div 
                                key={p.id}
                                className="absolute top-0 h-5 w-0.5 animate-pulse"
                                style={{ left: `${40 + (p.cursor?.column || 0) * 8}px`, backgroundColor: p.color }}
                                title={p.name}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Collaborators:</span>
                        <div className="flex -space-x-2">
                          {session.participants.map(p => (
                            <div 
                              key={p.id}
                              className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-medium"
                              style={{ backgroundColor: p.color }}
                              title={p.name}
                            >
                              {p.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">👁️ Watch</Button>
                        <Button>Join Session</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recordings">
          <Card>
            <CardHeader>
              <CardTitle>Session Recordings</CardTitle>
              <CardDescription>Playback past coding sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recordings.map(rec => (
                <div key={rec.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white">
                      ▶️
                    </div>
                    <div>
                      <h4 className="font-medium">{rec.sessionName}</h4>
                      <p className="text-sm text-muted-foreground">{rec.host} • {rec.duration} • {rec.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">🔗 Share</Button>
                    <Button variant="outline" size="sm">▶️ Play</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="join">
          <Card>
            <CardHeader>
              <CardTitle>Join a Session</CardTitle>
              <CardDescription>Enter a session link to join</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Session Link</label>
                <input 
                  type="text" 
                  placeholder="https://prismcode.dev/live/session-abc123"
                  className="w-full mt-1 px-4 py-3 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Your Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your name"
                  className="w-full mt-1 px-4 py-3 rounded-lg border border-border bg-background"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">👁️ Join as Viewer</Button>
                <Button className="flex-1">✏️ Join as Editor</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
