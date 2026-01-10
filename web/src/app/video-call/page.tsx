'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VideoRoom {
  id: string;
  name: string;
  participants: VideoParticipant[];
  isRecording: boolean;
  startedAt: string;
}

interface VideoParticipant {
  id: string;
  name: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
}

interface Recording {
  id: string;
  title: string;
  duration: string;
  createdAt: string;
  thumbnail?: string;
  hasTranscript: boolean;
}

const mockParticipants: VideoParticipant[] = [
  { id: '1', name: 'Sarah Chen', isMuted: false, isVideoOn: true, isScreenSharing: false, isSpeaking: true },
  { id: '2', name: 'Alex Thompson', isMuted: true, isVideoOn: true, isScreenSharing: false, isSpeaking: false },
  { id: '3', name: 'Jordan Rivera', isMuted: false, isVideoOn: false, isScreenSharing: true, isSpeaking: false },
];

const mockRecordings: Recording[] = [
  { id: '1', title: 'Sprint Planning Session', duration: '45:23', createdAt: 'Yesterday', hasTranscript: true },
  { id: '2', title: 'Code Review: Auth Flow', duration: '23:15', createdAt: '2 days ago', hasTranscript: true },
  { id: '3', title: 'Bug Triage Meeting', duration: '32:08', createdAt: 'Last week', hasTranscript: false },
];

export default function VideoCollaborationPage() {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [participants] = useState(mockParticipants);

  const startCall = () => setIsInCall(true);
  const endCall = () => {
    setIsInCall(false);
    setIsRecording(false);
    setIsScreenSharing(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Video Collaboration
          </h1>
          <p className="text-muted-foreground">Voice and video calls with your team</p>
        </div>
        {!isInCall ? (
          <Button onClick={startCall} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            📹 Start Call
          </Button>
        ) : (
          <Button onClick={endCall} variant="destructive">
            📵 End Call
          </Button>
        )}
      </div>

      {isInCall ? (
        /* Active Call View */
        <div className="space-y-4">
          {/* Video Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {participants.map(participant => (
              <Card key={participant.id} className={`relative overflow-hidden ${participant.isSpeaking ? 'ring-2 ring-green-500' : ''}`}>
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  {participant.isVideoOn ? (
                    <div className="w-full h-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                      <span className="text-6xl text-white/80">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-2xl">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="px-2 py-1 rounded bg-black/50 text-white text-sm">
                    {participant.name}
                  </span>
                  <div className="flex gap-1">
                    {participant.isMuted && <span className="px-2 py-1 rounded bg-red-500/80 text-white text-xs">🔇</span>}
                    {participant.isScreenSharing && <span className="px-2 py-1 rounded bg-blue-500/80 text-white text-xs">🖥️</span>}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Call Controls */}
          <Card className="sticky bottom-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant={isMuted ? 'destructive' : 'secondary'}
                  size="lg"
                  onClick={() => setIsMuted(!isMuted)}
                  className="rounded-full w-14 h-14"
                >
                  {isMuted ? '🔇' : '🎤'}
                </Button>
                <Button
                  variant={isVideoOn ? 'secondary' : 'destructive'}
                  size="lg"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className="rounded-full w-14 h-14"
                >
                  {isVideoOn ? '📹' : '📷'}
                </Button>
                <Button
                  variant={isScreenSharing ? 'default' : 'secondary'}
                  size="lg"
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className="rounded-full w-14 h-14"
                >
                  🖥️
                </Button>
                <Button
                  variant={isRecording ? 'destructive' : 'secondary'}
                  size="lg"
                  onClick={() => setIsRecording(!isRecording)}
                  className="rounded-full w-14 h-14"
                >
                  {isRecording ? '⏹️' : '⏺️'}
                </Button>
                <div className="w-px h-10 bg-border mx-2" />
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={endCall}
                  className="rounded-full w-14 h-14"
                >
                  📵
                </Button>
              </div>
              {isRecording && (
                <div className="text-center mt-2">
                  <Badge variant="destructive" className="animate-pulse">🔴 Recording in progress</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Not in Call View */
        <Tabs defaultValue="start" className="space-y-4">
          <TabsList>
            <TabsTrigger value="start">Start Call</TabsTrigger>
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
            <TabsTrigger value="async">Async Video</TabsTrigger>
          </TabsList>

          <TabsContent value="start">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="cursor-pointer hover:shadow-md transition-all" onClick={startCall}>
                <CardContent className="p-6 text-center">
                  <span className="text-5xl">📹</span>
                  <h3 className="font-semibold text-lg mt-4">Start Video Call</h3>
                  <p className="text-sm text-muted-foreground mt-1">Start an instant video call with your team</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-all">
                <CardContent className="p-6 text-center">
                  <span className="text-5xl">📅</span>
                  <h3 className="font-semibold text-lg mt-4">Schedule Meeting</h3>
                  <p className="text-sm text-muted-foreground mt-1">Schedule a meeting for later</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-all">
                <CardContent className="p-6 text-center">
                  <span className="text-5xl">🔗</span>
                  <h3 className="font-semibold text-lg mt-4">Join with Link</h3>
                  <p className="text-sm text-muted-foreground mt-1">Join an existing call with a link</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:shadow-md transition-all">
                <CardContent className="p-6 text-center">
                  <span className="text-5xl">🎙️</span>
                  <h3 className="font-semibold text-lg mt-4">Audio Only</h3>
                  <p className="text-sm text-muted-foreground mt-1">Start a voice-only huddle</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recordings">
            <Card>
              <CardHeader>
                <CardTitle>Past Recordings</CardTitle>
                <CardDescription>View and share your meeting recordings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockRecordings.map(recording => (
                  <div key={recording.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-10 rounded bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-xl">▶️</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{recording.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{recording.duration}</span>
                          <span>•</span>
                          <span>{recording.createdAt}</span>
                          {recording.hasTranscript && <Badge variant="secondary" className="text-[10px]">Transcript</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">🔗 Share</Button>
                      <Button variant="ghost" size="sm">▶️ Play</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="async">
            <Card>
              <CardHeader>
                <CardTitle>Record Async Video</CardTitle>
                <CardDescription>Record and share video messages like Loom</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <span className="text-6xl">🎬</span>
                <h3 className="text-lg font-semibold mt-4">Record a Video Message</h3>
                <p className="text-muted-foreground mt-2 mb-6">Share screen + webcam recordings with your team</p>
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                  ⏺️ Start Recording
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
