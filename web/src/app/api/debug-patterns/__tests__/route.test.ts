import { GET } from '../route';
import { NextRequest } from 'next/server';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, options?: any) => ({ 
      json: async () => data, 
      status: options?.status || 200 
    }),
  },
}));

describe('API: Debug Patterns', () => {
  it('GET returns patterns', async () => {
    const req = {
      url: 'http://localhost/api/debug-patterns',
      nextUrl: new URL('http://localhost/api/debug-patterns')
    } as any;
    const res = await GET(req);
    const data = await res.json();
    expect(data?.patterns || data?.success).toBeDefined();
  });
});
