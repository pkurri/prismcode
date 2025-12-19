/**
 * n8n Workflow Templates Service
 * Issue #116: n8n Workflow Templates
 *
 * Manage and deploy n8n workflow templates
 */

import logger from '../utils/logger';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  triggers: string[];
  tags: string[];
  usageCount: number;
  createdAt: Date;
}

export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  parameters: Record<string, unknown>;
}

export interface WorkflowConnection {
  from: { node: string; output: number };
  to: { node: string; input: number };
}

export interface DeployedWorkflow {
  id: string;
  templateId: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  deployedAt: Date;
  lastRun?: Date;
  runCount: number;
}

/**
 * Workflow Template Manager
 * Manages n8n workflow templates
 */
export class WorkflowTemplateManager {
  private templates: Map<string, WorkflowTemplate> = new Map();
  private deployments: Map<string, DeployedWorkflow> = new Map();

  constructor() {
    logger.info('WorkflowTemplateManager initialized');
  }

  /**
   * Create template
   */
  createTemplate(
    template: Omit<WorkflowTemplate, 'id' | 'usageCount' | 'createdAt'>
  ): WorkflowTemplate {
    const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const fullTemplate: WorkflowTemplate = {
      id,
      ...template,
      usageCount: 0,
      createdAt: new Date(),
    };

    this.templates.set(id, fullTemplate);
    logger.info('Workflow template created', { id, name: template.name });

    return fullTemplate;
  }

  /**
   * Get template
   */
  getTemplate(id: string): WorkflowTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * List templates
   */
  listTemplates(category?: string): WorkflowTemplate[] {
    const templates = Array.from(this.templates.values());
    if (category) {
      return templates.filter((t) => t.category === category);
    }
    return templates;
  }

  /**
   * Deploy template
   */
  deployTemplate(templateId: string, name: string): DeployedWorkflow | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const id = `workflow_${Date.now()}`;

    const deployment: DeployedWorkflow = {
      id,
      templateId,
      name,
      status: 'active',
      deployedAt: new Date(),
      runCount: 0,
    };

    this.deployments.set(id, deployment);
    template.usageCount++;

    logger.info('Workflow deployed', { id, templateId });
    return deployment;
  }

  /**
   * Get deployed workflows
   */
  getDeployments(): DeployedWorkflow[] {
    return Array.from(this.deployments.values());
  }

  /**
   * Update deployment status
   */
  updateDeploymentStatus(id: string, status: DeployedWorkflow['status']): boolean {
    const deployment = this.deployments.get(id);
    if (deployment) {
      deployment.status = status;
      return true;
    }
    return false;
  }

  /**
   * Record workflow run
   */
  recordRun(deploymentId: string): boolean {
    const deployment = this.deployments.get(deploymentId);
    if (deployment) {
      deployment.runCount++;
      deployment.lastRun = new Date();
      return true;
    }
    return false;
  }

  /**
   * Search templates
   */
  searchTemplates(query: string): WorkflowTemplate[] {
    const lower = query.toLowerCase();
    return Array.from(this.templates.values()).filter(
      (t) =>
        t.name.toLowerCase().includes(lower) ||
        t.description.toLowerCase().includes(lower) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lower))
    );
  }

  /**
   * Export template as JSON
   */
  exportTemplate(id: string): string | null {
    const template = this.templates.get(id);
    if (!template) return null;

    return JSON.stringify(template, null, 2);
  }

  /**
   * Import template from JSON
   */
  importTemplate(json: string): WorkflowTemplate | null {
    try {
      const data = JSON.parse(json) as {
        name: string;
        description: string;
        category: string;
        nodes: WorkflowNode[];
        connections: WorkflowConnection[];
        triggers: string[];
        tags: string[];
      };
      return this.createTemplate({
        name: data.name,
        description: data.description,
        category: data.category,
        nodes: data.nodes,
        connections: data.connections,
        triggers: data.triggers,
        tags: data.tags,
      });
    } catch {
      return null;
    }
  }

  /**
   * Delete template
   */
  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  /**
   * Delete deployment
   */
  deleteDeployment(id: string): boolean {
    return this.deployments.delete(id);
  }

  /**
   * Reset
   */
  reset(): void {
    this.templates.clear();
    this.deployments.clear();
    logger.info('WorkflowTemplateManager reset');
  }
}

export const workflowTemplateManager = new WorkflowTemplateManager();
