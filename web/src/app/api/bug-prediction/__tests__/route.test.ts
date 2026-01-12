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

describe('API: Bug Prediction', () => {
  it('GET returns predictions', async () => {
    const req = {
      url: 'http://localhost/api/bug-prediction',
      nextUrl: new URL('http://localhost/api/bug-prediction')
    } as any;
    const res = await GET(req);
    const data = await res.json();
    expect(data?.service).toBeDefined();
  });
});
