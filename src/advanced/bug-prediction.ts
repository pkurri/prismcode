/**
 * Bug Prediction Engine
 * Issue #242: Bug Prediction Engine
 *
 * Uses code patterns and historical data to predict potential bugs
 */

import logger from '../utils/logger';

export interface BugPrediction {
  id: string;
  file: string;
  line: number;
  probability: number;
  type: BugType;
  reason: string;
  suggestedFix?: string;
  confidence: number;
}

export type BugType =
  | 'null-reference'
  | 'off-by-one'
  | 'race-condition'
  | 'memory-leak'
  | 'type-coercion'
  | 'boundary-error'
  | 'logic-error'
  | 'exception-handling';

export interface RiskFactor {
  factor: string;
  weight: number;
  description: string;
}

export interface FileRiskScore {
  file: string;
  score: number;
  predictions: BugPrediction[];
  riskFactors: RiskFactor[];
}

export interface PredictionResult {
  totalFiles: number;
  filesAnalyzed: number;
  predictions: BugPrediction[];
  highRiskFiles: FileRiskScore[];
  analysisTime: number;
}

/**
 * Bug Prediction Engine
 * Analyzes code to predict potential bugs before they occur
 */
export class BugPredictionEngine {
  private patterns: Map<string, BugType> = new Map();

  constructor() {
    this.initializePatterns();
    logger.info('BugPredictionEngine initialized');
  }

  private initializePatterns(): void {
    // Common bug patterns
    this.patterns.set('\\w+\\.\\w+\\.\\w+', 'null-reference');
    this.patterns.set('(?:i|index)\\s*[<>=]+\\s*(?:length|len|size)', 'off-by-one');
    this.patterns.set('setTimeout|setInterval.*\\d{1,3}\\)', 'race-condition');
    this.patterns.set('new\\s+\\w+\\(.*\\)(?!.*(?:close|dispose|release))', 'memory-leak');
    this.patterns.set('==(?!=)', 'type-coercion');
  }

  /**
   * Analyze code for bug predictions
   */
  async analyzeCode(filePath: string, content: string): Promise<BugPrediction[]> {
    logger.info('Analyzing code for bugs', { file: filePath });
    await Promise.resolve(); // Async for future ML integration
    const predictions: BugPrediction[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for null reference chains
      if (/\w+\.\w+\.\w+/.test(line) && !line.includes('?.')) {
        predictions.push(
          this.createPrediction(
            filePath,
            i + 1,
            'null-reference',
            0.65,
            'Deep property access without null checks could throw TypeError'
          )
        );
      }

      // Check for array boundary issues
      if (/\[(?:i|index|idx)\s*[-+]\s*1\]/.test(line)) {
        predictions.push(
          this.createPrediction(
            filePath,
            i + 1,
            'off-by-one',
            0.55,
            'Array index arithmetic may cause off-by-one error'
          )
        );
      }

      // Check for == instead of ===
      if (/[^=!]==[^=]/.test(line) && !line.includes('===')) {
        predictions.push(
          this.createPrediction(
            filePath,
            i + 1,
            'type-coercion',
            0.7,
            'Loose equality may cause unexpected type coercion'
          )
        );
      }

      // Check for missing error handling
      if (/\.then\(/.test(line) && !content.slice(0, i * 80).includes('.catch')) {
        predictions.push(
          this.createPrediction(
            filePath,
            i + 1,
            'exception-handling',
            0.6,
            'Promise without catch handler may miss errors'
          )
        );
      }

      // Check for potential async race conditions
      if (/(async|Promise)/.test(line) && /(?:set|update|modify)\w*\s*=/.test(line)) {
        predictions.push(
          this.createPrediction(
            filePath,
            i + 1,
            'race-condition',
            0.45,
            'State modification in async context may cause race condition'
          )
        );
      }
    }

    logger.info('Bug analysis complete', { file: filePath, predictions: predictions.length });
    return predictions;
  }

  /**
   * Analyze multiple files and rank by risk
   */
  async analyzeProject(files: { path: string; content: string }[]): Promise<PredictionResult> {
    const startTime = Date.now();
    const allPredictions: BugPrediction[] = [];
    const riskScores: FileRiskScore[] = [];

    for (const file of files) {
      const predictions = await this.analyzeCode(file.path, file.content);
      allPredictions.push(...predictions);

      if (predictions.length > 0) {
        riskScores.push({
          file: file.path,
          score: this.calculateRiskScore(predictions),
          predictions,
          riskFactors: this.identifyRiskFactors(file.content),
        });
      }
    }

    // Sort by risk score
    riskScores.sort((a, b) => b.score - a.score);

    return {
      totalFiles: files.length,
      filesAnalyzed: files.length,
      predictions: allPredictions,
      highRiskFiles: riskScores.slice(0, 10),
      analysisTime: Date.now() - startTime,
    };
  }

  /**
   * Predict bugs for a commit diff
   */
  predictForDiff(diff: string): BugPrediction[] {
    const predictions: BugPrediction[] = [];
    const addedLines = diff.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++'));

    for (let i = 0; i < addedLines.length; i++) {
      const line = addedLines[i].substring(1);

      // Simplified analysis for diff
      if (/\w+\.\w+\.\w+/.test(line)) {
        predictions.push(
          this.createPrediction(
            'diff',
            i,
            'null-reference',
            0.5,
            'New code with deep property access'
          )
        );
      }
    }

    return predictions;
  }

  private createPrediction(
    file: string,
    line: number,
    type: BugType,
    probability: number,
    reason: string
  ): BugPrediction {
    return {
      id: `bug_${Date.now().toString(16)}_${Math.random().toString(36).substr(2, 4)}`,
      file,
      line,
      probability,
      type,
      reason,
      confidence: probability * 0.9,
      suggestedFix: this.getSuggestedFix(type),
    };
  }

  private getSuggestedFix(type: BugType): string {
    const fixes: Record<BugType, string> = {
      'null-reference': 'Use optional chaining (?.) or add null checks',
      'off-by-one': 'Verify loop boundaries and array indices',
      'race-condition': 'Use proper synchronization or locks',
      'memory-leak': 'Ensure resources are properly disposed',
      'type-coercion': 'Use strict equality (===) instead',
      'boundary-error': 'Add boundary validation',
      'logic-error': 'Review conditional logic',
      'exception-handling': 'Add try-catch or .catch handler',
    };
    return fixes[type];
  }

  private calculateRiskScore(predictions: BugPrediction[]): number {
    const weightedSum = predictions.reduce((sum, p) => sum + p.probability * p.confidence, 0);
    return Math.min(100, Math.round(weightedSum * 10));
  }

  private identifyRiskFactors(content: string): RiskFactor[] {
    const factors: RiskFactor[] = [];

    if (content.length > 500) {
      factors.push({
        factor: 'large-file',
        weight: 0.2,
        description: 'Large file increases complexity',
      });
    }
    if ((content.match(/function/g) || []).length > 20) {
      factors.push({ factor: 'many-functions', weight: 0.3, description: 'High function count' });
    }
    if ((content.match(/if|else|switch/g) || []).length > 30) {
      factors.push({
        factor: 'high-complexity',
        weight: 0.4,
        description: 'High cyclomatic complexity',
      });
    }

    return factors;
  }
}

export const bugPredictionEngine = new BugPredictionEngine();
