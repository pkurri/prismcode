/**
 * @jest-environment node
 */
import { GET, POST, DELETE } from '../route';
import { NextRequest } from 'next/server';

function createRequest(url: string, options?: RequestInit): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), options);
}

describe('Environments API', () => {
  describe('GET', () => {
    it('returns all environments', async () => {
      const req = createRequest('http://localhost:3000/api/environments');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('environments');
    });

    it('returns specific environment by id', async () => {
      const req = createRequest('http://localhost:3000/api/environments?id=local');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe('local');
    });

    it('returns 404 for non-existent environment', async () => {
      const req = createRequest('http://localhost:3000/api/environments?id=fake');
      const res = await GET(req);
      expect(res.status).toBe(404);
    });

    it('filters by type', async () => {
      const req = createRequest('http://localhost:3000/api/environments?type=staging');
      const res = await GET(req);
      expect(res.status).toBe(200);
    });
  });

  describe('POST - deploy', () => {
    it('triggers deployment', async () => {
      const req = createRequest('http://localhost:3000/api/environments', {
        method: 'POST',
        body: JSON.stringify({ action: 'deploy', id: 'staging' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('buildId');
    });

    it('returns 404 for non-existent environment', async () => {
      const req = createRequest('http://localhost:3000/api/environments', {
        method: 'POST',
        body: JSON.stringify({ action: 'deploy', id: 'fake' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(404);
    });
  });

  describe('POST - create', () => {
    it('creates new environment', async () => {
      const req = createRequest('http://localhost:3000/api/environments', {
        method: 'POST',
        body: JSON.stringify({ 
          action: 'create', 
          config: { name: 'Test Env', type: 'cloud', branch: 'dev' } 
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.environment).toHaveProperty('id');
    });
  });

  describe('POST - invalid action', () => {
    it('returns 400', async () => {
      const req = createRequest('http://localhost:3000/api/environments', {
        method: 'POST',
        body: JSON.stringify({ action: 'unknown' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE', () => {
    it('returns 400 without id', async () => {
      const req = createRequest('http://localhost:3000/api/environments', { method: 'DELETE' });
      const res = await DELETE(req);
      expect(res.status).toBe(400);
    });

    it('returns 404 for non-existent environment', async () => {
      const req = createRequest('http://localhost:3000/api/environments?id=fake', { method: 'DELETE' });
      const res = await DELETE(req);
      expect(res.status).toBe(404);
    });
  });
});
