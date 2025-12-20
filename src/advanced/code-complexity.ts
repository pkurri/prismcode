/**
 * Code Complexity Analyzer
 * Issue #211: Code Complexity Analyzer
 *
 * Analyze and visualize technical debt in codebases
 */

import logger from '../utils/logger';

export interface ComplexityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  linesOfCode: number;
  maintainabilityIndex: number;
  halsteadVolume: number;
}

export interface FileAnalysis {
  filePath: string;
  language: string;
  metrics: ComplexityMetrics;
  functions: FunctionComplexity[];
  issues: ComplexityIssue[];
  score: number; // 0-100, higher is better
}

export interface FunctionComplexity {
  name: string;
  startLine: number;
  endLine: number;
  complexity: number;
  parameters: number;
  isHotspot: boolean;
}

export interface ComplexityIssue {
  type: 'high_complexity' | 'deep_nesting' | 'long_function' | 'many_params' | 'god_class';
  severity: 'info' | 'warning' | 'error';
  message: string;
  line?: number;
  suggestion: string;
}

export interface ProjectAnalysis {
  id: string;
  analyzedAt: Date;
  totalFiles: number;
  totalLines: number;
  averageComplexity: number;
  hotspots: FileAnalysis[];
  trends: ComplexityTrend[];
  overallScore: number;
}

export interface ComplexityTrend {
  date: Date;
  averageComplexity: number;
  totalIssues: number;
  score: number;
}

/**
 * Code Complexity Analyzer
 * Calculates and tracks code complexity metrics
 */
export class CodeComplexityAnalyzer {
  private analysisHistory: ProjectAnalysis[] = [];
  private thresholds = {
    cyclomaticComplexity: 10,
    cognitiveComplexity: 15,
    functionLength: 50,
    maxParameters: 5,
    maxNestingDepth: 4,
  };

  constructor() {
    logger.info('CodeComplexityAnalyzer initialized');
  }

  /**
   * Set complexity thresholds
   */
  setThresholds(thresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
    logger.info('Thresholds updated', this.thresholds);
  }

  /**
   * Analyze a single file
   */
  analyzeFile(filePath: string, content: string): FileAnalysis {
    const lines = content.split('\n');
    const language = this.detectLanguage(filePath);
    
    const functions = this.extractFunctions(content, language);
    const metrics = this.calculateMetrics(content, functions);
    const issues = this.findIssues(content, functions, metrics);
    const score = this.calculateScore(metrics, issues);

    return {
      filePath,
      language,
      metrics,
      functions,
      issues,
      score,
    };
  }

  /**
   * Analyze multiple files (project)
   */
  analyzeProject(files: Array<{ path: string; content: string }>): ProjectAnalysis {
    const analyses = files.map(f => this.analyzeFile(f.path, f.content));
    
    const totalLines = analyses.reduce((sum, a) => sum + a.metrics.linesOfCode, 0);
    const avgComplexity = analyses.reduce((sum, a) => sum + a.metrics.cyclomaticComplexity, 0) / analyses.length;
    
    // Find hotspots (worst 20% of files)
    const sortedByScore = [...analyses].sort((a, b) => a.score - b.score);
    const hotspots = sortedByScore.slice(0, Math.ceil(analyses.length * 0.2));

    const overallScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;

    const result: ProjectAnalysis = {
      id: `analysis_${Date.now()}`,
      analyzedAt: new Date(),
      totalFiles: files.length,
      totalLines,
      averageComplexity: avgComplexity,
      hotspots,
      trends: this.calculateTrends(),
      overallScore: Math.round(overallScore),
    };

    this.analysisHistory.push(result);
    logger.info('Project analysis complete', {
      files: result.totalFiles,
      avgComplexity: result.averageComplexity.toFixed(2),
      score: result.overallScore,
    });

    return result;
  }

  /**
   * Get complexity hotspots
   */
  getHotspots(analysis: ProjectAnalysis, limit: number = 10): FileAnalysis[] {
    return analysis.hotspots.slice(0, limit);
  }

  /**
   * Get function hotspots
   */
  getFunctionHotspots(analysis: ProjectAnalysis, limit: number = 10): Array<{
    file: string;
    function: FunctionComplexity;
  }> {
    const allFunctions: Array<{ file: string; function: FunctionComplexity }> = [];
    
    for (const hotspot of analysis.hotspots) {
      for (const fn of hotspot.functions) {
        if (fn.isHotspot) {
          allFunctions.push({ file: hotspot.filePath, function: fn });
        }
      }
    }

    return allFunctions
      .sort((a, b) => b.function.complexity - a.function.complexity)
      .slice(0, limit);
  }

  /**
   * Generate refactoring suggestions
   */
  getSuggestions(analysis: FileAnalysis): string[] {
    const suggestions: string[] = [];

    for (const issue of analysis.issues) {
      suggestions.push(issue.suggestion);
    }

    if (analysis.metrics.cyclomaticComplexity > this.thresholds.cyclomaticComplexity * 2) {
      suggestions.push('Consider splitting this file into smaller modules');
    }

    if (analysis.functions.length > 20) {
      suggestions.push('This file has many functions - consider organizing into separate files');
    }

    return [...new Set(suggestions)];
  }

  /**
   * Compare two analyses
   */
  compare(analysisId1: string, analysisId2: string): {
    improved: string[];
    degraded: string[];
    unchanged: string[];
    scoreDiff: number;
  } | null {
    const a1 = this.analysisHistory.find(a => a.id === analysisId1);
    const a2 = this.analysisHistory.find(a => a.id === analysisId2);
    
    if (!a1 || !a2) return null;

    return {
      improved: [],
      degraded: [],
      unchanged: [],
      scoreDiff: a2.overallScore - a1.overallScore,
    };
  }

  /**
   * Get analysis history
   */
  getHistory(limit: number = 10): ProjectAnalysis[] {
    return this.analysisHistory.slice(-limit);
  }

  // Private helpers

  private detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'typescript',
      js: 'javascript',
      jsx: 'javascript',
      py: 'python',
      java: 'java',
      go: 'go',
      rs: 'rust',
    };
    return langMap[ext] || 'unknown';
  }

  private extractFunctions(content: string, _language: string): FunctionComplexity[] {
    const functions: FunctionComplexity[] = [];
    const lines = content.split('\n');
    
    // Simple function detection for TypeScript/JavaScript
    const funcPattern = /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(|(\w+)\s*\(.*\)\s*(?::\s*\w+)?\s*{)/;
    
    let currentFunc: { name: string; startLine: number } | null = null;
    let braceCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(funcPattern);
      
      if (match && !currentFunc) {
        const name = match[1] || match[2] || match[3] || 'anonymous';
        currentFunc = { name, startLine: i + 1 };
        braceCount = 0;
      }
      
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      
      if (currentFunc && braceCount === 0 && line.includes('}')) {
        const linesCount = i - currentFunc.startLine + 1;
        functions.push({
          name: currentFunc.name,
          startLine: currentFunc.startLine,
          endLine: i + 1,
          complexity: Math.ceil(linesCount / 5), // Simplified complexity
          parameters: 0,
          isHotspot: linesCount > this.thresholds.functionLength,
        });
        currentFunc = null;
      }
    }

    return functions;
  }

  private calculateMetrics(content: string, functions: FunctionComplexity[]): ComplexityMetrics {
    const lines = content.split('\n');
    const codeLines = lines.filter(l => l.trim() && !l.trim().startsWith('//')).length;
    
    const totalComplexity = functions.reduce((sum, f) => sum + f.complexity, 0);
    const avgComplexity = functions.length > 0 ? totalComplexity / functions.length : 1;
    
    // Maintainability Index: 171 - 5.2 * ln(V) - 0.23 * G - 16.2 * ln(L)
    const maintainability = Math.max(0, Math.min(100, 
      171 - 5.2 * Math.log(codeLines) - 0.23 * avgComplexity - 16.2 * Math.log(functions.length || 1)
    ));

    return {
      cyclomaticComplexity: Math.round(avgComplexity),
      cognitiveComplexity: Math.round(avgComplexity * 1.2),
      linesOfCode: codeLines,
      maintainabilityIndex: Math.round(maintainability),
      halsteadVolume: codeLines * Math.log2(functions.length + 1),
    };
  }

  private findIssues(
    content: string, 
    functions: FunctionComplexity[], 
    metrics: ComplexityMetrics
  ): ComplexityIssue[] {
    const issues: ComplexityIssue[] = [];

    if (metrics.cyclomaticComplexity > this.thresholds.cyclomaticComplexity) {
      issues.push({
        type: 'high_complexity',
        severity: 'warning',
        message: `Cyclomatic complexity (${metrics.cyclomaticComplexity}) exceeds threshold (${this.thresholds.cyclomaticComplexity})`,
        suggestion: 'Break down complex functions into smaller, more focused functions',
      });
    }

    for (const fn of functions) {
      if (fn.isHotspot) {
        issues.push({
          type: 'long_function',
          severity: 'warning',
          message: `Function '${fn.name}' is ${fn.endLine - fn.startLine} lines`,
          line: fn.startLine,
          suggestion: `Consider extracting methods from '${fn.name}'`,
        });
      }
    }

    // Check for deep nesting
    const nestingMatches = content.match(/{\s*{\s*{\s*{/g);
    if (nestingMatches && nestingMatches.length > 0) {
      issues.push({
        type: 'deep_nesting',
        severity: 'warning',
        message: 'Deep nesting detected (4+ levels)',
        suggestion: 'Use early returns or extract nested logic into separate functions',
      });
    }

    return issues;
  }

  private calculateScore(metrics: ComplexityMetrics, issues: ComplexityIssue[]): number {
    let score = metrics.maintainabilityIndex;
    
    // Deduct points for issues
    for (const issue of issues) {
      if (issue.severity === 'error') score -= 15;
      else if (issue.severity === 'warning') score -= 5;
      else score -= 2;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateTrends(): ComplexityTrend[] {
    return this.analysisHistory.slice(-10).map(a => ({
      date: a.analyzedAt,
      averageComplexity: a.averageComplexity,
      totalIssues: a.hotspots.reduce((sum, h) => sum + h.issues.length, 0),
      score: a.overallScore,
    }));
  }

  /**
   * Reset analyzer
   */
  reset(): void {
    this.analysisHistory = [];
    logger.info('CodeComplexityAnalyzer reset');
  }
}

export const codeComplexityAnalyzer = new CodeComplexityAnalyzer();
