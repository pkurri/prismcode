/**
 * Orchestrator - Coordinates all specialized agents
 * 
 * This is the main entry point for the PrismCode multi-agent system.
 * It coordinates PM, Architect, Coder, QA, and DevOps agents to generate
 * a complete project plan from a feature description.
 */

import { FeatureInput, ProjectPlan, PrismCodeConfig, Epic, Story, Task, GitHubIssue } from '../types';
import { PMAgent } from '../agents/pm-agent';
import { ArchitectAgent } from '../agents/architect-agent';
import logger from '../utils/logger';

/**
 * Orchestrator coordinates all specialized agents to generate project plans
 */
export class Orchestrator {
  private config: PrismCodeConfig;
  private pmAgent: PMAgent;
  private architectAgent: ArchitectAgent;

  constructor(config: PrismCodeConfig = {}) {
    this.config = config;
    this.pmAgent = new PMAgent();
    this.architectAgent = new ArchitectAgent();
  }

  /**
   * Orchestrate multi-agent collaboration to generate complete project plan
   * 
   * @param input - Feature description and requirements
   * @returns Complete project plan with epics, stories, tasks, and architecture
   */
  async orchestrate(input: FeatureInput): Promise<ProjectPlan> {
    logger.info('Orchestrator: Starting multi-agent collaboration', { feature: input.feature });

    try {
      // Step 1: PM Agent - Break down feature into epics, stories, and tasks
      logger.info('Orchestrator: Calling PM Agent for project breakdown');
      const pmOutput = await this.pmAgent.process({ feature: input });

      if (!pmOutput.data) {
        throw new Error('PM Agent failed to generate project breakdown');
      }

      const { analysis, epics, stories, tasks } = pmOutput.data;

      // Step 2: Architect Agent - Design system architecture
      logger.info('Orchestrator: Calling Architect Agent for system design');
      const architectOutput = await this.architectAgent.process({ 
        feature: input,
        requirements: analysis.successMetrics 
      });

      if (!architectOutput.data) {
        throw new Error('Architect Agent failed to generate architecture');
      }

      const { architecture } = architectOutput.data;

      // Step 3: Assemble complete project plan
      logger.info('Orchestrator: Assembling complete project plan');
      
      const projectPlan: ProjectPlan = {
        analysis,
        epics,
        stories,
        tasks,
        architecture,
        githubIssues: this.generateGitHubIssues(epics, stories, tasks),
      };

      logger.info('Orchestrator: Project plan generated successfully', {
        epics: epics.length,
        stories: stories.length,
        tasks: tasks.length,
      });

      return projectPlan;
    } catch (error) {
      logger.error('Orchestrator: Error during orchestration', { error });
      throw error;
    }
  }

  /**
   * Generate GitHub issues from epics, stories, and tasks
   * @private
   */
  private generateGitHubIssues(epics: Epic[], stories: Story[], tasks: Task[]): GitHubIssue[] {
    const issues: GitHubIssue[] = [];

    // Create epic issues
    for (const epic of epics) {
      issues.push({
        title: `[EPIC] ${epic.title}`,
        body: this.formatEpicBody(epic),
        labels: ['epic', 'phase-1'],
      });
    }

    // Create story issues
    for (const story of stories) {
      issues.push({
        title: `[STORY] ${story.title}`,
        body: this.formatStoryBody(story),
        labels: ['story', 'phase-1'],
      });
    }

    // Create task issues
    for (const task of tasks) {
      issues.push({
        title: `[TASK] ${task.title}`,
        body: this.formatTaskBody(task),
        labels: ['task', 'phase-1'],
      });
    }

    return issues;
  }

  /**
   * Format epic body for GitHub issue
   * @private
   */
  private formatEpicBody(epic: Epic): string {
    return `## 🎯 Epic Goal
${epic.goal}

## ✅ Success Metrics
${epic.successMetrics.map((m) => `- ${m}`).join('\n')}

## 📅 Timeline
${epic.timeline}

## 🔗 Related Stories
${epic.stories.map((s) => `- ${s}`).join('\n')}
`;
  }

  /**
   * Format story body for GitHub issue
   * @private
   */
  private formatStoryBody(story: Story): string {
    return `## 📖 User Story
As a ${story.asA}
I want ${story.iWant}
So that ${story.soThat}

## ✅ Acceptance Criteria
${story.acceptanceCriteria.map((c) => `- [ ] ${c}`).join('\n')}

## 📊 Story Points
${story.storyPoints}

## 🔗 Related Tasks
${story.tasks.map((t) => `- ${t}`).join('\n')}
`;
  }

  /**
   * Format task body for GitHub issue
   * @private
   */
  private formatTaskBody(task: Task): string {
    return `## 📋 Description
${task.description}

## ✅ Checklist
${task.checklist?.map((c) => `- [ ] ${c}`).join('\n') || 'No checklist items'}

## ⏱️ Estimated Hours
${task.estimatedHours}

## 🏷️ Type
${task.type}

## 💪 Complexity
${task.complexity}
`;
  }

  /**
   * Get orchestrator name for logging
   */
  getName(): string {
    return 'Orchestrator';
  }
}
