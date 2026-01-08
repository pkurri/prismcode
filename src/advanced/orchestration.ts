/**
 * Multi-Model Orchestration Engine
 * Issue #258: Multi-Model Orchestration Engine
 *
 * Manages complex workflows using multiple AI models
 */

import logger from '../utils/logger';
import { modelRouter, TaskContext, RoutingDecision } from './model-router';

export interface ExecutionStep {
  id: string;
  name: string;
  type: 'generation' | 'review' | 'synthesis' | 'validation';
  model?: string;
  input: string;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
}

export interface OrchestrationExecutionPlan {
  id: string;
  objective: string;
  steps: ExecutionStep[];
  estimatedCost: number;
  estimatedTime: number;
  createdAt: Date;
}

export interface StepResult {
  stepId: string;
  success: boolean;
  output: string;
  model: string;
  cost: number;
  duration: number;
}

export interface OrchestrationResult {
  planId: string;
  success: boolean;
  finalOutput: string;
  stepResults: StepResult[];
  totalCost: number;
  totalDuration: number;
}

/**
 * Orchestration Engine
 * Decomposes complex tasks and routes sub-tasks to optimal models
 */
export class OrchestrationEngine {
  private activePlans: Map<string, OrchestrationExecutionPlan> = new Map();

  constructor() {
    logger.info('OrchestrationEngine initialized');
  }

  createPlan(objective: string): OrchestrationExecutionPlan {
    logger.info('Creating execution plan', { objective: objective.substring(0, 50) });

    const steps = this.decomposeObjective(objective);
    const estimatedCost = this.estimatePlanCost(steps);
    const estimatedTime = this.estimatePlanTime(steps);

    const plan: OrchestrationExecutionPlan = {
      id: `plan_${Date.now().toString(16)}`,
      objective,
      steps,
      estimatedCost,
      estimatedTime,
      createdAt: new Date(),
    };

    this.activePlans.set(plan.id, plan);

    logger.info('Execution plan created', {
      id: plan.id,
      stepCount: steps.length,
      estimatedCost,
    });

    return plan;
  }

  async executePlan(planId: string): Promise<OrchestrationResult> {
    const plan = this.activePlans.get(planId);
    if (!plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    logger.info('Executing plan', { planId, stepCount: plan.steps.length });

    const stepResults: StepResult[] = [];
    const startTime = Date.now();

    for (const step of this.getExecutionOrder(plan.steps)) {
      const result = await this.executeStep(step, stepResults);
      stepResults.push(result);

      if (!result.success) {
        logger.warn('Step failed, continuing with remaining steps', { stepId: step.id });
      }
    }

    const finalOutput = this.synthesizeResults(stepResults, plan.objective);
    const totalCost = stepResults.reduce((sum, r) => sum + r.cost, 0);
    const totalDuration = Date.now() - startTime;

    const result: OrchestrationResult = {
      planId,
      success: stepResults.every((r) => r.success),
      finalOutput,
      stepResults,
      totalCost,
      totalDuration,
    };

    logger.info('Plan execution complete', {
      planId,
      success: result.success,
      totalCost,
      duration: totalDuration,
    });

    return result;
  }

  private decomposeObjective(objective: string): ExecutionStep[] {
    const lowerObj = objective.toLowerCase();
    const steps: ExecutionStep[] = [];

    if (lowerObj.includes('refactor')) {
      steps.push(
        this.createStep('analyze', 'Analyze code structure', 'review', objective, []),
        this.createStep('plan', 'Create refactoring plan', 'generation', '', ['analyze']),
        this.createStep('implement', 'Implement changes', 'generation', '', ['plan']),
        this.createStep('review', 'Review changes', 'review', '', ['implement']),
        this.createStep('validate', 'Validate correctness', 'validation', '', ['review'])
      );
    } else if (lowerObj.includes('test') || lowerObj.includes('testing')) {
      steps.push(
        this.createStep('analyze', 'Analyze code for testing', 'review', objective, []),
        this.createStep('generate', 'Generate test cases', 'generation', '', ['analyze']),
        this.createStep('review', 'Review test coverage', 'review', '', ['generate'])
      );
    } else if (lowerObj.includes('document')) {
      steps.push(
        this.createStep('analyze', 'Analyze code structure', 'review', objective, []),
        this.createStep('generate', 'Generate documentation', 'generation', '', ['analyze']),
        this.createStep('format', 'Format and polish', 'synthesis', '', ['generate'])
      );
    } else {
      steps.push(
        this.createStep('understand', 'Understand requirements', 'review', objective, []),
        this.createStep('execute', 'Execute task', 'generation', '', ['understand']),
        this.createStep('validate', 'Validate output', 'validation', '', ['execute'])
      );
    }

    return steps;
  }

  private createStep(
    id: string,
    name: string,
    type: ExecutionStep['type'],
    input: string,
    dependencies: string[]
  ): ExecutionStep {
    return { id, name, type, input, dependencies, status: 'pending' };
  }

  private async executeStep(
    step: ExecutionStep,
    previousResults: StepResult[]
  ): Promise<StepResult> {
    const startTime = Date.now();
    step.status = 'running';

    const dependencyOutputs = step.dependencies
      .map((depId) => previousResults.find((r) => r.stepId === depId)?.output || '')
      .join('\n');

    const fullInput = step.input + (dependencyOutputs ? `\n\nContext:\n${dependencyOutputs}` : '');

    const taskContext: TaskContext = {
      type: this.mapStepTypeToCapability(step.type),
      complexity: 'medium',
      estimatedTokens: modelRouter.estimateTokens(fullInput),
      priority: 'normal',
    };

    let decision: RoutingDecision;
    try {
      decision = modelRouter.route(taskContext);
    } catch {
      step.status = 'failed';
      step.error = 'No suitable model available';
      return {
        stepId: step.id,
        success: false,
        output: '',
        model: 'none',
        cost: 0,
        duration: Date.now() - startTime,
      };
    }

    await this.simulateModelCall();

    const output = `[${decision.selectedModel.id}] Completed: ${step.name}`;
    step.status = 'completed';
    step.output = output;

    return {
      stepId: step.id,
      success: true,
      output,
      model: decision.selectedModel.id,
      cost: decision.estimatedCost,
      duration: Date.now() - startTime,
    };
  }

  private mapStepTypeToCapability(type: ExecutionStep['type']): TaskContext['type'] {
    switch (type) {
      case 'generation':
        return 'code-generation';
      case 'review':
        return 'code-review';
      case 'validation':
        return 'testing';
      case 'synthesis':
        return 'summarization';
      default:
        return 'code-generation';
    }
  }

  private getExecutionOrder(steps: ExecutionStep[]): ExecutionStep[] {
    const ordered: ExecutionStep[] = [];
    const remaining = [...steps];

    while (remaining.length > 0) {
      const ready = remaining.filter((s) =>
        s.dependencies.every((d) => ordered.some((o) => o.id === d))
      );

      if (ready.length === 0 && remaining.length > 0) {
        ordered.push(...remaining);
        break;
      }

      ordered.push(...ready);
      for (const s of ready) {
        remaining.splice(remaining.indexOf(s), 1);
      }
    }

    return ordered;
  }

  synthesizeResults(results: StepResult[], objective: string): string {
    const successfulOutputs = results
      .filter((r) => r.success)
      .map((r) => r.output)
      .join('\n');

    return `# Orchestration Result\n\n**Objective**: ${objective}\n\n**Outputs**:\n${successfulOutputs}`;
  }

  private estimatePlanCost(steps: ExecutionStep[]): number {
    return steps.length * 0.01;
  }

  private estimatePlanTime(steps: ExecutionStep[]): number {
    return steps.length * 2000;
  }

  private async simulateModelCall(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  getActivePlans(): OrchestrationExecutionPlan[] {
    return Array.from(this.activePlans.values());
  }

  cancelPlan(planId: string): boolean {
    return this.activePlans.delete(planId);
  }
}

export const orchestrationEngine = new OrchestrationEngine();
