/**
 * n8n Workflow Templates Tests
 * Tests for Issue #116
 */

import { WorkflowTemplateManager } from '../../../src/advanced/workflow-templates';

describe('WorkflowTemplateManager', () => {
  let manager: WorkflowTemplateManager;

  beforeEach(() => {
    manager = new WorkflowTemplateManager();
    manager.reset();
  });

  describe('createTemplate', () => {
    it('should create workflow template', () => {
      const template = manager.createTemplate({
        name: 'Slack Notification',
        description: 'Send Slack notifications',
        category: 'notifications',
        nodes: [
          {
            id: 'n1',
            type: 'slack',
            name: 'Send Message',
            position: { x: 0, y: 0 },
            parameters: {},
          },
        ],
        connections: [],
        triggers: ['webhook'],
        tags: ['slack', 'notification'],
      });

      expect(template.id).toBeDefined();
      expect(template.usageCount).toBe(0);
    });
  });

  describe('listTemplates', () => {
    it('should list templates', () => {
      manager.createTemplate({
        name: 'T1',
        description: '',
        category: 'c1',
        nodes: [],
        connections: [],
        triggers: [],
        tags: [],
      });
      manager.createTemplate({
        name: 'T2',
        description: '',
        category: 'c2',
        nodes: [],
        connections: [],
        triggers: [],
        tags: [],
      });

      expect(manager.listTemplates().length).toBe(2);
    });
  });

  describe('deployTemplate', () => {
    it('should deploy template', () => {
      const template = manager.createTemplate({
        name: 'Test',
        description: '',
        category: 'c',
        nodes: [],
        connections: [],
        triggers: [],
        tags: [],
      });

      const deployment = manager.deployTemplate(template.id, 'My Workflow');

      expect(deployment).toBeDefined();
      expect(deployment!.status).toBe('active');
      expect(manager.getTemplate(template.id)!.usageCount).toBe(1);
    });
  });

  describe('recordRun', () => {
    it('should record workflow run', () => {
      const template = manager.createTemplate({
        name: 'Test',
        description: '',
        category: 'c',
        nodes: [],
        connections: [],
        triggers: [],
        tags: [],
      });
      const deployment = manager.deployTemplate(template.id, 'Workflow')!;

      manager.recordRun(deployment.id);
      manager.recordRun(deployment.id);

      const deployments = manager.getDeployments();
      expect(deployments[0].runCount).toBe(2);
    });
  });

  describe('exportTemplate', () => {
    it('should export as JSON', () => {
      const template = manager.createTemplate({
        name: 'Test',
        description: 'Desc',
        category: 'c',
        nodes: [],
        connections: [],
        triggers: [],
        tags: [],
      });

      const json = manager.exportTemplate(template.id);

      expect(json).toContain('Test');
      expect(JSON.parse(json!).description).toBe('Desc');
    });
  });

  describe('importTemplate', () => {
    it('should import from JSON', () => {
      const json = JSON.stringify({
        name: 'Imported',
        description: 'Imported desc',
        category: 'c',
        nodes: [],
        connections: [],
        triggers: [],
        tags: [],
      });

      const imported = manager.importTemplate(json);

      expect(imported).toBeDefined();
      expect(imported!.name).toBe('Imported');
    });
  });
});
