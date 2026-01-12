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

describe('API Video', () => {
  it('GET returns rooms', async () => {
    const req = {
      url: 'http://localhost/api/video',
    } as any;
    const res = await GET(req);
    const data = await res.json();
    expect(data.rooms).toBeDefined();
  });

  it('POST creates instant room', async () => {
    const req = {
      json: async () => ({
        action: 'create_room',
        name: 'Test Room'
      })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.room.type).toBe('instant');
    expect(data.joinUrl).toBeDefined();
  });

  it('POST joins room', async () => {
    // Create room first
    const createReq = { json: async () => ({ action: 'create_room' }) } as any;
    const createRes = await POST(createReq);
    const roomId = (await createRes.json()).room.id;

    const req = {
      json: async () => ({
        action: 'join_room',
        roomId,
        userName: 'User'
      })
    } as any;
    const res = await POST(req);
    const data = await res.json();
    expect(data.message).toBe('Joined room');
    expect(data.participant).toBeDefined();
  });

  it('POST controls recording', async () => {
    // Create room
    const createReq = { json: async () => ({ action: 'create_room' }) } as any;
    const createRes = await POST(createReq);
    const roomId = (await createRes.json()).room.id;

    // Start
    const startReq = {
      json: async () => ({
         action: 'start_recording',
         roomId
      })
    } as any;
    const startRes = await POST(startReq);
    const recordingId = (await startRes.json()).recording.id;
    expect(recordingId).toBeDefined();

    // Stop
    const stopReq = {
      json: async () => ({
        action: 'stop_recording',
        recordingId,
        duration: 10
      })
    } as any;
    const stopRes = await POST(stopReq);
    expect((await stopRes.json()).message).toBe('Recording stopped');
  });

  it('DELETE deletes recording', async () => {
     // Mock a recording ID that exists in mock data from route.ts
     // 'rec-001' is in the mock data
     const req = {
       url: 'http://localhost/api/video?recordingId=rec-001',
     } as any;
     const res = await DELETE(req);
     const data = await res.json();
     expect(data.message).toBe('Recording deleted');
  });
});
