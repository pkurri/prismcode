/**
 * Database Connection Pool
 * Issue #18
 */

import { Pool, PoolConfig } from 'pg';
import { env } from './env';
import logger from './logger';

let pool: Pool | null = null;

/**
 * Get database connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    const config: PoolConfig = {
      host: env.DB_HOST,
      port: parseInt(env.DB_PORT),
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    pool = new Pool(config);

    pool.on('connect', () => {
      logger.info('Database connection established');
    });

    pool.on('error', (err) => {
      logger.error('Unexpected database error', { error: err });
    });
  }

  return pool;
}

/**
 * Close database pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database pool closed');
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await getPool().connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    logger.error('Database connection test failed', { error });
    return false;
  }
}
