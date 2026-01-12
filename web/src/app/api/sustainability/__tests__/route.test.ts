/**
 * @jest-environment node
 */
import { GET, POST } from '../route';

describe('Sustainability API', () => {
  describe('GET', () => {
    it('returns sustainability data', async () => {
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('summary');
      expect(data.data).toHaveProperty('breakdown');
      expect(data.data).toHaveProperty('recommendations');
      expect(data.data).toHaveProperty('trends');
    });
  });

  describe('POST - analyze', () => {
    it('starts carbon analysis', async () => {
      const req = new Request('http://localhost:3000/api/sustainability', {
        method: 'POST',
        body: JSON.stringify({ action: 'analyze', path: '/src' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('jobId');
    });
  });

  describe('POST - optimize', () => {
    it('generates green optimization recommendations', async () => {
      const req = new Request('http://localhost:3000/api/sustainability', {
        method: 'POST',
        body: JSON.stringify({ action: 'optimize' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.recommendations).toBe(5);
    });
  });

  describe('POST - invalid action', () => {
    it('returns 400', async () => {
      const req = new Request('http://localhost:3000/api/sustainability', {
        method: 'POST',
        body: JSON.stringify({ action: 'invalid' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });
});
