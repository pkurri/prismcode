/**
 * Pattern Library Service
 * Issue #123: Pattern Library
 *
 * Reusable code patterns and templates
 */

import logger from '../utils/logger';

export interface CodePattern {
  id: string;
  name: string;
  description: string;
  category: string;
  language: string;
  template: string;
  variables: PatternVariable[];
  tags: string[];
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatternVariable {
  name: string;
  description: string;
  defaultValue: string;
  required: boolean;
}

export interface PatternCategory {
  id: string;
  name: string;
  description: string;
  patterns: string[];
}

/**
 * Pattern Library Manager
 * Manages reusable code patterns
 */
export class PatternLibrary {
  private patterns: Map<string, CodePattern> = new Map();
  private categories: Map<string, PatternCategory> = new Map();

  constructor() {
    this.initializeDefaultCategories();
    logger.info('PatternLibrary initialized');
  }

  private initializeDefaultCategories(): void {
    this.createCategory('components', 'UI Components', 'Reusable UI components');
    this.createCategory('hooks', 'React Hooks', 'Custom React hooks');
    this.createCategory('utilities', 'Utilities', 'Helper functions');
    this.createCategory('api', 'API Patterns', 'API client patterns');
  }

  /**
   * Create a pattern
   */
  createPattern(
    pattern: Omit<CodePattern, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>
  ): CodePattern {
    const id = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const fullPattern: CodePattern = {
      id,
      ...pattern,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.patterns.set(id, fullPattern);

    // Add to category
    const category = this.categories.get(pattern.category);
    if (category) {
      category.patterns.push(id);
    }

    logger.info('Pattern created', { id, name: pattern.name });
    return fullPattern;
  }

  /**
   * Get pattern by ID
   */
  getPattern(id: string): CodePattern | undefined {
    return this.patterns.get(id);
  }

  /**
   * List patterns
   */
  listPatterns(category?: string): CodePattern[] {
    const patterns = Array.from(this.patterns.values());
    if (category) {
      return patterns.filter((p) => p.category === category);
    }
    return patterns;
  }

  /**
   * Apply pattern with variables
   */
  applyPattern(id: string, variables: Record<string, string>): string | null {
    const pattern = this.patterns.get(id);
    if (!pattern) return null;

    let result = pattern.template;
    for (const [name, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${name}\\}\\}`, 'g'), value);
    }

    // Apply defaults for missing variables
    for (const v of pattern.variables) {
      result = result.replace(new RegExp(`\\{\\{${v.name}\\}\\}`, 'g'), v.defaultValue);
    }

    pattern.usageCount++;
    return result;
  }

  /**
   * Search patterns
   */
  searchPatterns(query: string): CodePattern[] {
    const lower = query.toLowerCase();
    return Array.from(this.patterns.values()).filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower) ||
        p.tags.some((t) => t.toLowerCase().includes(lower))
    );
  }

  /**
   * Create category
   */
  createCategory(id: string, name: string, description: string): PatternCategory {
    const category: PatternCategory = { id, name, description, patterns: [] };
    this.categories.set(id, category);
    return category;
  }

  /**
   * Get categories
   */
  getCategories(): PatternCategory[] {
    return Array.from(this.categories.values());
  }

  /**
   * Delete pattern
   */
  deletePattern(id: string): boolean {
    const pattern = this.patterns.get(id);
    if (pattern) {
      const category = this.categories.get(pattern.category);
      if (category) {
        category.patterns = category.patterns.filter((p) => p !== id);
      }
    }
    return this.patterns.delete(id);
  }

  /**
   * Reset
   */
  reset(): void {
    this.patterns.clear();
    this.categories.clear();
    this.initializeDefaultCategories();
    logger.info('PatternLibrary reset');
  }
}

export const patternLibrary = new PatternLibrary();
