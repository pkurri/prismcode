import { NextRequest, NextResponse } from 'next/server';

// Session Sharing API
// Manage collaborative workspace sessions with real-time sync

interface Session {
  id: string;
  name: string;
  owner: string;
  participants: SessionParticipant[];
  permissions: 'view' | 'edit' | 'admin';
  expiresAt?: string;
  isRecording: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SessionParticipant {
  userId: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'active' | 'idle' | 'away';
  cursor?: { file: string; line: number; column: number };
  joinedAt: string;
  lastActiveAt: string;
}

interface SessionInvite {
  id: string;
  sessionId: string;
  email?: string;
  permissions: 'view' | 'edit' | 'admin';
  expiresAt: string;
  usedAt?: string;
}

// Mock data stores
const sessions: Map<string, Session> = new Map();
const invites: Map<string, SessionInvite> = new Map();

// GET: List sessions or get specific session
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const inviteId = searchParams.get('inviteId');

  // Get specific session
  if (sessionId) {
    const session = sessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json(session);
  }

  // Validate invite
  if (inviteId) {
    const invite = invites.get(inviteId);
    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }
    if (new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invite expired' }, { status: 410 });
    }
    if (invite.usedAt) {
      return NextResponse.json({ error: 'Invite already used' }, { status: 410 });
    }
    
    const session = sessions.get(invite.sessionId);
    return NextResponse.json({ invite, session });
  }

  // List user's sessions
  return NextResponse.json({
    sessions: Array.from(sessions.values()),
    total: sessions.size,
  });
}

// POST: Create session, invite, or update cursor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Create new session
    if (action === 'create_session') {
      const { name, permissions = 'edit', expiresIn } = body;

      const session: Session = {
        id: `session-${Math.random().toString(36).substring(2, 10)}`,
        name: name || 'Untitled Session',
        owner: body.owner || 'current-user',
        participants: [{
          userId: body.owner || 'current-user',
          name: body.ownerName || 'Session Owner',
          role: 'owner',
          status: 'active',
          joinedAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
        }],
        permissions,
        isRecording: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (expiresIn) {
        const expiresAt = new Date();
        if (expiresIn === '1h') expiresAt.setHours(expiresAt.getHours() + 1);
        else if (expiresIn === '24h') expiresAt.setHours(expiresAt.getHours() + 24);
        else if (expiresIn === '7d') expiresAt.setDate(expiresAt.getDate() + 7);
        session.expiresAt = expiresAt.toISOString();
      }

      sessions.set(session.id, session);

      console.log('[Session Created]', { sessionId: session.id, name: session.name });

      return NextResponse.json({
        message: 'Session created',
        session,
        shareUrl: `https://prismcode.dev/join/${session.id}`,
      }, { status: 201 });
    }

    // Create invite link
    if (action === 'create_invite') {
      const { sessionId, permissions = 'edit', expiresIn = '24h', email } = body;

      const session = sessions.get(sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const expiresAt = new Date();
      if (expiresIn === '1h') expiresAt.setHours(expiresAt.getHours() + 1);
      else if (expiresIn === '24h') expiresAt.setHours(expiresAt.getHours() + 24);
      else if (expiresIn === '7d') expiresAt.setDate(expiresAt.getDate() + 7);

      const invite: SessionInvite = {
        id: `inv-${Math.random().toString(36).substring(2, 10)}`,
        sessionId,
        email,
        permissions,
        expiresAt: expiresAt.toISOString(),
      };

      invites.set(invite.id, invite);

      return NextResponse.json({
        message: 'Invite created',
        invite,
        inviteUrl: `https://prismcode.dev/join/${sessionId}?invite=${invite.id}`,
      }, { status: 201 });
    }

    // Join session
    if (action === 'join_session') {
      const { sessionId, inviteId, userName } = body;

      const session = sessions.get(sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      // Validate invite if provided
      let permissions: 'view' | 'edit' | 'admin' = 'view';
      if (inviteId) {
        const invite = invites.get(inviteId);
        if (!invite || invite.sessionId !== sessionId) {
          return NextResponse.json({ error: 'Invalid invite' }, { status: 400 });
        }
        if (new Date(invite.expiresAt) < new Date()) {
          return NextResponse.json({ error: 'Invite expired' }, { status: 410 });
        }
        permissions = invite.permissions;
        invite.usedAt = new Date().toISOString();
        invites.set(inviteId, invite);
      }

      const participant: SessionParticipant = {
        userId: `user-${Date.now()}`,
        name: userName || 'Anonymous',
        role: permissions === 'admin' ? 'owner' : permissions === 'edit' ? 'editor' : 'viewer',
        status: 'active',
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };

      session.participants.push(participant);
      session.updatedAt = new Date().toISOString();
      sessions.set(sessionId, session);

      return NextResponse.json({
        message: 'Joined session',
        participant,
        session,
      });
    }

    // Update cursor position
    if (action === 'update_cursor') {
      const { sessionId, userId, cursor } = body;

      const session = sessions.get(sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const participant = session.participants.find(p => p.userId === userId);
      if (!participant) {
        return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
      }

      participant.cursor = cursor;
      participant.lastActiveAt = new Date().toISOString();
      participant.status = 'active';
      sessions.set(sessionId, session);

      return NextResponse.json({ message: 'Cursor updated', cursor });
    }

    // Toggle recording
    if (action === 'toggle_recording') {
      const { sessionId } = body;

      const session = sessions.get(sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      session.isRecording = !session.isRecording;
      session.updatedAt = new Date().toISOString();
      sessions.set(sessionId, session);

      return NextResponse.json({
        message: session.isRecording ? 'Recording started' : 'Recording stopped',
        isRecording: session.isRecording,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('[Session API Error]', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// DELETE: End session or leave
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const userId = searchParams.get('userId');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Leave session
  if (userId) {
    session.participants = session.participants.filter(p => p.userId !== userId);
    session.updatedAt = new Date().toISOString();
    sessions.set(sessionId, session);
    return NextResponse.json({ message: 'Left session' });
  }

  // End session (owner only)
  sessions.delete(sessionId);
  return NextResponse.json({ message: 'Session ended' });
}
