/**
 * Role-Based Access Control (RBAC)
 * Issue #218: RBAC Implementation
 *
 * Manage roles, permissions, and authorization for teams
 */

import logger from '../utils/logger';
import { randomBytes } from 'crypto';

export type Permission =
  | 'project:read'
  | 'project:write'
  | 'project:delete'
  | 'project:admin'
  | 'agent:execute'
  | 'agent:configure'
  | 'issues:read'
  | 'issues:write'
  | 'issues:assign'
  | 'team:read'
  | 'team:invite'
  | 'team:manage'
  | 'billing:read'
  | 'billing:manage'
  | 'settings:read'
  | 'settings:write'
  | 'audit:read';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isBuiltIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  userId: string;
  roleId: string;
  projectId?: string; // Optional: role scoped to project
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

export interface PermissionCheck {
  allowed: boolean;
  reason: string;
  missingPermissions?: Permission[];
}

export interface AuditEntry {
  id: string;
  action: 'grant' | 'revoke' | 'check' | 'deny';
  userId: string;
  targetUserId?: string;
  roleId?: string;
  permission?: Permission;
  projectId?: string;
  reason: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Built-in roles
const BUILT_IN_ROLES: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Admin',
    description: 'Full access to all features and settings',
    permissions: [
      'project:read',
      'project:write',
      'project:delete',
      'project:admin',
      'agent:execute',
      'agent:configure',
      'issues:read',
      'issues:write',
      'issues:assign',
      'team:read',
      'team:invite',
      'team:manage',
      'billing:read',
      'billing:manage',
      'settings:read',
      'settings:write',
      'audit:read',
    ],
    isBuiltIn: true,
  },
  {
    name: 'Developer',
    description: 'Full development access, limited admin',
    permissions: [
      'project:read',
      'project:write',
      'agent:execute',
      'agent:configure',
      'issues:read',
      'issues:write',
      'issues:assign',
      'team:read',
      'settings:read',
    ],
    isBuiltIn: true,
  },
  {
    name: 'Viewer',
    description: 'Read-only access to projects and issues',
    permissions: ['project:read', 'issues:read', 'team:read'],
    isBuiltIn: true,
  },
  {
    name: 'Billing Admin',
    description: 'Manage billing and view usage',
    permissions: ['project:read', 'billing:read', 'billing:manage', 'settings:read'],
    isBuiltIn: true,
  },
];

/**
 * RBAC Manager
 * Handles role-based access control
 */
export class RBACManager {
  private roles: Map<string, Role> = new Map();
  private userRoles: Map<string, UserRole[]> = new Map();
  private auditLog: AuditEntry[] = [];

  constructor() {
    this.initializeBuiltInRoles();
    logger.info('RBACManager initialized', { rolesCount: this.roles.size });
  }

  /**
   * Initialize built-in roles
   */
  private initializeBuiltInRoles(): void {
    const now = new Date();
    for (const roleConfig of BUILT_IN_ROLES) {
      const role: Role = {
        id: `role_${roleConfig.name.toLowerCase()}`,
        ...roleConfig,
        createdAt: now,
        updatedAt: now,
      };
      this.roles.set(role.id, role);
    }
  }

  /**
   * Create a custom role
   */
  createRole(config: { name: string; description: string; permissions: Permission[] }): Role {
    const id = `role_${randomBytes(8).toString('hex')}`;
    const now = new Date();

    const role: Role = {
      id,
      name: config.name,
      description: config.description,
      permissions: [...config.permissions],
      isBuiltIn: false,
      createdAt: now,
      updatedAt: now,
    };

    this.roles.set(id, role);
    logger.info('Custom role created', { id, name: config.name });

    return role;
  }

  /**
   * Update a role (custom roles only)
   */
  updateRole(
    roleId: string,
    updates: Partial<Pick<Role, 'name' | 'description' | 'permissions'>>
  ): Role | null {
    const role = this.roles.get(roleId);
    if (!role || role.isBuiltIn) {
      logger.warn('Cannot update role', { roleId, isBuiltIn: role?.isBuiltIn });
      return null;
    }

    if (updates.name) role.name = updates.name;
    if (updates.description) role.description = updates.description;
    if (updates.permissions) role.permissions = [...updates.permissions];
    role.updatedAt = new Date();

    logger.info('Role updated', { roleId, updates: Object.keys(updates) });
    return role;
  }

  /**
   * Delete a custom role
   */
  deleteRole(roleId: string): boolean {
    const role = this.roles.get(roleId);
    if (!role || role.isBuiltIn) {
      return false;
    }

    // Remove all user assignments for this role
    for (const [userId, roles] of this.userRoles) {
      this.userRoles.set(
        userId,
        roles.filter((r) => r.roleId !== roleId)
      );
    }

    this.roles.delete(roleId);
    logger.info('Role deleted', { roleId });
    return true;
  }

  /**
   * Grant a role to a user
   */
  grantRole(params: {
    userId: string;
    roleId: string;
    grantedBy: string;
    projectId?: string;
    expiresAt?: Date;
  }): UserRole | null {
    const role = this.roles.get(params.roleId);
    if (!role) {
      logger.warn('Role not found for grant', { roleId: params.roleId });
      return null;
    }

    const userRole: UserRole = {
      userId: params.userId,
      roleId: params.roleId,
      projectId: params.projectId,
      grantedBy: params.grantedBy,
      grantedAt: new Date(),
      expiresAt: params.expiresAt,
    };

    const userRoles = this.userRoles.get(params.userId) || [];

    // Check for duplicate
    const existing = userRoles.find(
      (r) => r.roleId === params.roleId && r.projectId === params.projectId
    );
    if (existing) {
      logger.warn('Role already granted', { userId: params.userId, roleId: params.roleId });
      return existing;
    }

    userRoles.push(userRole);
    this.userRoles.set(params.userId, userRoles);

    this.logAudit({
      action: 'grant',
      userId: params.grantedBy,
      targetUserId: params.userId,
      roleId: params.roleId,
      projectId: params.projectId,
      reason: `Role ${role.name} granted`,
    });

    logger.info('Role granted', {
      userId: params.userId,
      roleId: params.roleId,
      roleName: role.name,
    });

    return userRole;
  }

  /**
   * Revoke a role from a user
   */
  revokeRole(params: {
    userId: string;
    roleId: string;
    revokedBy: string;
    projectId?: string;
  }): boolean {
    const userRoles = this.userRoles.get(params.userId);
    if (!userRoles) return false;

    const index = userRoles.findIndex(
      (r) => r.roleId === params.roleId && r.projectId === params.projectId
    );

    if (index < 0) return false;

    userRoles.splice(index, 1);
    this.userRoles.set(params.userId, userRoles);

    this.logAudit({
      action: 'revoke',
      userId: params.revokedBy,
      targetUserId: params.userId,
      roleId: params.roleId,
      projectId: params.projectId,
      reason: 'Role revoked',
    });

    logger.info('Role revoked', {
      userId: params.userId,
      roleId: params.roleId,
    });

    return true;
  }

  /**
   * Check if user has permission
   */
  hasPermission(userId: string, permission: Permission, projectId?: string): PermissionCheck {
    const userRoles = this.getUserRoles(userId, projectId);

    if (userRoles.length === 0) {
      this.logAudit({
        action: 'deny',
        userId,
        permission,
        projectId,
        reason: 'No roles assigned',
      });
      return { allowed: false, reason: 'No roles assigned' };
    }

    // Collect all permissions from user's roles
    const allPermissions = new Set<Permission>();
    for (const userRole of userRoles) {
      const role = this.roles.get(userRole.roleId);
      if (role) {
        for (const perm of role.permissions) {
          allPermissions.add(perm);
        }
      }
    }

    if (allPermissions.has(permission)) {
      this.logAudit({
        action: 'check',
        userId,
        permission,
        projectId,
        reason: 'Permission granted',
      });
      return { allowed: true, reason: 'Permission granted' };
    }

    this.logAudit({
      action: 'deny',
      userId,
      permission,
      projectId,
      reason: 'Missing permission',
    });

    return {
      allowed: false,
      reason: 'Missing permission',
      missingPermissions: [permission],
    };
  }

  /**
   * Check multiple permissions
   */
  hasAllPermissions(
    userId: string,
    permissions: Permission[],
    projectId?: string
  ): PermissionCheck {
    const missing: Permission[] = [];

    for (const permission of permissions) {
      const check = this.hasPermission(userId, permission, projectId);
      if (!check.allowed) {
        missing.push(permission);
      }
    }

    if (missing.length === 0) {
      return { allowed: true, reason: 'All permissions granted' };
    }

    return {
      allowed: false,
      reason: `Missing ${missing.length} permission(s)`,
      missingPermissions: missing,
    };
  }

  /**
   * Check if user has any of the permissions
   */
  hasAnyPermission(userId: string, permissions: Permission[], projectId?: string): PermissionCheck {
    for (const permission of permissions) {
      const check = this.hasPermission(userId, permission, projectId);
      if (check.allowed) {
        return check;
      }
    }

    return {
      allowed: false,
      reason: 'No matching permissions',
      missingPermissions: permissions,
    };
  }

  /**
   * Get user's effective roles
   */
  getUserRoles(userId: string, projectId?: string): UserRole[] {
    const allRoles = this.userRoles.get(userId) || [];
    const now = new Date();

    return allRoles.filter((role) => {
      // Check expiration
      if (role.expiresAt && role.expiresAt < now) {
        return false;
      }

      // Check project scope
      if (projectId) {
        // Include global roles and project-specific roles
        return !role.projectId || role.projectId === projectId;
      }

      // Return only global roles if no project specified
      return !role.projectId;
    });
  }

  /**
   * Get all permissions for a user
   */
  getUserPermissions(userId: string, projectId?: string): Permission[] {
    const userRoles = this.getUserRoles(userId, projectId);
    const permissions = new Set<Permission>();

    for (const userRole of userRoles) {
      const role = this.roles.get(userRole.roleId);
      if (role) {
        for (const perm of role.permissions) {
          permissions.add(perm);
        }
      }
    }

    return Array.from(permissions);
  }

  /**
   * Get all roles
   */
  getRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * Get role by ID
   */
  getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  /**
   * Get audit log
   */
  getAuditLog(options?: {
    userId?: string;
    action?: AuditEntry['action'];
    limit?: number;
  }): AuditEntry[] {
    let entries = [...this.auditLog];

    if (options?.userId) {
      entries = entries.filter(
        (e) => e.userId === options.userId || e.targetUserId === options.userId
      );
    }

    if (options?.action) {
      entries = entries.filter((e) => e.action === options.action);
    }

    // Sort by timestamp descending
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (options?.limit) {
      entries = entries.slice(0, options.limit);
    }

    return entries;
  }

  /**
   * Create permission check middleware
   */
  createMiddleware(requiredPermissions: Permission | Permission[]) {
    const permissions = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    return (userId: string, projectId?: string): PermissionCheck => {
      return this.hasAllPermissions(userId, permissions, projectId);
    };
  }

  // Private helpers

  private logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void {
    this.auditLog.push({
      id: `audit_${Date.now()}_${randomBytes(4).toString('hex')}`,
      ...entry,
      timestamp: new Date(),
    });

    // Keep only last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.roles.clear();
    this.userRoles.clear();
    this.auditLog = [];
    this.initializeBuiltInRoles();
    logger.info('RBACManager reset');
  }
}

export const rbacManager = new RBACManager();
