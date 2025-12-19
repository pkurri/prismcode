/**
 * Orchestrator Unit Tests
 * Verifies acceptance criteria for Issue #26
 */

import { Orchestrator } from '../../../src/core/orchestrator';
import { FeatureInput } from '../../../src/types';

describe('Orchestrator', () => {
  let orchestrator: Orchestrator;

  beforeEach(() => {
    orchestrator = new Orchestrator();
  });

  describe('constructor', () => {
    it('should create orchestrator with default config', () => {
      expect(orchestrator).toBeDefined();
      expect(orchestrator.getName()).toBe('Orchestrator');
    });

    it('should accept custom config', () => {
      const customOrchestrator = new Orchestrator({
        github: {
          token: 'test-token',
          owner: 'test-owner',
        },
      });
      expect(customOrchestrator).toBeDefined();
    });
  });

  describe('orchestrate()', () => {
    it('should generate complete project plan from feature input', async () => {
      const input: FeatureInput = {
        feature: 'E-commerce platform with product catalog and shopping cart',
        platform: 'web',
        scale: 'startup',
      };

      const result = await orchestrator.orchestrate(input);

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(result.epics).toBeDefined();
      expect(result.stories).toBeDefined();
      expect(result.tasks).toBeDefined();
      expect(result.architecture).toBeDefined();
    });

    it('should coordinate PM Agent for project breakdown', async () => {
      const input: FeatureInput = {
        feature: 'Task management application',
      };

      const result = await orchestrator.orchestrate(input);

      expect(result.analysis).toBeDefined();
      expect(result.epics.length).toBeGreaterThan(0);
      expect(result.stories.length).toBeGreaterThan(0);
      expect(result.tasks.length).toBeGreaterThan(0);
    });

    it('should coordinate Architect Agent for system design', async () => {
      const input: FeatureInput = {
        feature: 'Real-time chat application',
      };

      const result = await orchestrator.orchestrate(input);

      expect(result.architecture).toBeDefined();
      expect(result.architecture.frontend).toBeDefined();
      expect(result.architecture.backend).toBeDefined();
      expect(result.architecture.database).toBeDefined();
    });

    it('should generate GitHub issues', async () => {
      const input: FeatureInput = {
        feature: 'Blog platform with CMS',
      };

      const result = await orchestrator.orchestrate(input);

      expect(result.githubIssues).toBeDefined();
      expect(Array.isArray(result.githubIssues)).toBe(true);
      expect(result.githubIssues.length).toBeGreaterThan(0);
    });

    it('should include epic issues with proper labels', async () => {
      const input: FeatureInput = {
        feature: 'Social media dashboard',
      };

      const result = await orchestrator.orchestrate(input);

      const epicIssues = result.githubIssues.filter((i) => 
        i.title.startsWith('[EPIC]')
      );
      
      expect(epicIssues.length).toBeGreaterThan(0);
      epicIssues.forEach((issue) => {
        expect(issue.labels).toContain('epic');
      });
    });

    it('should include story issues with acceptance criteria', async () => {
      const input: FeatureInput = {
        feature: 'API gateway service',
      };

      const result = await orchestrator.orchestrate(input);

      const storyIssues = result.githubIssues.filter((i) => 
        i.title.startsWith('[STORY]')
      );
      
      expect(storyIssues.length).toBeGreaterThan(0);
      storyIssues.forEach((issue) => {
        expect(issue.body).toContain('Acceptance Criteria');
        expect(issue.labels).toContain('story');
      });
    });

    it('should include task issues with checklist', async () => {
      const input: FeatureInput = {
        feature: 'User authentication system',
      };

      const result = await orchestrator.orchestrate(input);

      const taskIssues = result.githubIssues.filter((i) => 
        i.title.startsWith('[TASK]')
      );
      
      expect(taskIssues.length).toBeGreaterThan(0);
      taskIssues.forEach((issue) => {
        expect(issue.body).toContain('Description');
        expect(issue.labels).toContain('task');
      });
    });
  });

  describe('getName()', () => {
    it('should return orchestrator name', () => {
      expect(orchestrator.getName()).toBe('Orchestrator');
    });
  });
});
