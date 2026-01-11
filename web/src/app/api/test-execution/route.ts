import { NextRequest, NextResponse } from 'next/server';

// Test Execution & Results Aggregation API - implements #311
interface TestRun {
  id: string;
  projectId: string;
  suiteId: string;
  status: 'running' | 'passed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  stats: TestStats;
}

interface TestStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
}

interface TestCaseResult {
  id: string;
  testId: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: {
    message: string;
    stack: string;
  };
}

// In-memory store
const runs: Map<string, TestRun> = new Map();
const results: Map<string, TestCaseResult[]> = new Map(); // runId -> results

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, runId, projectId, suiteId, cases } = body;

    // Start a new test run
    if (action === 'start') {
      const newRun: TestRun = {
        id: runId || `run-${Date.now()}`,
        projectId,
        suiteId,
        status: 'running',
        startTime: new Date().toISOString(),
        stats: { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 },
      };
      runs.set(newRun.id, newRun);
      return NextResponse.json({ success: true, run: newRun });
    }

    // Report results (streaming or batch)
    if (action === 'report') {
      const run = runs.get(runId);
      if (!run) return NextResponse.json({ error: 'Run not found' }, { status: 404 });

      // Update stats
      if (cases && Array.isArray(cases)) {
        const currentResults = results.get(runId) || [];
        
        cases.forEach((c: any) => {
          run.stats.total++;
          if (c.status === 'passed') run.stats.passed++;
          if (c.status === 'failed') run.stats.failed++;
          if (c.status === 'skipped') run.stats.skipped++;
          run.stats.duration += c.duration || 0;
          
          currentResults.push({
            id: c.id || `res-${Date.now()}-${Math.random()}`,
            testId: c.testId,
            name: c.name,
            status: c.status,
            duration: c.duration,
            error: c.error,
          });
        });
        
        results.set(runId, currentResults);
      }

      return NextResponse.json({ success: true, run });
    }

    // Finish a test run
    if (action === 'finish') {
      const run = runs.get(runId);
      if (!run) return NextResponse.json({ error: 'Run not found' }, { status: 404 });

      run.status = body.status || (run.stats.failed > 0 ? 'failed' : 'passed');
      run.endTime = new Date().toISOString();
      
      return NextResponse.json({ success: true, run });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('runId');
  const projectId = searchParams.get('projectId');
  
  if (runId) {
    const run = runs.get(runId);
    if (!run) return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    
    return NextResponse.json({
      run,
      results: results.get(runId) || [],
    });
  }
  
  if (projectId) {
    const projectRuns = Array.from(runs.values())
      .filter(r => r.projectId === projectId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 20); // Last 20 runs
      
    return NextResponse.json({ runs: projectRuns });
  }

  return NextResponse.json({ 
    service: 'test-execution-service',
    activeRuns: Array.from(runs.values()).filter(r => r.status === 'running').length,
  });
}
