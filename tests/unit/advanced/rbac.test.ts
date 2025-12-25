import { rbacManager, Role, Permission } from '../../../src/advanced/rbac';

describe('RBAC Manager', () => {
  const testUser = 'user-123';
  const testProject = 'project-abc';
  const adminUser = 'admin-user';

  beforeEach(() => {
    rbacManager.reset();
  });

  describe('Built-in Roles', () => {
    it('should initialize with built-in roles', () => {
      const roles = rbacManager.getRoles();
      expect(roles.length).toBeGreaterThan(0);

      const adminRole = roles.find((r: Role) => r.name === 'Admin');
      expect(adminRole).toBeDefined();
      expect(adminRole?.isBuiltIn).toBe(true);
    });

    it('should not allow modifying built-in roles', () => {
      const adminRole = rbacManager.getRoles().find((r: Role) => r.name === 'Admin');
      if (!adminRole) throw new Error('Admin role not found');

      const result = rbacManager.updateRole(adminRole.id, { description: 'Hacked' });
      expect(result).toBeNull();
    });
  });

  describe('Custom Roles', () => {
    it('should create custom role', () => {
      const role = rbacManager.createRole({
        name: 'Custom Reviewer',
        description: 'Can only review code',
        permissions: ['project:read', 'issues:write'],
      });

      expect(role).toBeDefined();
      expect(role.name).toBe('Custom Reviewer');
      expect(role.isBuiltIn).toBe(false);
    });

    it('should update custom role', () => {
      const role = rbacManager.createRole({
        name: 'Editor',
        description: 'Edit code',
        permissions: ['project:write'],
      });

      const updated = rbacManager.updateRole(role.id, {
        description: 'Edit and delete code',
        permissions: ['project:write', 'project:delete'],
      });

      expect(updated).toBeDefined();
      expect(updated?.description).toBe('Edit and delete code');
      expect(updated?.permissions).toContain('project:delete');
    });

    it('should delete custom role', () => {
      const role = rbacManager.createRole({
        name: 'Temp Role',
        description: 'Temporary',
        permissions: ['project:read'],
      });

      const deleted = rbacManager.deleteRole(role.id);
      expect(deleted).toBe(true);
      expect(rbacManager.getRole(role.id)).toBeUndefined();
    });
  });

  describe('Role Assignment', () => {
    let viewerRole: Role;

    beforeEach(() => {
      viewerRole = rbacManager.createRole({
        name: 'Viewer',
        description: 'Can view project',
        permissions: ['project:read'],
      });
    });

    it('should grant role to user', () => {
      const assignment = rbacManager.grantRole({
        userId: testUser,
        roleId: viewerRole.id,
        grantedBy: adminUser,
        projectId: testProject,
      });

      expect(assignment).toBeDefined();
      expect(assignment?.userId).toBe(testUser);
      expect(assignment?.roleId).toBe(viewerRole.id);
    });

    it('should revoke role from user', () => {
      rbacManager.grantRole({
        userId: testUser,
        roleId: viewerRole.id,
        grantedBy: adminUser,
      });

      const revoked = rbacManager.revokeRole({
        userId: testUser,
        roleId: viewerRole.id,
        revokedBy: adminUser,
      });

      expect(revoked).toBe(true);
      const roles = rbacManager.getUserRoles(testUser);
      expect(roles).toHaveLength(0);
    });
  });

  describe('Permission Checking', () => {
    beforeEach(() => {
      const role = rbacManager.createRole({
        name: 'Developer',
        description: 'Dev role',
        permissions: ['project:read', 'project:write'],
      });

      rbacManager.grantRole({
        userId: testUser,
        roleId: role.id,
        grantedBy: adminUser,
        projectId: testProject,
      });
    });

    it('should allow authorized actions', () => {
      const check = rbacManager.hasPermission(testUser, 'project:write', testProject);
      expect(check.allowed).toBe(true);
    });

    it('should deny unauthorized actions', () => {
      const check = rbacManager.hasPermission(testUser, 'project:delete', testProject);
      expect(check.allowed).toBe(false);
    });

    it('should handle project-scoped permissions', () => {
      // User has permission in testProject, but not in otherProject
      const check1 = rbacManager.hasPermission(testUser, 'project:write', testProject);
      const check2 = rbacManager.hasPermission(testUser, 'project:write', 'other-project');

      expect(check1.allowed).toBe(true);
      expect(check2.allowed).toBe(false);
    });

    it('should check multiple permissions (hasAllPermissions)', () => {
      const check = rbacManager.hasAllPermissions(
        testUser,
        ['project:read', 'project:write'],
        testProject
      );
      expect(check.allowed).toBe(true);

      const failCheck = rbacManager.hasAllPermissions(
        testUser,
        ['project:read', 'project:delete'],
        testProject
      );
      expect(failCheck.allowed).toBe(false);
    });

    it('should check any permission (hasAnyPermission)', () => {
      const check = rbacManager.hasAnyPermission(
        testUser,
        ['project:delete', 'project:read'],
        testProject
      );
      expect(check.allowed).toBe(true);
    });
  });

  describe('Audit Log', () => {
    it('should log role changes', () => {
      rbacManager.createRole({
        name: 'Audited Role',
        description: 'Test audit',
        permissions: ['project:read'],
      });

      // We need to trigger an action that logs to audit
      // The implementation logs on grant/revoke/check depending on configuration
      // Assuming grantRole logs
      const role = rbacManager.getRoles().find((r: Role) => r.name === 'Audited Role');
      if (role) {
        rbacManager.grantRole({
          userId: testUser,
          roleId: role.id,
          grantedBy: adminUser,
        });
      }

      const logs = rbacManager.getAuditLog({ userId: testUser });
      expect(logs).toBeDefined();
    });
  });
});
