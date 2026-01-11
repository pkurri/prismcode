/**
 * Real-Time Collaboration Service
 * GitHub Issue #313: [BACKEND] Real-Time Collaboration Service
 */

export interface CollaborationSession {
  id: string;
  projectId: string;
  participants: Participant[];
  createdAt: Date;
  status: 'active' | 'ended';
}

export interface Participant {
  userId: string;
  name: string;
  color: string;
  cursor?: CursorPosition;
  joinedAt: Date;
}

export interface CursorPosition {
  file: string;
  line: number;
  column: number;
}

export interface CollaborationEvent {
  type: 'join' | 'leave' | 'cursor' | 'edit' | 'chat';
  userId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

// Active sessions
const sessions = new Map<string, CollaborationSession>();

export function createSession(projectId: string, creatorId: string): CollaborationSession {
  const session: CollaborationSession = {
    id: `session-${Date.now()}`,
    projectId,
    participants: [{ userId: creatorId, name: 'User', color: '#6366f1', joinedAt: new Date() }],
    createdAt: new Date(),
    status: 'active',
  };
  sessions.set(session.id, session);
  return session;
}

export function joinSession(sessionId: string, userId: string, name: string): boolean {
  const session = sessions.get(sessionId);
  if (!session || session.status !== 'active') return false;
  
  session.participants.push({
    userId,
    name,
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    joinedAt: new Date(),
  });
  return true;
}

export function leaveSession(sessionId: string, userId: string): void {
  const session = sessions.get(sessionId);
  if (!session) return;
  
  session.participants = session.participants.filter(p => p.userId !== userId);
  if (session.participants.length === 0) {
    session.status = 'ended';
  }
}

export function getSession(sessionId: string): CollaborationSession | undefined {
  return sessions.get(sessionId);
}

export function broadcastEvent(sessionId: string, event: CollaborationEvent): void {
  console.log(`Broadcasting to ${sessionId}:`, event.type);
  // In production, this would use WebSocket
}
