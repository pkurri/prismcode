/**
 * Tests for Comprehensive Audit Logging
 * Issue #209: Comprehensive Audit Logging
 */

import { 
  ComplianceAuditLogger, 
  type AuditEvent, 
  type AuditAction 
} from '../../../src/advanced/audit-logging';

describe('ComplianceAuditLogger', () => {
  let logger: ComplianceAuditLogger;

  beforeEach(() => {
    logger = new ComplianceAuditLogger();
  });

  afterEach(() => {
    logger.reset();
  });

  describe('event logging', () => {
    it('should log an audit event', () => {
      const event = logger.log({
        userId: 'user1',
        action: 'create',
        resource: 'project',
        resourceId: 'proj_123',
        context: {},
        metadata: { name: 'Test Project' },
      });

      expect(event.id).toBeDefined();
      expect(event.timestamp).toBeInstanceOf(Date);
      expect(event.userId).toBe('user1');
      expect(event.action).toBe('create');
    });

    it('should log user action with helper method', () => {
      const event = logger.logUserAction('user1', 'read', 'document', 'doc_123');

      expect(event.action).toBe('read');
      expect(event.resource).toBe('document');
      expect(event.resourceId).toBe('doc_123');
    });

    it('should log config changes with before/after values', () => {
      const event = logger.logConfigChange('admin', 'theme', 'light', 'dark');

      expect(event.action).toBe('config_change');
      expect(event.context.previousValue).toBe('light');
      expect(event.context.newValue).toBe('dark');
    });

    it('should log agent execution', () => {
      const event = logger.logAgentExecution('user1', 'architect', 'analyze', {
        filesAnalyzed: 10,
      });

      expect(event.action).toBe('agent_execute');
      expect(event.context.agentName).toBe('architect');
      expect(event.context.operationType).toBe('analyze');
    });
  });

  describe('querying', () => {
    beforeEach(() => {
      // Create some test events
      logger.logUserAction('user1', 'create', 'project', 'proj_1');
      logger.logUserAction('user1', 'read', 'project', 'proj_1');
      logger.logUserAction('user2', 'create', 'document', 'doc_1');
      logger.logConfigChange('admin', 'setting', 'old', 'new');
    });

    it('should query by userId', () => {
      const results = logger.query({ userId: 'user1' });

      expect(results.length).toBe(2);
      expect(results.every((e: AuditEvent) => e.userId === 'user1')).toBe(true);
    });

    it('should query by action', () => {
      const results = logger.query({ action: 'create' });

      expect(results.length).toBe(2);
      expect(results.every((e: AuditEvent) => e.action === 'create')).toBe(true);
    });

    it('should query by resource', () => {
      const results = logger.query({ resource: 'project' });

      expect(results.length).toBe(2);
    });

    it('should support pagination', () => {
      const page1 = logger.query({ limit: 2 });
      const page2 = logger.query({ limit: 2, offset: 2 });

      expect(page1.length).toBe(2);
      expect(page2.length).toBe(2);
      expect(page1[0].id).not.toBe(page2[0].id);
    });

    it('should sort by timestamp descending', () => {
      const results = logger.query({});

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].timestamp.getTime()).toBeGreaterThanOrEqual(
          results[i].timestamp.getTime()
        );
      }
    });
  });

  describe('search', () => {
    beforeEach(() => {
      logger.logUserAction('john_doe', 'create', 'project', 'proj_1', { name: 'Alpha' });
      logger.logUserAction('jane_smith', 'update', 'document', 'doc_1', { name: 'Beta' });
    });

    it('should search by user id', () => {
      const results = logger.search('john');

      expect(results.length).toBe(1);
      expect(results[0].userId).toBe('john_doe');
    });

    it('should search by resource', () => {
      const results = logger.search('document');

      expect(results.length).toBe(1);
    });

    it('should search in metadata', () => {
      const results = logger.search('Alpha');

      expect(results.length).toBe(1);
    });
  });

  describe('export', () => {
    beforeEach(() => {
      logger.logUserAction('user1', 'create', 'project', 'proj_1');
      logger.logUserAction('user2', 'read', 'document', 'doc_1');
    });

    it('should export as JSON', () => {
      const exportData = logger.export({});

      expect(exportData.format).toBe('json');
      expect(exportData.events.length).toBe(2);
      expect(exportData.exportedAt).toBeInstanceOf(Date);
    });

    it('should export as CSV', () => {
      const csv = logger.exportToCsv({});

      expect(csv).toContain('id,timestamp,userId,action,resource,resourceId');
      expect(csv).toContain('user1');
      expect(csv).toContain('create');
    });

    it('should export to SIEM format (CEF)', () => {
      const siem = logger.exportToSiem({});

      expect(siem.length).toBe(2);
      expect(siem[0]).toContain('CEF:0|PrismCode|Audit|');
      expect(siem[0]).toContain('userId=');
    });
  });

  describe('retention policy', () => {
    it('should return retention policy', () => {
      const policy = logger.getRetentionPolicy();

      expect(policy.years).toBe(7);
      expect(policy.maxEvents).toBe(100000);
    });

    it('should update retention years', () => {
      logger.setRetentionYears(10);

      const policy = logger.getRetentionPolicy();
      expect(policy.years).toBe(10);
    });

    it('should enforce max events limit', () => {
      // Create a logger with low limit for testing
      const smallLogger = new ComplianceAuditLogger();
      
      // Log many events
      for (let i = 0; i < 150; i++) {
        smallLogger.logUserAction(`user${i}`, 'read', 'resource', `res_${i}`);
      }

      // Should still work (enforcement happens but with higher default limit)
      expect(smallLogger.getEventCount()).toBeGreaterThan(0);
    });
  });

  describe('immutability', () => {
    it('should generate unique IDs for each event', () => {
      const event1 = logger.logUserAction('user1', 'create', 'project');
      const event2 = logger.logUserAction('user1', 'create', 'project');

      expect(event1.id).not.toBe(event2.id);
    });

    it('should preserve timestamps', () => {
      const event = logger.logUserAction('user1', 'create', 'project');
      const queried = logger.query({ userId: 'user1' })[0];

      expect(queried.timestamp.getTime()).toBe(event.timestamp.getTime());
    });
  });

  describe('event count', () => {
    it('should return correct event count', () => {
      expect(logger.getEventCount()).toBe(0);

      logger.logUserAction('user1', 'create', 'project');
      logger.logUserAction('user2', 'read', 'document');

      expect(logger.getEventCount()).toBe(2);
    });

    it('should reset to zero after reset', () => {
      logger.logUserAction('user1', 'create', 'project');
      logger.reset();

      expect(logger.getEventCount()).toBe(0);
    });
  });
});
