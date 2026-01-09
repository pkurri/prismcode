import { NextResponse } from 'next/server';

// Service connecting to snyk-integration.ts, sonarqube-integration.ts backend modules
const securityService = {
  async getVulnerabilities() {
    // In production: Connect to SnykIntegration from src/advanced/snyk-integration.ts
    return {
      summary: { critical: 1, high: 2, medium: 3, low: 5, total: 11 },
      vulnerabilities: [
        {
          id: 'SNYK-001',
          severity: 'critical',
          title: 'SQL Injection',
          file: 'src/db/queries.ts',
          line: 45,
          fixable: true,
          source: 'snyk',
        },
        {
          id: 'SNYK-002',
          severity: 'high',
          title: 'Exposed API keys',
          file: 'src/config.ts',
          line: 12,
          fixable: true,
          source: 'snyk',
        },
        {
          id: 'SONAR-001',
          severity: 'high',
          title: 'XSS vulnerability',
          file: 'src/utils/markdown.ts',
          line: 89,
          fixable: false,
          source: 'sonarqube',
        },
        {
          id: 'DEP-001',
          severity: 'medium',
          title: 'Outdated lodash',
          file: 'package.json',
          line: 23,
          fixable: true,
          source: 'dependabot',
        },
      ],
    };
  },

  async getQualityGates() {
    // In production: Connect to SonarQubeIntegration from src/advanced/sonarqube-integration.ts
    return {
      status: 'passed',
      gates: [
        { name: 'Coverage', status: 'passed', current: 87.4, threshold: 80 },
        { name: 'Duplications', status: 'passed', current: 2.1, threshold: 5 },
        { name: 'Bugs', status: 'passed', current: 0, threshold: 0 },
        { name: 'Vulnerabilities', status: 'warning', current: 2, threshold: 0 },
      ],
    };
  },

  async scan(path: string) {
    return { jobId: `scan_${Date.now()}`, status: 'queued', estimatedTime: '2min' };
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'vulnerabilities';

  try {
    switch (type) {
      case 'vulnerabilities':
        return NextResponse.json({
          success: true,
          data: await securityService.getVulnerabilities(),
        });
      case 'quality':
        return NextResponse.json({ success: true, data: await securityService.getQualityGates() });
      default:
        return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, path = '.', vulnerabilityId } = body;

    switch (action) {
      case 'scan':
        return NextResponse.json({ success: true, ...(await securityService.scan(path)) });
      case 'fix':
        return NextResponse.json({ success: true, message: `Fix applied for ${vulnerabilityId}` });
      case 'ignore':
        return NextResponse.json({ success: true, message: `Ignored ${vulnerabilityId}` });
      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ success: false, error: 'Operation failed' }, { status: 500 });
  }
}
