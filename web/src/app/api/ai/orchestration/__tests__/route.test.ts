import { GET, POST } from '../route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, options?: any) => ({ 
      json: async () => data, 
      status: options?.status || 200 
    }),
  },
  NextRequest: jest.fn(),
}));

describe('API AI Orchestration', () => {
  it('GET returns models', async () => {
    const res = await GET();
    const data = await res.json();
    expect(data.models).toHaveLength(7);
    expect(data.routingPolicies).toBeDefined();
  });

  it('POST routes task correctly (quality)', async () => {
    const req = {
      json: async () => ({
        task: 'code-generation',
        strategy: 'quality',
        prompt: 'Write a function',
      })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    
    // Quality strategy -> Claude 3 Opus or GPT-4o
    expect(['claude-3-opus', 'gpt-4o', 'claude-3-sonnet']).toContain(data.model);
    expect(data.usage.estimatedCost).toBeGreaterThan(0);
  });

  it('POST routes task correctly (cost)', async () => {
    const req = {
      json: async () => ({
        task: 'code-generation',
        strategy: 'cost',
        prompt: 'Write a function',
      })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    
    // Cost strategy -> DeepSeek or GPT-3.5
    expect(['deepseek-coder', 'gpt-3.5-turbo']).toContain(data.model);
  });

  it('POST handles error on invalid task', async () => {
    const req = {
      json: async () => ({
        task: 'invalid-task',
        prompt: 'test',
      })
    } as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
