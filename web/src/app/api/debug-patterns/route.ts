import { NextRequest, NextResponse } from 'next/server';

// Debug Patterns API - implements #239
interface DebugPattern {
  id: string;
  name: string;
  category: 'null_reference' | 'async' | 'state' | 'memory' | 'type';
  occurrences: number;
  solutions: string[];
  codeExample?: { before: string; after: string };
}

interface DebugSession {
  id: string;
  error: string;
  file: string;
  resolution: string;
  duration: string;
  timestamp: string;
}

// In-memory storage (would be database in production)
const patterns: Map<string, DebugPattern> = new Map([
  ['null_ref', { 
    id: 'null_ref', 
    name: 'Undefined Property Access', 
    category: 'null_reference', 
    occurrences: 45, 
    solutions: ['Use optional chaining', 'Add null check', 'Use default values'],
    codeExample: {
      before: 'const name = user.profile.name;',
      after: 'const name = user?.profile?.name ?? "Guest";',
    },
  }],
  ['unhandled_promise', { 
    id: 'unhandled_promise', 
    name: 'Unhandled Promise Rejection', 
    category: 'async', 
    occurrences: 32, 
    solutions: ['Add try-catch', 'Use .catch()', 'Implement error boundary'],
    codeExample: {
      before: 'await fetchData();',
      after: 'try { await fetchData(); } catch (e) { handleError(e); }',
    },
  }],
  ['state_after_unmount', { 
    id: 'state_after_unmount', 
    name: 'State Update After Unmount', 
    category: 'state', 
    occurrences: 18, 
    solutions: ['Add cleanup in useEffect', 'Use AbortController', 'Check mounted state'],
  }],
  ['memory_leak', { 
    id: 'memory_leak', 
    name: 'Memory Leak in Event Listeners', 
    category: 'memory', 
    occurrences: 12, 
    solutions: ['Remove listeners on cleanup', 'Use weak references', 'Dispose timers'],
  }],
]);

const sessions: DebugSession[] = [];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  
  if (type === 'sessions') {
    return NextResponse.json({
      sessions: sessions.slice(-50), // Last 50 sessions
      total: sessions.length,
    });
  }
  
  return NextResponse.json({
    patterns: Array.from(patterns.values()),
    summary: {
      totalPatterns: patterns.size,
      totalOccurrences: Array.from(patterns.values()).reduce((s, p) => s + p.occurrences, 0),
      categories: ['null_reference', 'async', 'state', 'memory', 'type'],
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.type === 'session') {
      // Log a new debug session
      const session: DebugSession = {
        id: `session-${Date.now()}`,
        error: body.error,
        file: body.file,
        resolution: body.resolution,
        duration: body.duration || '0m',
        timestamp: new Date().toISOString(),
      };
      sessions.push(session);
      
      // Update pattern occurrence if known
      if (body.patternId && patterns.has(body.patternId)) {
        const pattern = patterns.get(body.patternId)!;
        pattern.occurrences++;
      }
      
      return NextResponse.json({ success: true, session });
    }
    
    if (body.type === 'pattern') {
      // Add new pattern
      const pattern: DebugPattern = {
        id: body.id || `pattern-${Date.now()}`,
        name: body.name,
        category: body.category,
        occurrences: 1,
        solutions: body.solutions || [],
        codeExample: body.codeExample,
      };
      patterns.set(pattern.id, pattern);
      
      return NextResponse.json({ success: true, pattern });
    }
    
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
