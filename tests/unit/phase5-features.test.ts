/**
 * Tests for Usage Analytics, Model Router, and RBAC
 * Issues #214, #215, #218
 */

import { UsageAnalytics, type UsageAlert } from '../../src/advanced/usage-analytics';
import { ModelRouter, type TaskContext } from '../../src/advanced/model-router';
import { RBACManager, type Role, type AuditEntry } from '../../src/advanced/rbac';
import { costTracker } from '../../src/advanced/cost-tracking';

describe('UsageAnalytics', () => {
  let analytics: UsageAnalytics;

  beforeEach(() => {
    analytics = new UsageAnalytics();
    costTracker.reset();
  });

  describe('generateReport', () => {
    it('should generate a daily report', () => {
      // Record some costs
      costTracker.recordCost('openai', 'gpt-4', 1000, 500, 'architect', 'planning');
      costTracker.recordCost('anthropic', 'claude-3-sonnet', 800, 400, 'coder', 'coding');

      const report = analytics.generateReport('daily');

      expect(report.period).toBe('daily');
      expect(report.totalCalls).toBe(2);
      expect(report.totalTokens).toBeGreaterThan(0);
      expect(report.byModel.size).toBe(2);
      expect(report.byAgent.size).toBe(2);
    });

    it('should aggregate by model correctly', () => {
      costTracker.recordCost('openai', 'gpt-4', 1000, 500, 'agent1', 'op1');
      costTracker.recordCost('openai', 'gpt-4', 500, 250, 'agent2', 'op2');

      const report = analytics.generateReport('daily');
      const gpt4Usage = report.byModel.get('openai/gpt-4');

      expect(gpt4Usage).toBeDefined();
      expect(gpt4Usage!.calls).toBe(2);
      expect(gpt4Usage!.inputTokens).toBe(1500);
      expect(gpt4Usage!.outputTokens).toBe(750);
    });
  });

  describe('alerts', () => {
    it('should create budget warning alert when threshold reached', () => {
      // Set a low budget
      costTracker.setBudget({ daily: 0.01 });

      // Record cost that exceeds threshold
      const cost = costTracker.recordCost('openai', 'gpt-4', 1000, 500, 'agent', 'op');
      analytics.recordUserUsage('user1', cost);

      const alerts = analytics.getAlerts();
      expect(
        alerts.some((a: UsageAlert) => a.type === 'budget_exceeded' || a.type === 'budget_warning')
      ).toBe(true);
    });

    it('should dismiss alerts', () => {
      costTracker.setBudget({ daily: 0.01 });
      const cost = costTracker.recordCost('openai', 'gpt-4', 1000, 500, 'agent', 'op');
      analytics.recordUserUsage('user1', cost);

      const alerts = analytics.getAlerts();
      if (alerts.length > 0) {
        const result = analytics.dismissAlert(alerts[0].id);
        expect(result).toBe(true);
        expect(analytics.getAlerts().length).toBe(alerts.length - 1);
      }
    });
  });

  describe('export', () => {
    it('should export data as JSON', () => {
      costTracker.recordCost('openai', 'gpt-4', 1000, 500, 'agent', 'op');

      const json = analytics.exportData({
        format: 'json',
        includeBreakdown: true,
        includeTrends: true,
      });
      const parsed = JSON.parse(json);

      expect(parsed.period).toBe('monthly');
      expect(parsed.summary).toBeDefined();
    });

    it('should export data as CSV', () => {
      costTracker.recordCost('openai', 'gpt-4', 1000, 500, 'agent', 'op');

      const csv = analytics.exportData({
        format: 'csv',
        includeBreakdown: true,
        includeTrends: true,
      });

      expect(csv).toContain('Type,Name,Cost,Tokens,Calls');
      expect(csv).toContain('model');
    });
  });
});

describe('ModelRouter', () => {
  let router: ModelRouter;

  beforeEach(() => {
    router = new ModelRouter();
  });

  describe('route', () => {
    it('should route simple tasks to cheaper models', () => {
      const context: TaskContext = {
        type: 'documentation',
        complexity: 'simple',
        estimatedTokens: 500,
        priority: 'normal',
      };

      const decision = router.route(context);

      expect(decision.selectedModel).toBeDefined();
      expect(decision.estimatedCost).toBeGreaterThan(0);
      expect(decision.reason).toBeDefined();
    });

    it('should route complex tasks to higher quality models', () => {
      const context: TaskContext = {
        type: 'architecture',
        complexity: 'complex',
        estimatedTokens: 5000,
        priority: 'high',
      };

      const decision = router.route(context);

      expect(decision.selectedModel.qualityScore).toBeGreaterThanOrEqual(85);
    });

    it('should respect max cost constraint', () => {
      const context: TaskContext = {
        type: 'documentation',
        complexity: 'simple',
        estimatedTokens: 500,
        priority: 'normal',
        maxCost: 0.05, // More realistic budget
      };

      const decision = router.route(context);

      expect(decision.estimatedCost).toBeLessThanOrEqual(0.05);
    });

    it('should respect preferred provider', () => {
      const context: TaskContext = {
        type: 'code-generation',
        complexity: 'medium',
        estimatedTokens: 1000,
        priority: 'normal',
        preferredProvider: 'anthropic',
      };

      const decision = router.route(context);

      expect(decision.selectedModel.provider).toBe('anthropic');
    });
  });

  describe('policy', () => {
    it('should update routing policy', () => {
      router.setPolicy({
        name: 'cost-optimized',
        costWeight: 0.8,
        qualityWeight: 0.1,
        latencyWeight: 0.1,
      });

      const context: TaskContext = {
        type: 'documentation',
        complexity: 'simple',
        estimatedTokens: 500,
        priority: 'normal',
      };

      const decision = router.route(context);

      // Cost-optimized should prefer cheaper models
      expect(decision.selectedModel.costPer1kInput).toBeLessThan(0.01);
    });
  });

  describe('complexity classification', () => {
    it('should classify simple tasks', () => {
      const complexity = router.classifyComplexity({ codeLines: 50, fileCount: 1 });
      expect(complexity).toBe('simple');
    });

    it('should classify medium tasks', () => {
      const complexity = router.classifyComplexity({
        codeLines: 200,
        fileCount: 3,
        hasTests: true,
      });
      expect(complexity).toBe('medium');
    });

    it('should classify complex tasks', () => {
      const complexity = router.classifyComplexity({
        codeLines: 1000,
        fileCount: 10,
        isRefactoring: true,
      });
      expect(complexity).toBe('complex');
    });
  });

  describe('token estimation', () => {
    it('should estimate tokens from input', () => {
      const input = 'This is a test input string for token estimation.';
      const tokens = router.estimateTokens(input);

      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(100);
    });
  });
});

describe('RBACManager', () => {
  let rbac: RBACManager;

  beforeEach(() => {
    rbac = new RBACManager();
  });

  describe('built-in roles', () => {
    it('should have Admin, Developer, Viewer roles', () => {
      const roles = rbac.getRoles();
      const roleNames = roles.map((r: Role) => r.name);

      expect(roleNames).toContain('Admin');
      expect(roleNames).toContain('Developer');
      expect(roleNames).toContain('Viewer');
    });

    it('should have correct Admin permissions', () => {
      const admin = rbac.getRole('role_admin');
      expect(admin).toBeDefined();
      expect(admin!.permissions).toContain('project:admin');
      expect(admin!.permissions).toContain('team:manage');
      expect(admin!.permissions).toContain('billing:manage');
    });
  });

  describe('role management', () => {
    it('should create custom role', () => {
      const role = rbac.createRole({
        name: 'Custom Editor',
        description: 'Can edit but not delete',
        permissions: ['project:read', 'project:write', 'issues:read', 'issues:write'],
      });

      expect(role.id).toBeDefined();
      expect(role.name).toBe('Custom Editor');
      expect(role.isBuiltIn).toBe(false);
    });

    it('should not allow updating built-in roles', () => {
      const result = rbac.updateRole('role_admin', { name: 'Super Admin' });
      expect(result).toBeNull();
    });

    it('should update custom roles', () => {
      const role = rbac.createRole({
        name: 'Test Role',
        description: 'Test',
        permissions: ['project:read'],
      });

      const updated = rbac.updateRole(role.id, {
        permissions: ['project:read', 'project:write'],
      });

      expect(updated).not.toBeNull();
      expect(updated!.permissions).toContain('project:write');
    });

    it('should delete custom roles', () => {
      const role = rbac.createRole({
        name: 'Temp Role',
        description: 'To be deleted',
        permissions: ['project:read'],
      });

      const result = rbac.deleteRole(role.id);
      expect(result).toBe(true);
      expect(rbac.getRole(role.id)).toBeUndefined();
    });
  });

  describe('role assignment', () => {
    it('should grant role to user', () => {
      const userRole = rbac.grantRole({
        userId: 'user1',
        roleId: 'role_developer',
        grantedBy: 'admin1',
      });

      expect(userRole).not.toBeNull();
      expect(userRole!.userId).toBe('user1');
      expect(userRole!.roleId).toBe('role_developer');
    });

    it('should revoke role from user', () => {
      rbac.grantRole({
        userId: 'user1',
        roleId: 'role_developer',
        grantedBy: 'admin1',
      });

      const result = rbac.revokeRole({
        userId: 'user1',
        roleId: 'role_developer',
        revokedBy: 'admin1',
      });

      expect(result).toBe(true);
      expect(rbac.getUserRoles('user1').length).toBe(0);
    });

    it('should handle project-scoped roles', () => {
      rbac.grantRole({
        userId: 'user1',
        roleId: 'role_admin',
        grantedBy: 'admin1',
        projectId: 'project1',
      });

      const projectRoles = rbac.getUserRoles('user1', 'project1');
      expect(projectRoles.length).toBe(1);

      const globalRoles = rbac.getUserRoles('user1');
      expect(globalRoles.length).toBe(0);
    });
  });

  describe('permission checks', () => {
    beforeEach(() => {
      rbac.grantRole({
        userId: 'dev1',
        roleId: 'role_developer',
        grantedBy: 'admin1',
      });

      rbac.grantRole({
        userId: 'viewer1',
        roleId: 'role_viewer',
        grantedBy: 'admin1',
      });
    });

    it('should allow permitted actions', () => {
      const check = rbac.hasPermission('dev1', 'project:write');
      expect(check.allowed).toBe(true);
    });

    it('should deny unpermitted actions', () => {
      const check = rbac.hasPermission('viewer1', 'project:write');
      expect(check.allowed).toBe(false);
      expect(check.missingPermissions).toContain('project:write');
    });

    it('should check multiple permissions', () => {
      const check = rbac.hasAllPermissions('dev1', ['project:read', 'project:write']);
      expect(check.allowed).toBe(true);

      const checkFail = rbac.hasAllPermissions('dev1', ['project:read', 'billing:manage']);
      expect(checkFail.allowed).toBe(false);
    });

    it('should check any permission', () => {
      const check = rbac.hasAnyPermission('viewer1', ['project:write', 'project:read']);
      expect(check.allowed).toBe(true); // Has project:read
    });
  });

  describe('audit log', () => {
    it('should log permission grants', () => {
      rbac.grantRole({
        userId: 'user1',
        roleId: 'role_developer',
        grantedBy: 'admin1',
      });

      const logs = rbac.getAuditLog({ action: 'grant' });
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].action).toBe('grant');
    });

    it('should log permission denials', () => {
      rbac.hasPermission('nobody', 'project:admin');

      const logs = rbac.getAuditLog({ action: 'deny' });
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should filter audit log by user', () => {
      rbac.grantRole({
        userId: 'user1',
        roleId: 'role_developer',
        grantedBy: 'admin1',
      });

      const logs = rbac.getAuditLog({ userId: 'admin1' });
      expect(
        logs.every((l: AuditEntry) => l.userId === 'admin1' || l.targetUserId === 'admin1')
      ).toBe(true);
    });
  });

  describe('middleware', () => {
    it('should create permission check middleware', () => {
      rbac.grantRole({
        userId: 'user1',
        roleId: 'role_developer',
        grantedBy: 'admin1',
      });

      const middleware = rbac.createMiddleware(['project:read', 'project:write']);

      const result = middleware('user1');
      expect(result.allowed).toBe(true);

      const resultFail = middleware('nobody');
      expect(resultFail.allowed).toBe(false);
    });
  });
});
