import {
  EmbeddingsService,
  EmbeddingResult,
  SimilarityResult,
  embed,
  semanticSearch,
} from '../../../src/advanced/embeddings';

describe('Embeddings Service', () => {
  let service: EmbeddingsService;

  beforeEach(() => {
    service = new EmbeddingsService({ provider: 'mock', cacheEnabled: true });
  });

  afterEach(() => {
    service.clearAll();
  });

  describe('Embedding Generation', () => {
    it('should generate embedding for text', async () => {
      const result = await service.embed('function hello() { return "world"; }');

      expect(result.embedding).toBeDefined();
      expect(result.embedding.length).toBeGreaterThan(0);
      expect(result.model).toBe('text-embedding-ada-002');
    });

    it('should generate deterministic embeddings', async () => {
      const text = 'const x = 1;';
      const result1 = await service.embed(text);
      const result2 = await service.embed(text);

      expect(result1.embedding).toEqual(result2.embedding);
    });

    it('should generate different embeddings for different text', async () => {
      const result1 = await service.embed('function add(a, b) { return a + b; }');
      const result2 = await service.embed('class User { constructor() {} }');

      expect(result1.embedding).not.toEqual(result2.embedding);
    });

    it('should use configured dimensions', async () => {
      const customService = new EmbeddingsService({ dimensions: 256 });
      const result = await customService.embed('test');

      expect(result.embedding.length).toBe(256);
    });
  });

  describe('Batch Embedding', () => {
    it('should embed multiple texts', async () => {
      const texts = ['code 1', 'code 2', 'code 3'];
      const results = await service.embedBatch(texts);

      expect(results).toHaveLength(3);
      results.forEach((result, i) => {
        expect(result.text).toBe(texts[i]);
      });
    });
  });

  describe('Caching', () => {
    it('should cache embeddings', async () => {
      const text = 'cached text';
      const result1 = await service.embed(text);
      const result2 = await service.embed(text);

      expect(result1.cached).toBe(false);
      expect(result2.cached).toBe(true);
    });

    it('should not cache when disabled', async () => {
      const noCacheService = new EmbeddingsService({ cacheEnabled: false });
      const text = 'not cached';

      const result1 = await noCacheService.embed(text);
      const result2 = await noCacheService.embed(text);

      expect(result1.cached).toBe(false);
      expect(result2.cached).toBe(false);
    });

    it('should clear cache', async () => {
      await service.embed('cached');
      service.clearCache();

      const result = await service.embed('cached');
      expect(result.cached).toBe(false);
    });

    it('should track cache stats', async () => {
      await service.embed('text1');
      await service.embed('text2');

      const stats = service.getCacheStats();
      expect(stats.size).toBe(2);
    });
  });

  describe('Storage', () => {
    it('should store embedding', async () => {
      const embedding = [0.1, 0.2, 0.3];
      service.store('test-id', 'test text', embedding);

      expect(service.count()).toBe(1);
    });

    it('should retrieve stored embedding', async () => {
      const embedding = [0.1, 0.2, 0.3];
      service.store('test-id', 'test text', embedding);

      const result = service.get('test-id');
      expect(result?.text).toBe('test text');
      expect(result?.embedding).toEqual(embedding);
    });

    it('should return undefined for non-existent id', () => {
      const result = service.get('nonexistent');
      expect(result).toBeUndefined();
    });

    it('should clear all embeddings', () => {
      service.store('id1', 'text1', [0.1]);
      service.store('id2', 'text2', [0.2]);
      service.clearAll();

      expect(service.count()).toBe(0);
    });
  });

  describe('Similarity Search', () => {
    beforeEach(() => {
      // Store some embeddings for search
      service.store('a', 'function add(a, b) { return a + b; }', [0.9, 0.1, 0.0]);
      service.store('b', 'function subtract(a, b) { return a - b; }', [0.8, 0.2, 0.0]);
      service.store('c', 'class Calculator { add() {} subtract() {} }', [0.7, 0.3, 0.1]);
    });

    it('should find similar embeddings', () => {
      const query = [0.85, 0.15, 0.0];
      const results = service.findSimilar(query, 3);

      expect(results).toHaveLength(3);
      expect(results[0].similarity).toBeGreaterThan(results[1].similarity);
    });

    it('should limit results to topK', () => {
      const query = [0.5, 0.5, 0.0];
      const results = service.findSimilar(query, 2);

      expect(results).toHaveLength(2);
    });

    it('should order by similarity descending', () => {
      const query = [0.9, 0.1, 0.0];
      const results = service.findSimilar(query);

      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].similarity).toBeGreaterThanOrEqual(results[i + 1].similarity);
      }
    });
  });

  describe('Cosine Similarity', () => {
    it('should calculate perfect similarity for identical vectors', () => {
      const v = [0.5, 0.5, 0.5];
      const similarity = service.cosineSimilarity(v, v);

      expect(similarity).toBeCloseTo(1.0, 5);
    });

    it('should calculate zero similarity for orthogonal vectors', () => {
      const v1 = [1, 0, 0];
      const v2 = [0, 1, 0];
      const similarity = service.cosineSimilarity(v1, v2);

      expect(similarity).toBeCloseTo(0.0, 5);
    });

    it('should throw for different dimensions', () => {
      const v1 = [1, 2, 3];
      const v2 = [1, 2];

      expect(() => service.cosineSimilarity(v1, v2)).toThrow('same dimension');
    });
  });

  describe('Semantic Search', () => {
    it('should search using query text', async () => {
      // Use tiny dimensions for test
      const tinyService = new EmbeddingsService({ dimensions: 2 });
      const emb1 = await tinyService.embed('function');
      const emb2 = await tinyService.embed('class');
      tinyService.store('func', 'function', emb1.embedding);
      tinyService.store('class', 'class', emb2.embedding);

      const results = await tinyService.search('function definition');

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const config = service.getConfig();

      expect(config.provider).toBe('mock');
      expect(config.cacheEnabled).toBe(true);
    });

    it('should accept custom configuration', () => {
      const custom = new EmbeddingsService({
        provider: 'local',
        dimensions: 512,
      });

      const config = custom.getConfig();

      expect(config.provider).toBe('local');
      expect(config.dimensions).toBe(512);
    });

    it('should update configuration', () => {
      service.updateConfig({ maxCacheSize: 5000 });

      expect(service.getConfig().maxCacheSize).toBe(5000);
    });
  });

  describe('Local Embeddings', () => {
    it('should generate local embeddings', async () => {
      const localService = new EmbeddingsService({ provider: 'local', dimensions: 128 });
      const result = await localService.embed('async function fetchData() {}');

      expect(result.embedding).toBeDefined();
      expect(result.embedding.length).toBe(128);
    });
  });

  describe('Helper Functions', () => {
    it('should embed text using helper', async () => {
      const embedding = await embed('const x = 1;');

      expect(embedding).toBeDefined();
      expect(Array.isArray(embedding)).toBe(true);
    });

    it('should search using service', async () => {
      // Use service with small dimensions for test
      const tinyService = new EmbeddingsService({ dimensions: 2 });
      const emb = await tinyService.embed('function test() {}');
      tinyService.store('code', 'function test() {}', emb.embedding);

      const results = await tinyService.search('function');

      expect(results).toBeDefined();
    });
  });
});
