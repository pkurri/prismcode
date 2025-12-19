/**
 * Snyk Security Integration
 * Issue #216: Snyk Integration
 *
 * Scan dependencies for vulnerabilities using Snyk API
 */

import logger from '../utils/logger';

export interface SnykConfig {
  apiToken: string;
  organizationId: string;
  projectId?: string;
  severity: ('low' | 'medium' | 'high' | 'critical')[];
  autoFix: boolean;
  blockOnCritical: boolean;
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  packageName: string;
  version: string;
  fixedIn?: string;
  description: string;
  cvss: number;
  cwe: string[];
  exploitMaturity: 'no-known-exploit' | 'proof-of-concept' | 'mature';
  url: string;
}

export interface ScanResult {
  id: string;
  projectName: string;
  scannedAt: Date;
  totalVulnerabilities: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  vulnerabilities: Vulnerability[];
  isBlocked: boolean;
  fixAvailable: number;
}

export interface FixSuggestion {
  vulnerabilityId: string;
  packageName: string;
  currentVersion: string;
  fixedVersion: string;
  isBreaking: boolean;
  command: string;
}

// API base URL for future implementation\n// const SNYK_API_BASE = 'https://api.snyk.io/v1';

/**
 * Snyk Security Scanner
 * Integrates with Snyk API for vulnerability scanning
 */
export class SnykIntegration {
  private config: SnykConfig | null = null;
  private scanHistory: ScanResult[] = [];

  constructor() {
    logger.info('SnykIntegration initialized');
  }

  /**
   * Configure Snyk integration
   */
  configure(config: SnykConfig): void {
    this.config = config;
    logger.info('Snyk configured', { 
      organizationId: config.organizationId,
      severity: config.severity,
      autoFix: config.autoFix,
    });
  }

  /**
   * Scan a project for vulnerabilities
   */
  async scanProject(manifestPath: string): Promise<ScanResult> {
    if (!this.config) {
      throw new Error('Snyk not configured. Call configure() first.');
    }

    logger.info('Starting Snyk scan', { manifestPath });

    // In a real implementation, this would call the Snyk API
    // For now, we simulate the scan
    const result = await this.performScan(manifestPath);
    
    this.scanHistory.push(result);
    
    logger.info('Snyk scan complete', {
      totalVulnerabilities: result.totalVulnerabilities,
      critical: result.bySeverity.critical,
      high: result.bySeverity.high,
    });

    return result;
  }

  /**
   * Check if PR should be blocked based on scan results
   */
  shouldBlockPR(scanResult: ScanResult): { blocked: boolean; reason: string } {
    if (!this.config) {
      return { blocked: false, reason: 'Snyk not configured' };
    }

    if (this.config.blockOnCritical && scanResult.bySeverity.critical > 0) {
      return {
        blocked: true,
        reason: `${scanResult.bySeverity.critical} critical vulnerabilities found`,
      };
    }

    return { blocked: false, reason: 'No blocking vulnerabilities' };
  }

  /**
   * Get fix suggestions for vulnerabilities
   */
  getFixSuggestions(scanResult: ScanResult): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    for (const vuln of scanResult.vulnerabilities) {
      if (vuln.fixedIn) {
        suggestions.push({
          vulnerabilityId: vuln.id,
          packageName: vuln.packageName,
          currentVersion: vuln.version,
          fixedVersion: vuln.fixedIn,
          isBreaking: this.isBreakingChange(vuln.version, vuln.fixedIn),
          command: `npm install ${vuln.packageName}@${vuln.fixedIn}`,
        });
      }
    }

    return suggestions;
  }

  /**
   * Apply auto-fixes for vulnerabilities
   */
  applyFixes(suggestions: FixSuggestion[]): { applied: number; failed: number } {
    if (!this.config?.autoFix) {
      logger.warn('Auto-fix disabled');
      return { applied: 0, failed: 0 };
    }

    let applied = 0;
    let failed = 0;

    for (const suggestion of suggestions) {
      if (!suggestion.isBreaking) {
        // In reality, this would run the npm command
        logger.info('Would apply fix', { 
          package: suggestion.packageName, 
          version: suggestion.fixedVersion 
        });
        applied++;
      } else {
        logger.warn('Skipping breaking change', { package: suggestion.packageName });
        failed++;
      }
    }

    return { applied, failed };
  }

  /**
   * Get scan history
   */
  getScanHistory(limit: number = 10): ScanResult[] {
    return this.scanHistory.slice(-limit);
  }

  /**
   * Generate security report
   */
  generateReport(scanResult: ScanResult): string {
    const lines: string[] = [
      `# Security Scan Report`,
      ``,
      `**Project:** ${scanResult.projectName}`,
      `**Scanned:** ${scanResult.scannedAt.toISOString()}`,
      ``,
      `## Summary`,
      `- Total Vulnerabilities: ${scanResult.totalVulnerabilities}`,
      `- Critical: ${scanResult.bySeverity.critical}`,
      `- High: ${scanResult.bySeverity.high}`,
      `- Medium: ${scanResult.bySeverity.medium}`,
      `- Low: ${scanResult.bySeverity.low}`,
      ``,
      `## Vulnerabilities`,
    ];

    for (const vuln of scanResult.vulnerabilities) {
      lines.push(`### ${vuln.title}`);
      lines.push(`- **Severity:** ${vuln.severity.toUpperCase()}`);
      lines.push(`- **Package:** ${vuln.packageName}@${vuln.version}`);
      lines.push(`- **CVSS:** ${vuln.cvss}`);
      if (vuln.fixedIn) {
        lines.push(`- **Fix:** Upgrade to ${vuln.fixedIn}`);
      }
      lines.push(``);
    }

    return lines.join('\n');
  }

  // Private helpers

  private async performScan(manifestPath: string): Promise<ScanResult> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock scan result
    const mockVulnerabilities: Vulnerability[] = [
      {
        id: 'SNYK-JS-LODASH-1234',
        title: 'Prototype Pollution in lodash',
        severity: 'high',
        packageName: 'lodash',
        version: '4.17.15',
        fixedIn: '4.17.21',
        description: 'Prototype pollution vulnerability',
        cvss: 7.4,
        cwe: ['CWE-1321'],
        exploitMaturity: 'proof-of-concept',
        url: 'https://snyk.io/vuln/SNYK-JS-LODASH-1234',
      },
    ];

    return {
      id: `scan_${Date.now()}`,
      projectName: manifestPath.split('/').pop() || 'unknown',
      scannedAt: new Date(),
      totalVulnerabilities: mockVulnerabilities.length,
      bySeverity: {
        critical: mockVulnerabilities.filter(v => v.severity === 'critical').length,
        high: mockVulnerabilities.filter(v => v.severity === 'high').length,
        medium: mockVulnerabilities.filter(v => v.severity === 'medium').length,
        low: mockVulnerabilities.filter(v => v.severity === 'low').length,
      },
      vulnerabilities: mockVulnerabilities,
      isBlocked: false,
      fixAvailable: mockVulnerabilities.filter(v => v.fixedIn).length,
    };
  }

  private isBreakingChange(current: string, fixed: string): boolean {
    const currentMajor = parseInt(current.split('.')[0]);
    const fixedMajor = parseInt(fixed.split('.')[0]);
    return fixedMajor > currentMajor;
  }

  /**
   * Reset integration
   */
  reset(): void {
    this.config = null;
    this.scanHistory = [];
    logger.info('SnykIntegration reset');
  }
}

export const snykIntegration = new SnykIntegration();
