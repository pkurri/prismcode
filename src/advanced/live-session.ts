/**
 * Live Code Session Sharing
 * Issue #261: Live Code Session Sharing
 *
 * Real-time collaborative coding with presence and sync
 */

import logger from '../utils/logger';

export interface SessionParticipant {
  id: string;
  name: string;
  color: string;
  cursor?: CursorPosition;
  selection?: SelectionRange;
  isActive: boolean;
  joinedAt: Date;
}

export interface CursorPosition {
  line: number;
  column: number;
  file: string;
}

export interface SelectionRange {
  start: CursorPosition;
  end: CursorPosition;
}

export interface CodeChange {
  id: string;
  participantId: string;
  file: string;
  timestamp: Date;
  type: 'insert' | 'delete' | 'replace';
  range: { startLine: number; startCol: number; endLine: number; endCol: number };
  content: string;
}

export interface LiveSession {
  id: string;
  name: string;
  hostId: string;
  participants: Map<string, SessionParticipant>;
  files: Set<string>;
  changes: CodeChange[];
  createdAt: Date;
  isActive: boolean;
}

export interface SessionConfig {
  maxParticipants: number;
  autoSaveInterval: number;
  conflictResolution: 'host-wins' | 'last-write' | 'merge';
  enableVoice: boolean;
  enableChat: boolean;
}

const DEFAULT_CONFIG: SessionConfig = {
  maxParticipants: 10,
  autoSaveInterval: 5000,
  conflictResolution: 'merge',
  enableVoice: false,
  enableChat: true,
};

const PARTICIPANT_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#22c55e',
  '#a855f7',
  '#f59e0b',
  '#ec4899',
  '#14b8a6',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
];

/**
 * Live Session Manager
 * Manages real-time collaborative coding sessions
 */
export class LiveSessionManager {
  private sessions: Map<string, LiveSession> = new Map();
  private config: SessionConfig;
  private eventListeners: Map<string, ((event: SessionEvent) => void)[]> = new Map();

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('LiveSessionManager initialized', { config: this.config });
  }

  /**
   * Create a new live session
   */
  createSession(name: string, hostId: string, hostName: string): LiveSession {
    const sessionId = `session_${Date.now().toString(16)}_${Math.random().toString(36).substr(2, 6)}`;

    const host: SessionParticipant = {
      id: hostId,
      name: hostName,
      color: PARTICIPANT_COLORS[0],
      isActive: true,
      joinedAt: new Date(),
    };

    const session: LiveSession = {
      id: sessionId,
      name,
      hostId,
      participants: new Map([[hostId, host]]),
      files: new Set(),
      changes: [],
      createdAt: new Date(),
      isActive: true,
    };

    this.sessions.set(sessionId, session);
    this.emit(sessionId, { type: 'session-created', session });

    logger.info('Live session created', { sessionId, host: hostName });
    return session;
  }

  /**
   * Join an existing session
   */
  joinSession(sessionId: string, participantId: string, name: string): SessionParticipant | null {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      logger.warn('Cannot join session', { sessionId, reason: 'not found or inactive' });
      return null;
    }

    if (session.participants.size >= this.config.maxParticipants) {
      logger.warn('Session full', { sessionId, max: this.config.maxParticipants });
      return null;
    }

    const colorIndex = session.participants.size % PARTICIPANT_COLORS.length;
    const participant: SessionParticipant = {
      id: participantId,
      name,
      color: PARTICIPANT_COLORS[colorIndex],
      isActive: true,
      joinedAt: new Date(),
    };

    session.participants.set(participantId, participant);
    this.emit(sessionId, { type: 'participant-joined', participant });

    logger.info('Participant joined session', { sessionId, participant: name });
    return participant;
  }

  /**
   * Leave a session
   */
  leaveSession(sessionId: string, participantId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const participant = session.participants.get(participantId);
    if (participant) {
      session.participants.delete(participantId);
      this.emit(sessionId, { type: 'participant-left', participantId });

      // End session if host leaves
      if (participantId === session.hostId) {
        this.endSession(sessionId);
      }

      logger.info('Participant left session', { sessionId, participant: participant.name });
    }
  }

  /**
   * Broadcast cursor position
   */
  updateCursor(sessionId: string, participantId: string, cursor: CursorPosition): void {
    const session = this.sessions.get(sessionId);
    const participant = session?.participants.get(participantId);

    if (participant) {
      participant.cursor = cursor;
      this.emit(sessionId, { type: 'cursor-moved', participantId, cursor });
    }
  }

  /**
   * Broadcast selection
   */
  updateSelection(sessionId: string, participantId: string, selection: SelectionRange): void {
    const session = this.sessions.get(sessionId);
    const participant = session?.participants.get(participantId);

    if (participant) {
      participant.selection = selection;
      this.emit(sessionId, { type: 'selection-changed', participantId, selection });
    }
  }

  /**
   * Broadcast code change
   */
  broadcastChange(sessionId: string, change: CodeChange): void {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) return;

    session.changes.push(change);
    session.files.add(change.file);
    this.emit(sessionId, { type: 'code-changed', change });

    logger.debug('Code change broadcast', { sessionId, file: change.file, type: change.type });
  }

  /**
   * Get session participants
   */
  getParticipants(sessionId: string): SessionParticipant[] {
    const session = this.sessions.get(sessionId);
    return session ? Array.from(session.participants.values()) : [];
  }

  /**
   * Get session info
   */
  getSession(sessionId: string): LiveSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * List active sessions
   */
  listSessions(): LiveSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.isActive);
  }

  /**
   * End a session
   */
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.emit(sessionId, { type: 'session-ended', sessionId });
      logger.info('Session ended', { sessionId, totalChanges: session.changes.length });
    }
  }

  /**
   * Subscribe to session events
   */
  on(sessionId: string, callback: (event: SessionEvent) => void): void {
    if (!this.eventListeners.has(sessionId)) {
      this.eventListeners.set(sessionId, []);
    }
    this.eventListeners.get(sessionId)!.push(callback);
  }

  /**
   * Emit session event
   */
  private emit(sessionId: string, event: SessionEvent): void {
    const listeners = this.eventListeners.get(sessionId) || [];
    for (const listener of listeners) {
      listener(event);
    }
  }

  /**
   * Generate shareable session link
   */
  getShareLink(sessionId: string): string {
    return `prismcode://join-session/${sessionId}`;
  }
}

export type SessionEvent =
  | { type: 'session-created'; session: LiveSession }
  | { type: 'session-ended'; sessionId: string }
  | { type: 'participant-joined'; participant: SessionParticipant }
  | { type: 'participant-left'; participantId: string }
  | { type: 'cursor-moved'; participantId: string; cursor: CursorPosition }
  | { type: 'selection-changed'; participantId: string; selection: SelectionRange }
  | { type: 'code-changed'; change: CodeChange };

export const liveSessionManager = new LiveSessionManager();
