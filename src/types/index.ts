/**
 * Core type definitions for PrismCode
 */

/**
 * Feature input from user
 */
export interface FeatureInput {
  /** Feature description */
  feature: string;
  
  /** Technology stack */
  techStack?: string[];
  
  /** Project scale */
  scale?: 'mvp' | 'startup' | 'enterprise';
  
  /** Target platform */
  platform?: 'web' | 'mobile' | 'desktop' | 'api';
  
  /** Third-party integrations */
  integrations?: string[];
  
  /** Project constraints */
  constraints?: {
    budget?: 'low' | 'medium' | 'high';
    timeline?: string;
    team_size?: 'solo' | 'small' | 'large';
    compliance?: string[];
  };
}

/**
 * Project plan output
 */
export interface ProjectPlan {
  /** Feature analysis */
  analysis: FeatureAnalysis;
  
  /** Epics */
  epics: Epic[];
  
  /** User stories */
  stories: Story[];
  
  /** Tasks */
  tasks: Task[];
  
  /** Architecture design */
  architecture: Architecture;
  
  /** GitHub issues payload */
  githubIssues: GitHubIssue[];
  
  /** n8n workflow */
  n8nWorkflow?: object;
  
  /** Cursor IDE prompts */
  cursorPrompts?: CursorPrompt[];
}

/**
 * Feature analysis
 */
export interface FeatureAnalysis {
  coreValue: string;
  userPersonas: string[];
  successMetrics: string[];
  realWorldPatterns: RealWorldPattern[];
  technicalComplexity: 'low' | 'medium' | 'high';
  estimatedTimeline: string;
}

/**
 * Real-world pattern reference
 */
export interface RealWorldPattern {
  name: string;
  example: string;
  source: string;
  applicability: string;
}

/**
 * Epic (strategic initiative)
 */
export interface Epic {
  id: string;
  title: string;
  goal: string;
  successMetrics: string[];
  stories: string[];
  dependencies: string[];
  timeline: string;
  effort: number;
}

/**
 * User Story
 */
export interface Story {
  id: string;
  epicId: string;
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  acceptanceCriteria: string[];
  tasks: string[];
  storyPoints: number;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Task (implementation work)
 */
export interface Task {
  id: string;
  storyId: string;
  title: string;
  description: string;
  type: 'frontend' | 'backend' | 'database' | 'devops' | 'testing' | 'documentation';
  checklist: string[];
  estimatedHours: number;
  complexity: 'low' | 'medium' | 'high';
}

/**
 * System architecture
 */
export interface Architecture {
  frontend: {
    framework: string;
    stateManagement: string;
    routing: string;
    uiLibrary: string;
  };
  backend: {
    runtime: string;
    framework: string;
    authentication: string;
    apiStyle: 'rest' | 'graphql' | 'trpc';
  };
  database: {
    primary: string;
    cache?: string;
    search?: string;
  };
  infrastructure: {
    hosting: string;
    cicd: string;
    monitoring: string;
  };
  diagrams: {
    systemDiagram: string;
    erDiagram?: string;
    sequenceDiagram?: string;
  };
}

/**
 * GitHub issue payload
 */
export interface GitHubIssue {
  title: string;
  body: string;
  labels: string[];
  milestone?: number;
  assignees?: string[];
}

/**
 * Cursor IDE prompt
 */
export interface CursorPrompt {
  taskId: string;
  title: string;
  context: string;
  requirements: string[];
  technicalConstraints: string[];
  filesToModify: string[];
  acceptanceCriteria: string[];
  codeExample?: string;
}

/**
 * Agent output
 */
export interface AgentOutput {
  agentName: string;
  data: any;
  metadata?: {
    processingTime?: number;
    tokensUsed?: number;
    confidence?: number;
  };
}

/**
 * Configuration options
 */
export interface PrismCodeConfig {
  github?: {
    token: string;
    owner: string;
    repo?: string;
    defaultLabels?: string[];
    useProjects?: boolean;
    projectId?: string;
  };
  agents?: {
    pm?: any;
    architect?: any;
    coder?: any;
    qa?: any;
    devops?: any;
  };
  output?: {
    format?: 'json' | 'markdown' | 'both';
    directory?: string;
    generateCursorPrompts?: boolean;
    generateN8nWorkflows?: boolean;
  };
}