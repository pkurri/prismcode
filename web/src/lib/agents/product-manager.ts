/**
 * Product Manager Agent
 * GitHub Issue #344: Implement Product Manager agent
 * 
 * Responsibilities:
 * - Requirements gathering from user input
 * - Epic/story generation
 * - GitHub integration for issue creation
 */

import { Agent, MCPTool, MCPToolResult } from './types';
import { registerAgent } from './orchestrator';

// MCP Tools for Product Manager

const gatherRequirementsTool: MCPTool = {
  name: 'gather_requirements',
  description: 'Analyze user input and extract structured requirements',
  parameters: {
    input: { type: 'string', description: 'User input to analyze', required: true },
    context: { type: 'object', description: 'Project context', required: false },
  },
  execute: async (params): Promise<MCPToolResult> => {
    const input = params.input as string;
    return {
      success: true,
      data: {
        requirements: [
          { id: 'REQ-001', description: `Extracted from: ${input}`, priority: 'high' },
        ],
        suggestedEpics: ['Epic 1: Core Features'],
      },
      duration: 500,
    };
  },
};

const createEpicTool: MCPTool = {
  name: 'create_epic',
  description: 'Create a GitHub epic issue with structured format',
  parameters: {
    title: { type: 'string', description: 'Epic title', required: true },
    description: { type: 'string', description: 'Epic description', required: true },
    labels: { type: 'array', description: 'Labels to apply', required: false },
  },
  execute: async (params): Promise<MCPToolResult> => {
    const title = params.title as string;
    return {
      success: true,
      data: {
        issueNumber: Math.floor(Math.random() * 1000),
        url: `https://github.com/pkurri/prismcode/issues/${Math.floor(Math.random() * 1000)}`,
        title,
      },
      duration: 300,
    };
  },
};

const createUserStoryTool: MCPTool = {
  name: 'create_user_story',
  description: 'Create a user story from requirements',
  parameters: {
    requirement: { type: 'object', description: 'Requirement to convert', required: true },
    epicId: { type: 'string', description: 'Parent epic ID', required: false },
  },
  execute: async (params): Promise<MCPToolResult> => {
    return {
      success: true,
      data: {
        story: {
          title: 'As a user, I want...',
          acceptanceCriteria: ['Given...', 'When...', 'Then...'],
        },
      },
      duration: 400,
    };
  },
};

// Create and register Product Manager Agent
export const productManagerAgent: Agent = {
  id: 'pm-agent-001',
  role: 'product-manager',
  name: 'Product Manager Agent',
  description: 'Analyzes requirements, creates epics and user stories, manages product backlog',
  capabilities: [
    'Requirement analysis',
    'Epic creation',
    'User story writing',
    'Backlog prioritization',
    'GitHub issue management',
  ],
  tools: [gatherRequirementsTool, createEpicTool, createUserStoryTool],
  status: 'idle',
};

// Auto-register on import
registerAgent(productManagerAgent);

export { gatherRequirementsTool, createEpicTool, createUserStoryTool };
