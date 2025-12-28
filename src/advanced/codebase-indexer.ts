/**
 * Codebase Indexing & Embedding
 * Issue #195: Codebase Indexing & Embedding
 *
 * Provides semantic indexing of codebase for intelligent code search
 */

import logger from '../utils/logger';

export interface IndexConfig {
  maxFileSize: number;
  supportedExtensions: string[];
  chunkSize: number;
  overlapSize: number;
  embeddingDimensions: number;
}

export interface FileIndex {
  id: string;
  path: string;
  content: string;
  chunks: CodeChunk[];
  language: string;
  lastIndexed: Date;
  hash: string;
}

export interface CodeChunk {
  id: string;
  fileId: string;
  content: string;
  startLine: number;
  endLine: number;
  embedding?: number[];
  metadata: ChunkMetadata;
}

export interface ChunkMetadata {
  functions: string[];
  classes: string[];
  imports: string[];
  exports: string[];
  comments: string[];
}

export interface SearchResult {
  chunk: CodeChunk;
  score: number;
  file: string;
  relevance: 'high' | 'medium' | 'low';
}

export interface IndexStats {
  totalFiles: number;
  totalChunks: number;
  totalTokens: number;
  languages: Record<string, number>;
  lastUpdated: Date;
}

const DEFAULT_CONFIG: IndexConfig = {
  maxFileSize: 1024 * 1024, // 1MB
  supportedExtensions: [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.py',
    '.java',
    '.go',
    '.rs',
    '.cpp',
    '.c',
    '.h',
    '.cs',
    '.rb',
    '.php',
    '.swift',
    '.kt',
  ],
  chunkSize: 500,
  overlapSize: 50,
  embeddingDimensions: 384,
};

/**
 * Language detection based on file extension
 */
const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python',
  '.java': 'java',
  '.go': 'go',
  '.rs': 'rust',
  '.cpp': 'cpp',
  '.c': 'c',
  '.h': 'c',
  '.cs': 'csharp',
  '.rb': 'ruby',
  '.php': 'php',
  '.swift': 'swift',
  '.kt': 'kotlin',
};

/**
 * Codebase Indexing Engine
 * Indexes source code for semantic search
 */
export class CodebaseIndexer {
  private config: IndexConfig;
  private files: Map<string, FileIndex> = new Map();
  private chunks: Map<string, CodeChunk> = new Map();

  constructor(config: Partial<IndexConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('CodebaseIndexer initialized', {
      supportedExtensions: this.config.supportedExtensions.length,
      chunkSize: this.config.chunkSize,
    });
  }

  /**
   * Index a single file
   */
  indexFile(path: string, content: string): FileIndex {
    const extension = this.getExtension(path);
    const language = EXTENSION_TO_LANGUAGE[extension] || 'unknown';

    // Generate file ID and hash
    const fileId = this.generateId('file');
    const hash = this.computeHash(content);

    // Check if already indexed with same content
    const existing = this.findByPath(path);
    if (existing && existing.hash === hash) {
      logger.debug('File already indexed with same content', { path });
      return existing;
    }

    // Split content into chunks
    const chunks = this.createChunks(fileId, content, path);

    // Create file index
    const fileIndex: FileIndex = {
      id: fileId,
      path,
      content,
      chunks,
      language,
      lastIndexed: new Date(),
      hash,
    };

    // Store file and chunks
    this.files.set(fileId, fileIndex);
    for (const chunk of chunks) {
      this.chunks.set(chunk.id, chunk);
    }

    logger.info('File indexed', {
      path,
      language,
      chunkCount: chunks.length,
    });

    return fileIndex;
  }

  /**
   * Index multiple files
   */
  indexFiles(files: Array<{ path: string; content: string }>): FileIndex[] {
    return files.map((f) => this.indexFile(f.path, f.content));
  }

  /**
   * Remove a file from the index
   */
  removeFile(path: string): boolean {
    const file = this.findByPath(path);
    if (!file) return false;

    // Remove all chunks
    for (const chunk of file.chunks) {
      this.chunks.delete(chunk.id);
    }

    // Remove file
    this.files.delete(file.id);

    logger.info('File removed from index', { path });
    return true;
  }

  /**
   * Search the index using keyword matching
   */
  search(query: string, limit = 10): SearchResult[] {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter((t) => t.length > 2);

    const results: SearchResult[] = [];

    for (const [, chunk] of this.chunks) {
      const contentLower = chunk.content.toLowerCase();
      let score = 0;

      // Calculate relevance score
      for (const term of queryTerms) {
        if (contentLower.includes(term)) {
          score += 1;

          // Boost for exact matches
          if (contentLower.includes(` ${term} `) || contentLower.includes(`${term}(`)) {
            score += 0.5;
          }
        }
      }

      // Check metadata
      const metadataStr = [
        ...chunk.metadata.functions,
        ...chunk.metadata.classes,
        ...chunk.metadata.exports,
      ]
        .join(' ')
        .toLowerCase();

      for (const term of queryTerms) {
        if (metadataStr.includes(term)) {
          score += 0.5;
        }
      }

      if (score > 0) {
        const file = this.getFileForChunk(chunk.id);
        results.push({
          chunk,
          score,
          file: file?.path || 'unknown',
          relevance: score >= 2 ? 'high' : score >= 1 ? 'medium' : 'low',
        });
      }
    }

    // Sort by score and limit
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Semantic search using embeddings (simulated)
   */
  semanticSearch(query: string, limit = 10): SearchResult[] {
    // In a real implementation, this would use actual embeddings
    // For now, we use enhanced keyword search
    const results = this.search(query, limit * 2);

    // Boost results that match semantic patterns
    for (const result of results) {
      // Boost for function/class names matching intent
      if (query.includes('function') && result.chunk.metadata.functions.length > 0) {
        result.score *= 1.5;
      }
      if (query.includes('class') && result.chunk.metadata.classes.length > 0) {
        result.score *= 1.5;
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * Get a file by ID
   */
  getFile(id: string): FileIndex | undefined {
    return this.files.get(id);
  }

  /**
   * Get a chunk by ID
   */
  getChunk(id: string): CodeChunk | undefined {
    return this.chunks.get(id);
  }

  /**
   * Find file by path
   */
  findByPath(path: string): FileIndex | undefined {
    for (const [, file] of this.files) {
      if (file.path === path) {
        return file;
      }
    }
    return undefined;
  }

  /**
   * Get file for a chunk
   */
  getFileForChunk(chunkId: string): FileIndex | undefined {
    const chunk = this.chunks.get(chunkId);
    if (!chunk) return undefined;

    for (const [, file] of this.files) {
      if (file.chunks.some((c) => c.id === chunkId)) {
        return file;
      }
    }
    return undefined;
  }

  /**
   * Get index statistics
   */
  getStats(): IndexStats {
    const languages: Record<string, number> = {};
    let totalTokens = 0;

    for (const [, file] of this.files) {
      languages[file.language] = (languages[file.language] || 0) + 1;
      totalTokens += this.estimateTokens(file.content);
    }

    return {
      totalFiles: this.files.size,
      totalChunks: this.chunks.size,
      totalTokens,
      languages,
      lastUpdated:
        this.files.size > 0
          ? new Date(
              Math.max(...Array.from(this.files.values()).map((f) => f.lastIndexed.getTime()))
            )
          : new Date(),
    };
  }

  /**
   * Get all indexed file paths
   */
  getAllPaths(): string[] {
    return Array.from(this.files.values()).map((f) => f.path);
  }

  /**
   * Check if a file extension is supported
   */
  isSupported(path: string): boolean {
    const ext = this.getExtension(path);
    return this.config.supportedExtensions.includes(ext);
  }

  /**
   * Clear the entire index
   */
  clear(): void {
    this.files.clear();
    this.chunks.clear();
    logger.info('Index cleared');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<IndexConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('CodebaseIndexer config updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): IndexConfig {
    return { ...this.config };
  }

  // Private methods

  private createChunks(fileId: string, content: string, path: string): CodeChunk[] {
    const lines = content.split('\n');
    const chunks: CodeChunk[] = [];
    const { chunkSize, overlapSize } = this.config;

    let currentChunk: string[] = [];
    let startLine = 1;

    for (let i = 0; i < lines.length; i++) {
      currentChunk.push(lines[i]);

      // Check if we have enough lines or it's the end
      const tokenCount = this.estimateTokens(currentChunk.join('\n'));

      if (tokenCount >= chunkSize || i === lines.length - 1) {
        const chunkContent = currentChunk.join('\n');
        const chunkId = this.generateId('chunk');

        chunks.push({
          id: chunkId,
          fileId,
          content: chunkContent,
          startLine,
          endLine: i + 1,
          metadata: this.extractMetadata(chunkContent, path),
        });

        // Start next chunk with overlap
        const overlapLines = Math.min(overlapSize, currentChunk.length);
        currentChunk = currentChunk.slice(-overlapLines);
        startLine = i + 2 - overlapLines;
      }
    }

    return chunks;
  }

  private extractMetadata(content: string, _path: string): ChunkMetadata {
    const metadata: ChunkMetadata = {
      functions: [],
      classes: [],
      imports: [],
      exports: [],
      comments: [],
    };

    // Language detection handled by getExtension

    // Extract functions
    const funcPatterns = [
      /function\s+(\w+)/g,
      /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(?/g,
      /(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*\w+(?:<[^>]+>)?\s*)?{/g,
      /def\s+(\w+)/g, // Python
      /func\s+(\w+)/g, // Go
    ];

    for (const pattern of funcPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1] && !metadata.functions.includes(match[1])) {
          metadata.functions.push(match[1]);
        }
      }
    }

    // Extract classes
    const classPatterns = [/class\s+(\w+)/g, /struct\s+(\w+)/g, /interface\s+(\w+)/g];

    for (const pattern of classPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1] && !metadata.classes.includes(match[1])) {
          metadata.classes.push(match[1]);
        }
      }
    }

    // Extract imports
    const importPatterns = [
      /import\s+.*?from\s+['"](.*?)['"]/g,
      /import\s+['"](.*?)['"]/g,
      /require\(['"](.*?)['"]\)/g,
    ];

    for (const pattern of importPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1] && !metadata.imports.includes(match[1])) {
          metadata.imports.push(match[1]);
        }
      }
    }

    // Extract exports
    const exportPatterns = [
      /export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/g,
      /exports\.(\w+)/g,
    ];

    for (const pattern of exportPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1] && !metadata.exports.includes(match[1])) {
          metadata.exports.push(match[1]);
        }
      }
    }

    return metadata;
  }

  private estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  private computeHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  private getExtension(path: string): string {
    const match = path.match(/\.[^/.]+$/);
    return match ? match[0] : '';
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now().toString(16)}_${Math.random().toString(16).slice(2, 8)}`;
  }
}

// Singleton instance
export const codebaseIndexer = new CodebaseIndexer();

/**
 * Quick index helper
 */
export function indexCode(path: string, content: string): FileIndex {
  return codebaseIndexer.indexFile(path, content);
}

/**
 * Quick search helper
 */
export function searchCode(query: string, limit = 10): SearchResult[] {
  return codebaseIndexer.search(query, limit);
}
