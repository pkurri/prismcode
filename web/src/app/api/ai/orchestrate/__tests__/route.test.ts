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

describe('API AI Orchestrate', () => {
  it('GET returns optimal model for chat', async () => {
    const req = {
      url: 'http://localhost/api/ai/orchestrate?task=chat',
    } as any;
    const res = await GET(req);
    const data = await res.json();
    expect(data.selectedModel).toBeDefined();
    // Chat strategy is cost, so it should be low cost model
    expect(data.reason).toContain('cost');
  });

  it('GET returns optimal model for code-review', async () => {
    const req = {
      url: 'http://localhost/api/ai/orchestrate?task=code-review',
    } as any;
    const res = await GET(req);
    const data = await res.json();
    // Quality strategy implies GPT-4o or Claude 3.5 Sonnet
    expect(['gpt-4o', 'claude-3-5-sonnet']).toContain(data.selectedModel);
    expect(data.reason).toContain('quality');
  });

  it('POST processes request and tracks usage', async () => {
    const req = {
      json: async () => ({
        task: 'code-completion',
        prompt: 'console.log',
        maxTokens: 100
      })
    } as any;
    
    const res = await POST(req);
    const data = await res.json();
    expect(data.routing).toBeDefined();
    expect(data.response.content).toContain('Mock response');
    
    // Verify usage tracking
    const reqUsage = {
       url: 'http://localhost/api/ai/orchestrate?view=usage',
    } as any;
    const resUsage = await GET(reqUsage);
    const dataUsage = await resUsage.json();
    expect(dataUsage.totalTokens).toBeGreaterThan(0);
  });
});
