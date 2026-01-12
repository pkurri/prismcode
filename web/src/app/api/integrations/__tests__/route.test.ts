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

describe('API: Integrations', () => {
  it('GET returns integrations', async () => {
    const req = {
      url: 'http://localhost/api/integrations',
      nextUrl: new URL('http://localhost/api/integrations')
    } as any;
    const res = await GET(req);
    const data = await res.json();
    expect(data).toBeDefined();
  });
});
