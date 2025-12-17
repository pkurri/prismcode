/**
 * PM Agent - Project Manager Agent
 *
 * Handles:
 * - Requirements analysis and clarification
 * - Project breakdown (epics, stories, tasks)
 * - Effort estimation and timeline planning
 * - Sprint planning and prioritization
 * - GitHub issue creation
 */

import { BaseAgent } from './base-agent';
import {
  AgentOutput,
  FeatureInput,
  // ProjectPlan imported for type reference
  Epic,
  Story,
  Task,
  FeatureAnalysis,
} from '../types';
import logger from '../utils/logger';

/**
 * PM Agent input
 */
export interface PMAgentInput {
  feature: FeatureInput;
  context?: Record<string, unknown>;
}

/**
 * PM Agent output
 */
export interface PMAgentOutput extends AgentOutput {
  data: {
    analysis: FeatureAnalysis;
    epics: Epic[];
    stories: Story[];
    tasks: Task[];
    timeline: string;
    totalEffort: number;
  };
}

/**
 * PM Agent - Coordinates project planning
 */
export class PMAgent extends BaseAgent {
  constructor() {
    super('PM Agent');
  }

  /**
   * Process feature input to generate project breakdown
   */
  async process(input: PMAgentInput): Promise<PMAgentOutput> {
    const startTime = Date.now();
    logger.info(`${this.name}: Starting project analysis`, { feature: input.feature.feature });

    try {
      // Step 1: Analyze the feature
      const analysis = await this.analyzeFeature(input.feature);

      // Step 2: Break down into epics
      const epics = await this.generateEpics(input.feature, analysis);

      // Step 3: Create stories for each epic
      const stories = await this.generateStories(epics, input.feature);

      // Step 4: Create tasks for each story
      const tasks = await this.generateTasks(stories);

      // Step 5: Estimate effort and timeline
      const totalEffort = this.calculateTotalEffort(stories, tasks);
      const timeline = this.generateTimeline(totalEffort, input.feature.constraints);

      const processingTime = Date.now() - startTime;
      logger.info(`${this.name}: Analysis complete`, {
        epics: epics.length,
        stories: stories.length,
        tasks: tasks.length,
        processingTime,
      });

      return {
        agentName: this.name,
        data: {
          analysis,
          epics,
          stories,
          tasks,
          timeline,
          totalEffort,
        },
        metadata: {
          processingTime,
          confidence: 0.85,
        },
      };
    } catch (error) {
      logger.error(`${this.name}: Error during analysis`, { error });
      throw error;
    }
  }

  /**
   * Analyze the feature request
   */
  private async analyzeFeature(feature: FeatureInput): Promise<FeatureAnalysis> {
    // TODO: Integrate with AI for deeper analysis
    const complexity = this.assessComplexity(feature);

    return {
      coreValue: `Implement ${feature.feature} to provide value to users`,
      userPersonas: this.identifyPersonas(feature),
      successMetrics: this.defineSuccessMetrics(feature),
      realWorldPatterns: [],
      technicalComplexity: complexity,
      estimatedTimeline: this.estimateTimeline(complexity, feature.scale),
    };
  }

  /**
   * Generate epics from feature
   */
  private async generateEpics(feature: FeatureInput, analysis: FeatureAnalysis): Promise<Epic[]> {
    const epics: Epic[] = [];

    // Core feature epic
    epics.push({
      id: 'epic-1',
      title: `[EPIC] ${feature.feature} - Core Implementation`,
      goal: `Implement the core functionality of ${feature.feature}`,
      successMetrics: analysis.successMetrics.slice(0, 2),
      stories: [],
      dependencies: [],
      timeline: '2-3 weeks',
      effort: 40,
    });

    // Integration epic
    if (feature.integrations && feature.integrations.length > 0) {
      epics.push({
        id: 'epic-2',
        title: `[EPIC] ${feature.feature} - Integrations`,
        goal: `Integrate ${feature.feature} with ${feature.integrations.join(', ')}`,
        successMetrics: ['All integrations functional', 'API contracts validated'],
        stories: [],
        dependencies: ['epic-1'],
        timeline: '1-2 weeks',
        effort: 20,
      });
    }

    // Testing & Quality epic
    epics.push({
      id: 'epic-3',
      title: `[EPIC] ${feature.feature} - Quality & Testing`,
      goal: 'Ensure comprehensive test coverage and quality',
      successMetrics: ['80%+ test coverage', 'Zero critical bugs'],
      stories: [],
      dependencies: ['epic-1'],
      timeline: '1 week',
      effort: 15,
    });

    return epics;
  }

  /**
   * Generate stories for epics
   */
  private async generateStories(epics: Epic[], _feature: FeatureInput): Promise<Story[]> {
    const stories: Story[] = [];
    let storyCount = 0;

    for (const epic of epics) {
      // Generate 2-4 stories per epic
      const storyCountForEpic = Math.min(4, Math.max(2, Math.floor(epic.effort / 10)));

      for (let i = 0; i < storyCountForEpic; i++) {
        storyCount++;
        const story: Story = {
          id: `story-${storyCount}`,
          epicId: epic.id,
          title: `Implement ${epic.title.replace('[EPIC] ', '')} - Part ${i + 1}`,
          asA: 'developer',
          iWant: `to implement part ${i + 1} of ${epic.title}`,
          soThat: 'the feature is complete and functional',
          acceptanceCriteria: [
            'Code compiles without errors',
            'Unit tests pass',
            'Documentation updated',
          ],
          tasks: [],
          storyPoints: Math.ceil(epic.effort / storyCountForEpic),
          priority: i === 0 ? 'high' : 'medium',
        };

        stories.push(story);
        epic.stories.push(story.id);
      }
    }

    return stories;
  }

  /**
   * Generate tasks for stories
   */
  private async generateTasks(stories: Story[]): Promise<Task[]> {
    const tasks: Task[] = [];
    let taskCount = 0;

    for (const story of stories) {
      // Generate 2-3 tasks per story
      const taskTypes: Array<Task['type']> = ['frontend', 'backend', 'testing'];

      for (let i = 0; i < Math.min(3, story.storyPoints); i++) {
        taskCount++;
        const task: Task = {
          id: `task-${taskCount}`,
          storyId: story.id,
          title: `${story.title} - ${taskTypes[i % taskTypes.length]} implementation`,
          description: `Implement the ${taskTypes[i % taskTypes.length]} component for ${story.title}`,
          type: taskTypes[i % taskTypes.length],
          checklist: ['Write code', 'Add tests', 'Update documentation', 'Code review'],
          estimatedHours: Math.ceil((story.storyPoints * 2) / 3),
          complexity: story.storyPoints > 8 ? 'high' : story.storyPoints > 3 ? 'medium' : 'low',
        };

        tasks.push(task);
        story.tasks.push(task.id);
      }
    }

    return tasks;
  }

  /**
   * Assess feature complexity
   */
  private assessComplexity(feature: FeatureInput): 'low' | 'medium' | 'high' {
    let score = 0;

    if (feature.scale === 'enterprise') score += 3;
    else if (feature.scale === 'startup') score += 2;
    else score += 1;

    if (feature.integrations && feature.integrations.length > 2) score += 2;
    if (feature.techStack && feature.techStack.length > 3) score += 1;
    if (feature.constraints?.compliance && feature.constraints.compliance.length > 0) score += 2;

    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  /**
   * Identify user personas
   */
  private identifyPersonas(feature: FeatureInput): string[] {
    const personas = ['End User', 'Developer'];

    if (feature.scale === 'enterprise') {
      personas.push('Admin', 'Manager');
    }

    return personas;
  }

  /**
   * Define success metrics
   */
  private defineSuccessMetrics(_feature: FeatureInput): string[] {
    return [
      'Feature deployed to production',
      'All acceptance criteria met',
      'Performance benchmarks achieved',
      'User feedback positive',
    ];
  }

  /**
   * Estimate timeline based on complexity
   */
  private estimateTimeline(complexity: 'low' | 'medium' | 'high', scale?: string): string {
    const baseWeeks = complexity === 'high' ? 8 : complexity === 'medium' ? 4 : 2;
    const scaleMultiplier = scale === 'enterprise' ? 1.5 : scale === 'startup' ? 1.2 : 1;
    const weeks = Math.ceil(baseWeeks * scaleMultiplier);

    return `${weeks} weeks`;
  }

  /**
   * Calculate total effort
   */
  private calculateTotalEffort(stories: Story[], tasks: Task[]): number {
    const storyPoints = stories.reduce((sum, s) => sum + s.storyPoints, 0);
    const taskHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);

    return storyPoints + Math.ceil(taskHours / 8); // Convert hours to days
  }

  /**
   * Generate timeline string
   */
  private generateTimeline(effort: number, constraints?: FeatureInput['constraints']): string {
    const weeks = Math.ceil(effort / 5); // Assume 5 effort units per week

    if (constraints?.timeline) {
      return constraints.timeline;
    }

    return `${weeks} weeks`;
  }
}
