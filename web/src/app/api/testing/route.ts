import { NextRequest, NextResponse } from 'next/server';

// Types for test results
interface TestRun {
  id: string;
  projectId: string;
  commit: string;
  branch: string;
  suiteType: 'unit' | 'integration' | 'e2e' | 'visual';
  status: 'passed' | 'failed' | 'running' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  environment: string;
  triggered_by: string;
  summary: TestSummary;
  coverage?: CoverageData;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
}

interface TestCase {
  id: string;
  runId: string;
  name: string;
  suite: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  retries: number;
  failureMessage?: string;
  stackTrace?: string;
  artifacts?: TestArtifact[];
}

interface TestArtifact {
  type: 'log' | 'screenshot' | 'video' | 'trace';
  name: string;
  url: string;
}

interface CoverageData {
  lines: number;
  branches: number;
  functions: number;
  statements: number;
}

interface FlakyTest {
  testName: string;
  suite: string;
  flakyRate: number;
  lastFlaky: string;
  occurrences: number;
  status: 'investigating' | 'known' | 'fixed';
}

// Mock data store (in production, this would be a database)
const testRuns: TestRun[] = [
  {
    id: 'run-001',
    projectId: 'prismcode',
    commit: 'e45243e',
    branch: 'main',
    suiteType: 'unit',
    status: 'passed',
    startedAt: new Date(Date.now() - 600000).toISOString(),
    completedAt: new Date(Date.now() - 450000).toISOString(),
    duration: 150,
    environment: 'ci',
    triggered_by: 'push',
    summary: { total: 245, passed: 243, failed: 0, skipped: 2, flaky: 0 },
    coverage: { lines: 87, branches: 82, functions: 91, statements: 86 },
  },
  {
    id: 'run-002',
    projectId: 'prismcode',
    commit: 'e45243e',
    branch: 'main',
    suiteType: 'integration',
    status: 'passed',
    startedAt: new Date(Date.now() - 900000).toISOString(),
    completedAt: new Date(Date.now() - 720000).toISOString(),
    duration: 180,
    environment: 'ci',
    triggered_by: 'push',
    summary: { total: 58, passed: 57, failed: 0, skipped: 1, flaky: 1 },
    coverage: { lines: 72, branches: 68, functions: 78, statements: 71 },
  },
  {
    id: 'run-003',
    projectId: 'prismcode',
    commit: '7b0fd6d',
    branch: 'feat/oauth',
    suiteType: 'unit',
    status: 'failed',
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    completedAt: new Date(Date.now() - 1650000).toISOString(),
    duration: 150,
    environment: 'ci',
    triggered_by: 'pull_request',
    summary: { total: 245, passed: 240, failed: 3, skipped: 2, flaky: 1 },
    coverage: { lines: 85, branches: 80, functions: 89, statements: 84 },
  },
  {
    id: 'run-004',
    projectId: 'prismcode',
    commit: 'e45243e',
    branch: 'main',
    suiteType: 'e2e',
    status: 'passed',
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3300000).toISOString(),
    duration: 300,
    environment: 'ci',
    triggered_by: 'schedule',
    summary: { total: 34, passed: 33, failed: 0, skipped: 1, flaky: 2 },
  },
];

const testCases: TestCase[] = [
  {
    id: 'case-001',
    runId: 'run-003',
    name: 'should authenticate user with valid credentials',
    suite: 'AuthService',
    status: 'failed',
    duration: 1250,
    retries: 2,
    failureMessage: 'Expected status 200 but received 401',
    stackTrace: 'AuthService.test.ts:45\n  at async authenticate()',
    artifacts: [
      { type: 'log', name: 'test.log', url: '/artifacts/run-003/case-001/test.log' },
    ],
  },
  {
    id: 'case-002',
    runId: 'run-003',
    name: 'should handle OAuth callback',
    suite: 'AuthService',
    status: 'failed',
    duration: 850,
    retries: 1,
    failureMessage: 'Timeout: callback not received within 5000ms',
  },
  {
    id: 'case-003',
    runId: 'run-003',
    name: 'should refresh expired token',
    suite: 'AuthService',
    status: 'failed',
    duration: 650,
    retries: 0,
    failureMessage: 'Token refresh endpoint returned 500',
  },
];

const flakyTests: FlakyTest[] = [
  {
    testName: 'should handle network timeout gracefully',
    suite: 'APIClient',
    flakyRate: 15,
    lastFlaky: new Date(Date.now() - 86400000).toISOString(),
    occurrences: 12,
    status: 'investigating',
  },
  {
    testName: 'should retry on connection failure',
    suite: 'APIClient',
    flakyRate: 8,
    lastFlaky: new Date(Date.now() - 172800000).toISOString(),
    occurrences: 5,
    status: 'known',
  },
  {
    testName: 'should render dashboard within 3 seconds',
    suite: 'Dashboard.e2e',
    flakyRate: 5,
    lastFlaky: new Date(Date.now() - 604800000).toISOString(),
    occurrences: 3,
    status: 'fixed',
  },
];

// GET: Retrieve test runs, cases, or flaky tests
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('runId');
  const projectId = searchParams.get('projectId');
  const branch = searchParams.get('branch');
  const suiteType = searchParams.get('suiteType');
  const view = searchParams.get('view'); // 'runs', 'cases', 'flaky', 'coverage'

  // Get flaky tests
  if (view === 'flaky') {
    return NextResponse.json({
      flakyTests,
      total: flakyTests.length,
      activeCount: flakyTests.filter(t => t.status !== 'fixed').length,
    });
  }

  // Get test cases for a specific run
  if (view === 'cases' && runId) {
    const cases = testCases.filter(c => c.runId === runId);
    return NextResponse.json({
      cases,
      total: cases.length,
    });
  }

  // Get coverage trends
  if (view === 'coverage') {
    const runsWithCoverage = testRuns.filter(r => r.coverage);
    const trends = runsWithCoverage.map(r => ({
      commit: r.commit,
      branch: r.branch,
      date: r.completedAt,
      coverage: r.coverage,
    }));
    return NextResponse.json({
      trends,
      current: runsWithCoverage[0]?.coverage,
    });
  }

  // Get specific run
  if (runId) {
    const run = testRuns.find(r => r.id === runId);
    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }
    const cases = testCases.filter(c => c.runId === runId);
    return NextResponse.json({ run, cases });
  }

  // Filter runs
  let filteredRuns = testRuns;
  if (projectId) filteredRuns = filteredRuns.filter(r => r.projectId === projectId);
  if (branch) filteredRuns = filteredRuns.filter(r => r.branch === branch);
  if (suiteType) filteredRuns = filteredRuns.filter(r => r.suiteType === suiteType);

  // Calculate aggregated stats
  const stats = {
    totalRuns: filteredRuns.length,
    passedRuns: filteredRuns.filter(r => r.status === 'passed').length,
    failedRuns: filteredRuns.filter(r => r.status === 'failed').length,
    totalTests: filteredRuns.reduce((acc, r) => acc + r.summary.total, 0),
    passedTests: filteredRuns.reduce((acc, r) => acc + r.summary.passed, 0),
    flakyTests: filteredRuns.reduce((acc, r) => acc + r.summary.flaky, 0),
    avgDuration: Math.round(filteredRuns.reduce((acc, r) => acc + (r.duration || 0), 0) / filteredRuns.length),
  };

  return NextResponse.json({
    runs: filteredRuns,
    stats,
    total: filteredRuns.length,
  });
}

// POST: Record a new test run
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, commit, branch, suiteType, environment, triggered_by, results } = body;

    // Validate required fields
    if (!projectId || !commit || !suiteType || !results) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, commit, suiteType, results' },
        { status: 400 }
      );
    }

    // Calculate summary from results
    const summary: TestSummary = {
      total: results.length,
      passed: results.filter((r: { status: string }) => r.status === 'passed').length,
      failed: results.filter((r: { status: string }) => r.status === 'failed').length,
      skipped: results.filter((r: { status: string }) => r.status === 'skipped').length,
      flaky: results.filter((r: { retries: number }) => r.retries > 0).length,
    };

    const now = new Date().toISOString();
    const run: TestRun = {
      id: `run-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      projectId,
      commit,
      branch: branch || 'main',
      suiteType,
      status: summary.failed > 0 ? 'failed' : 'passed',
      startedAt: now,
      completedAt: now,
      duration: results.reduce((acc: number, r: { duration: number }) => acc + (r.duration || 0), 0),
      environment: environment || 'ci',
      triggered_by: triggered_by || 'api',
      summary,
    };

    // In production, save to database
    console.log('[Test Run Recorded]', {
      runId: run.id,
      projectId,
      commit,
      suiteType,
      status: run.status,
      testsRun: summary.total,
      passed: summary.passed,
      failed: summary.failed,
    });

    return NextResponse.json({
      run,
      message: 'Test run recorded successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('[Test Aggregation Error]', error);
    return NextResponse.json(
      { error: 'Failed to record test run' },
      { status: 500 }
    );
  }
}

// PATCH: Update flaky test status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { testName, status } = body;

    if (!testName || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: testName, status' },
        { status: 400 }
      );
    }

    // In production, update database
    console.log('[Flaky Test Updated]', { testName, status });

    return NextResponse.json({
      message: 'Flaky test status updated',
      testName,
      newStatus: status,
    });

  } catch (error) {
    console.error('[Test Update Error]', error);
    return NextResponse.json(
      { error: 'Failed to update test status' },
      { status: 500 }
    );
  }
}
