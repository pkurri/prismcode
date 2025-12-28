import {
  CodebaseIndexer,
  FileIndex,
  CodeChunk,
  SearchResult,
  indexCode,
  searchCode,
} from '../../../src/advanced/codebase-indexer';

describe('Codebase Indexing & Embedding', () => {
  let indexer: CodebaseIndexer;

  const sampleCode = {
    typescript: `
import { Logger } from './logger';

export class UserService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  async getUser(id: string): Promise<User> {
    this.logger.info('Getting user', { id });
    return { id, name: 'Test' };
  }

  createUser(data: UserData): User {
    return { ...data, id: 'new-id' };
  }
}

export function validateUser(user: User): boolean {
  return user.id && user.name;
}
`,
    javascript: `
const express = require('express');

class ApiController {
  constructor(service) {
    this.service = service;
  }

  async handleRequest(req, res) {
    const data = await this.service.getData();
    res.json(data);
  }
}

function createRouter() {
  const router = express.Router();
  return router;
}

module.exports = { ApiController, createRouter };
`,
    python: `
import os
from typing import Optional

class DataProcessor:
    def __init__(self, config):
        self.config = config

    def process(self, data: dict) -> dict:
        return {"processed": True, **data}

def load_config(path: str) -> dict:
    with open(path, 'r') as f:
        return json.load(f)
`,
  };

  beforeEach(() => {
    indexer = new CodebaseIndexer();
  });

  afterEach(() => {
    indexer.clear();
  });

  describe('File Indexing', () => {
    it('should index a TypeScript file', () => {
      const result = indexer.indexFile('src/services/user.ts', sampleCode.typescript);

      expect(result.id).toBeDefined();
      expect(result.path).toBe('src/services/user.ts');
      expect(result.language).toBe('typescript');
      expect(result.chunks.length).toBeGreaterThan(0);
    });

    it('should index a JavaScript file', () => {
      const result = indexer.indexFile('src/api/controller.js', sampleCode.javascript);

      expect(result.language).toBe('javascript');
      expect(result.hash).toBeDefined();
    });

    it('should index a Python file', () => {
      const result = indexer.indexFile('src/processor.py', sampleCode.python);

      expect(result.language).toBe('python');
    });

    it('should detect unknown language for unsupported extensions', () => {
      const result = indexer.indexFile('config.yaml', 'key: value');

      expect(result.language).toBe('unknown');
    });

    it('should not re-index unchanged files', () => {
      const first = indexer.indexFile('src/file.ts', sampleCode.typescript);
      const second = indexer.indexFile('src/file.ts', sampleCode.typescript);

      expect(first.id).toBe(second.id);
    });

    it('should re-index changed files', () => {
      const first = indexer.indexFile('src/file.ts', sampleCode.typescript);
      const second = indexer.indexFile('src/file.ts', sampleCode.typescript + '\n// New comment');

      expect(first.id).not.toBe(second.id);
    });
  });

  describe('Batch Indexing', () => {
    it('should index multiple files', () => {
      const results = indexer.indexFiles([
        { path: 'src/a.ts', content: sampleCode.typescript },
        { path: 'src/b.js', content: sampleCode.javascript },
        { path: 'src/c.py', content: sampleCode.python },
      ]);

      expect(results).toHaveLength(3);
      expect(indexer.getAllPaths()).toHaveLength(3);
    });
  });

  describe('Chunk Creation', () => {
    it('should create chunks from file content', () => {
      const result = indexer.indexFile('src/file.ts', sampleCode.typescript);

      expect(result.chunks.length).toBeGreaterThan(0);
      for (const chunk of result.chunks) {
        expect(chunk.id).toBeDefined();
        expect(chunk.fileId).toBe(result.id);
        expect(chunk.startLine).toBeLessThanOrEqual(chunk.endLine);
      }
    });

    it('should include line numbers in chunks', () => {
      const result = indexer.indexFile('src/file.ts', sampleCode.typescript);

      expect(result.chunks[0].startLine).toBe(1);
      expect(result.chunks[0].endLine).toBeGreaterThan(0);
    });
  });

  describe('Metadata Extraction', () => {
    it('should extract function names', () => {
      const result = indexer.indexFile('src/file.ts', sampleCode.typescript);

      const allFunctions = result.chunks.flatMap((c) => c.metadata.functions);
      expect(allFunctions).toContain('getUser');
      expect(allFunctions).toContain('validateUser');
    });

    it('should extract class names', () => {
      const result = indexer.indexFile('src/file.ts', sampleCode.typescript);

      const allClasses = result.chunks.flatMap((c) => c.metadata.classes);
      expect(allClasses).toContain('UserService');
    });

    it('should extract imports', () => {
      const result = indexer.indexFile('src/file.ts', sampleCode.typescript);

      const allImports = result.chunks.flatMap((c) => c.metadata.imports);
      expect(allImports).toContain('./logger');
    });

    it('should extract exports', () => {
      const result = indexer.indexFile('src/file.ts', sampleCode.typescript);

      const allExports = result.chunks.flatMap((c) => c.metadata.exports);
      expect(allExports).toContain('UserService');
      expect(allExports).toContain('validateUser');
    });
  });

  describe('Search', () => {
    beforeEach(() => {
      indexer.indexFile('src/services/user.ts', sampleCode.typescript);
      indexer.indexFile('src/api/controller.js', sampleCode.javascript);
      indexer.indexFile('src/processor.py', sampleCode.python);
    });

    it('should search by keyword', () => {
      const results = indexer.search('getUser');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].file).toBe('src/services/user.ts');
    });

    it('should search by class name', () => {
      const results = indexer.search('UserService');

      expect(results.length).toBeGreaterThan(0);
    });

    it('should limit results', () => {
      const results = indexer.search('function', 2);

      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should rank results by relevance', () => {
      const results = indexer.search('user');

      // Results should be sorted by score (descending)
      for (let i = 1; i < results.length; i++) {
        expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
      }
    });

    it('should return empty array for no matches', () => {
      const results = indexer.search('nonexistent_function_xyz');

      expect(results).toHaveLength(0);
    });

    it('should include relevance category', () => {
      const results = indexer.search('UserService');

      for (const result of results) {
        expect(['high', 'medium', 'low']).toContain(result.relevance);
      }
    });
  });

  describe('Semantic Search', () => {
    beforeEach(() => {
      indexer.indexFile('src/services/user.ts', sampleCode.typescript);
      indexer.indexFile('src/api/controller.js', sampleCode.javascript);
    });

    it('should perform semantic search', () => {
      const results = indexer.semanticSearch('function that handles users');

      expect(results.length).toBeGreaterThan(0);
    });

    it('should boost function-related queries', () => {
      const results = indexer.semanticSearch('function getUser');

      // Should find the TypeScript file with getUser function
      expect(results.some((r) => r.file.includes('user.ts'))).toBe(true);
    });

    it('should boost class-related queries', () => {
      const results = indexer.semanticSearch('class that processes data');

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('File Management', () => {
    it('should get file by ID', () => {
      const indexed = indexer.indexFile('src/file.ts', sampleCode.typescript);
      const retrieved = indexer.getFile(indexed.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.path).toBe('src/file.ts');
    });

    it('should find file by path', () => {
      indexer.indexFile('src/file.ts', sampleCode.typescript);
      const found = indexer.findByPath('src/file.ts');

      expect(found).toBeDefined();
    });

    it('should remove file from index', () => {
      indexer.indexFile('src/file.ts', sampleCode.typescript);
      const removed = indexer.removeFile('src/file.ts');

      expect(removed).toBe(true);
      expect(indexer.findByPath('src/file.ts')).toBeUndefined();
    });

    it('should return false when removing non-existent file', () => {
      const removed = indexer.removeFile('nonexistent.ts');

      expect(removed).toBe(false);
    });
  });

  describe('Chunk Management', () => {
    it('should get chunk by ID', () => {
      const indexed = indexer.indexFile('src/file.ts', sampleCode.typescript);
      const chunkId = indexed.chunks[0].id;
      const retrieved = indexer.getChunk(chunkId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(chunkId);
    });

    it('should get file for chunk', () => {
      const indexed = indexer.indexFile('src/file.ts', sampleCode.typescript);
      const chunkId = indexed.chunks[0].id;
      const file = indexer.getFileForChunk(chunkId);

      expect(file).toBeDefined();
      expect(file?.id).toBe(indexed.id);
    });
  });

  describe('Statistics', () => {
    it('should return index statistics', () => {
      indexer.indexFile('src/a.ts', sampleCode.typescript);
      indexer.indexFile('src/b.js', sampleCode.javascript);
      indexer.indexFile('src/c.py', sampleCode.python);

      const stats = indexer.getStats();

      expect(stats.totalFiles).toBe(3);
      expect(stats.totalChunks).toBeGreaterThan(0);
      expect(stats.totalTokens).toBeGreaterThan(0);
      expect(stats.languages.typescript).toBe(1);
      expect(stats.languages.javascript).toBe(1);
      expect(stats.languages.python).toBe(1);
    });

    it('should return lastUpdated timestamp', () => {
      indexer.indexFile('src/file.ts', sampleCode.typescript);
      const stats = indexer.getStats();

      expect(stats.lastUpdated).toBeInstanceOf(Date);
    });
  });

  describe('Extension Support', () => {
    it('should check if extension is supported', () => {
      expect(indexer.isSupported('file.ts')).toBe(true);
      expect(indexer.isSupported('file.js')).toBe(true);
      expect(indexer.isSupported('file.py')).toBe(true);
      expect(indexer.isSupported('file.txt')).toBe(false);
    });

    it('should list all indexed paths', () => {
      indexer.indexFile('src/a.ts', 'code');
      indexer.indexFile('src/b.ts', 'code');

      const paths = indexer.getAllPaths();

      expect(paths).toContain('src/a.ts');
      expect(paths).toContain('src/b.ts');
    });
  });

  describe('Configuration', () => {
    it('should accept custom configuration', () => {
      const custom = new CodebaseIndexer({
        chunkSize: 1000,
        overlapSize: 100,
      });

      const config = custom.getConfig();

      expect(config.chunkSize).toBe(1000);
      expect(config.overlapSize).toBe(100);
    });

    it('should update configuration', () => {
      indexer.updateConfig({ chunkSize: 750 });

      expect(indexer.getConfig().chunkSize).toBe(750);
    });
  });

  describe('Helper Functions', () => {
    it('should index code using helper', () => {
      const result = indexCode('src/file.ts', sampleCode.typescript);

      expect(result.chunks.length).toBeGreaterThan(0);
    });

    it('should search code using helper', () => {
      indexCode('src/file.ts', sampleCode.typescript);
      const results = searchCode('UserService');

      expect(results.length).toBeGreaterThan(0);
    });
  });
});
