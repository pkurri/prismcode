import { POST } from '../route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, options?: any) => ({ 
      json: async () => data, 
      status: options?.status || 200 
    }),
  },
}));

describe('API: Analysis', () => {
  it('POST performs analysis', async () => {
    const req = {
      json: async () => ({ action: 'analyze', path: 'src/test.ts' })
    } as any;
    
    const res = await POST(req);
    const data = await res.json();
    expect(data?.success).toBe(true);
    expect(data?.data?.issues).toBeDefined();
  });
});
