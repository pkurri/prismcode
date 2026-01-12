/**
 * @jest-environment node
 */
import { GET, POST, DELETE } from '../route';
import { NextRequest } from 'next/server';

// Helper to create mock requests
function createRequest(url: string, options?: RequestInit): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), options);
}

describe('Video API', () => {
  describe('GET', () => {
    it('returns list of rooms', async () => {
      const req = createRequest('http://localhost:3000/api/video');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('rooms');
      expect(data).toHaveProperty('total');
    });

    it('returns recordings when view=recordings', async () => {
      const req = createRequest('http://localhost:3000/api/video?view=recordings');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('recordings');
    });

    it('returns 404 for non-existent room', async () => {
      const req = createRequest('http://localhost:3000/api/video?roomId=non-existent');
      const res = await GET(req);
      expect(res.status).toBe(404);
    });

    it('returns 404 for non-existent recording', async () => {
      const req = createRequest('http://localhost:3000/api/video?recordingId=non-existent');
      const res = await GET(req);
      expect(res.status).toBe(404);
    });

    it('returns existing recording by id', async () => {
      const req = createRequest('http://localhost:3000/api/video?recordingId=rec-001');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe('rec-001');
    });
  });

  describe('POST - create_room', () => {
    it('creates instant room', async () => {
      const req = createRequest('http://localhost:3000/api/video', {
        method: 'POST',
        body: JSON.stringify({ action: 'create_room', name: 'Test Room' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.room.name).toBe('Test Room');
      expect(data).toHaveProperty('joinUrl');
    });

    it('creates scheduled room', async () => {
      const req = createRequest('http://localhost:3000/api/video', {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'create_room', 
          name: 'Scheduled Meeting',
          type: 'scheduled',
          scheduledAt: new Date().toISOString()
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
    });
  });

  describe('POST - join_room', () => {
    it('returns 404 for non-existent room', async () => {
      const req = createRequest('http://localhost:3000/api/video', {
        method: 'POST',
        body: JSON.stringify({ action: 'join_room', roomId: 'fake-room', userName: 'Test' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(404);
    });
  });

  describe('POST - recording', () => {
    it('returns 404 for start_recording with invalid room', async () => {
      const req = createRequest('http://localhost:3000/api/video', {
        method: 'POST',
        body: JSON.stringify({ action: 'start_recording', roomId: 'fake-room' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(404);
    });

    it('returns 404 for stop_recording with invalid id', async () => {
      const req = createRequest('http://localhost:3000/api/video', {
        method: 'POST',
        body: JSON.stringify({ action: 'stop_recording', recordingId: 'fake' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(404);
    });
  });

  describe('POST - end_room', () => {
    it('returns 404 for non-existent room', async () => {
      const req = createRequest('http://localhost:3000/api/video', {
        method: 'POST',
        body: JSON.stringify({ action: 'end_room', roomId: 'fake-room' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(404);
    });
  });

  describe('POST - invalid action', () => {
    it('returns 400 for invalid action', async () => {
      const req = createRequest('http://localhost:3000/api/video', {
        method: 'POST',
        body: JSON.stringify({ action: 'invalid_action' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE', () => {
    it('returns 400 without recordingId', async () => {
      const req = createRequest('http://localhost:3000/api/video', { method: 'DELETE' });
      const res = await DELETE(req);
      expect(res.status).toBe(400);
    });

    it('returns 404 for non-existent recording', async () => {
      const req = createRequest('http://localhost:3000/api/video?recordingId=fake', { method: 'DELETE' });
      const res = await DELETE(req);
      expect(res.status).toBe(404);
    });

    it('deletes existing recording', async () => {
      const req = createRequest('http://localhost:3000/api/video?recordingId=rec-002', { method: 'DELETE' });
      const res = await DELETE(req);
      expect(res.status).toBe(200);
    });
  });
});
