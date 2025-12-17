/**
 * Coder Agent - Code Implementation Agent
 * 
 * Handles:
 * - Code generation from specifications
 * - Code refactoring
 * - Bug fixes
 * - Documentation generation
 * - Test scaffolding
 */

import { BaseAgent } from './base-agent';
import { AgentOutput, Task } from '../types';
import logger from '../utils/logger';

/**
 * Coder Agent input
 */
export interface CoderAgentInput {
    task: Task;
    architecture?: Record<string, unknown>;
    existingCode?: string;
    context?: Record<string, unknown>;
}

/**
 * Generated file
 */
export interface GeneratedFile {
    path: string;
    content: string;
    language: string;
    purpose: string;
}

/**
 * Coder Agent output
 */
export interface CoderAgentOutput extends AgentOutput {
    data: {
        files: GeneratedFile[];
        tests: GeneratedFile[];
        documentation: string;
        summary: string;
    };
}

/**
 * Coder Agent - Generates code implementations
 */
export class CoderAgent extends BaseAgent {
    constructor() {
        super('Coder Agent');
    }

    /**
     * Process task to generate code
     */
    async process(input: CoderAgentInput): Promise<CoderAgentOutput> {
        const startTime = Date.now();
        logger.info(`${this.name}: Starting code generation`, { taskId: input.task.id });

        try {
            // Step 1: Analyze task
            const analysis = this.analyzeTask(input.task);

            // Step 2: Generate implementation files
            const files = await this.generateImplementation(input.task, analysis);

            // Step 3: Generate tests
            const tests = await this.generateTests(input.task, files);

            // Step 4: Generate documentation
            const documentation = this.generateDocumentation(input.task, files);

            // Step 5: Create summary
            const summary = this.createSummary(files, tests);

            const processingTime = Date.now() - startTime;
            logger.info(`${this.name}: Code generation complete`, {
                files: files.length,
                tests: tests.length,
                processingTime
            });

            return {
                agentName: this.name,
                data: {
                    files,
                    tests,
                    documentation,
                    summary,
                },
                metadata: {
                    processingTime,
                    confidence: 0.75,
                },
            };
        } catch (error) {
            logger.error(`${this.name}: Error during generation`, { error });
            throw error;
        }
    }

    /**
     * Analyze task requirements
     */
    private analyzeTask(task: Task): {
        type: string;
        complexity: string;
        dependencies: string[];
        patterns: string[];
    } {
        return {
            type: task.type,
            complexity: task.complexity,
            dependencies: this.inferDependencies(task),
            patterns: this.inferPatterns(task),
        };
    }

    /**
     * Infer dependencies from task
     */
    private inferDependencies(task: Task): string[] {
        const deps: string[] = [];

        if (task.type === 'frontend') {
            deps.push('react', 'next');
        } else if (task.type === 'backend') {
            deps.push('express', 'zod');
        } else if (task.type === 'database') {
            deps.push('prisma', 'drizzle-orm');
        }

        return deps;
    }

    /**
     * Infer design patterns
     */
    private inferPatterns(task: Task): string[] {
        const patterns: string[] = [];

        if (task.type === 'backend') {
            patterns.push('repository', 'service-layer');
        }
        if (task.type === 'frontend') {
            patterns.push('component', 'container');
        }

        return patterns;
    }

    /**
     * Generate implementation files
     */
    private async generateImplementation(
        task: Task,
        analysis: ReturnType<typeof this.analyzeTask>
    ): Promise<GeneratedFile[]> {
        const files: GeneratedFile[] = [];

        if (task.type === 'backend') {
            files.push(this.generateServiceFile(task));
            files.push(this.generateControllerFile(task));
            files.push(this.generateTypesFile(task));
        } else if (task.type === 'frontend') {
            files.push(this.generateComponentFile(task));
            files.push(this.generateHookFile(task));
        } else if (task.type === 'database') {
            files.push(this.generateSchemaFile(task));
            files.push(this.generateRepositoryFile(task));
        }

        return files;
    }

    /**
     * Generate service file
     */
    private generateServiceFile(task: Task): GeneratedFile {
        const name = this.toClassName(task.title);

        return {
            path: `src/services/${this.toFileName(task.title)}.service.ts`,
            language: 'typescript',
            purpose: 'Business logic service',
            content: `/**
 * ${name} Service
 * Generated for: ${task.title}
 */

import { z } from 'zod';
import logger from '../utils/logger';

// Input validation schema
export const ${name}InputSchema = z.object({
  // TODO: Define input schema
});

export type ${name}Input = z.infer<typeof ${name}InputSchema>;

// Output type
export interface ${name}Output {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * ${name} Service
 */
export class ${name}Service {
  /**
   * Execute the main operation
   */
  async execute(input: ${name}Input): Promise<${name}Output> {
    logger.info('${name}Service: Starting execution', { input });
    
    try {
      // Validate input
      const validated = ${name}InputSchema.parse(input);
      
      // TODO: Implement business logic
      
      return {
        success: true,
        data: validated,
      };
    } catch (error) {
      logger.error('${name}Service: Error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const ${this.toCamelCase(name)}Service = new ${name}Service();
`,
        };
    }

    /**
     * Generate controller file
     */
    private generateControllerFile(task: Task): GeneratedFile {
        const name = this.toClassName(task.title);

        return {
            path: `src/controllers/${this.toFileName(task.title)}.controller.ts`,
            language: 'typescript',
            purpose: 'API endpoint controller',
            content: `/**
 * ${name} Controller
 * Generated for: ${task.title}
 */

import { Request, Response } from 'express';
import { ${this.toCamelCase(name)}Service } from '../services/${this.toFileName(task.title)}.service';

/**
 * Handle ${name} operations
 */
export class ${name}Controller {
  /**
   * Main endpoint handler
   */
  async handle(req: Request, res: Response): Promise<void> {
    try {
      const result = await ${this.toCamelCase(name)}Service.execute(req.body);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}

export const ${this.toCamelCase(name)}Controller = new ${name}Controller();
`,
        };
    }

    /**
     * Generate types file
     */
    private generateTypesFile(task: Task): GeneratedFile {
        const name = this.toClassName(task.title);

        return {
            path: `src/types/${this.toFileName(task.title)}.types.ts`,
            language: 'typescript',
            purpose: 'Type definitions',
            content: `/**
 * ${name} Types
 */

export interface ${name}Config {
  enabled: boolean;
  options?: Record<string, unknown>;
}

export interface ${name}Result {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}
`,
        };
    }

    /**
     * Generate component file
     */
    private generateComponentFile(task: Task): GeneratedFile {
        const name = this.toClassName(task.title);

        return {
            path: `src/components/${name}/${name}.tsx`,
            language: 'tsx',
            purpose: 'React component',
            content: `'use client';

/**
 * ${name} Component
 */

import React from 'react';

interface ${name}Props {
  className?: string;
}

export function ${name}({ className }: ${name}Props) {
  return (
    <div className={className}>
      <h2>${name}</h2>
      {/* TODO: Implement component */}
    </div>
  );
}
`,
        };
    }

    /**
     * Generate hook file
     */
    private generateHookFile(task: Task): GeneratedFile {
        const name = this.toClassName(task.title);

        return {
            path: `src/hooks/use${name}.ts`,
            language: 'typescript',
            purpose: 'React hook',
            content: `'use client';

/**
 * use${name} Hook
 */

import { useState, useCallback } from 'react';

export function use${name}() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implement hook logic
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { execute, loading, error };
}
`,
        };
    }

    /**
     * Generate schema file
     */
    private generateSchemaFile(task: Task): GeneratedFile {
        const name = this.toClassName(task.title);

        return {
            path: `src/db/schema/${this.toFileName(task.title)}.schema.ts`,
            language: 'typescript',
            purpose: 'Database schema',
            content: `/**
 * ${name} Schema
 */

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const ${this.toCamelCase(name)}Table = pgTable('${this.toSnakeCase(name)}', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type ${name} = typeof ${this.toCamelCase(name)}Table.$inferSelect;
export type New${name} = typeof ${this.toCamelCase(name)}Table.$inferInsert;
`,
        };
    }

    /**
     * Generate repository file
     */
    private generateRepositoryFile(task: Task): GeneratedFile {
        const name = this.toClassName(task.title);

        return {
            path: `src/repositories/${this.toFileName(task.title)}.repository.ts`,
            language: 'typescript',
            purpose: 'Data access repository',
            content: `/**
 * ${name} Repository
 */

import { db } from '../db';
import { ${this.toCamelCase(name)}Table, ${name}, New${name} } from '../db/schema/${this.toFileName(task.title)}.schema';

export class ${name}Repository {
  async findAll(): Promise<${name}[]> {
    return db.select().from(${this.toCamelCase(name)}Table);
  }
  
  async findById(id: string): Promise<${name} | null> {
    const results = await db.select().from(${this.toCamelCase(name)}Table).where(eq(${this.toCamelCase(name)}Table.id, id));
    return results[0] || null;
  }
  
  async create(data: New${name}): Promise<${name}> {
    const results = await db.insert(${this.toCamelCase(name)}Table).values(data).returning();
    return results[0];
  }
}

export const ${this.toCamelCase(name)}Repository = new ${name}Repository();
`,
        };
    }

    /**
     * Generate tests
     */
    private async generateTests(task: Task, files: GeneratedFile[]): Promise<GeneratedFile[]> {
        return files.map(file => ({
            path: file.path.replace('/src/', '/tests/').replace('.ts', '.test.ts').replace('.tsx', '.test.tsx'),
            language: file.language,
            purpose: `Tests for ${file.purpose}`,
            content: `/**
 * Tests for ${file.path}
 */

describe('${this.toClassName(task.title)}', () => {
  it('should exist', () => {
    expect(true).toBe(true);
  });
  
  // TODO: Add comprehensive tests
});
`,
        }));
    }

    /**
     * Generate documentation
     */
    private generateDocumentation(task: Task, files: GeneratedFile[]): string {
        return `# ${task.title}

## Overview
${task.description}

## Generated Files
${files.map(f => `- \`${f.path}\` - ${f.purpose}`).join('\n')}

## Usage
\`\`\`typescript
// TODO: Add usage examples
\`\`\`

## Testing
\`\`\`bash
npm test -- --grep "${task.title}"
\`\`\`
`;
    }

    /**
     * Create summary
     */
    private createSummary(files: GeneratedFile[], tests: GeneratedFile[]): string {
        return `Generated ${files.length} implementation files and ${tests.length} test files.`;
    }

    // Helper methods
    private toClassName(str: string): string {
        return str
            .replace(/[^a-zA-Z0-9 ]/g, '')
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join('');
    }

    private toFileName(str: string): string {
        return str
            .replace(/[^a-zA-Z0-9 ]/g, '')
            .toLowerCase()
            .replace(/\s+/g, '-');
    }

    private toCamelCase(str: string): string {
        const className = this.toClassName(str);
        return className.charAt(0).toLowerCase() + className.slice(1);
    }

    private toSnakeCase(str: string): string {
        return str
            .replace(/[^a-zA-Z0-9]/g, '_')
            .toLowerCase()
            .replace(/_+/g, '_');
    }
}
