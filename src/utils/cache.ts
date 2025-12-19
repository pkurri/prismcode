/**
 * Redis Cache Setup
 * Issue #19
 */

import { createClient, RedisClientType } from 'redis';
import { env } from './env';
import logger from './logger';

let redisClient: RedisClientType | null = null;

/**
 * Get Redis client
 */
export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    const url = env.REDIS_URL || `redis://${env.REDIS_HOST}:${env.REDIS_PORT}`;

    redisClient = createClient({ url });

    redisClient.on('error', (err: Error) => {
      logger.error('Redis error', { error: err });
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    await redisClient.connect();
  }

  return redisClient;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}

/**
 * Cache helper functions
 */
export class Cache {
  private static async getClient() {
    return await getRedisClient();
  }

  static async get(key: string): Promise<string | null> {
    const client = await this.getClient();
    return await client.get(key);
  }

  static async set(key: string, value: string, ttl?: number): Promise<void> {
    const client = await this.getClient();
    if (ttl) {
      await client.setEx(key, ttl, value);
    } else {
      await client.set(key, value);
    }
  }

  static async del(key: string): Promise<void> {
    const client = await this.getClient();
    await client.del(key);
  }

  static async exists(key: string): Promise<boolean> {
    const client = await this.getClient();
    return (await client.exists(key)) === 1;
  }
}
