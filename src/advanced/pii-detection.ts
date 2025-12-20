/**
 * PII Detection & Redaction Agent
 * Issue #210: PII Detection & Redaction Agent
 *
 * Automatic detection and redaction of personally identifiable information
 */

import logger from '../utils/logger';

export interface PIIMatch {
  id: string;
  type: PIIType;
  value: string;
  redactedValue: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
  context: string;
}

export type PIIType =
  | 'email'
  | 'phone'
  | 'ssn'
  | 'credit_card'
  | 'ip_address'
  | 'address'
  | 'name'
  | 'date_of_birth'
  | 'passport'
  | 'driver_license'
  | 'api_key'
  | 'password';

export interface ScanResult {
  id: string;
  scannedAt: Date;
  inputLength: number;
  piiFound: number;
  matches: PIIMatch[];
  redactedText?: string;
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

export interface PIIPolicy {
  enabledTypes: PIIType[];
  autoRedact: boolean;
  alertOnDetection: boolean;
  blockOnHighRisk: boolean;
}

// Common PII patterns
const PII_PATTERNS: Record<PIIType, RegExp> = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
  ssn: /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,
  credit_card: /\b(?:\d{4}[-.\s]?){3}\d{4}\b/g,
  ip_address: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  address: /\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|court|ct)\.?\s*(?:,\s*[\w\s]+)?/gi,
  name: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
  date_of_birth: /\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})\b/g,
  passport: /\b[A-Z]{1,2}\d{6,9}\b/g,
  driver_license: /\b[A-Z]\d{7,12}\b/g,
  api_key: /\b(?:sk|pk)[-_][a-zA-Z0-9]{20,}\b/g,
  password: /(?:password|passwd|pwd)[\s:=]+['"]?[^\s'"]+['"]?/gi,
};

/**
 * PII Detection & Redaction Service
 * Scans text for PII and provides redaction
 */
export class PIIDetector {
  private policy: PIIPolicy = {
    enabledTypes: ['email', 'phone', 'ssn', 'credit_card', 'api_key', 'password'],
    autoRedact: false,
    alertOnDetection: true,
    blockOnHighRisk: false,
  };
  private scanHistory: ScanResult[] = [];

  constructor() {
    logger.info('PIIDetector initialized');
  }

  /**
   * Set detection policy
   */
  setPolicy(policy: Partial<PIIPolicy>): void {
    this.policy = { ...this.policy, ...policy };
    logger.info('PII policy updated', this.policy);
  }

  /**
   * Get current policy
   */
  getPolicy(): PIIPolicy {
    return { ...this.policy };
  }

  /**
   * Scan text for PII
   */
  scan(text: string, options: { redact?: boolean } = {}): ScanResult {
    const matches: PIIMatch[] = [];
    let matchId = 0;

    for (const type of this.policy.enabledTypes) {
      const pattern = PII_PATTERNS[type];
      if (!pattern) continue;

      // Reset regex lastIndex
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(text)) !== null) {
        const value = match[0];
        const startIndex = match.index;
        const endIndex = startIndex + value.length;

        // Get surrounding context
        const contextStart = Math.max(0, startIndex - 20);
        const contextEnd = Math.min(text.length, endIndex + 20);
        const context = text.substring(contextStart, contextEnd);

        matches.push({
          id: `pii_${++matchId}`,
          type,
          value,
          redactedValue: this.redactValue(value, type),
          startIndex,
          endIndex,
          confidence: this.calculateConfidence(type, value),
          context: `...${context}...`,
        });
      }
    }

    // Calculate risk level
    const riskLevel = this.calculateRiskLevel(matches);

    // Generate redacted text if requested
    let redactedText: string | undefined;
    if (options.redact || this.policy.autoRedact) {
      redactedText = this.redactText(text, matches);
    }

    const result: ScanResult = {
      id: `scan_${Date.now()}`,
      scannedAt: new Date(),
      inputLength: text.length,
      piiFound: matches.length,
      matches,
      redactedText,
      riskLevel,
    };

    this.scanHistory.push(result);

    if (this.policy.alertOnDetection && matches.length > 0) {
      logger.warn('PII detected', {
        count: matches.length,
        types: [...new Set(matches.map(m => m.type))],
        riskLevel,
      });
    }

    return result;
  }

  /**
   * Redact PII from text
   */
  redact(text: string): string {
    const result = this.scan(text, { redact: true });
    return result.redactedText || text;
  }

  /**
   * Check if text contains PII
   */
  containsPII(text: string): boolean {
    const result = this.scan(text);
    return result.piiFound > 0;
  }

  /**
   * Should block based on policy
   */
  shouldBlock(text: string): { block: boolean; reason?: string } {
    if (!this.policy.blockOnHighRisk) {
      return { block: false };
    }

    const result = this.scan(text);
    if (result.riskLevel === 'high' || result.riskLevel === 'critical') {
      return {
        block: true,
        reason: `High-risk PII detected: ${result.matches.map(m => m.type).join(', ')}`,
      };
    }

    return { block: false };
  }

  /**
   * Get scan history
   */
  getScanHistory(limit: number = 10): ScanResult[] {
    return this.scanHistory.slice(-limit);
  }

  /**
   * Get detection statistics
   */
  getStats(): Record<PIIType, number> {
    const stats: Record<string, number> = {};
    for (const type of Object.keys(PII_PATTERNS) as PIIType[]) {
      stats[type] = 0;
    }

    for (const scan of this.scanHistory) {
      for (const match of scan.matches) {
        stats[match.type] = (stats[match.type] || 0) + 1;
      }
    }

    return stats as Record<PIIType, number>;
  }

  // Private helpers

  private redactValue(value: string, type: PIIType): string {
    switch (type) {
      case 'email': {
        const [local, domain] = value.split('@');
        return `${local[0]}***@${domain}`;
      }
      case 'phone':
        return value.replace(/\d(?=\d{4})/g, '*');
      case 'ssn':
        return '***-**-' + value.slice(-4);
      case 'credit_card':
        return '**** **** **** ' + value.slice(-4);
      case 'api_key':
      case 'password':
        return '[REDACTED]';
      default:
        return '*'.repeat(value.length);
    }
  }

  private redactText(text: string, matches: PIIMatch[]): string {
    let result = text;
    // Process from end to start to preserve indices
    const sortedMatches = [...matches].sort((a, b) => b.startIndex - a.startIndex);
    
    for (const match of sortedMatches) {
      result = result.substring(0, match.startIndex) + 
               match.redactedValue + 
               result.substring(match.endIndex);
    }
    
    return result;
  }

  private calculateConfidence(type: PIIType, _value: string): number {
    // High confidence for structured data
    const highConfidenceTypes: PIIType[] = ['email', 'ssn', 'credit_card', 'api_key'];
    if (highConfidenceTypes.includes(type)) {
      return 0.95;
    }
    return 0.75;
  }

  private calculateRiskLevel(matches: PIIMatch[]): ScanResult['riskLevel'] {
    if (matches.length === 0) return 'none';
    
    const highRiskTypes: PIIType[] = ['ssn', 'credit_card', 'password', 'api_key'];
    const hasHighRisk = matches.some(m => highRiskTypes.includes(m.type));
    
    if (hasHighRisk && matches.length > 3) return 'critical';
    if (hasHighRisk) return 'high';
    if (matches.length > 5) return 'medium';
    return 'low';
  }

  /**
   * Reset detector
   */
  reset(): void {
    this.scanHistory = [];
    logger.info('PIIDetector reset');
  }
}

export const piiDetector = new PIIDetector();
