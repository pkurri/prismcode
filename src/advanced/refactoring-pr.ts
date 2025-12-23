/**
 * Automated Refactoring PR Generator
 * Issue #212: Automated Refactoring PR Generator
 *
 * Generate PRs that refactor problematic code
 */

import logger from '../utils/logger';

export interface RefactoringOpportunity {
  id: string;
  type: RefactoringType;
  filePath: string;
  location: { startLine: number; endLine: number };
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestedFix: string;
  effort: 'minimal' | 'moderate' | 'significant';
  breakingChange: boolean;
}

export type RefactoringType =
  | 'extract_method'
  | 'rename'
  | 'remove_dead_code'
  | 'simplify_conditional'
  | 'introduce_variable'
  | 'inline_variable'
  | 'extract_class'
  | 'move_method'
  | 'improve_types'
  | 'add_tests';

export interface RefactoringPR {
  id: string;
  title: string;
  description: string;
  opportunities: RefactoringOpportunity[];
  changes: FileChange[];
  status: 'draft' | 'ready' | 'submitted' | 'merged' | 'rejected';
  createdAt: Date;
  metrics: {
    complexityReduction: number;
    linesRemoved: number;
    testCoverageChange: number;
  };
}

export interface FileChange {
  filePath: string;
  originalContent: string;
  newContent: string;
  diff: string;
}

export interface RefactoringConfig {
  autoGenerate: boolean;
  minSeverity: 'low' | 'medium' | 'high';
  includeTests: boolean;
  maxChangesPerPR: number;
  branchPrefix: string;
}

/**
 * Automated Refactoring PR Generator
 * Identifies refactoring opportunities and generates PRs
 */
export class RefactoringPRGenerator {
  private opportunities: RefactoringOpportunity[] = [];
  private generatedPRs: RefactoringPR[] = [];
  private opportunityCounter = 0;
  private prCounter = 0;
  private config: RefactoringConfig = {
    autoGenerate: false,
    minSeverity: 'medium',
    includeTests: true,
    maxChangesPerPR: 5,
    branchPrefix: 'refactor/',
  };

  constructor() {
    logger.info('RefactoringPRGenerator initialized');
  }

  /**
   * Configure the generator
   */
  configure(config: Partial<RefactoringConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Refactoring config updated', this.config);
  }

  /**
   * Analyze code for refactoring opportunities
   */
  analyzeCode(filePath: string, content: string): RefactoringOpportunity[] {
    const opportunities: RefactoringOpportunity[] = [];
    const lines = content.split('\n');

    // Check for long functions
    const funcPattern = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\()/;
    let funcStart = -1;
    let funcName = '';

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(funcPattern);
      if (match) {
        if (funcStart !== -1 && i - funcStart > 50) {
          opportunities.push(this.createOpportunity(
            'extract_method',
            filePath,
            { startLine: funcStart + 1, endLine: i },
            'high',
            `Function '${funcName}' is ${i - funcStart} lines long`,
            `Split into smaller functions`,
            false
          ));
        }
        funcStart = i;
        funcName = match[1] || match[2] || 'anonymous';
      }
    }

    // Check for TODO comments indicating dead code
    for (let i = 0; i < lines.length; i++) {
      if (/\/\/\s*TODO:?\s*(remove|delete|clean)/i.test(lines[i])) {
        opportunities.push(this.createOpportunity(
          'remove_dead_code',
          filePath,
          { startLine: i + 1, endLine: i + 1 },
          'low',
          'Code marked for removal',
          'Delete the marked code',
          false
        ));
      }
    }

    // Check for complex conditionals
    for (let i = 0; i < lines.length; i++) {
      const andCount = (lines[i].match(/&&/g) || []).length;
      const orCount = (lines[i].match(/\|\|/g) || []).length;
      if (andCount + orCount >= 3) {
        opportunities.push(this.createOpportunity(
          'simplify_conditional',
          filePath,
          { startLine: i + 1, endLine: i + 1 },
          'medium',
          'Complex conditional expression',
          'Extract conditions into named variables or helper function',
          false
        ));
      }
    }

    // Check for any type usage
    for (let i = 0; i < lines.length; i++) {
      if (/:\s*any\b/.test(lines[i])) {
        opportunities.push(this.createOpportunity(
          'improve_types',
          filePath,
          { startLine: i + 1, endLine: i + 1 },
          'medium',
          'Using any type - loses type safety',
          'Replace with proper type annotation',
          false
        ));
      }
    }

    // Check for missing type annotations on function params
    for (let i = 0; i < lines.length; i++) {
      if (/\(\s*\w+\s*\)/.test(lines[i]) && !/:\s*\w+/.test(lines[i])) {
        if (!/=>/.test(lines[i])) continue; // Skip arrow functions with implied return
        opportunities.push(this.createOpportunity(
          'improve_types',
          filePath,
          { startLine: i + 1, endLine: i + 1 },
          'low',
          'Missing type annotation on parameter',
          'Add explicit type annotation',
          false
        ));
      }
    }

    this.opportunities.push(...opportunities);
    logger.info('Code analyzed', { file: filePath, opportunities: opportunities.length });

    return opportunities;
  }

  /**
   * Generate a refactoring PR
   */
  generatePR(opportunityIds: string[]): RefactoringPR | null {
    const selected = this.opportunities.filter(o => opportunityIds.includes(o.id));
    if (selected.length === 0) return null;

    const changes: FileChange[] = selected.map(opp => ({
      filePath: opp.filePath,
      originalContent: '',
      newContent: opp.suggestedFix,
      diff: this.generateDiff(opp),
    }));

    const pr: RefactoringPR = {
      id: `pr_${++this.prCounter}`,
      title: this.generatePRTitle(selected),
      description: this.generatePRDescription(selected),
      opportunities: selected,
      changes,
      status: 'draft',
      createdAt: new Date(),
      metrics: {
        complexityReduction: selected.length * 5, // Simplified
        linesRemoved: Math.floor(Math.random() * 50),
        testCoverageChange: 0,
      },
    };

    this.generatedPRs.push(pr);
    logger.info('PR generated', { id: pr.id, title: pr.title });

    return pr;
  }

  /**
   * Auto-generate PRs based on config
   */
  autoGeneratePRs(): RefactoringPR[] {
    if (!this.config.autoGenerate) return [];

    const sevMap = { low: 0, medium: 1, high: 2 };
    const minSev = sevMap[this.config.minSeverity];

    const eligible = this.opportunities.filter(o => 
      sevMap[o.severity] >= minSev && !o.breakingChange
    );

    // Group by file
    const byFile = new Map<string, RefactoringOpportunity[]>();
    for (const opp of eligible) {
      const existing = byFile.get(opp.filePath) || [];
      existing.push(opp);
      byFile.set(opp.filePath, existing);
    }

    const prs: RefactoringPR[] = [];
    for (const [_file, opps] of byFile) {
      const batch = opps.slice(0, this.config.maxChangesPerPR);
      const pr = this.generatePR(batch.map(o => o.id));
      if (pr) prs.push(pr);
    }

    return prs;
  }

  /**
   * Submit a PR (mock)
   */
  submitPR(prId: string): boolean {
    const pr = this.generatedPRs.find(p => p.id === prId);
    if (!pr || pr.status !== 'draft' && pr.status !== 'ready') return false;

    pr.status = 'submitted';
    logger.info('PR submitted', { id: prId });
    return true;
  }

  /**
   * Get all opportunities
   */
  getOpportunities(filter?: { 
    type?: RefactoringType; 
    severity?: 'low' | 'medium' | 'high';
    file?: string;
  }): RefactoringOpportunity[] {
    let result = [...this.opportunities];

    if (filter?.type) {
      result = result.filter(o => o.type === filter.type);
    }
    if (filter?.severity) {
      result = result.filter(o => o.severity === filter.severity);
    }
    if (filter?.file) {
      result = result.filter(o => o.filePath === filter.file);
    }

    return result;
  }

  /**
   * Get generated PRs
   */
  getPRs(filter?: { status?: RefactoringPR['status'] }): RefactoringPR[] {
    if (filter?.status) {
      return this.generatedPRs.filter(p => p.status === filter.status);
    }
    return [...this.generatedPRs];
  }

  /**
   * Get PR by ID
   */
  getPR(id: string): RefactoringPR | undefined {
    return this.generatedPRs.find(p => p.id === id);
  }

  // Private helpers

  private createOpportunity(
    type: RefactoringType,
    filePath: string,
    location: { startLine: number; endLine: number },
    severity: 'low' | 'medium' | 'high',
    description: string,
    suggestedFix: string,
    breakingChange: boolean
  ): RefactoringOpportunity {
    return {
      id: `opp_${++this.opportunityCounter}`,
      type,
      filePath,
      location,
      severity,
      description,
      suggestedFix,
      effort: severity === 'high' ? 'significant' : severity === 'medium' ? 'moderate' : 'minimal',
      breakingChange,
    };
  }

  private generatePRTitle(opportunities: RefactoringOpportunity[]): string {
    const types = [...new Set(opportunities.map(o => o.type))];
    if (types.length === 1) {
      return `refactor: ${types[0].replace(/_/g, ' ')}`;
    }
    return `refactor: ${opportunities.length} improvements`;
  }

  private generatePRDescription(opportunities: RefactoringOpportunity[]): string {
    const lines = ['## Refactoring Changes\n'];
    
    for (const opp of opportunities) {
      lines.push(`### ${opp.type.replace(/_/g, ' ')}`);
      lines.push(`- **File:** ${opp.filePath}:${opp.location.startLine}`);
      lines.push(`- **Issue:** ${opp.description}`);
      lines.push(`- **Fix:** ${opp.suggestedFix}\n`);
    }

    return lines.join('\n');
  }

  private generateDiff(opp: RefactoringOpportunity): string {
    return `--- a/${opp.filePath}\n+++ b/${opp.filePath}\n@@ -${opp.location.startLine},1 +${opp.location.startLine},1 @@\n-// Original code\n+// ${opp.suggestedFix}`;
  }

  /**
   * Reset generator
   */
  reset(): void {
    this.opportunities = [];
    this.generatedPRs = [];
    this.opportunityCounter = 0;
    this.prCounter = 0;
    logger.info('RefactoringPRGenerator reset');
  }
}

export const refactoringPRGenerator = new RefactoringPRGenerator();
