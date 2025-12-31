import {
  createAnalyzeComplexityTool,
  createFindDependenciesTool,
  createDetectPatternsTool,
  createExtractFunctionTool,
  createRenameSymbolTool,
  createInlineVariableTool,
  createFindReferencesTool,
  createFindDefinitionTool,
  createGenerateTestTool,
  createGenerateDocsTool,
  registerExtendedTools,
  getAllExtendedTools,
} from '../../../src/advanced/mcp-tools';
import { MCPServer } from '../../../src/advanced/mcp-server';

describe('MCP Tools Library', () => {
  let server: MCPServer;

  beforeEach(() => {
    server = new MCPServer({ enableLogging: false });
  });

  describe('Tool Registration', () => {
    it('should register all extended tools', () => {
      registerExtendedTools(server);
      const tools = server.listTools();

      expect(tools.some((t) => t.name === 'analyzeComplexity')).toBe(true);
      expect(tools.some((t) => t.name === 'findDependencies')).toBe(true);
      expect(tools.some((t) => t.name === 'detectPatterns')).toBe(true);
      expect(tools.some((t) => t.name === 'extractFunction')).toBe(true);
      expect(tools.some((t) => t.name === 'renameSymbol')).toBe(true);
      expect(tools.some((t) => t.name === 'inlineVariable')).toBe(true);
      expect(tools.some((t) => t.name === 'findReferences')).toBe(true);
      expect(tools.some((t) => t.name === 'findDefinition')).toBe(true);
      expect(tools.some((t) => t.name === 'generateTest')).toBe(true);
      expect(tools.some((t) => t.name === 'generateDocs')).toBe(true);
    });

    it('should get all extended tool definitions', () => {
      const tools = getAllExtendedTools();
      expect(tools.length).toBe(10);
    });
  });

  describe('Code Analysis Tools', () => {
    describe('analyzeComplexity', () => {
      it('should calculate cyclomatic complexity', async () => {
        server.registerTool(createAnalyzeComplexityTool());

        const code = `
          function test(x) {
            if (x > 0) {
              return x;
            } else if (x < 0) {
              return -x;
            } else {
              return 0;
            }
          }
        `;

        const result = await server.invoke('analyzeComplexity', { code });

        expect(result.success).toBe(true);
        expect(
          (result.data as { cyclomaticComplexity: number }).cyclomaticComplexity
        ).toBeGreaterThan(1);
      });

      it('should count lines of code', async () => {
        server.registerTool(createAnalyzeComplexityTool());

        const code = 'const a = 1;\nconst b = 2;\nconst c = a + b;';
        const result = await server.invoke('analyzeComplexity', { code });

        expect((result.data as { linesOfCode: number }).linesOfCode).toBe(3);
      });

      it('should rate complexity', async () => {
        server.registerTool(createAnalyzeComplexityTool());

        const simpleCode = 'const x = 1;';
        const result = await server.invoke('analyzeComplexity', { code: simpleCode });

        expect((result.data as { rating: string }).rating).toBe('low');
      });
    });

    describe('findDependencies', () => {
      it('should find ES6 imports', async () => {
        server.registerTool(createFindDependenciesTool());

        const code = `
          import fs from 'fs';
          import { join } from 'path';
          import * as lodash from 'lodash';
        `;

        const result = await server.invoke('findDependencies', { code });

        expect(result.success).toBe(true);
        expect((result.data as { external: string[] }).external).toContain('fs');
        expect((result.data as { external: string[] }).external).toContain('path');
        expect((result.data as { external: string[] }).external).toContain('lodash');
      });

      it('should find CommonJS requires', async () => {
        server.registerTool(createFindDependenciesTool());

        const code = `const express = require('express');`;
        const result = await server.invoke('findDependencies', { code });

        expect((result.data as { external: string[] }).external).toContain('express');
      });

      it('should distinguish internal and external', async () => {
        server.registerTool(createFindDependenciesTool());

        const code = `
          import axios from 'axios';
          import { helper } from './utils';
        `;

        const result = await server.invoke('findDependencies', { code });
        const data = result.data as { external: string[]; internal: string[] };

        expect(data.external).toContain('axios');
        expect(data.internal).toContain('./utils');
      });
    });

    describe('detectPatterns', () => {
      it('should detect good patterns', async () => {
        server.registerTool(createDetectPatternsTool());

        const code = `
          export async function fetchData() {
            try {
              return await api.get('/data');
            } catch (error) {
              throw error;
            }
          }
        `;

        const result = await server.invoke('detectPatterns', { code });
        const data = result.data as { patterns: { name: string }[] };

        expect(data.patterns.some((p) => p.name === 'async-await')).toBe(true);
        expect(data.patterns.some((p) => p.name === 'error-handling')).toBe(true);
      });

      it('should detect anti-patterns', async () => {
        server.registerTool(createDetectPatternsTool());

        const code = `
          var x: any = 'test';
          console.log(x);
          // TODO: fix this
        `;

        const result = await server.invoke('detectPatterns', { code });
        const data = result.data as { antiPatterns: { name: string }[]; hasIssues: boolean };

        expect(data.hasIssues).toBe(true);
        expect(data.antiPatterns.some((p) => p.name === 'any-type-usage')).toBe(true);
        expect(data.antiPatterns.some((p) => p.name === 'console-statements')).toBe(true);
      });
    });
  });

  describe('Refactoring Tools', () => {
    describe('extractFunction', () => {
      it('should extract code to function', async () => {
        server.registerTool(createExtractFunctionTool());

        const result = await server.invoke('extractFunction', {
          code: 'const sum = a + b;\nreturn sum;',
          functionName: 'calculateSum',
          params: ['a', 'b'],
        });

        const data = result.data as { extractedFunction: string; callSite: string };

        expect(data.extractedFunction).toContain('function calculateSum');
        expect(data.callSite).toBe('calculateSum(a, b)');
      });
    });

    describe('renameSymbol', () => {
      it('should rename all occurrences', async () => {
        server.registerTool(createRenameSymbolTool());

        const code = 'const foo = 1;\nconst bar = foo + 2;\nconsole.log(foo);';

        const result = await server.invoke('renameSymbol', {
          code,
          oldName: 'foo',
          newName: 'value',
        });

        const data = result.data as { modifiedCode: string; replacements: number };

        expect(data.modifiedCode).not.toContain('foo');
        expect(data.modifiedCode).toContain('value');
        expect(data.replacements).toBe(3);
      });

      it('should not rename partial matches', async () => {
        server.registerTool(createRenameSymbolTool());

        const code = 'const foobar = 1; const foo = 2;';

        const result = await server.invoke('renameSymbol', {
          code,
          oldName: 'foo',
          newName: 'value',
        });

        const data = result.data as { modifiedCode: string };

        expect(data.modifiedCode).toContain('foobar');
        expect(data.modifiedCode).toContain('const value = 2');
      });
    });

    describe('inlineVariable', () => {
      it('should inline variable usages', async () => {
        server.registerTool(createInlineVariableTool());

        const code = 'const multiplier = 2;\nconst result = value * multiplier;';

        const result = await server.invoke('inlineVariable', {
          code,
          variableName: 'multiplier',
        });

        const data = result.data as { modifiedCode: string; inlinedValue: string };

        expect(data.modifiedCode).toContain('value * 2');
        expect(data.inlinedValue).toBe('2');
      });

      it('should fail for non-existent variable', async () => {
        server.registerTool(createInlineVariableTool());

        const code = 'const x = 1;';

        const result = await server.invoke('inlineVariable', {
          code,
          variableName: 'nonexistent',
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
      });
    });
  });

  describe('Search Tools', () => {
    describe('findReferences', () => {
      it('should find all references', async () => {
        server.registerTool(createFindReferencesTool());

        const code = 'const foo = 1;\nconst bar = foo + 2;\nreturn foo;';

        const result = await server.invoke('findReferences', {
          code,
          symbol: 'foo',
        });

        const data = result.data as { references: unknown[]; count: number };

        expect(data.count).toBe(3);
        expect(data.references).toHaveLength(3);
      });

      it('should include line and column info', async () => {
        server.registerTool(createFindReferencesTool());

        const code = 'const x = 1;';

        const result = await server.invoke('findReferences', {
          code,
          symbol: 'x',
        });

        const data = result.data as { references: Array<{ line: number; column: number }> };

        expect(data.references[0].line).toBe(1);
        expect(data.references[0].column).toBeGreaterThan(0);
      });
    });

    describe('findDefinition', () => {
      it('should find function definition', async () => {
        server.registerTool(createFindDefinitionTool());

        const code = 'function myFunc() { return 1; }\nmyFunc();';

        const result = await server.invoke('findDefinition', {
          code,
          symbol: 'myFunc',
        });

        const data = result.data as { found: boolean; line: number };

        expect(data.found).toBe(true);
        expect(data.line).toBe(1);
      });

      it('should find const definition', async () => {
        server.registerTool(createFindDefinitionTool());

        const code = 'const handler = () => {};\nhandler();';

        const result = await server.invoke('findDefinition', {
          code,
          symbol: 'handler',
        });

        expect((result.data as { found: boolean }).found).toBe(true);
      });

      it('should return not found for undefined symbol', async () => {
        server.registerTool(createFindDefinitionTool());

        const code = 'const x = 1;';

        const result = await server.invoke('findDefinition', {
          code,
          symbol: 'undefined_symbol',
        });

        expect((result.data as { found: boolean }).found).toBe(false);
      });
    });
  });

  describe('Generation Tools', () => {
    describe('generateTest', () => {
      it('should generate Jest test', async () => {
        server.registerTool(createGenerateTestTool());

        const result = await server.invoke('generateTest', {
          functionName: 'calculateTotal',
          params: ['items', 'tax'],
          framework: 'jest',
        });

        const data = result.data as string;

        expect(data).toContain("describe('calculateTotal'");
        expect(data).toContain('expect(result).toBeDefined()');
      });

      it('should generate Mocha test', async () => {
        server.registerTool(createGenerateTestTool());

        const result = await server.invoke('generateTest', {
          functionName: 'processData',
          framework: 'mocha',
        });

        const data = result.data as string;

        expect(data).toContain('expect(result).to.exist');
      });
    });

    describe('generateDocs', () => {
      it('should generate JSDoc for function', async () => {
        server.registerTool(createGenerateDocsTool());

        const code = 'function add(a: number, b: number): number { return a + b; }';

        const result = await server.invoke('generateDocs', { code });

        const data = result.data as string;

        expect(data).toContain('/**');
        expect(data).toContain('@param');
        expect(data).toContain('@returns');
      });

      it('should generate JSDoc for arrow function', async () => {
        server.registerTool(createGenerateDocsTool());

        const code = 'const multiply = (x, y) => x * y;';

        const result = await server.invoke('generateDocs', { code });

        expect(result.success).toBe(true);
        expect(result.data as string).toContain('@param');
      });

      it('should fail for non-function code', async () => {
        server.registerTool(createGenerateDocsTool());

        const code = 'const x = 1;';

        const result = await server.invoke('generateDocs', { code });

        expect(result.success).toBe(false);
      });
    });
  });
});
