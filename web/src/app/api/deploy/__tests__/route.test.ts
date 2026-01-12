import { GET, POST, DELETE } from '../route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, options?: any) => ({ 
      json: async () => data, 
      status: options?.status || 200 
    }),
  },
  NextRequest: jest.fn(),
}));

describe('API Deploy', () => {
  it('GET returns summary', async () => {
    const req = {
      url: 'http://localhost/api/deploy?view=summary',
    } as any;
    const res = await GET(req);
    const data = await res.json();
    expect(data.stats.totalDeployments).toBeDefined();
  });

  it('GET returns environment', async () => {
    const req = {
      url: 'http://localhost/api/deploy?envId=prod',
    } as any;
    const res = await GET(req);
    const data = await res.json();
    expect(data.environment.name).toBe('Production');
    expect(data.deployments).toBeInstanceOf(Array);
  });

  it('POST triggers deployment', async () => {
    const req = {
      json: async () => ({
        action: 'deploy',
        envId: 'staging',
        branch: 'feat/test'
      })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(202);
    expect(data.deployment.status).toBe('building');
  });

  it('POST creates preview', async () => {
    const req = {
      json: async () => ({
        action: 'create_preview',
        prNumber: 123,
        branch: 'feat/preview'
      })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.environment.type).toBe('preview');
  });

  it('DELETE cancels deployment', async () => {
      // Create deploy first (use dev to avoid conflict with staging used above)
      const createReq = { json: async () => ({ action: 'deploy', envId: 'dev' }) } as any;
      const createRes = await POST(createReq);
      const deployId = (await createRes.json()).deployment.id;

      const req = {
        url: `http://localhost/api/deploy?deployId=${deployId}`,
      } as any;
      const res = await DELETE(req);
      const data = await res.json();
      expect(data.message).toContain('cancelled');
  });
});
