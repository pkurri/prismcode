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

describe('API Sessions', () => {
  it('GET returns sessions list', async () => {
    const req = {
      url: 'http://localhost/api/sessions',
    } as any;
    const res = await GET(req);
    const data = await res.json();
    expect(data.sessions).toBeDefined();
  });

  it('POST creates session', async () => {
    const req = {
      json: async () => ({
        action: 'create_session',
        name: 'My Session',
        permissions: 'edit',
        expiresIn: '24h'
      })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.session.id).toContain('session-');
    expect(data.shareUrl).toBeDefined();
  });

  it('POST creates invite', async () => {
    // Create session first
    const createReq = {
      json: async () => ({ action: 'create_session', name: 'Invite Test' })
    } as any;
    const createRes = await POST(createReq);
    const sessionData = await createRes.json();
    const sessionId = sessionData.session.id;

    const req = {
      json: async () => ({
        action: 'create_invite',
        sessionId,
        permissions: 'view',
        email: 'test@example.com'
      })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(data.invite.id).toContain('inv-');
  });

  it('POST joins session', async () => {
     // Needs existing session
     const createReq = { json: async () => ({ action: 'create_session' }) } as any;
     const createRes = await POST(createReq);
     const sessionId = (await createRes.json()).session.id;

     const req = {
       json: async () => ({
         action: 'join_session',
         sessionId,
         userName: 'Guest'
       })
     } as any;
     const res = await POST(req);
     const data = await res.json();
     expect(data.participant.name).toBe('Guest');
  });

  it('DELETE ends session', async () => {
    const createReq = { json: async () => ({ action: 'create_session' }) } as any;
    const createRes = await POST(createReq);
    const sessionId = (await createRes.json()).session.id;

    const req = {
      url: `http://localhost/api/sessions?sessionId=${sessionId}`,
    } as any;
    const res = await DELETE(req);
    const data = await res.json();
    expect(data.message).toBe('Session ended');
  });
});
