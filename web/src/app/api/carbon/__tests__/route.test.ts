/**
 * @jest-environment node
 */
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

function createRequest(url: string, options?: RequestInit): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'), options);
}

describe('Carbon API', () => {
  describe('GET', () => {
    it('returns service info', async () => {
      const res = await GET();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.service).toBe('carbon-analyzer');
      expect(data.version).toBe('1.0.0');
      expect(data.ratings).toContain('A');
    });
  });

  describe('POST', () => {
    it('returns 400 without files', async () => {
      const req = createRequest('http://localhost:3000/api/carbon', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it('analyzes clean code as rating A', async () => {
      const req = createRequest('http://localhost:3000/api/carbon', {
        method: 'POST',
        body: JSON.stringify({
          files: [{ path: 'test.ts', content: 'const x = 1;' }],
          language: 'typescript',
        }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.analyses).toHaveLength(1);
      expect(data.analyses[0].rating).toBe('A');
    });

    it('detects nested loops as high impact', async () => {
      const code = `for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          console.log(i, j);
        }
      }`;
      const req = createRequest('http://localhost:3000/api/carbon', {
        method: 'POST',
        body: JSON.stringify({
          files: [{ path: 'loops.ts', content: code }],
          language: 'typescript',
        }),
      });
      const res = await POST(req);
      const data = await res.json();
      expect(data.analyses[0].hotspots.length).toBeGreaterThan(0);
    });

    it('calculates summary metrics', async () => {
      const req = createRequest('http://localhost:3000/api/carbon', {
        method: 'POST',
        body: JSON.stringify({
          files: [
            { path: 'a.ts', content: 'const a = 1;' },
            { path: 'b.ts', content: 'const b = 2;' },
          ],
          language: 'typescript',
        }),
      });
      const res = await POST(req);
      const data = await res.json();
      expect(data.summary.totalFiles).toBe(2);
      expect(data.summary).toHaveProperty('totalCO2Grams');
      expect(data.summary).toHaveProperty('overallRating');
    });
  });
});
