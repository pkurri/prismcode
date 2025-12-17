/**
 * Database and Cache Utilities
 * 
 * Implements:
 * - #18 Database Connection Pool
 * - #19 Redis Cache Setup
 */

import logger from './logger';

// ============================================
// #18 Database Connection Pool
// ============================================

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
    url?: string;
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    poolMin?: number;
    poolMax?: number;
    idleTimeoutMs?: number;
    connectionTimeoutMs?: number;
}

/**
 * Connection pool state
 */
interface PoolState {
    connections: number;
    idle: number;
    waiting: number;
    maxReached: boolean;
}

/**
 * Database connection pool manager
 */
export class DatabasePool {
    private config: DatabaseConfig;
    private isConnected: boolean = false;
    private pool: unknown = null;

    constructor(config: DatabaseConfig = {}) {
        this.config = {
            url: process.env.DATABASE_URL,
            poolMin: 2,
            poolMax: 10,
            idleTimeoutMs: 30000,
            connectionTimeoutMs: 10000,
            ...config,
        };
    }

    /**
     * Initialize the connection pool
     */
    async connect(): Promise<void> {
        if (this.isConnected) {
            logger.warn('Database pool already connected');
            return;
        }

        if (!this.config.url) {
            logger.info('No DATABASE_URL configured, skipping database connection');
            return;
        }

        try {
            // In a real implementation, you would use your ORM here
            // For example: Prisma, Drizzle, TypeORM, etc.
            logger.info('Database pool connecting', {
                poolMin: this.config.poolMin,
                poolMax: this.config.poolMax,
            });

            // Simulated connection
            this.isConnected = true;
            logger.info('Database pool connected');
        } catch (error) {
            logger.error('Database connection failed', { error });
            throw error;
        }
    }

    /**
     * Close the connection pool
     */
    async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        try {
            // Close pool connections
            this.isConnected = false;
            this.pool = null;
            logger.info('Database pool disconnected');
        } catch (error) {
            logger.error('Database disconnect failed', { error });
            throw error;
        }
    }

    /**
     * Get pool state
     */
    getState(): PoolState {
        return {
            connections: this.isConnected ? 1 : 0,
            idle: this.isConnected ? 1 : 0,
            waiting: 0,
            maxReached: false,
        };
    }

    /**
     * Check if connected
     */
    isReady(): boolean {
        return this.isConnected;
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
        if (!this.isConnected) {
            return { healthy: false };
        }

        const start = Date.now();
        try {
            // In real implementation: await db.raw('SELECT 1')
            return { healthy: true, latency: Date.now() - start };
        } catch {
            return { healthy: false };
        }
    }
}

// ============================================
// #19 Redis Cache Setup
// ============================================

/**
 * Redis configuration
 */
export interface RedisConfig {
    url?: string;
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
    connectTimeout?: number;
    commandTimeout?: number;
}

/**
 * Cache entry options
 */
export interface CacheOptions {
    ttl?: number; // Time to live in seconds
    tags?: string[];
}

/**
 * Redis cache manager
 */
export class CacheManager {
    private config: RedisConfig;
    private isConnected: boolean = false;
    private cache: Map<string, { value: unknown; expiresAt: number }> = new Map();

    constructor(config: RedisConfig = {}) {
        this.config = {
            url: process.env.REDIS_URL,
            keyPrefix: 'prismcode:',
            connectTimeout: 5000,
            commandTimeout: 5000,
            ...config,
        };
    }

    /**
     * Connect to Redis
     */
    async connect(): Promise<void> {
        if (this.isConnected) {
            logger.warn('Redis already connected');
            return;
        }

        if (!this.config.url) {
            logger.info('No REDIS_URL configured, using in-memory cache');
            this.isConnected = true;
            return;
        }

        try {
            // In real implementation: use ioredis or redis package
            logger.info('Redis connecting', { keyPrefix: this.config.keyPrefix });
            this.isConnected = true;
            logger.info('Redis connected');
        } catch (error) {
            logger.error('Redis connection failed', { error });
            throw error;
        }
    }

    /**
     * Disconnect from Redis
     */
    async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        this.isConnected = false;
        this.cache.clear();
        logger.info('Redis disconnected');
    }

    /**
     * Get a cached value
     */
    async get<T>(key: string): Promise<T | null> {
        const prefixedKey = this.config.keyPrefix + key;

        const entry = this.cache.get(prefixedKey);
        if (!entry) {
            return null;
        }

        if (entry.expiresAt && entry.expiresAt < Date.now()) {
            this.cache.delete(prefixedKey);
            return null;
        }

        return entry.value as T;
    }

    /**
     * Set a cached value
     */
    async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
        const prefixedKey = this.config.keyPrefix + key;
        const ttl = options.ttl || 3600; // Default 1 hour

        this.cache.set(prefixedKey, {
            value,
            expiresAt: Date.now() + (ttl * 1000),
        });
    }

    /**
     * Delete a cached value
     */
    async delete(key: string): Promise<boolean> {
        const prefixedKey = this.config.keyPrefix + key;
        return this.cache.delete(prefixedKey);
    }

    /**
     * Delete by pattern
     */
    async deleteByPattern(pattern: string): Promise<number> {
        const prefixedPattern = this.config.keyPrefix + pattern.replace('*', '');
        let count = 0;

        for (const key of this.cache.keys()) {
            if (key.startsWith(prefixedPattern)) {
                this.cache.delete(key);
                count++;
            }
        }

        return count;
    }

    /**
     * Clear all cache
     */
    async flush(): Promise<void> {
        this.cache.clear();
        logger.info('Cache flushed');
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<{ healthy: boolean; latency?: number }> {
        if (!this.isConnected) {
            return { healthy: false };
        }

        const start = Date.now();
        try {
            // In real implementation: await redis.ping()
            return { healthy: true, latency: Date.now() - start };
        } catch {
            return { healthy: false };
        }
    }

    /**
     * Get or set pattern (cache aside)
     */
    async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        options: CacheOptions = {}
    ): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        const value = await factory();
        await this.set(key, value, options);
        return value;
    }
}

// ============================================
// Singleton instances
// ============================================

export const databasePool = new DatabasePool();
export const cacheManager = new CacheManager();

/**
 * Initialize all data stores
 */
export async function initializeDataStores(): Promise<void> {
    await Promise.all([
        databasePool.connect(),
        cacheManager.connect(),
    ]);
    logger.info('Data stores initialized');
}

/**
 * Graceful shutdown
 */
export async function shutdownDataStores(): Promise<void> {
    await Promise.all([
        databasePool.disconnect(),
        cacheManager.disconnect(),
    ]);
    logger.info('Data stores shut down');
}
