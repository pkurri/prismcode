import {
  SelfHealingRecovery,
  ErrorDiagnosis,
  ErrorCategory,
  HealingSession,
  diagnoseError,
  autoHeal,
} from '../../../src/advanced/self-healing';

describe('Self-Healing Error Recovery', () => {
  let recovery: SelfHealingRecovery;

  beforeEach(() => {
    recovery = new SelfHealingRecovery({ autoFixEnabled: true });
  });

  describe('Error Diagnosis', () => {
    it('should diagnose missing module errors', () => {
      const error = "Cannot find module 'lodash'";
      const diagnosis = recovery.diagnose(error);

      expect(diagnosis.category).toBe('dependency');
      expect(diagnosis.message).toContain('lodash');
      expect(diagnosis.isAutoFixable).toBe(true);
      expect(diagnosis.suggestedFixes.length).toBeGreaterThan(0);
      expect(diagnosis.suggestedFixes[0].command).toContain('npm install lodash');
    });

    it('should diagnose TypeScript errors', () => {
      const error = "TS2304: Cannot find name 'foo' at src/index.ts:10:5";
      const diagnosis = recovery.diagnose(error);

      expect(diagnosis.category).toBe('type');
      expect(diagnosis.file).toBe('src/index.ts');
      expect(diagnosis.line).toBe(10);
      expect(diagnosis.column).toBe(5);
    });

    it('should diagnose syntax errors', () => {
      const error = 'SyntaxError: Unexpected token at src/file.js:5:12';
      const diagnosis = recovery.diagnose(error);

      expect(diagnosis.category).toBe('syntax');
      expect(diagnosis.file).toBe('src/file.js');
      expect(diagnosis.line).toBe(5);
      expect(diagnosis.isAutoFixable).toBe(false);
    });

    it('should diagnose build failures', () => {
      const error = 'error: Build failed with 3 errors';
      const diagnosis = recovery.diagnose(error);

      expect(diagnosis.category).toBe('build');
      expect(diagnosis.suggestedFixes.some((f) => f.command?.includes('npm run clean'))).toBe(true);
    });

    it('should diagnose test failures', () => {
      const error = 'FAIL tests/unit/example.test.ts';
      const diagnosis = recovery.diagnose(error);

      expect(diagnosis.category).toBe('test');
      expect(diagnosis.file).toContain('example.test.ts');
    });

    it('should diagnose permission errors', () => {
      const error = 'Error: EACCES: permission denied, open /etc/hosts';
      const diagnosis = recovery.diagnose(error);

      expect(diagnosis.category).toBe('permission');
      expect(diagnosis.isAutoFixable).toBe(false);
    });

    it('should diagnose network errors', () => {
      const error = 'Error: connect ECONNREFUSED 127.0.0.1:3000';
      const diagnosis = recovery.diagnose(error);

      expect(diagnosis.category).toBe('network');
    });

    it('should return unknown for unrecognized errors', () => {
      const error = 'Some completely random error message that does not match any pattern';
      const diagnosis = recovery.diagnose(error);

      expect(diagnosis.category).toBe('unknown');
      expect(diagnosis.confidence).toBeLessThan(0.5);
    });

    it('should accept Error objects', () => {
      const error = new Error("Cannot find module 'express'");
      const diagnosis = recovery.diagnose(error);

      expect(diagnosis.category).toBe('dependency');
      expect(diagnosis.message).toContain('express');
    });
  });

  describe('Healing Sessions', () => {
    it('should start a healing session', () => {
      const session = recovery.startSession("Cannot find module 'axios'");

      expect(session.id).toBeDefined();
      expect(session.startTime).toBeInstanceOf(Date);
      expect(session.diagnosis.category).toBe('dependency');
      expect(session.resolved).toBe(false);
      expect(session.fixAttempts).toHaveLength(0);
    });

    it('should retrieve a session by ID', () => {
      const session = recovery.startSession('Test error');
      const retrieved = recovery.getSession(session.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(session.id);
    });

    it('should list all sessions', () => {
      recovery.startSession('Error 1');
      recovery.startSession('Error 2');

      const sessions = recovery.getAllSessions();
      expect(sessions.length).toBe(2);
    });

    it('should clear all sessions', () => {
      recovery.startSession('Error 1');
      recovery.startSession('Error 2');
      recovery.clearSessions();

      expect(recovery.getAllSessions().length).toBe(0);
    });
  });

  describe('Fix Application', () => {
    it('should apply a fix to a session', async () => {
      const session = recovery.startSession("Cannot find module 'react'");
      const result = recovery.applyFix(session.id, 0);

      expect(result.fix).toBeDefined();
      expect(result.appliedAt).toBeInstanceOf(Date);
    });

    it('should mark session as resolved on successful fix', async () => {
      const session = recovery.startSession("Cannot find module 'vue'");
      recovery.applyFix(session.id, 0);

      const updatedSession = recovery.getSession(session.id);
      expect(updatedSession?.resolved).toBe(true);
      expect(updatedSession?.endTime).toBeInstanceOf(Date);
    });

    it('should track fix attempts', async () => {
      const session = recovery.startSession("Cannot find module 'angular'");
      recovery.applyFix(session.id, 0);

      const updatedSession = recovery.getSession(session.id);
      expect(updatedSession?.fixAttempts.length).toBe(1);
    });

    it('should throw for invalid session ID', () => {
      expect(() => recovery.applyFix('invalid-id', 0)).toThrow('Session not found');
    });

    it('should throw for invalid fix index', () => {
      const session = recovery.startSession("Cannot find module 'test'");
      expect(() => recovery.applyFix(session.id, 99)).toThrow('Fix not found');
    });
  });

  describe('Auto-Healing', () => {
    it('should auto-heal when enabled', () => {
      const session = recovery.autoHeal("Cannot find module 'moment'");

      expect(session.diagnosis.category).toBe('dependency');
      expect(session.fixAttempts.length).toBeGreaterThan(0);
    });

    it('should not auto-apply when disabled', () => {
      recovery.setAutoFixEnabled(false);
      const session = recovery.autoHeal("Cannot find module 'dayjs'");

      expect(session.fixAttempts.length).toBe(0);
      expect(session.resolved).toBe(false);
    });

    it('should toggle auto-fix setting', () => {
      expect(recovery.isAutoFixEnabled()).toBe(true);
      recovery.setAutoFixEnabled(false);
      expect(recovery.isAutoFixEnabled()).toBe(false);
      recovery.setAutoFixEnabled(true);
      expect(recovery.isAutoFixEnabled()).toBe(true);
    });
  });

  describe('Helper Functions', () => {
    it('diagnoseError should work standalone', () => {
      const diagnosis = diagnoseError("Cannot find module 'uuid'");
      expect(diagnosis.category).toBe('dependency');
    });

    it('autoHeal should work standalone', () => {
      const session = autoHeal("Cannot find module 'crypto-js'");
      expect(session.diagnosis).toBeDefined();
    });
  });

  describe('Confidence Scores', () => {
    it('should have high confidence for clear patterns', () => {
      const diagnosis = recovery.diagnose("Cannot find module 'known-package'");
      expect(diagnosis.confidence).toBeGreaterThan(0.8);
    });

    it('should have low confidence for unknown errors', () => {
      const diagnosis = recovery.diagnose('Weird obscure error nobody has seen');
      expect(diagnosis.confidence).toBeLessThan(0.5);
    });
  });

  describe('Fix Priorities', () => {
    it('should order fixes by priority', () => {
      const diagnosis = recovery.diagnose("Cannot find module 'test-pkg'");
      const highPriorityFix = diagnosis.suggestedFixes.find((f) => f.priority === 'high');

      expect(highPriorityFix).toBeDefined();
      expect(diagnosis.suggestedFixes[0].priority).toBe('high');
    });

    it('should include auto-apply flag', () => {
      const diagnosis = recovery.diagnose("Cannot find module 'package'");
      const autoApplyFix = diagnosis.suggestedFixes.find((f) => f.autoApply);

      expect(autoApplyFix).toBeDefined();
    });
  });
});
