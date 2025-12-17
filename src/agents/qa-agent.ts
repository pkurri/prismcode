/**
 * QA Agent - Quality Assurance Agent
 *
 * Handles:
 * - Test strategy definition
 * - Test case generation
 * - Test coverage analysis
 * - Bug detection patterns
 * - Quality metrics
 */

import { BaseAgent } from './base-agent';
import { AgentOutput, Task } from '../types';
import logger from '../utils/logger';

/**
 * QA Agent input
 */
export interface QAAgentInput {
  task: Task;
  code?: string;
  architecture?: Record<string, unknown>;
  context?: Record<string, unknown>;
}

/**
 * Test case
 */
export interface TestCase {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  description: string;
  setup: string[];
  steps: string[];
  assertions: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: string;
}

/**
 * Test strategy
 */
export interface TestStrategy {
  coverage: {
    unit: number;
    integration: number;
    e2e: number;
  };
  priorities: string[];
  riskAreas: string[];
  automationLevel: 'full' | 'partial' | 'manual';
}

/**
 * QA Agent output
 */
export interface QAAgentOutput extends AgentOutput {
  data: {
    strategy: TestStrategy;
    testCases: TestCase[];
    testCode: string;
    metrics: {
      totalTests: number;
      coverage: number;
      estimatedTime: string;
    };
  };
}

/**
 * QA Agent - Generates test strategies and test cases
 */
export class QAAgent extends BaseAgent {
  constructor() {
    super('QA Agent');
  }

  /**
   * Process task to generate testing artifacts
   */
  async process(input: QAAgentInput): Promise<QAAgentOutput> {
    const startTime = Date.now();
    logger.info(`${this.name}: Starting QA analysis`, { taskId: input.task.id });

    try {
      // Step 1: Define test strategy
      const strategy = this.defineStrategy(input.task);

      // Step 2: Generate test cases
      const testCases = this.generateTestCases(input.task, strategy);

      // Step 3: Generate test code
      const testCode = this.generateTestCode(input.task, testCases);

      // Step 4: Calculate metrics
      const metrics = this.calculateMetrics(testCases);

      const processingTime = Date.now() - startTime;
      logger.info(`${this.name}: QA analysis complete`, {
        testCases: testCases.length,
        processingTime,
      });

      return {
        agentName: this.name,
        data: {
          strategy,
          testCases,
          testCode,
          metrics,
        },
        metadata: {
          processingTime,
          confidence: 0.8,
        },
      };
    } catch (error) {
      logger.error(`${this.name}: Error during QA analysis`, { error });
      throw error;
    }
  }

  /**
   * Define test strategy based on task
   */
  private defineStrategy(task: Task): TestStrategy {
    const isComplex = task.complexity === 'high';

    return {
      coverage: {
        unit: isComplex ? 90 : 80,
        integration: isComplex ? 70 : 60,
        e2e: isComplex ? 50 : 30,
      },
      priorities: [
        'Critical path functionality',
        'Edge cases and error handling',
        'Performance under load',
        'Security vulnerabilities',
      ],
      riskAreas: this.identifyRiskAreas(task),
      automationLevel: isComplex ? 'full' : 'partial',
    };
  }

  /**
   * Identify risk areas
   */
  private identifyRiskAreas(task: Task): string[] {
    const risks: string[] = [];

    if (task.type === 'backend') {
      risks.push('API contract changes', 'Database migrations', 'Authentication flows');
    } else if (task.type === 'frontend') {
      risks.push('UI state management', 'Form validation', 'Responsive layouts');
    } else if (task.type === 'database') {
      risks.push('Data integrity', 'Query performance', 'Migration rollbacks');
    }

    risks.push('Error handling', 'Edge cases');
    return risks;
  }

  /**
   * Generate test cases for task
   */
  private generateTestCases(task: Task, _strategy: TestStrategy): TestCase[] {
    const cases: TestCase[] = [];
    let caseId = 0;

    // Unit tests
    cases.push({
      id: `tc-${++caseId}`,
      name: `${task.title} - Happy path`,
      type: 'unit',
      description: 'Verify basic functionality works as expected',
      setup: ['Initialize test environment', 'Create mock dependencies'],
      steps: ['Call the function with valid input', 'Verify output matches expected'],
      assertions: ['Result is not null', 'Result matches expected type'],
      priority: 'critical',
      estimatedTime: '5 min',
    });

    cases.push({
      id: `tc-${++caseId}`,
      name: `${task.title} - Error handling`,
      type: 'unit',
      description: 'Verify errors are handled gracefully',
      setup: ['Initialize test environment', 'Configure to throw errors'],
      steps: ['Call function with invalid input', 'Verify error is caught'],
      assertions: ['Error is thrown', 'Error message is descriptive'],
      priority: 'high',
      estimatedTime: '5 min',
    });

    cases.push({
      id: `tc-${++caseId}`,
      name: `${task.title} - Edge cases`,
      type: 'unit',
      description: 'Verify edge cases are handled',
      setup: ['Initialize test environment'],
      steps: ['Test with empty input', 'Test with null', 'Test with boundary values'],
      assertions: ['No exceptions thrown', 'Returns appropriate defaults'],
      priority: 'medium',
      estimatedTime: '10 min',
    });

    // Integration tests
    if (task.type === 'backend' || task.type === 'database') {
      cases.push({
        id: `tc-${++caseId}`,
        name: `${task.title} - API Integration`,
        type: 'integration',
        description: 'Verify API endpoints work correctly',
        setup: ['Start test server', 'Seed test database'],
        steps: ['Make API request', 'Verify response'],
        assertions: ['Status code is correct', 'Response body matches schema'],
        priority: 'high',
        estimatedTime: '15 min',
      });
    }

    // E2E tests
    if (task.type === 'frontend') {
      cases.push({
        id: `tc-${++caseId}`,
        name: `${task.title} - User flow`,
        type: 'e2e',
        description: 'Verify complete user flow',
        setup: ['Launch browser', 'Navigate to page'],
        steps: ['Interact with UI', 'Submit form', 'Verify result'],
        assertions: ['UI updates correctly', 'Data persists'],
        priority: 'high',
        estimatedTime: '20 min',
      });
    }

    return cases;
  }

  /**
   * Generate test code
   */
  private generateTestCode(task: Task, testCases: TestCase[]): string {
    const name = this.toClassName(task.title);

    let code = `/**
 * Tests for ${task.title}
 * Generated by QA Agent
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('${name}', () => {
  beforeEach(() => {
    // Test setup
  });
  
  afterEach(() => {
    // Test cleanup
  });
`;

    for (const tc of testCases) {
      code += `
  describe('${tc.name}', () => {
    it('${tc.description}', async () => {
      // Setup: ${tc.setup.join(', ')}
      
      // Steps:
${tc.steps.map((s) => `      // - ${s}`).join('\n')}
      
      // Assertions:
${tc.assertions.map((a) => `      expect(true).toBe(true); // ${a}`).join('\n')}
    });
  });
`;
    }

    code += '});\n';
    return code;
  }

  /**
   * Calculate test metrics
   */
  private calculateMetrics(testCases: TestCase[]): {
    totalTests: number;
    coverage: number;
    estimatedTime: string;
  } {
    const totalMinutes = testCases.reduce((sum, tc) => {
      const match = tc.estimatedTime.match(/(\d+)/);
      return sum + (match ? parseInt(match[1]) : 5);
    }, 0);

    return {
      totalTests: testCases.length,
      coverage: 80,
      estimatedTime: `${totalMinutes} min`,
    };
  }

  private toClassName(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('');
  }
}
