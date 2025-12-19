"use strict";
/**
 * Orchestrator - Coordinates all specialized agents
 *
 * This is the main entry point for the PrismCode multi-agent system.
 * It coordinates PM, Architect, Coder, QA, and DevOps agents to generate
 * a complete project plan from a feature description.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orchestrator = void 0;
const pm_agent_1 = require("../agents/pm-agent");
const architect_agent_1 = require("../agents/architect-agent");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Orchestrator coordinates all specialized agents to generate project plans
 */
class Orchestrator {
    constructor(config = {}) {
        this.config = config;
        this.pmAgent = new pm_agent_1.PMAgent();
        this.architectAgent = new architect_agent_1.ArchitectAgent();
    }
    /**
     * Orchestrate multi-agent collaboration to generate complete project plan
     *
     * @param input - Feature description and requirements
     * @returns Complete project plan with epics, stories, tasks, and architecture
     */
    async orchestrate(input) {
        logger_1.default.info('Orchestrator: Starting multi-agent collaboration', { feature: input.feature });
        try {
            // Step 1: PM Agent - Break down feature into epics, stories, and tasks
            logger_1.default.info('Orchestrator: Calling PM Agent for project breakdown');
            const pmOutput = await this.pmAgent.process({ feature: input });
            if (!pmOutput.data) {
                throw new Error('PM Agent failed to generate project breakdown');
            }
            const { analysis, epics, stories, tasks } = pmOutput.data;
            // Step 2: Architect Agent - Design system architecture
            logger_1.default.info('Orchestrator: Calling Architect Agent for system design');
            const architectOutput = await this.architectAgent.process({
                feature: input,
                requirements: analysis.successMetrics
            });
            if (!architectOutput.data) {
                throw new Error('Architect Agent failed to generate architecture');
            }
            const { architecture } = architectOutput.data;
            // Step 3: Assemble complete project plan
            logger_1.default.info('Orchestrator: Assembling complete project plan');
            const projectPlan = {
                analysis,
                epics,
                stories,
                tasks,
                architecture,
                githubIssues: this.generateGitHubIssues(epics, stories, tasks),
            };
            logger_1.default.info('Orchestrator: Project plan generated successfully', {
                epics: epics.length,
                stories: stories.length,
                tasks: tasks.length,
            });
            return projectPlan;
        }
        catch (error) {
            logger_1.default.error('Orchestrator: Error during orchestration', { error });
            throw error;
        }
    }
    /**
     * Generate GitHub issues from epics, stories, and tasks
     * @private
     */
    generateGitHubIssues(epics, stories, tasks) {
        const issues = [];
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
    formatEpicBody(epic) {
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
    formatStoryBody(story) {
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
    formatTaskBody(task) {
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
    getName() {
        return 'Orchestrator';
    }
}
exports.Orchestrator = Orchestrator;
//# sourceMappingURL=orchestrator.js.map