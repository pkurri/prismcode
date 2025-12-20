/**
 * Comprehensive Audit Logging
 * Issue #209: Comprehensive Audit Logging
 *
 * Immutable audit trails for compliance
 */

import logger from '../utils/logger';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  context: AuditContext;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'permission_grant'
  | 'permission_revoke'
  | 'config_change'
  | 'agent_execute'
  | 'pr_create'
  | 'pr_merge'
  | 'deploy';

export interface AuditContext {
  projectId?: string;
  agentName?: string;
  operationType?: string;
  previousValue?: unknown;
  newValue?: unknown;
}

export interface AuditQuery {
  userId?: string;
  action?: AuditAction;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditExport {
  format: 'json' | 'csv' | 'siem';
  events: AuditEvent[];
  exportedAt: Date;
  query: AuditQuery;
}

/**
 * Audit Logger for Compliance
 * Provides immutable, searchable audit trails
 */
export class ComplianceAuditLogger {
  private events: AuditEvent[] = [];
  private retentionYears: number = 7;
  private maxEvents: number = 100000;

  constructor() {
    logger.info('ComplianceAuditLogger initialized');
  }

  /**
   * Log an audit event
   */
  log(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const auditEvent: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event,
    };

    this.events.push(auditEvent);
    this.enforceRetention();

    logger.debug('Audit event logged', { 
      action: event.action, 
      resource: event.resource,
      userId: event.userId,
    });

    return auditEvent;
  }

  /**
   * Log user action
   */
  logUserAction(
    userId: string,
    action: AuditAction,
    resource: string,
    resourceId?: string,
    metadata: Record<string, unknown> = {}
  ): AuditEvent {
    return this.log({
      userId,
      action,
      resource,
      resourceId,
      context: {},
      metadata,
    });
  }

  /**
   * Log config change
   */
  logConfigChange(
    userId: string,
    configKey: string,
    previousValue: unknown,
    newValue: unknown
  ): AuditEvent {
    return this.log({
      userId,
      action: 'config_change',
      resource: 'config',
      resourceId: configKey,
      context: {
        previousValue,
        newValue,
      },
      metadata: { configKey },
    });
  }

  /**
   * Log agent execution
   */
  logAgentExecution(
    userId: string,
    agentName: string,
    operationType: string,
    metadata: Record<string, unknown> = {}
  ): AuditEvent {
    return this.log({
      userId,
      action: 'agent_execute',
      resource: 'agent',
      resourceId: agentName,
      context: {
        agentName,
        operationType,
      },
      metadata,
    });
  }

  /**
   * Query audit events
   */
  query(query: AuditQuery): AuditEvent[] {
    let results = [...this.events];

    if (query.userId) {
      results = results.filter(e => e.userId === query.userId);
    }
    if (query.action) {
      results = results.filter(e => e.action === query.action);
    }
    if (query.resource) {
      results = results.filter(e => e.resource === query.resource);
    }
    if (query.startDate) {
      results = results.filter(e => e.timestamp >= query.startDate!);
    }
    if (query.endDate) {
      results = results.filter(e => e.timestamp <= query.endDate!);
    }

    // Sort by timestamp descending
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    return results.slice(offset, offset + limit);
  }

  /**
   * Search audit events
   */
  search(searchTerm: string, limit: number = 50): AuditEvent[] {
    const term = searchTerm.toLowerCase();
    return this.events
      .filter(e => 
        e.userId.toLowerCase().includes(term) ||
        e.resource.toLowerCase().includes(term) ||
        e.action.toLowerCase().includes(term) ||
        JSON.stringify(e.metadata).toLowerCase().includes(term)
      )
      .slice(0, limit);
  }

  /**
   * Export audit events
   */
  export(query: AuditQuery, format: 'json' | 'csv' | 'siem' = 'json'): AuditExport {
    const events = this.query(query);

    const exportData: AuditExport = {
      format,
      events,
      exportedAt: new Date(),
      query,
    };

    logger.info('Audit events exported', { 
      format, 
      count: events.length,
    });

    return exportData;
  }

  /**
   * Export as CSV string
   */
  exportToCsv(query: AuditQuery): string {
    const events = this.query(query);
    const lines: string[] = ['id,timestamp,userId,action,resource,resourceId'];

    for (const event of events) {
      lines.push(
        `${event.id},${event.timestamp.toISOString()},${event.userId},${event.action},${event.resource},${event.resourceId || ''}`
      );
    }

    return lines.join('\n');
  }

  /**
   * Export to SIEM format (CEF)
   */
  exportToSiem(query: AuditQuery): string[] {
    const events = this.query(query);
    return events.map(e => 
      `CEF:0|PrismCode|Audit|1.0|${e.action}|${e.resource}|5|userId=${e.userId} resourceId=${e.resourceId || 'none'} timestamp=${e.timestamp.toISOString()}`
    );
  }

  /**
   * Get event count
   */
  getEventCount(): number {
    return this.events.length;
  }

  /**
   * Get retention policy
   */
  getRetentionPolicy(): { years: number; maxEvents: number } {
    return {
      years: this.retentionYears,
      maxEvents: this.maxEvents,
    };
  }

  /**
   * Set retention policy
   */
  setRetentionYears(years: number): void {
    this.retentionYears = years;
    this.enforceRetention();
    logger.info('Retention policy updated', { years });
  }

  // Private helpers
  private enforceRetention(): void {
    // Enforce max events limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Enforce time-based retention
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - this.retentionYears);
    this.events = this.events.filter(e => e.timestamp >= cutoffDate);
  }

  /**
   * Reset logger
   */
  reset(): void {
    this.events = [];
    logger.info('ComplianceAuditLogger reset');
  }
}

export const complianceAuditLogger = new ComplianceAuditLogger();
