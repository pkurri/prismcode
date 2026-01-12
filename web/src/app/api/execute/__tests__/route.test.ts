/**
 * @jest-environment node
 */
import { GET, POST } from '../route';

describe('Execute API', () => {
  describe('GET', () => {
    it('returns supported languages', async () => {
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.languages)).toBe(true);
      expect(data.languages.length).toBeGreaterThan(0);
      expect(data.limits).toHaveProperty('maxTimeout');
    });
  });

  describe('POST', () => {
    it('returns 400 without code', async () => {
      const req = new Request('http://localhost:3000/api/execute', {
        method: 'POST',
        body: JSON.stringify({ language: 'typescript' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('returns 400 without language', async () => {
      const req = new Request('http://localhost:3000/api/execute', {
        method: 'POST',
        body: JSON.stringify({ code: 'console.log("hi")' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('executes code successfully', async () => {
      const req = new Request('http://localhost:3000/api/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'console.log("hello")',
          language: 'typescript',
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.result).toHaveProperty('stdout');
      expect(data.result).toHaveProperty('exitCode');
      expect(data).toHaveProperty('executionId');
    });

    it('accepts custom timeout and memory', async () => {
      const req = new Request('http://localhost:3000/api/execute', {
        method: 'POST',
        body: JSON.stringify({
          code: 'print("hi")',
          language: 'python',
          timeout: 5000,
          memoryMB: 128,
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });
});
