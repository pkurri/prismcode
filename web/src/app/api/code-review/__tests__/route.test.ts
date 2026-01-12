import { POST } from '../route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, options?: any) => ({ 
      json: async () => data, 
      status: options?.status || 200 
    }),
  },
}));

describe('API: Code Review', () => {
  it('POST creates review', async () => {
    const req = {
      json: async () => ({ 
        repo: 'test/repo',
        diff: 'diff --git',
        prNumber: 1,
        files: []
      })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(data?.id).toBeDefined();
  });

  it('POST returns error for missing fields', async () => {
    const req = {
      json: async () => ({ repo: 'missing' })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(data?.error).toBeDefined();
  });
});
