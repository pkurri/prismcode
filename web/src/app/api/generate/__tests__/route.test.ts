/**
 * @jest-environment node
 */
import { GET, POST } from '../route';

describe('Generate API', () => {
  describe('GET', () => {
    it('returns generation history', async () => {
      const req = new Request('http://localhost:3000/api/generate');
      const res = await GET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('POST', () => {
    it('returns 400 without prompt', async () => {
      const req = new Request('http://localhost:3000/api/generate', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('generates component from prompt', async () => {
      const req = new Request('http://localhost:3000/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Login form' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.code).toContain('Login form');
      expect(data).toHaveProperty('previewUrl');
      expect(data).toHaveProperty('model');
      expect(data).toHaveProperty('id');
    });
  });
});
