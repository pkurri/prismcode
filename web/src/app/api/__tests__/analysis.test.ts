import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../analysis/route';

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    }),
  },
}));

describe('Analysis API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/analysis', () => {
    it('returns summary data by default', async () => {
      const request = new Request('http://localhost:3000/api/analysis');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalFiles');
      expect(data.data).toHaveProperty('avgComplexity');
      expect(data.data).toHaveProperty('hotspots');
      expect(data.data).toHaveProperty('techDebtHours');
    });

    it('returns hotspots when type=hotspots', async () => {
      const request = new Request('http://localhost:3000/api/analysis?type=hotspots');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('returns error for invalid type', async () => {
      const request = new Request('http://localhost:3000/api/analysis?type=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/analysis', () => {
    it('starts analysis for valid path', async () => {
      const request = new Request('http://localhost:3000/api/analysis', {
        method: 'POST',
        body: JSON.stringify({ action: 'analyze', path: 'src/test.ts' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.jobId).toMatch(/^analysis_/);
    });

    it('returns error for missing path', async () => {
      const request = new Request('http://localhost:3000/api/analysis', {
        method: 'POST',
        body: JSON.stringify({ action: 'analyze' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
    });
  });
});
