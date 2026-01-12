/**
 * @jest-environment node
 */
import { GET, POST } from '../route';

describe('Team API', () => {
  describe('GET', () => {
    it('returns team data', async () => {
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('members');
      expect(data.data).toHaveProperty('roles');
      expect(data.data).toHaveProperty('auditLogs');
    });
  });

  describe('POST - invite', () => {
    it('sends invite', async () => {
      const req = new Request('http://localhost:3000/api/team', {
        method: 'POST',
        body: JSON.stringify({ action: 'invite', email: 'test@example.com', role: 'developer' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('inviteId');
    });

    it('returns 400 without email', async () => {
      const req = new Request('http://localhost:3000/api/team', {
        method: 'POST',
        body: JSON.stringify({ action: 'invite', role: 'developer' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe('POST - updateRole', () => {
    it('updates member role', async () => {
      const req = new Request('http://localhost:3000/api/team', {
        method: 'POST',
        body: JSON.stringify({ action: 'updateRole', memberId: 'u2', roleId: 'role_developer' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('returns 400 without memberId', async () => {
      const req = new Request('http://localhost:3000/api/team', {
        method: 'POST',
        body: JSON.stringify({ action: 'updateRole', roleId: 'role_admin' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe('POST - invalid action', () => {
    it('returns 400', async () => {
      const req = new Request('http://localhost:3000/api/team', {
        method: 'POST',
        body: JSON.stringify({ action: 'unknown' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });
});
