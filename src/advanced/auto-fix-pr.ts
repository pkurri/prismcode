/**
 * Auto-Fix Pull Request Generator
 * Issue #245 - Automated PR generation for fixes
 */

/**
 * Fix category types
 */
export type FixCategory = 'security' | 'dependency' | 'lint' | 'style' | 'deprecation';

/**
 * PR priority levels
 */
export type PRPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Auto-merge configuration
 */
export type AutoMergePolicy = 'never' | 'low_risk' | 'all_passing' | 'always';

/**
 * File change in a PR
 */
export interface FileChange {
  path: string;
  originalContent: string;
  newContent: string;
  changeType: 'modify' | 'add' | 'delete';
  linesAdded: number;
  linesRemoved: number;
}

/**
 * Fix suggestion with confidence
 */
export interface FixSuggestion {
  id: string;
  category: FixCategory;
  title: string;
  description: string;
  confidence: number; // 0-1
  priority: PRPriority;
  affectedFiles: string[];
  suggestedChanges: FileChange[];
  estimatedRisk: 'low' | 'medium' | 'high';
  references: string[]; // CVE IDs, package URLs, lint rules
}

/**
 * Generated PR data
 */
export interface AutoFixPR {
  id: string;
  title: string;
  description: string;
  category: FixCategory;
  priority: PRPriority;
  branch: string;
  baseBranch: string;
  changes: FileChange[];
  createdAt: Date;
  status: 'draft' | 'ready' | 'merged' | 'closed';
  autoMergeEnabled: boolean;
  checksRequired: string[];
  labels: string[];
}

/**
 * Security vulnerability info
 */
export interface SecurityVulnerability {
  cveId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  package: string;
  currentVersion: string;
  fixedVersion: string;
  description: string;
  publishedAt: Date;
}

/**
 * Dependency update info
 */
export interface DependencyUpdate {
  name: string;
  currentVersion: string;
  latestVersion: string;
  updateType: 'major' | 'minor' | 'patch';
  breaking: boolean;
  changelog?: string;
}

/**
 * Auto-merge configuration
 */
export interface AutoMergeConfig {
  policy: AutoMergePolicy;
  requiredChecks: string[];
  requiredApprovals: number;
  allowedCategories: FixCategory[];
  maxRiskLevel: 'low' | 'medium' | 'high';
  excludePatterns: string[];
}

/**
 * PR generation statistics
 */
export interface PRStats {
  totalGenerated: number;
  byCategory: Record<FixCategory, number>;
  autoMerged: number;
  manuallyMerged: number;
  rejected: number;
  averageTimeToMerge: number;
}

/**
 * Default auto-merge configuration
 */
const DEFAULT_AUTO_MERGE_CONFIG: AutoMergeConfig = {
  policy: 'low_risk',
  requiredChecks: ['lint', 'test', 'build'],
  requiredApprovals: 0,
  allowedCategories: ['lint', 'style', 'deprecation'],
  maxRiskLevel: 'low',
  excludePatterns: ['*.config.*', 'package.json'],
};

/**
 * Auto-Fix PR Generator for automated code fixes
 * Generates PRs for security patches, dependency updates, and lint fixes
 */
export class AutoFixPRGenerator {
  private config: AutoMergeConfig;
  private generatedPRs: Map<string, AutoFixPR> = new Map();
  private suggestions: Map<string, FixSuggestion> = new Map();
  private stats: PRStats = {
    totalGenerated: 0,
    byCategory: { security: 0, dependency: 0, lint: 0, style: 0, deprecation: 0 },
    autoMerged: 0,
    manuallyMerged: 0,
    rejected: 0,
    averageTimeToMerge: 0,
  };

  constructor(config: Partial<AutoMergeConfig> = {}) {
    this.config = { ...DEFAULT_AUTO_MERGE_CONFIG, ...config };
  }

  /**
   * Generate PR for security vulnerability fix
   */
  generateSecurityPatchPR(vulnerability: SecurityVulnerability): AutoFixPR {
    const changes = this.createSecurityPatchChanges(vulnerability);
    const pr = this.createPR({
      category: 'security',
      title: `🔒 Security: Fix ${vulnerability.cveId} in ${vulnerability.package}`,
      description: this.generateSecurityDescription(vulnerability),
      priority: vulnerability.severity as PRPriority,
      changes,
      labels: ['security', `severity-${vulnerability.severity}`, 'auto-generated'],
    });

    return pr;
  }

  /**
   * Generate PR for dependency update
   */
  generateDependencyUpdatePR(updates: DependencyUpdate[]): AutoFixPR {
    const changes = this.createDependencyUpdateChanges(updates);
    const hasBreaking = updates.some((u) => u.breaking);
    const updateTypes = [...new Set(updates.map((u) => u.updateType))];

    const pr = this.createPR({
      category: 'dependency',
      title: `📦 Dependencies: Update ${updates.length} package(s)`,
      description: this.generateDependencyDescription(updates),
      priority: hasBreaking ? 'high' : 'medium',
      changes,
      labels: ['dependencies', ...updateTypes.map((t) => `update-${t}`), 'auto-generated'],
    });

    return pr;
  }

  /**
   * Generate PR for lint/style fixes
   */
  generateLintFixPR(filePath: string, violations: LintViolation[]): AutoFixPR {
    const changes = this.createLintFixChanges(filePath, violations);

    const pr = this.createPR({
      category: 'lint',
      title: `🧹 Lint: Fix ${violations.length} issue(s) in ${this.getFileName(filePath)}`,
      description: this.generateLintDescription(violations),
      priority: 'low',
      changes,
      labels: ['lint', 'code-quality', 'auto-generated'],
    });

    return pr;
  }

  /**
   * Configure auto-merge settings
   */
  configureAutoMerge(config: Partial<AutoMergeConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if PR qualifies for auto-merge
   */
  canAutoMerge(pr: AutoFixPR): { allowed: boolean; reason?: string } {
    if (this.config.policy === 'never') {
      return { allowed: false, reason: 'Auto-merge disabled' };
    }

    if (this.config.policy === 'always') {
      return { allowed: true };
    }

    if (!this.config.allowedCategories.includes(pr.category)) {
      return { allowed: false, reason: `Category ${pr.category} not allowed for auto-merge` };
    }

    const risk = this.assessRisk(pr);
    const maxRiskLevels = { low: 1, medium: 2, high: 3 };
    if (maxRiskLevels[risk] > maxRiskLevels[this.config.maxRiskLevel]) {
      return {
        allowed: false,
        reason: `Risk level ${risk} exceeds max ${this.config.maxRiskLevel}`,
      };
    }

    for (const pattern of this.config.excludePatterns) {
      if (pr.changes.some((c) => this.matchesPattern(c.path, pattern))) {
        return { allowed: false, reason: `File matches exclude pattern: ${pattern}` };
      }
    }

    return { allowed: true };
  }

  /**
   * Analyze code for fix suggestions
   */
  analyzeFixes(source: string, filePath: string): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    // Check for deprecated patterns
    const deprecationFixes = this.findDeprecationFixes(source, filePath);
    suggestions.push(...deprecationFixes);

    // Check for style improvements
    const styleFixes = this.findStyleFixes(source, filePath);
    suggestions.push(...styleFixes);

    // Store suggestions
    suggestions.forEach((s) => this.suggestions.set(s.id, s));

    return suggestions;
  }

  /**
   * Apply a fix suggestion and generate PR
   */
  applyFixSuggestion(suggestionId: string): AutoFixPR | null {
    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion) {
      return null;
    }

    return this.createPR({
      category: suggestion.category,
      title: `🔧 Fix: ${suggestion.title}`,
      description: suggestion.description,
      priority: suggestion.priority,
      changes: suggestion.suggestedChanges,
      labels: [suggestion.category, 'auto-fix', 'auto-generated'],
    });
  }

  /**
   * Get all generated PRs
   */
  getPRs(): AutoFixPR[] {
    return Array.from(this.generatedPRs.values());
  }

  /**
   * Get PRs by category
   */
  getPRsByCategory(category: FixCategory): AutoFixPR[] {
    return this.getPRs().filter((pr) => pr.category === category);
  }

  /**
   * Get PR statistics
   */
  getStats(): PRStats {
    return { ...this.stats };
  }

  /**
   * Mark PR as merged
   */
  markMerged(prId: string, autoMerged: boolean = false): void {
    const pr = this.generatedPRs.get(prId);
    if (pr) {
      pr.status = 'merged';
      if (autoMerged) {
        this.stats.autoMerged++;
      } else {
        this.stats.manuallyMerged++;
      }
    }
  }

  /**
   * Mark PR as rejected
   */
  markRejected(prId: string): void {
    const pr = this.generatedPRs.get(prId);
    if (pr) {
      pr.status = 'closed';
      this.stats.rejected++;
    }
  }

  // Private helper methods

  private createPR(options: {
    category: FixCategory;
    title: string;
    description: string;
    priority: PRPriority;
    changes: FileChange[];
    labels: string[];
  }): AutoFixPR {
    const id = `pr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const branch = `auto-fix/${options.category}/${id}`;

    const autoMergeCheck = this.canAutoMerge({
      ...options,
      id,
      branch,
      baseBranch: 'main',
      createdAt: new Date(),
      status: 'draft',
      autoMergeEnabled: false,
      checksRequired: this.config.requiredChecks,
    });

    const pr: AutoFixPR = {
      id,
      title: options.title,
      description: options.description,
      category: options.category,
      priority: options.priority,
      branch,
      baseBranch: 'main',
      changes: options.changes,
      createdAt: new Date(),
      status: 'ready',
      autoMergeEnabled: autoMergeCheck.allowed,
      checksRequired: this.config.requiredChecks,
      labels: options.labels,
    };

    this.generatedPRs.set(id, pr);
    this.stats.totalGenerated++;
    this.stats.byCategory[options.category]++;

    return pr;
  }

  private createSecurityPatchChanges(vulnerability: SecurityVulnerability): FileChange[] {
    // Simulate package.json update
    return [
      {
        path: 'package.json',
        originalContent: `"${vulnerability.package}": "${vulnerability.currentVersion}"`,
        newContent: `"${vulnerability.package}": "${vulnerability.fixedVersion}"`,
        changeType: 'modify',
        linesAdded: 1,
        linesRemoved: 1,
      },
    ];
  }

  private createDependencyUpdateChanges(updates: DependencyUpdate[]): FileChange[] {
    const changes: FileChange[] = [];
    for (const update of updates) {
      changes.push({
        path: 'package.json',
        originalContent: `"${update.name}": "${update.currentVersion}"`,
        newContent: `"${update.name}": "${update.latestVersion}"`,
        changeType: 'modify',
        linesAdded: 1,
        linesRemoved: 1,
      });
    }
    return changes;
  }

  private createLintFixChanges(filePath: string, violations: LintViolation[]): FileChange[] {
    // Simplified - in real implementation would apply actual fixes
    return [
      {
        path: filePath,
        originalContent: '// original code with violations',
        newContent: '// fixed code',
        changeType: 'modify',
        linesAdded: violations.length,
        linesRemoved: violations.length,
      },
    ];
  }

  private generateSecurityDescription(vuln: SecurityVulnerability): string {
    return `## Security Vulnerability Fix

**CVE:** ${vuln.cveId}
**Severity:** ${vuln.severity.toUpperCase()}
**Package:** ${vuln.package}
**Current Version:** ${vuln.currentVersion}
**Fixed Version:** ${vuln.fixedVersion}

### Description
${vuln.description}

### Changes
Updates \`${vuln.package}\` from \`${vuln.currentVersion}\` to \`${vuln.fixedVersion}\` to address the security vulnerability.

---
*This PR was automatically generated by Auto-Fix PR Generator.*`;
  }

  private generateDependencyDescription(updates: DependencyUpdate[]): string {
    const lines = updates.map(
      (u) => `- **${u.name}**: ${u.currentVersion} → ${u.latestVersion} (${u.updateType})`
    );
    return `## Dependency Updates

${lines.join('\n')}

### Breaking Changes
${updates.filter((u) => u.breaking).length > 0 ? 'Yes - review required' : 'None detected'}

---
*This PR was automatically generated by Auto-Fix PR Generator.*`;
  }

  private generateLintDescription(violations: LintViolation[]): string {
    const byRule = violations.reduce(
      (acc, v) => {
        acc[v.rule] = (acc[v.rule] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const lines = Object.entries(byRule).map(([rule, count]) => `- **${rule}**: ${count} fix(es)`);

    return `## Lint Fixes

${lines.join('\n')}

### Summary
Fixed ${violations.length} lint violation(s) to improve code quality.

---
*This PR was automatically generated by Auto-Fix PR Generator.*`;
  }

  private assessRisk(pr: AutoFixPR): 'low' | 'medium' | 'high' {
    // Security fixes are always high priority but assessed per change
    if (pr.category === 'security' && pr.priority === 'critical') {
      return 'medium'; // Even critical security should be reviewed
    }

    // Lint and style fixes are low risk
    if (pr.category === 'lint' || pr.category === 'style') {
      return 'low';
    }

    // Large dependency updates are higher risk
    if (pr.category === 'dependency') {
      const totalChanges = pr.changes.reduce((sum, c) => sum + c.linesAdded + c.linesRemoved, 0);
      if (totalChanges > 10) return 'high';
      if (totalChanges > 5) return 'medium';
      return 'low';
    }

    return 'medium';
  }

  private findDeprecationFixes(source: string, filePath: string): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];
    const deprecatedPatterns = [
      { pattern: /\.substr\(/g, replacement: '.substring(', name: 'String.substr()' },
      { pattern: /new Buffer\(/g, replacement: 'Buffer.from(', name: 'Buffer constructor' },
    ];

    for (const { pattern, replacement, name } of deprecatedPatterns) {
      if (pattern.test(source)) {
        suggestions.push({
          id: `dep-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          category: 'deprecation',
          title: `Replace deprecated ${name}`,
          description: `Replace deprecated ${name} with modern alternative`,
          confidence: 0.95,
          priority: 'low',
          affectedFiles: [filePath],
          suggestedChanges: [
            {
              path: filePath,
              originalContent: source,
              newContent: source.replace(pattern, replacement),
              changeType: 'modify',
              linesAdded: 0,
              linesRemoved: 0,
            },
          ],
          estimatedRisk: 'low',
          references: ['https://developer.mozilla.org/'],
        });
      }
    }

    return suggestions;
  }

  private findStyleFixes(_source: string, _filePath: string): FixSuggestion[] {
    // Would implement style fix detection
    return [];
  }

  private getFileName(path: string): string {
    return path.split('/').pop() || path;
  }

  private matchesPattern(path: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(path);
  }
}

/**
 * Lint violation for fix generation
 */
export interface LintViolation {
  rule: string;
  severity: 'error' | 'warning';
  line: number;
  column: number;
  message: string;
  fix?: string;
}

/**
 * Singleton instance
 */
export const autoFixPRGenerator = new AutoFixPRGenerator();
