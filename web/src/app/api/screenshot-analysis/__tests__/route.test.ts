import { POST } from '../route';
import { NextRequest } from 'next/server';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, options?: any) => ({ 
      json: async () => data, 
      status: options?.status || 200 
    }),
  },
}));

describe('API: Screenshot Analysis', () => {
  it('POST analyzes screenshot', async () => {
    const req = {
      json: async () => ({ image: 'base64...' })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(data).toBeDefined();
  });
});
