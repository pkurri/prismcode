#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function createPhase0CompletionPR() {
    console.log('\n🚀 Creating Phase 0 Completion PR...\n');

    const prBody = `## Phase 0: Remaining Issues Completion

### Issues Resolved
Closes #3, #7, #8

### Issue #3 - Repository Structure (2 pts)
- Added \`STRUCTURE.md\` with complete repo layout
- Documented all directories and their purposes

### Issue #7 - Error Handling (3 pts)
- Created \`src/utils/errors.ts\`
- Custom error classes:
  - PrismCodeError (base)
  - ValidationError
  - ConfigurationError
  - AgentError
  - GitHubError
  - TimeoutError
- \`withErrorHandling\` wrapper for async functions
- \`retry()\` helper with exponential backoff
- \`assert()\` validation helper

### Issue #8 - Security (3 pts)
- Created \`src/utils/security.ts\`
- Input sanitization (\`sanitizeInput\`, \`sanitizeObject\`)
- GitHub token validation
- Sensitive data masking for logs
- \`RateLimiter\` class for rate limiting
- Secure token generation
- URL safety checking
- XSS protection with \`escapeHtml\`
- Security config validation

### Build Status
✅ TypeScript: 0 errors

### Files Changed
- \`STRUCTURE.md\` - Repository structure documentation
- \`src/utils/errors.ts\` - Error handling utilities
- \`src/utils/security.ts\` - Security utilities
- \`src/utils/index.ts\` - Updated exports

🤖 Phase 0 Complete - All 10 foundation issues resolved!`;

    try {
        const { data: pr } = await octokit.pulls.create({
            owner: OWNER,
            repo: REPO,
            title: '[Phase 0] Complete Remaining Issues - Structure, Errors, Security (#3, #7, #8)',
            head: 'antigravity/phase0-completion',
            base: 'main',
            body: prBody,
        });
        console.log(\`✅ Phase 0 Completion PR #\${pr.number} created: \${pr.html_url}\`);
    return pr;
  } catch (error) {
    console.log(\`⚠️ PR creation: \${error.message}\`);
    return null;
  }
}

createPhase0CompletionPR().catch(console.error);
