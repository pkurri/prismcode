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

describe('API: Ask', () => {
  it('POST handles query', async () => {
    const req = {
      json: async () => ({ question: 'How does auth work?' })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(data?.success).toBe(true);
  });
});
