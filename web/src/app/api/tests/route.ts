import { NextResponse } from 'next/server';

// Mock data - connects to test-generation, flaky-tests, test-impact modules
const testsData = {
  summary: {
    total: 1234,
    passed: 1189,
    failed: 12,
    skipped: 33,
    coverage: 87.4,
    duration: '4m 32s',
  },
  suites: [
    { name: 'unit', total: 890, passed: 878, failed: 5, duration: '1m 45s' },
    { name: 'integration', total: 234, passed: 221, failed: 6, duration: '2m 10s' },
    { name: 'e2e', total: 110, passed: 90, failed: 1, duration: '37s' },
  ],
  flaky: [
    { name: 'auth.session.test.ts', failRate: 0.15, lastFail: '2h ago' },
    { name: 'api.timeout.test.ts', failRate: 0.12, lastFail: '1d ago' },
    { name: 'db.connection.test.ts', failRate: 0.08, lastFail: '3d ago' },
  ],
  recentRuns: [
    { id: 1, branch: 'main', status: 'passed', duration: '4m 32s', time: '10 mins ago' },
    { id: 2, branch: 'feature/auth', status: 'passed', duration: '4m 18s', time: '1 hour ago' },
    { id: 3, branch: 'fix/memory-leak', status: 'failed', duration: '2m 45s', time: '3 hours ago' },
  ],
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: testsData,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, testPath } = body;

  switch (action) {
    case 'run':
      return NextResponse.json({
        success: true,
        message: `Test run started`,
        jobId: `test_${Date.now()}`,
      });
    case 'generate':
      return NextResponse.json({
        success: true,
        message: `Generating tests for ${testPath}`,
        jobId: `gen_${Date.now()}`,
      });
    case 'quarantine':
      return NextResponse.json({
        success: true,
        message: `Test quarantined: ${testPath}`,
      });
    default:
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  }
}
