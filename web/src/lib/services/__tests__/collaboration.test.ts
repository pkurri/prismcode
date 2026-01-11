import { createSession, joinSession, leaveSession, getSession } from '../collaboration';

describe('Collaboration Service', () => {
  describe('createSession', () => {
    it('creates a new session', () => {
      const session = createSession('proj-1', 'user-1');
      expect(session.projectId).toBe('proj-1');
      expect(session.status).toBe('active');
      expect(session.participants).toHaveLength(1);
    });
  });

  describe('joinSession', () => {
    it('adds participant to session', () => {
      const session = createSession('proj-2', 'user-1');
      const result = joinSession(session.id, 'user-2', 'User 2');
      expect(result).toBe(true);
      const updated = getSession(session.id);
      expect(updated?.participants).toHaveLength(2);
    });

    it('returns false for invalid session', () => {
      const result = joinSession('invalid-id', 'user-1', 'User 1');
      expect(result).toBe(false);
    });
  });

  describe('leaveSession', () => {
    it('removes participant from session', () => {
      const session = createSession('proj-3', 'user-1');
      joinSession(session.id, 'user-2', 'User 2');
      leaveSession(session.id, 'user-2');
      const updated = getSession(session.id);
      expect(updated?.participants).toHaveLength(1);
    });
  });
});
