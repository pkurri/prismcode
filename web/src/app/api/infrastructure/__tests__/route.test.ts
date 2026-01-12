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

describe('API Infrastructure', () => {
  it('GET returns summary', async () => {
    const req = {
      url: 'http://localhost/api/infrastructure?view=summary',
    } as any;
    const res = await GET(req);
    const data = await res.json();
    expect(data.total).toBeGreaterThan(0);
    expect(data.totalMonthlyCost).toBeGreaterThan(0);
  });

  it('GET returns templates', async () => {
    const req = {
      url: 'http://localhost/api/infrastructure?view=templates',
    } as any;
    const res = await GET(req);
    const data = await res.json();
    expect(data.templates).toHaveLength(7);
  });

  it('POST provisions template', async () => {
    const req = {
      json: async () => ({
        action: 'provision_template',
        templateId: 'web-server',
        name: 'my-web-server'
      })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(202);
    expect(data.resource.type).toBe('container');
    expect(data.resource.status).toBe('provisioning');
  });

  it('POST scales resource', async () => {
    const req = {
      json: async () => ({
        action: 'scale',
        resourceId: 'res-001', 
        specs: { cpu: 4 }
      })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(data.resource.specs.cpu).toBe(4);
  });

  it('DELETE marks resource deleting', async () => {
    const req = {
      url: 'http://localhost/api/infrastructure?resourceId=res-001',
    } as any;
    const res = await DELETE(req);
    const data = await res.json();
    expect(data.message).toContain('deletion initiated');
  });
});
