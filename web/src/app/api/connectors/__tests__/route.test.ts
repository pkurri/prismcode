import { GET, POST } from '../route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, options?: any) => ({ 
      json: async () => data, 
      status: options?.status || 200 
    }),
  },
}));

describe('API: Connectors', () => {
  it('GET returns connectors', async () => {
    const req = {
      url: 'http://localhost/api/connectors',
      nextUrl: new URL('http://localhost/api/connectors')
    } as any;
    const res = await GET(req);
    const data = await res.json();
    expect(data?.integrations).toBeInstanceOf(Array);
  });

  it('POST handles api key auth', async () => {
    const req = {
      json: async () => ({ 
        integrationId: 'snyk',
        authType: 'token',
        credentials: { token: 'secret' }
      })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(data?.status).toBe('connected');
  });

  it('POST handles oauth init', async () => {
    const req = {
      json: async () => ({ 
        integrationId: 'github',
        authType: 'oauth2'
      })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(data?.authUrl).toBeDefined();
  });
});
