import { NextRequest, NextResponse } from 'next/server';

// Types for real-time collaboration
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
}

interface Cursor {
  userId: string;
  position: {
    line: number;
    column: number;
  };
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  timestamp: number;
}

interface Presence {
  userId: string;
  user: User;
  roomId: string;
  resourcePath?: string;
  cursor?: Cursor;
  status: 'active' | 'idle' | 'away';
  lastSeen: string;
  connectedAt: string;
}

interface Room {
  id: string;
  type: 'workspace' | 'file' | 'session';
  projectId: string;
  resourcePath?: string;
  participants: Presence[];
  createdAt: string;
  maxParticipants: number;
}

interface CollaborationSession {
  id: string;
  roomId: string;
  createdBy: string;
  title: string;
  description?: string;
  status: 'active' | 'ended';
  participants: string[];
  startedAt: string;
  endedAt?: string;
}

// Mock data - In production, this would use Redis pub/sub for horizontal scaling
const activeRooms: Map<string, Room> = new Map();
const activeSessions: Map<string, CollaborationSession> = new Map();

// User colors for cursor visibility
const userColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

// Initialize demo data
function initializeDemoData() {
  const demoRoom: Room = {
    id: 'room-demo-001',
    type: 'file',
    projectId: 'prismcode',
    resourcePath: 'src/components/Dashboard.tsx',
    participants: [
      {
        userId: 'user-001',
        user: { id: 'user-001', name: 'Alice Chen', email: 'alice@prismcode.dev', color: userColors[0] },
        roomId: 'room-demo-001',
        resourcePath: 'src/components/Dashboard.tsx',
        cursor: { userId: 'user-001', position: { line: 45, column: 12 }, timestamp: Date.now() },
        status: 'active',
        lastSeen: new Date().toISOString(),
        connectedAt: new Date(Date.now() - 300000).toISOString(),
      },
      {
        userId: 'user-002',
        user: { id: 'user-002', name: 'Bob Smith', email: 'bob@prismcode.dev', color: userColors[1] },
        roomId: 'room-demo-001',
        resourcePath: 'src/components/Dashboard.tsx',
        cursor: { userId: 'user-002', position: { line: 78, column: 24 }, timestamp: Date.now() },
        status: 'active',
        lastSeen: new Date().toISOString(),
        connectedAt: new Date(Date.now() - 600000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    maxParticipants: 10,
  };

  activeRooms.set(demoRoom.id, demoRoom);

  const demoSession: CollaborationSession = {
    id: 'session-001',
    roomId: 'room-demo-001',
    createdBy: 'user-001',
    title: 'Dashboard Refactoring Session',
    description: 'Collaborative refactoring of the main dashboard component',
    status: 'active',
    participants: ['user-001', 'user-002'],
    startedAt: new Date(Date.now() - 3600000).toISOString(),
  };

  activeSessions.set(demoSession.id, demoSession);
}

initializeDemoData();

// GET: Get room info, presence, or session details
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const sessionId = searchParams.get('sessionId');
  const projectId = searchParams.get('projectId');
  const view = searchParams.get('view'); // 'rooms', 'presence', 'sessions'

  // Get all active sessions for a project
  if (view === 'sessions') {
    const sessions = Array.from(activeSessions.values())
      .filter(s => s.status === 'active');
    
    return NextResponse.json({
      sessions,
      total: sessions.length,
    });
  }

  // Get specific session
  if (sessionId) {
    const session = activeSessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    const room = activeRooms.get(session.roomId);
    return NextResponse.json({ session, room });
  }

  // Get presence for a specific room
  if (roomId) {
    const room = activeRooms.get(roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    return NextResponse.json({
      room,
      presence: room.participants,
      participantCount: room.participants.length,
    });
  }

  // Get all active rooms for a project
  if (projectId) {
    const rooms = Array.from(activeRooms.values())
      .filter(r => r.projectId === projectId);
    
    const totalParticipants = rooms.reduce((acc, r) => acc + r.participants.length, 0);
    
    return NextResponse.json({
      rooms,
      totalRooms: rooms.length,
      totalParticipants,
    });
  }

  // Return overview
  const allRooms = Array.from(activeRooms.values());
  const allSessions = Array.from(activeSessions.values()).filter(s => s.status === 'active');
  
  return NextResponse.json({
    overview: {
      activeRooms: allRooms.length,
      activeSessions: allSessions.length,
      totalParticipants: allRooms.reduce((acc, r) => acc + r.participants.length, 0),
    },
    websocketEndpoint: 'wss://collab.prismcode.dev/ws',
    message: 'Connect via WebSocket for real-time updates',
  });
}

// POST: Join a room or create a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, projectId, resourcePath, sessionTitle, sessionDescription } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Create a new collaboration session
    if (action === 'create_session') {
      const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const room: Room = {
        id: roomId,
        type: 'session',
        projectId: projectId || 'default',
        resourcePath,
        participants: [],
        createdAt: new Date().toISOString(),
        maxParticipants: 10,
      };

      const session: CollaborationSession = {
        id: sessionId,
        roomId,
        createdBy: userId,
        title: sessionTitle || 'Untitled Session',
        description: sessionDescription,
        status: 'active',
        participants: [],
        startedAt: new Date().toISOString(),
      };

      activeRooms.set(roomId, room);
      activeSessions.set(sessionId, session);

      console.log('[Session Created]', { sessionId, roomId, createdBy: userId });

      return NextResponse.json({
        session,
        room,
        websocketUrl: `wss://collab.prismcode.dev/ws?room=${roomId}&session=${sessionId}`,
      }, { status: 201 });
    }

    // Join an existing room
    if (action === 'join_room') {
      const { roomId } = body;
      const room = activeRooms.get(roomId);
      
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      if (room.participants.length >= room.maxParticipants) {
        return NextResponse.json({ error: 'Room is full' }, { status: 403 });
      }

      // Check if user already in room
      if (room.participants.some(p => p.userId === userId)) {
        return NextResponse.json({ error: 'Already in room' }, { status: 400 });
      }

      const userIndex = room.participants.length;
      const presence: Presence = {
        userId,
        user: {
          id: userId,
          name: body.userName || `User ${userId}`,
          email: body.userEmail || `${userId}@prismcode.dev`,
          color: userColors[userIndex % userColors.length],
        },
        roomId,
        resourcePath: room.resourcePath,
        status: 'active',
        lastSeen: new Date().toISOString(),
        connectedAt: new Date().toISOString(),
      };

      room.participants.push(presence);

      console.log('[User Joined Room]', { userId, roomId });

      return NextResponse.json({
        presence,
        room,
        otherParticipants: room.participants.filter(p => p.userId !== userId),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('[Collaboration Error]', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH: Update presence, cursor, or session status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, roomId, sessionId } = body;

    // Update cursor position
    if (action === 'update_cursor') {
      const { line, column, selection } = body;
      const room = activeRooms.get(roomId);
      
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      const participant = room.participants.find(p => p.userId === userId);
      if (!participant) {
        return NextResponse.json({ error: 'User not in room' }, { status: 404 });
      }

      participant.cursor = {
        userId,
        position: { line, column },
        selection,
        timestamp: Date.now(),
      };
      participant.lastSeen = new Date().toISOString();
      participant.status = 'active';

      return NextResponse.json({
        cursor: participant.cursor,
        broadcast: {
          type: 'cursor_update',
          userId,
          cursor: participant.cursor,
        },
      });
    }

    // Update presence status
    if (action === 'update_status') {
      const { status } = body;
      const room = activeRooms.get(roomId);
      
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      const participant = room.participants.find(p => p.userId === userId);
      if (!participant) {
        return NextResponse.json({ error: 'User not in room' }, { status: 404 });
      }

      participant.status = status;
      participant.lastSeen = new Date().toISOString();

      return NextResponse.json({
        status: participant.status,
        broadcast: {
          type: 'presence_update',
          userId,
          status,
        },
      });
    }

    // End a session
    if (action === 'end_session') {
      const session = activeSessions.get(sessionId);
      
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      session.status = 'ended';
      session.endedAt = new Date().toISOString();

      // Clear the room
      activeRooms.delete(session.roomId);

      console.log('[Session Ended]', { sessionId });

      return NextResponse.json({
        session,
        message: 'Session ended successfully',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('[Collaboration Update Error]', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE: Leave a room
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');
  const userId = searchParams.get('userId');

  if (!roomId || !userId) {
    return NextResponse.json({ error: 'roomId and userId required' }, { status: 400 });
  }

  const room = activeRooms.get(roomId);
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  room.participants = room.participants.filter(p => p.userId !== userId);

  // Clean up empty rooms
  if (room.participants.length === 0) {
    activeRooms.delete(roomId);
  }

  console.log('[User Left Room]', { userId, roomId });

  return NextResponse.json({
    message: 'Left room successfully',
    broadcast: {
      type: 'user_left',
      userId,
      roomId,
    },
  });
}
