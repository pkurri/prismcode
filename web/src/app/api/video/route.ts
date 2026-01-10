import { NextRequest, NextResponse } from 'next/server';

// Video/Audio Collaboration API
// Manage video calls, recordings, and async video messages

interface VideoRoom {
  id: string;
  name: string;
  type: 'instant' | 'scheduled' | 'huddle';
  status: 'waiting' | 'active' | 'ended';
  host: string;
  participants: RoomParticipant[];
  settings: RoomSettings;
  createdAt: string;
  scheduledAt?: string;
  endedAt?: string;
}

interface RoomParticipant {
  userId: string;
  name: string;
  role: 'host' | 'participant';
  joinedAt: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
}

interface RoomSettings {
  maxParticipants: number;
  enableRecording: boolean;
  enableTranscription: boolean;
  enableChat: boolean;
  enableScreenShare: boolean;
  waitingRoom: boolean;
}

interface Recording {
  id: string;
  roomId: string;
  title: string;
  duration: number;
  size: number;
  status: 'processing' | 'ready' | 'failed';
  url?: string;
  transcriptUrl?: string;
  createdAt: string;
}

// Mock data stores
const rooms: Map<string, VideoRoom> = new Map();
const recordings: Map<string, Recording> = new Map([
  ['rec-001', { id: 'rec-001', roomId: 'room-old', title: 'Sprint Planning', duration: 2723, size: 245000000, status: 'ready', url: '/recordings/rec-001.webm', transcriptUrl: '/transcripts/rec-001.txt', createdAt: new Date(Date.now() - 86400000).toISOString() }],
  ['rec-002', { id: 'rec-002', roomId: 'room-old', title: 'Code Review Session', duration: 1395, size: 128000000, status: 'ready', url: '/recordings/rec-002.webm', createdAt: new Date(Date.now() - 172800000).toISOString() }],
]);

// GET: List rooms or recordings
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const recordingId = searchParams.get('recordingId');
  const view = searchParams.get('view');

  // Get specific room
  if (roomId) {
    const room = rooms.get(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    return NextResponse.json(room);
  }

  // Get specific recording
  if (recordingId) {
    const recording = recordings.get(recordingId);
    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }
    return NextResponse.json(recording);
  }

  // List recordings
  if (view === 'recordings') {
    return NextResponse.json({
      recordings: Array.from(recordings.values()),
      total: recordings.size,
    });
  }

  // List active rooms
  return NextResponse.json({
    rooms: Array.from(rooms.values()).filter(r => r.status !== 'ended'),
    total: rooms.size,
  });
}

// POST: Create room or control recording
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Create instant room
    if (action === 'create_room') {
      const { name, type = 'instant', settings = {} } = body;

      const room: VideoRoom = {
        id: `room-${Date.now()}`,
        name: name || 'Instant Call',
        type,
        status: 'waiting',
        host: body.host || 'current-user',
        participants: [],
        settings: {
          maxParticipants: 10,
          enableRecording: true,
          enableTranscription: true,
          enableChat: true,
          enableScreenShare: true,
          waitingRoom: false,
          ...settings,
        },
        createdAt: new Date().toISOString(),
        scheduledAt: body.scheduledAt,
      };

      rooms.set(room.id, room);

      console.log('[Video Room Created]', { roomId: room.id, type });

      // In production, create room via Daily.co or similar
      return NextResponse.json({
        message: 'Room created',
        room,
        joinUrl: `https://prismcode.dev/video-call/${room.id}`,
      }, { status: 201 });
    }

    // Join room
    if (action === 'join_room') {
      const { roomId, userName } = body;
      const room = rooms.get(roomId);
      
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      if (room.participants.length >= room.settings.maxParticipants) {
        return NextResponse.json({ error: 'Room is full' }, { status: 409 });
      }

      const participant: RoomParticipant = {
        userId: `user-${Date.now()}`,
        name: userName || 'Anonymous',
        role: room.participants.length === 0 ? 'host' : 'participant',
        joinedAt: new Date().toISOString(),
        isMuted: false,
        isVideoOn: true,
        isScreenSharing: false,
      };

      room.participants.push(participant);
      room.status = 'active';
      rooms.set(roomId, room);

      return NextResponse.json({
        message: 'Joined room',
        participant,
        room,
      });
    }

    // Start recording
    if (action === 'start_recording') {
      const { roomId, title } = body;
      const room = rooms.get(roomId);
      
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      const recording: Recording = {
        id: `rec-${Date.now()}`,
        roomId,
        title: title || room.name,
        duration: 0,
        size: 0,
        status: 'processing',
        createdAt: new Date().toISOString(),
      };

      recordings.set(recording.id, recording);

      console.log('[Recording Started]', { recordingId: recording.id, roomId });

      return NextResponse.json({
        message: 'Recording started',
        recording,
      });
    }

    // Stop recording
    if (action === 'stop_recording') {
      const { recordingId, duration } = body;
      const recording = recordings.get(recordingId);
      
      if (!recording) {
        return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
      }

      recording.duration = duration || 0;
      recording.status = 'ready';
      recording.url = `/recordings/${recording.id}.webm`;
      recordings.set(recordingId, recording);

      return NextResponse.json({
        message: 'Recording stopped',
        recording,
      });
    }

    // End room
    if (action === 'end_room') {
      const { roomId } = body;
      const room = rooms.get(roomId);
      
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      room.status = 'ended';
      room.endedAt = new Date().toISOString();
      rooms.set(roomId, room);

      return NextResponse.json({
        message: 'Room ended',
        room,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('[Video API Error]', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// DELETE: Delete recording
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recordingId = searchParams.get('recordingId');

  if (!recordingId) {
    return NextResponse.json({ error: 'recordingId required' }, { status: 400 });
  }

  if (!recordings.has(recordingId)) {
    return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
  }

  recordings.delete(recordingId);

  return NextResponse.json({ message: 'Recording deleted' });
}
