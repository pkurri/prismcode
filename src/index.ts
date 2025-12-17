export * from './agents';
export * from './types';
export * from './utils';

/**
 * Main entry point for PrismCode
 * @example
 * ```typescript
 * import { PrismCode } from '@prismcode/core';
 *
 * const prism = new PrismCode({
 *   githubToken: process.env.GITHUB_TOKEN,
 *   owner: 'pkurri',
 *   repo: 'my-project'
 * });
 *
 * const plan = await prism.plan({
 *   feature: 'User authentication with OAuth',
 *   techStack: ['React', 'Node.js', 'PostgreSQL'],
 *   scale: 'startup'
 * });
 *
 * console.log(plan.epics);
 * ```
 */
export { PrismCode } from './core/prismcode';
