import { GET, POST, PATCH, DELETE } from '../route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, options?: any) => ({ 
      json: async () => data, 
      status: options?.status || 200 
    }),
  },
  NextRequest: jest.fn(),
}));

// Mock NextRequest/Response is simplified since we import the handlers directly.
// The handlers expect a request object with .url and .json()

describe('API Collaboration', () => {
  it('GET returns room info', async () => {
    // room-demo-001 is initialized in the route file
    const req = {
      url: 'http://localhost/api/collaboration?roomId=room-demo-001',
    } as any;
    const res = await GET(req);
    const data = await res.json();
    expect(data.room).toBeDefined();
    expect(data.participantCount).toBeGreaterThan(0);
  });

  it('POST creates new session', async () => {
    const req = {
      json: async () => ({
        action: 'create_session',
        userId: 'user-new',
        projectId: 'p1',
        sessionTitle: 'Test Session'
      })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.session.id).toContain('session-');
    expect(data.websocketUrl).toContain('wss://');
  });

  it('POST joins room', async () => {
    const req = {
      json: async () => ({
        action: 'join_room',
        roomId: 'room-demo-001',
        userId: 'user-joiner',
        userName: 'Joiner'
      })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(data.presence.userId).toBe('user-joiner');
    expect(data.room).toBeDefined();
  });

  it('PATCH updates cursor', async () => {
    const req = {
      json: async () => ({
        action: 'update_cursor',
        roomId: 'room-demo-001',
        userId: 'user-001',
        line: 10,
        column: 5
      })
    } as any;
    const res = await PATCH(req);
    const data = await res.json();
    expect(data.cursor.position).toEqual({ line: 10, column: 5 });
  });

  it('DELETE leaves room', async () => {
    const req = {
      url: 'http://localhost/api/collaboration?roomId=room-demo-001&userId=user-001'
    } as any;
    const res = await DELETE(req);
    const data = await res.json();
    expect(data.message).toBe('Left room successfully');
  });
});
