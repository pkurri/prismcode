import { GET, POST } from '../route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, options?: any) => ({ 
      json: async () => data, 
      status: options?.status || 200 
    }),
  },
}));

describe('API: Test Execution', () => {
  it('GET returns executions', async () => {
    const req = {
      url: 'http://localhost/api/test-execution',
      nextUrl: new URL('http://localhost/api/test-execution')
    } as any;
    const res = await GET(req);
    const data = await res.json();
    expect(data).toBeDefined();
  });

  it('POST creates execution', async () => {
    const req = {
      json: async () => ({ projectId: 'p1', branch: 'main' })
    } as any;
    
    const res = await POST(req);
    const data = await res.json();
    expect(data).toBeDefined();
  });
});
