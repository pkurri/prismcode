import { liveSessionManager } from '../../../src/advanced/live-session';

describe('LiveSessionManager', () => {
  describe('createSession', () => {
    it('should create a new session with host', () => {
      const session = liveSessionManager.createSession('Test Session', 'host1', 'Alice');

      expect(session.id).toMatch(/^session_/);
      expect(session.name).toBe('Test Session');
      expect(session.hostId).toBe('host1');
      expect(session.participants.size).toBe(1);
      expect(session.isActive).toBe(true);
    });
  });

  describe('joinSession', () => {
    it('should allow participant to join', () => {
      const session = liveSessionManager.createSession('Join Test', 'host2', 'Bob');
      const participant = liveSessionManager.joinSession(session.id, 'user1', 'Charlie');

      expect(participant).not.toBeNull();
      expect(participant?.name).toBe('Charlie');
      expect(session.participants.size).toBe(2);
    });

    it('should return null for invalid session', () => {
      const participant = liveSessionManager.joinSession('invalid_id', 'user1', 'Test');
      expect(participant).toBeNull();
    });
  });

  describe('updateCursor', () => {
    it('should update participant cursor position', () => {
      const session = liveSessionManager.createSession('Cursor Test', 'host3', 'Dave');
      liveSessionManager.updateCursor(session.id, 'host3', {
        line: 10,
        column: 5,
        file: 'test.ts',
      });

      const participant = session.participants.get('host3');
      expect(participant?.cursor?.line).toBe(10);
    });
  });

  describe('broadcastChange', () => {
    it('should record code changes', () => {
      const session = liveSessionManager.createSession('Change Test', 'host4', 'Eve');

      liveSessionManager.broadcastChange(session.id, {
        id: 'change1',
        participantId: 'host4',
        file: 'app.ts',
        timestamp: new Date(),
        type: 'insert',
        range: { startLine: 1, startCol: 0, endLine: 1, endCol: 0 },
        content: 'const x = 1;',
      });

      expect(session.changes.length).toBe(1);
      expect(session.files.has('app.ts')).toBe(true);
    });
  });

  describe('getShareLink', () => {
    it('should generate shareable link', () => {
      const session = liveSessionManager.createSession('Share Test', 'host5', 'Frank');
      const link = liveSessionManager.getShareLink(session.id);

      expect(link).toContain('prismcode://join-session/');
      expect(link).toContain(session.id);
    });
  });
});
