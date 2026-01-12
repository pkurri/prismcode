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

describe('API: Achievements', () => {
  it('GET returns achievements', async () => {
    const req = {
      url: 'http://localhost/api/achievements',
      nextUrl: new URL('http://localhost/api/achievements')
    } as any;
    const res = await GET(req);
    const data = await res.json();
    expect(data?.success).toBe(true);
  });
});
