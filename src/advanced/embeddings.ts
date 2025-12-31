/**
 * Embeddings Service
 * Provides vector embeddings for semantic code search
 *
 * Supports OpenAI embeddings with local caching and fallback
 */

import logger from '../utils/logger';

export interface EmbeddingConfig {
  provider: 'openai' | 'local' | 'mock';
  model: string;
  dimensions: number;
  cacheEnabled: boolean;
  maxCacheSize: number;
  apiKey?: string;
}

export interface EmbeddingResult {
  text: string;
  embedding: number[];
  model: string;
  cached: boolean;
}

export interface SimilarityResult {
  text: string;
  similarity: number;
  index: number;
}

const DEFAULT_CONFIG: EmbeddingConfig = {
  provider: 'mock',
  model: 'text-embedding-ada-002',
  dimensions: 1536,
  cacheEnabled: true,
  maxCacheSize: 10000,
};

/**
 * Embeddings Service
 * Generates and manages vector embeddings for semantic search
 */
export class EmbeddingsService {
  private config: EmbeddingConfig;
  private cache: Map<string, number[]> = new Map();
  private embeddings: Map<string, { text: string; embedding: number[] }> = new Map();

  constructor(config: Partial<EmbeddingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    logger.info('EmbeddingsService initialized', {
      provider: this.config.provider,
      model: this.config.model,
    });
  }

  /**
   * Generate embedding for text
   */
  async embed(text: string): Promise<EmbeddingResult> {
    const cacheKey = this.generateCacheKey(text);

    // Check cache
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      return {
        text,
        embedding: this.cache.get(cacheKey)!,
        model: this.config.model,
        cached: true,
      };
    }

    // Generate embedding based on provider
    let embedding: number[];

    switch (this.config.provider) {
      case 'openai':
        embedding = await this.generateOpenAIEmbedding(text);
        break;
      case 'local':
        embedding = this.generateLocalEmbedding(text);
        break;
      case 'mock':
      default:
        embedding = this.generateMockEmbedding(text);
    }

    // Cache result
    if (this.config.cacheEnabled) {
      this.addToCache(cacheKey, embedding);
    }

    return {
      text,
      embedding,
      model: this.config.model,
      cached: false,
    };
  }

  /**
   * Generate embeddings for multiple texts
   */
  async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];

    for (const text of texts) {
      results.push(await this.embed(text));
    }

    return results;
  }

  /**
   * Store embedding for later retrieval
   */
  store(id: string, text: string, embedding: number[]): void {
    this.embeddings.set(id, { text, embedding });
    logger.debug('Embedding stored', { id, textLength: text.length });
  }

  /**
   * Get stored embedding by ID
   */
  get(id: string): { text: string; embedding: number[] } | undefined {
    return this.embeddings.get(id);
  }

  /**
   * Find similar texts using cosine similarity
   */
  findSimilar(queryEmbedding: number[], topK = 5): SimilarityResult[] {
    const results: SimilarityResult[] = [];
    let index = 0;

    for (const [, { text, embedding }] of this.embeddings) {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      results.push({ text, similarity, index });
      index++;
    }

    return results.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
  }

  /**
   * Search for similar texts given a query
   */
  async search(query: string, topK = 5): Promise<SimilarityResult[]> {
    const queryResult = await this.embed(query);
    return this.findSimilar(queryResult.embedding, topK);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimension');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      hitRate: 0, // Would need hit/miss tracking for accurate rate
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Embedding cache cleared');
  }

  /**
   * Clear all stored embeddings
   */
  clearAll(): void {
    this.embeddings.clear();
    this.cache.clear();
    logger.info('All embeddings cleared');
  }

  /**
   * Get stored embedding count
   */
  count(): number {
    return this.embeddings.size;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<EmbeddingConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('EmbeddingsService config updated');
  }

  /**
   * Get current configuration
   */
  getConfig(): EmbeddingConfig {
    return { ...this.config };
  }

  // Private methods

  private async generateOpenAIEmbedding(text: string): Promise<number[]> {
    if (!this.config.apiKey) {
      logger.warn('OpenAI API key not configured, falling back to mock');
      return this.generateMockEmbedding(text);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          input: text,
          model: this.config.model,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = (await response.json()) as { data: Array<{ embedding: number[] }> };
      return data.data[0].embedding;
    } catch (error) {
      logger.error('Failed to generate OpenAI embedding', { error });
      return this.generateMockEmbedding(text);
    }
  }

  private generateLocalEmbedding(text: string): number[] {
    // Simple local embedding using character-based features
    // This is a placeholder - real implementation would use a local model
    const embedding: number[] = new Array<number>(this.config.dimensions).fill(0);

    // Use text features to generate deterministic embedding
    const normalized = text.toLowerCase();

    for (let i = 0; i < normalized.length && i < this.config.dimensions; i++) {
      const charCode = normalized.charCodeAt(i);
      embedding[i] = (charCode - 96) / 26; // Normalize to 0-1 range
    }

    // Add some semantic features
    const features = [
      { pattern: /function/g, weight: 0.5 },
      { pattern: /class/g, weight: 0.5 },
      { pattern: /const|let|var/g, weight: 0.3 },
      { pattern: /import|export/g, weight: 0.4 },
      { pattern: /async|await/g, weight: 0.4 },
      { pattern: /return/g, weight: 0.3 },
      { pattern: /if|else|for|while/g, weight: 0.3 },
    ];

    features.forEach((feature, idx) => {
      const matches = text.match(feature.pattern);
      if (matches && idx < embedding.length) {
        embedding[idx] += matches.length * feature.weight;
      }
    });

    // Normalize the embedding
    return this.normalizeVector(embedding);
  }

  private generateMockEmbedding(text: string): number[] {
    // Generate deterministic mock embedding based on text content
    const embedding: number[] = new Array<number>(this.config.dimensions).fill(0);

    // Simple hash-based embedding
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash = hash & hash;
    }

    // Seed random with hash for deterministic results
    const seed = Math.abs(hash);

    for (let i = 0; i < this.config.dimensions; i++) {
      const val = Math.sin(seed * (i + 1)) * 10000;
      embedding[i] = val - Math.floor(val);
    }

    return this.normalizeVector(embedding);
  }

  private normalizeVector(vector: number[]): number[] {
    let magnitude = 0;
    for (const v of vector) {
      magnitude += v * v;
    }
    magnitude = Math.sqrt(magnitude);

    if (magnitude === 0) return vector;

    return vector.map((v) => v / magnitude);
  }

  private generateCacheKey(text: string): string {
    // Simple hash for cache key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash = hash & hash;
    }
    return `emb_${Math.abs(hash).toString(16)}`;
  }

  private addToCache(key: string, embedding: number[]): void {
    if (this.cache.size >= this.config.maxCacheSize) {
      // Remove oldest entry (first in Map)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, embedding);
  }
}

// Singleton instance
export const embeddingsService = new EmbeddingsService();

/**
 * Quick embedding helper
 */
export async function embed(text: string): Promise<number[]> {
  const result = await embeddingsService.embed(text);
  return result.embedding;
}

/**
 * Quick similarity search helper
 */
export async function semanticSearch(query: string, topK = 5): Promise<SimilarityResult[]> {
  return embeddingsService.search(query, topK);
}
