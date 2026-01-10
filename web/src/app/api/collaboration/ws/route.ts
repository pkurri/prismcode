import { NextRequest, NextResponse } from 'next/server';

// WebSocket Gateway Configuration for Real-Time Collaboration
// Note: Next.js API routes don't natively support WebSockets.
// This endpoint provides configuration and connection tokens for the WebSocket server.
// In production, use a dedicated WebSocket server (Socket.io, ws, or Edge Runtime with Cloudflare Durable Objects)

interface WebSocketConfig {
  endpoint: string;
  protocol: 'wss' | 'ws';
  heartbeatInterval: number;
  reconnectDelay: number;
  maxReconnectAttempts: number;
  features: string[];
}

interface ConnectionToken {
  token: string;
  userId: string;
  expiresAt: string;
  permissions: string[];
}

// WebSocket server configuration
const wsConfig: WebSocketConfig = {
  endpoint: process.env.WS_ENDPOINT || 'wss://collab.prismcode.dev/ws',
  protocol: 'wss',
  heartbeatInterval: 30000, // 30 seconds
  reconnectDelay: 1000, // 1 second initial delay
  maxReconnectAttempts: 5,
  features: [
    'presence', // Who is online
    'cursors', // Live cursor positions
    'selections', // Text selections
    'awareness', // User awareness (typing, idle, etc.)
    'yjs-sync', // CRDT document sync via Yjs
  ],
};

// Room types and their configurations
const roomTypes = {
  workspace: {
    maxParticipants: 50,
    features: ['presence', 'awareness'],
    persistence: true,
  },
  file: {
    maxParticipants: 10,
    features: ['presence', 'cursors', 'selections', 'yjs-sync'],
    persistence: true,
  },
  session: {
    maxParticipants: 5,
    features: ['presence', 'cursors', 'selections', 'awareness', 'yjs-sync'],
    persistence: false,
  },
};

// GET: Get WebSocket configuration for client connection
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomType = searchParams.get('roomType') as keyof typeof roomTypes | null;

  if (roomType && roomTypes[roomType]) {
    return NextResponse.json({
      config: wsConfig,
      roomConfig: roomTypes[roomType],
      availableRoomTypes: Object.keys(roomTypes),
    });
  }

  return NextResponse.json({
    config: wsConfig,
    roomTypes,
    usage: {
      connect: `const ws = new WebSocket('${wsConfig.endpoint}?token=YOUR_TOKEN&room=ROOM_ID')`,
      events: {
        inbound: ['presence_update', 'cursor_move', 'selection_change', 'doc_update', 'user_joined', 'user_left'],
        outbound: ['join_room', 'leave_room', 'update_cursor', 'update_selection', 'sync_doc'],
      },
    },
  });
}

// POST: Request a connection token for WebSocket authentication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, roomId, roomType = 'file' } = body;

    if (!userId || !roomId) {
      return NextResponse.json(
        { error: 'userId and roomId are required' },
        { status: 400 }
      );
    }

    // In production, validate user session and check room permissions
    // Generate a signed JWT token for WebSocket authentication

    const token: ConnectionToken = {
      token: `ws_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      userId,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      permissions: ['read', 'write', 'presence'],
    };

    console.log('[WebSocket Token Generated]', {
      userId,
      roomId,
      roomType,
      tokenId: token.token.substring(0, 20) + '...',
    });

    return NextResponse.json({
      ...token,
      connectionUrl: `${wsConfig.endpoint}?token=${token.token}&room=${roomId}`,
      config: {
        heartbeatInterval: wsConfig.heartbeatInterval,
        reconnectDelay: wsConfig.reconnectDelay,
      },
    });

  } catch (error) {
    console.error('[WebSocket Token Error]', error);
    return NextResponse.json(
      { error: 'Failed to generate connection token' },
      { status: 500 }
    );
  }
}
