/**
 * MCP Tool Library
 * Extended tool library for the MCP Server
 *
 * Provides practical tools for code analysis, refactoring, search, and generation
 */

import { ToolDefinition, ToolResult } from './mcp-server';

// ============================================
// Code Analysis Tools
// ============================================

/**
 * Analyze code complexity
 */
export function createAnalyzeComplexityTool(): ToolDefinition {
  return {
    name: 'analyzeComplexity',
    description: 'Calculate cyclomatic complexity and other metrics for code',
    category: 'analyze',
    parameters: [
      { name: 'code', type: 'string', description: 'Code to analyze', required: true },
      { name: 'language', type: 'string', description: 'Programming language', required: false },
    ],
    returns: { type: 'object', description: 'Complexity metrics' },
    handler: (params): Promise<ToolResult> => {
      const code = String(params.code);
      const lines = code.split('\n');
      const nonEmptyLines = lines.filter((l) => l.trim().length > 0);

      // Count decision points for cyclomatic complexity
      const decisionPatterns = [
        /\bif\b/g,
        /\belse\s+if\b/g,
        /\bfor\b/g,
        /\bwhile\b/g,
        /\bswitch\b/g,
        /\bcase\b/g,
        /\bcatch\b/g,
        /\b\?\s*:/g, // ternary
        /&&/g,
        /\|\|/g,
      ];

      let complexity = 1; // Base complexity
      for (const pattern of decisionPatterns) {
        const matches = code.match(pattern);
        if (matches) {
          complexity += matches.length;
        }
      }

      // Count functions/methods
      const functionPatterns = [/function\s+\w+/g, /=>\s*{/g, /\w+\s*\([^)]*\)\s*{/g];
      let functionCount = 0;
      for (const pattern of functionPatterns) {
        const matches = code.match(pattern);
        if (matches) {
          functionCount += matches.length;
        }
      }

      return Promise.resolve({
        success: true,
        data: {
          cyclomaticComplexity: complexity,
          linesOfCode: lines.length,
          nonEmptyLines: nonEmptyLines.length,
          functionCount,
          averageComplexity: functionCount > 0 ? complexity / functionCount : complexity,
          rating: complexity <= 5 ? 'low' : complexity <= 10 ? 'medium' : 'high',
        },
        metadata: { language: params.language || 'unknown' },
      });
    },
  };
}

/**
 * Find dependencies in code
 */
export function createFindDependenciesTool(): ToolDefinition {
  return {
    name: 'findDependencies',
    description: 'Extract import statements and dependencies from code',
    category: 'analyze',
    parameters: [{ name: 'code', type: 'string', description: 'Code to analyze', required: true }],
    returns: { type: 'object', description: 'Dependencies list' },
    handler: (params): Promise<ToolResult> => {
      const code = String(params.code);
      const imports: Array<{ module: string; type: 'default' | 'named' | 'namespace' }> = [];

      // ES6 imports
      const es6ImportPattern =
        /import\s+(?:(\w+)|{([^}]+)}|\*\s+as\s+(\w+))\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = es6ImportPattern.exec(code)) !== null) {
        const module = match[4];
        if (match[1]) {
          imports.push({ module, type: 'default' });
        } else if (match[2]) {
          imports.push({ module, type: 'named' });
        } else if (match[3]) {
          imports.push({ module, type: 'namespace' });
        }
      }

      // CommonJS require
      const requirePattern = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
      while ((match = requirePattern.exec(code)) !== null) {
        imports.push({ module: match[1], type: 'default' });
      }

      const external = imports.filter((i) => !i.module.startsWith('.'));
      const internal = imports.filter((i) => i.module.startsWith('.'));

      return Promise.resolve({
        success: true,
        data: {
          imports,
          external: external.map((i) => i.module),
          internal: internal.map((i) => i.module),
          totalDependencies: imports.length,
        },
      });
    },
  };
}

/**
 * Detect code patterns
 */
export function createDetectPatternsTool(): ToolDefinition {
  return {
    name: 'detectPatterns',
    description: 'Detect common code patterns and anti-patterns',
    category: 'analyze',
    parameters: [{ name: 'code', type: 'string', description: 'Code to analyze', required: true }],
    returns: { type: 'object', description: 'Detected patterns' },
    handler: (params): Promise<ToolResult> => {
      const code = String(params.code);
      const patterns: Array<{ name: string; type: 'pattern' | 'anti-pattern'; count: number }> = [];

      // Good patterns
      if (/export\s+(default|const|function|class)/.test(code)) {
        patterns.push({ name: 'module-exports', type: 'pattern', count: 1 });
      }
      if (/async\s+function|async\s*\(|=>\s*{/.test(code)) {
        patterns.push({ name: 'async-await', type: 'pattern', count: 1 });
      }
      if (/try\s*{[\s\S]*catch/.test(code)) {
        patterns.push({ name: 'error-handling', type: 'pattern', count: 1 });
      }
      if (/interface\s+\w+|type\s+\w+\s*=/.test(code)) {
        patterns.push({ name: 'type-definitions', type: 'pattern', count: 1 });
      }

      // Anti-patterns
      const anyMatches = code.match(/:\s*any\b/g);
      if (anyMatches) {
        patterns.push({ name: 'any-type-usage', type: 'anti-pattern', count: anyMatches.length });
      }
      if (/console\.(log|error|warn)/.test(code)) {
        patterns.push({ name: 'console-statements', type: 'anti-pattern', count: 1 });
      }
      if (/TODO|FIXME|HACK/i.test(code)) {
        patterns.push({ name: 'todo-comments', type: 'anti-pattern', count: 1 });
      }
      if (/var\s+\w+/.test(code)) {
        patterns.push({ name: 'var-usage', type: 'anti-pattern', count: 1 });
      }

      return Promise.resolve({
        success: true,
        data: {
          patterns: patterns.filter((p) => p.type === 'pattern'),
          antiPatterns: patterns.filter((p) => p.type === 'anti-pattern'),
          hasIssues: patterns.some((p) => p.type === 'anti-pattern'),
        },
      });
    },
  };
}

// ============================================
// Refactoring Tools
// ============================================

/**
 * Extract function from code block
 */
export function createExtractFunctionTool(): ToolDefinition {
  return {
    name: 'extractFunction',
    description: 'Extract a code block into a separate function',
    category: 'code',
    parameters: [
      { name: 'code', type: 'string', description: 'Code block to extract', required: true },
      {
        name: 'functionName',
        type: 'string',
        description: 'Name for the new function',
        required: true,
      },
      { name: 'params', type: 'array', description: 'Parameter names', required: false },
    ],
    returns: { type: 'object', description: 'Extracted function and call site' },
    handler: (params): Promise<ToolResult> => {
      const code = String(params.code);
      const functionName = String(params.functionName);
      const funcParams = Array.isArray(params.params) ? params.params.join(', ') : '';

      const extracted = `function ${functionName}(${funcParams}) {\n${code
        .split('\n')
        .map((l) => '  ' + l)
        .join('\n')}\n}`;

      const callSite = funcParams ? `${functionName}(${funcParams})` : `${functionName}()`;

      return Promise.resolve({
        success: true,
        data: {
          extractedFunction: extracted,
          callSite,
          functionName,
        },
      });
    },
  };
}

/**
 * Rename symbol in code
 */
export function createRenameSymbolTool(): ToolDefinition {
  return {
    name: 'renameSymbol',
    description: 'Rename a variable, function, or class in code',
    category: 'code',
    parameters: [
      { name: 'code', type: 'string', description: 'Code to modify', required: true },
      { name: 'oldName', type: 'string', description: 'Current symbol name', required: true },
      { name: 'newName', type: 'string', description: 'New symbol name', required: true },
    ],
    returns: { type: 'object', description: 'Modified code' },
    handler: (params): Promise<ToolResult> => {
      const code = String(params.code);
      const oldName = String(params.oldName);
      const newName = String(params.newName);

      // Use word boundaries to avoid partial matches
      const pattern = new RegExp(`\\b${oldName}\\b`, 'g');
      const newCode = code.replace(pattern, newName);
      const replacements = (code.match(pattern) || []).length;

      return Promise.resolve({
        success: true,
        data: {
          modifiedCode: newCode,
          replacements,
          oldName,
          newName,
        },
      });
    },
  };
}

/**
 * Inline variable
 */
export function createInlineVariableTool(): ToolDefinition {
  return {
    name: 'inlineVariable',
    description: 'Inline a variable by replacing its usages with its value',
    category: 'code',
    parameters: [
      { name: 'code', type: 'string', description: 'Code to modify', required: true },
      { name: 'variableName', type: 'string', description: 'Variable to inline', required: true },
    ],
    returns: { type: 'object', description: 'Modified code' },
    handler: (params): Promise<ToolResult> => {
      const code = String(params.code);
      const varName = String(params.variableName);

      // Find variable declaration
      const declPatterns = [
        new RegExp(`const\\s+${varName}\\s*=\\s*(.+?);`),
        new RegExp(`let\\s+${varName}\\s*=\\s*(.+?);`),
        new RegExp(`var\\s+${varName}\\s*=\\s*(.+?);`),
      ];

      let value: string | null = null;
      let declMatch: RegExp | null = null;

      for (const pattern of declPatterns) {
        const match = code.match(pattern);
        if (match) {
          value = match[1];
          declMatch = pattern;
          break;
        }
      }

      if (!value || !declMatch) {
        return Promise.resolve({
          success: false,
          error: `Variable "${varName}" declaration not found`,
        });
      }

      // Replace usages and remove declaration
      let newCode = code.replace(declMatch, '');
      const usagePattern = new RegExp(`\\b${varName}\\b`, 'g');
      const replacements = (newCode.match(usagePattern) || []).length;
      newCode = newCode.replace(usagePattern, value);

      return Promise.resolve({
        success: true,
        data: {
          modifiedCode: newCode.replace(/^\s*\n/gm, ''), // Remove empty lines
          inlinedValue: value,
          replacements,
        },
      });
    },
  };
}

// ============================================
// Search Tools
// ============================================

/**
 * Find references to a symbol
 */
export function createFindReferencesTool(): ToolDefinition {
  return {
    name: 'findReferences',
    description: 'Find all references to a symbol in code',
    category: 'search',
    parameters: [
      { name: 'code', type: 'string', description: 'Code to search', required: true },
      { name: 'symbol', type: 'string', description: 'Symbol to find', required: true },
    ],
    returns: { type: 'object', description: 'Reference locations' },
    handler: (params): Promise<ToolResult> => {
      const code = String(params.code);
      const symbol = String(params.symbol);
      const lines = code.split('\n');

      const references: Array<{ line: number; column: number; context: string }> = [];
      const pattern = new RegExp(`\\b${symbol}\\b`, 'g');

      for (let i = 0; i < lines.length; i++) {
        let match;
        while ((match = pattern.exec(lines[i])) !== null) {
          references.push({
            line: i + 1,
            column: match.index + 1,
            context: lines[i].trim(),
          });
        }
      }

      return Promise.resolve({
        success: true,
        data: {
          symbol,
          references,
          count: references.length,
        },
      });
    },
  };
}

/**
 * Find definition of a symbol
 */
export function createFindDefinitionTool(): ToolDefinition {
  return {
    name: 'findDefinition',
    description: 'Find the definition of a symbol',
    category: 'search',
    parameters: [
      { name: 'code', type: 'string', description: 'Code to search', required: true },
      { name: 'symbol', type: 'string', description: 'Symbol to find', required: true },
    ],
    returns: { type: 'object', description: 'Definition location' },
    handler: (params): Promise<ToolResult> => {
      const code = String(params.code);
      const symbol = String(params.symbol);
      const lines = code.split('\n');

      // Definition patterns
      const defPatterns = [
        new RegExp(`(?:function|class|interface|type|const|let|var)\\s+${symbol}\\b`),
        new RegExp(`${symbol}\\s*(?::|=)\\s*function`),
        new RegExp(`${symbol}\\s*=\\s*\\(`),
      ];

      for (let i = 0; i < lines.length; i++) {
        for (const pattern of defPatterns) {
          if (pattern.test(lines[i])) {
            return Promise.resolve({
              success: true,
              data: {
                symbol,
                line: i + 1,
                context: lines[i].trim(),
                found: true,
              },
            });
          }
        }
      }

      return Promise.resolve({
        success: true,
        data: {
          symbol,
          found: false,
        },
      });
    },
  };
}

// ============================================
// Generation Tools
// ============================================

/**
 * Generate unit tests
 */
export function createGenerateTestTool(): ToolDefinition {
  return {
    name: 'generateTest',
    description: 'Generate unit tests for a function',
    category: 'generate',
    parameters: [
      { name: 'functionName', type: 'string', description: 'Function name', required: true },
      { name: 'params', type: 'array', description: 'Parameter names', required: false },
      {
        name: 'framework',
        type: 'string',
        description: 'Test framework (jest/mocha)',
        required: false,
      },
    ],
    returns: { type: 'string', description: 'Generated test code' },
    handler: (params): Promise<ToolResult> => {
      const functionName = String(params.functionName);
      const funcParams = Array.isArray(params.params) ? params.params : [];
      const framework = typeof params.framework === 'string' ? params.framework : 'jest';

      const paramSetup = funcParams
        .map((p) => `const ${p} = undefined; // TODO: set value`)
        .join('\n    ');

      const test =
        framework === 'mocha'
          ? `describe('${functionName}', () => {
  it('should work correctly', () => {
    ${paramSetup}
    const result = ${functionName}(${funcParams.join(', ')});
    expect(result).to.exist;
  });

  it('should handle edge cases', () => {
    // TODO: implement edge case tests
  });
});`
          : `describe('${functionName}', () => {
  it('should work correctly', () => {
    ${paramSetup}
    const result = ${functionName}(${funcParams.join(', ')});
    expect(result).toBeDefined();
  });

  it('should handle edge cases', () => {
    // TODO: implement edge case tests
  });
});`;

      return Promise.resolve({
        success: true,
        data: test,
        metadata: { framework, functionName },
      });
    },
  };
}

/**
 * Generate JSDoc comments
 */
export function createGenerateDocsTool(): ToolDefinition {
  return {
    name: 'generateDocs',
    description: 'Generate JSDoc comments for a function',
    category: 'generate',
    parameters: [{ name: 'code', type: 'string', description: 'Function code', required: true }],
    returns: { type: 'string', description: 'Code with JSDoc' },
    handler: (params): Promise<ToolResult> => {
      const code = String(params.code);

      // Extract function signature
      const funcMatch = code.match(
        /(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)|(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)/
      );

      if (!funcMatch) {
        return Promise.resolve({
          success: false,
          error: 'Could not parse function signature',
        });
      }

      const functionName = funcMatch[1] || funcMatch[3];
      const paramsStr = funcMatch[2] || funcMatch[4] || '';
      const paramNames = paramsStr
        .split(',')
        .map((p) => p.trim().split(':')[0].trim())
        .filter((p) => p);

      const paramDocs = paramNames.map((p) => ` * @param {*} ${p} - Description`).join('\n');

      const jsdoc = `/**
 * ${functionName}
 * 
 * @description TODO: Add description
${paramDocs}
 * @returns {*} TODO: Add return description
 */
${code}`;

      return Promise.resolve({
        success: true,
        data: jsdoc,
      });
    },
  };
}

// ============================================
// Helper to register all tools
// ============================================

import { MCPServer } from './mcp-server';

/**
 * Register all extended tools with an MCP server
 */
export function registerExtendedTools(server: MCPServer): void {
  server.registerTools([
    // Analysis
    createAnalyzeComplexityTool(),
    createFindDependenciesTool(),
    createDetectPatternsTool(),
    // Refactoring
    createExtractFunctionTool(),
    createRenameSymbolTool(),
    createInlineVariableTool(),
    // Search
    createFindReferencesTool(),
    createFindDefinitionTool(),
    // Generation
    createGenerateTestTool(),
    createGenerateDocsTool(),
  ]);
}

/**
 * Get all extended tool definitions
 */
export function getAllExtendedTools(): ToolDefinition[] {
  return [
    createAnalyzeComplexityTool(),
    createFindDependenciesTool(),
    createDetectPatternsTool(),
    createExtractFunctionTool(),
    createRenameSymbolTool(),
    createInlineVariableTool(),
    createFindReferencesTool(),
    createFindDefinitionTool(),
    createGenerateTestTool(),
    createGenerateDocsTool(),
  ];
}
