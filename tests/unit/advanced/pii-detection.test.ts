/**
 * Tests for PII Detection & Redaction
 * Issue #210: PII Detection & Redaction Agent
 */

import { PIIDetector, type PIIMatch, type ScanResult, type PIIType } from '../../../src/advanced/pii-detection';

describe('PIIDetector', () => {
  let detector: PIIDetector;

  beforeEach(() => {
    detector = new PIIDetector();
  });

  afterEach(() => {
    detector.reset();
  });

  describe('email detection', () => {
    it('should detect email addresses', () => {
      const result = detector.scan('Contact us at test@example.com for help');
      
      expect(result.piiFound).toBe(1);
      expect(result.matches[0].type).toBe('email');
      expect(result.matches[0].value).toBe('test@example.com');
    });

    it('should detect multiple emails', () => {
      const result = detector.scan('Email john@test.com or jane@company.org');
      
      expect(result.piiFound).toBe(2);
      expect(result.matches.every((m: PIIMatch) => m.type === 'email')).toBe(true);
    });

    it('should redact emails properly', () => {
      const result = detector.scan('Contact test@example.com', { redact: true });
      
      expect(result.redactedText).toBe('Contact t***@example.com');
    });
  });

  describe('phone number detection', () => {
    it('should detect US phone numbers', () => {
      const result = detector.scan('Call me at 555-123-4567');
      
      expect(result.piiFound).toBe(1);
      expect(result.matches[0].type).toBe('phone');
    });

    it('should detect phone numbers with different formats', () => {
      const texts = [
        '(555) 123-4567',
        '555.123.4567',
        '+1 555-123-4567',
      ];
      
      for (const text of texts) {
        const result = detector.scan(text);
        expect(result.piiFound).toBeGreaterThan(0);
      }
    });

    it('should redact phone numbers', () => {
      const result = detector.scan('Call 555-123-4567', { redact: true });
      
      // Phone redaction preserves last 4 digits
      expect(result.redactedText).toContain('4567');
      expect(result.piiFound).toBe(1);
    });
  });

  describe('SSN detection', () => {
    it('should detect SSN format', () => {
      const result = detector.scan('SSN: 123-45-6789');
      
      expect(result.piiFound).toBe(1);
      expect(result.matches[0].type).toBe('ssn');
    });

    it('should detect SSN without dashes', () => {
      const result = detector.scan('SSN: 123 45 6789');
      
      expect(result.piiFound).toBe(1);
    });

    it('should redact SSN showing only last 4', () => {
      const result = detector.scan('SSN: 123-45-6789', { redact: true });
      
      expect(result.redactedText).toContain('***-**-6789');
    });
  });

  describe('credit card detection', () => {
    it('should detect credit card numbers', () => {
      const result = detector.scan('Card: 4111-1111-1111-1111');
      
      expect(result.piiFound).toBe(1);
      expect(result.matches[0].type).toBe('credit_card');
    });

    it('should detect cards with spaces', () => {
      const result = detector.scan('Card: 4111 1111 1111 1111');
      
      expect(result.piiFound).toBe(1);
    });

    it('should redact credit card showing only last 4', () => {
      const result = detector.scan('Card: 4111-1111-1111-1111', { redact: true });
      
      expect(result.redactedText).toContain('**** **** **** 1111');
    });
  });

  describe('API key detection', () => {
    it('should detect API keys with sk_ prefix', () => {
      // API key regex: (?:sk|pk)[-_][a-zA-Z0-9]{20,}
      // Requires 20+ alphanumeric chars directly after sk_ or pk_
      const result = detector.scan('API Key: sk_abcdefghijklmnopqrstuv');
      
      expect(result.piiFound).toBe(1);
      expect(result.matches[0].type).toBe('api_key');
    });

    it('should detect API keys with pk_ prefix', () => {
      const result = detector.scan('Public key: pk_abcdefghijklmnopqrstuv');
      
      expect(result.piiFound).toBe(1);
      expect(result.matches[0].type).toBe('api_key');
    });

    it('should redact API keys', () => {
      const result = detector.scan('Key: sk_abcdefghijklmnopqrstuv', { redact: true });
      
      expect(result.piiFound).toBe(1);
      // API keys get fully redacted
      expect(result.redactedText).toContain('[REDACTED]');
    });
  });

  describe('password detection', () => {
    it('should detect password patterns', () => {
      const result = detector.scan('password: mySecretPass123');
      
      expect(result.piiFound).toBe(1);
      expect(result.matches[0].type).toBe('password');
    });

    it('should detect variations of password labels', () => {
      const texts = [
        'passwd=secret',
        'pwd: hidden123',
      ];
      
      for (const text of texts) {
        const result = detector.scan(text);
        expect(result.piiFound).toBeGreaterThan(0);
      }
    });
  });

  describe('risk levels', () => {
    it('should return none for clean text', () => {
      const result = detector.scan('This is just normal text');
      
      expect(result.riskLevel).toBe('none');
      expect(result.piiFound).toBe(0);
    });

    it('should return low for single email', () => {
      const result = detector.scan('Contact user@test.com');
      
      expect(result.riskLevel).toBe('low');
    });

    it('should return high for SSN', () => {
      const result = detector.scan('SSN: 123-45-6789');
      
      expect(result.riskLevel).toBe('high');
    });

    it('should return critical for multiple high-risk items', () => {
      const result = detector.scan(`
        SSN: 123-45-6789
        Card: 4111-1111-1111-1111
        Password: secret123
        API: sk_live_abcdef1234567890abcdef
      `);
      
      expect(result.riskLevel).toBe('critical');
    });
  });

  describe('policy configuration', () => {
    it('should respect enabled types', () => {
      detector.setPolicy({ enabledTypes: ['email'] });
      
      const result = detector.scan('Email: test@example.com, SSN: 123-45-6789');
      
      expect(result.piiFound).toBe(1);
      expect(result.matches[0].type).toBe('email');
    });

    it('should auto-redact when policy enabled', () => {
      detector.setPolicy({ autoRedact: true });
      
      const result = detector.scan('Email: test@example.com');
      
      expect(result.redactedText).toBeDefined();
      expect(result.redactedText).not.toContain('test@example.com');
    });

    it('should block on high risk when policy enabled', () => {
      detector.setPolicy({ blockOnHighRisk: true });
      
      const blockCheck = detector.shouldBlock('SSN: 123-45-6789');
      
      expect(blockCheck.block).toBe(true);
      expect(blockCheck.reason).toBeDefined();
    });
  });

  describe('utility methods', () => {
    it('should check if text contains PII', () => {
      expect(detector.containsPII('test@example.com')).toBe(true);
      expect(detector.containsPII('No PII here')).toBe(false);
    });

    it('should redact text directly', () => {
      const redacted = detector.redact('Contact test@example.com');
      
      expect(redacted).not.toContain('test@example.com');
      expect(redacted).toContain('t***@example.com');
    });

    it('should track scan history', () => {
      detector.scan('test1@example.com');
      detector.scan('test2@example.com');
      
      const history = detector.getScanHistory();
      
      expect(history.length).toBe(2);
    });

    it('should collect statistics', () => {
      detector.scan('test@example.com, SSN: 123-45-6789');
      
      const stats = detector.getStats();
      
      expect(stats['email']).toBe(1);
      expect(stats['ssn']).toBe(1);
    });
  });

  describe('confidence scoring', () => {
    it('should have high confidence for structured PII', () => {
      const result = detector.scan('Email: test@example.com');
      
      expect(result.matches[0].confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should include context in matches', () => {
      const result = detector.scan('Please contact test@example.com for support');
      
      expect(result.matches[0].context).toContain('...');
      expect(result.matches[0].context.length).toBeGreaterThan(10);
    });
  });
});
