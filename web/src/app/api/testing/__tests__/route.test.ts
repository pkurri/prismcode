import { GET, POST } from '../route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, options?: any) => ({ 
      json: async () => data, 
      status: options?.status || 200 
    }),
  },
}));

describe('API: Testing', () => {
  it('GET returns tests', async () => {
    const req = {
      url: 'http://localhost/api/testing',
      nextUrl: new URL('http://localhost/api/testing')
    } as any;
    const res = await GET(req);
    const data = await res.json();
    expect(data?.runs).toBeDefined();
  });

  it('POST runs tests', async () => {
    const req = {
      json: async () => ({ 
        projectId: 'p1',
        commit: 'c1',
        suiteType: 'unit',
        results: []
      })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(data?.run).toBeDefined();
  });
});
