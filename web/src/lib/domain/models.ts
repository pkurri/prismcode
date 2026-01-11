/**
 * Project and Workspace Domain Models
 * GitHub Issue #340: Define project and workspace domain models
 */

// Workspace - Top-level container for projects
export interface Workspace {
  id: string;
  name: string;
  description: string;
  owner: string;
  members: WorkspaceMember[];
  projects: string[]; // Project IDs
  settings: WorkspaceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface WorkspaceSettings {
  defaultBranch: string;
  ciEnabled: boolean;
  notifications: NotificationSettings;
  integrations: IntegrationSettings;
}

export interface NotificationSettings {
  email: boolean;
  slack: boolean;
  webhooks: string[];
}

export interface IntegrationSettings {
  github?: { token?: string; org?: string };
  jira?: { url?: string; project?: string };
  slack?: { channel?: string };
}

// Project Domain Model
export interface ProjectDomain {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  repository: RepositoryInfo;
  stack: TechStack;
  agents: ProjectAgentConfig[];
  workflows: string[]; // Workflow IDs
  settings: ProjectSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepositoryInfo {
  provider: 'github' | 'gitlab' | 'bitbucket';
  url: string;
  branch: string;
  lastSyncAt?: Date;
}

export interface TechStack {
  language: string;
  framework?: string;
  buildTool?: string;
  testFramework?: string;
  packageManager?: string;
}

export interface ProjectAgentConfig {
  agentId: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface ProjectSettings {
  autoFix: boolean;
  autoTest: boolean;
  codeReview: boolean;
  securityScan: boolean;
  coverageThreshold: number;
}

// Project Factory
export function createProject(
  workspaceId: string,
  name: string,
  repository: RepositoryInfo
): ProjectDomain {
  return {
    id: `proj-${Date.now()}`,
    workspaceId,
    name,
    description: '',
    repository,
    stack: { language: 'typescript' },
    agents: [],
    workflows: [],
    settings: {
      autoFix: true,
      autoTest: true,
      codeReview: true,
      securityScan: true,
      coverageThreshold: 80,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Workspace Factory
export function createWorkspace(name: string, owner: string): Workspace {
  return {
    id: `ws-${Date.now()}`,
    name,
    description: '',
    owner,
    members: [{ userId: owner, role: 'owner', joinedAt: new Date() }],
    projects: [],
    settings: {
      defaultBranch: 'main',
      ciEnabled: true,
      notifications: { email: true, slack: false, webhooks: [] },
      integrations: {},
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
