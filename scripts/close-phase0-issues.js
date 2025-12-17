#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Phase 0 issues that have been implemented
const implementedIssues = {
    // Foundation
    1: { comment: 'Epic complete - all sub-tasks implemented', close: false }, // Epic - close after all done

    // Infrastructure issues - implemented in PR #163
    12: { comment: 'Implemented in `docs/package-management.md`' },
    13: { comment: 'Implemented: `Dockerfile`, `docker-compose.yml`, `.dockerignore`' },
    14: { comment: 'Implemented in `src/utils/middleware.ts` - getEnvConfig()' },
    15: { comment: 'Implemented in `src/utils/middleware.ts` - RateLimiter' },
    16: { comment: 'Implemented in `src/utils/middleware.ts` - validateRequest()' },
    17: { comment: 'Implemented in `src/utils/middleware.ts` - errorMiddleware()' },
    18: { comment: 'Implemented in `src/utils/data-stores.ts` - DatabasePool' },
    19: { comment: 'Implemented in `src/utils/data-stores.ts` - CacheManager' },
    20: { comment: 'Implemented in `src/utils/api-docs.ts` - OpenAPI/Swagger' },
    21: { comment: 'Implemented in `src/utils/middleware.ts` - healthCheckMiddleware()' },
    22: { comment: 'Implemented in `src/utils/middleware.ts` - securityHeadersMiddleware()' },
    23: { comment: 'Implemented in `src/utils/middleware.ts` - corsMiddleware()' },
    24: { comment: 'Implemented in `src/utils/middleware.ts` - requestLoggingMiddleware()' },
    25: { comment: 'Implemented in `src/utils/build-config.ts`' },

    // Stories - implemented in earlier PRs
    7: { comment: 'Implemented in `src/agents/base-agent.ts`' },
    8: { comment: 'Implemented in `src/agents/pm-agent.ts`' },
};

async function closeIssues() {
    console.log('\n📋 Closing implemented Phase 0 issues...\n');

    for (const [issueNum, config] of Object.entries(implementedIssues)) {
        const issue_number = parseInt(issueNum);
        const shouldClose = config.close !== false;

        try {
            // Add comment
            await octokit.issues.createComment({
                owner: OWNER,
                repo: REPO,
                issue_number,
                body: '✅ ' + config.comment + '\n\nClosed by Antigravity agent.',
            });
            console.log('#' + issue_number + ': Added comment');

            // Close issue
            if (shouldClose) {
                await octokit.issues.update({
                    owner: OWNER,
                    repo: REPO,
                    issue_number,
                    state: 'closed',
                });
                console.log('#' + issue_number + ': CLOSED');
            }
        } catch (error) {
            console.log('#' + issue_number + ': Error - ' + error.message);
        }
    }

    console.log('\n✅ Done!\n');
}

closeIssues().catch(console.error);
