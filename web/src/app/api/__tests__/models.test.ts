import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../models/route';

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: any) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    }),
  },
}));

describe('Models API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/models', () => {
    it('returns models, usage, and routing data', async () => {
      const response = await GET();
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('models');
      expect(data.data).toHaveProperty('usage');
      expect(data.data).toHaveProperty('routing');
      expect(Array.isArray(data.data.models)).toBe(true);
    });
  });

  describe('POST /api/models', () => {
    it('sets default model for task', async () => {
      const request = new Request('http://localhost:3000/api/models', {
        method: 'POST',
        body: JSON.stringify({ action: 'setDefault', modelId: 'gpt-4o', task: 'codeReview' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.message).toContain('codeReview');
    });

    it('sets routing policy', async () => {
      const request = new Request('http://localhost:3000/api/models', {
        method: 'POST',
        body: JSON.stringify({ action: 'setPolicy', policy: 'quality' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.message).toContain('quality');
    });

    it('tests model health', async () => {
      const request = new Request('http://localhost:3000/api/models', {
        method: 'POST',
        body: JSON.stringify({ action: 'test', modelId: 'gpt-4o' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.status).toBe('healthy');
      expect(data.latency).toBeDefined();
    });
  });
});
