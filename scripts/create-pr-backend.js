#!/usr/bin/env node

/**
 * Create Pull Request
 * Creates a PR for the Backend Agent branch
 */

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

if (!GITHUB_TOKEN) {
    console.error('❌ Error: GITHUB_TOKEN environment variable not set');
    process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function createPR() {
    console.log('\n📝 Creating Pull Request...\n');

    const prBody = `## Backend Agent - Development Environment & Monitoring

### Issues Resolved
- Closes #2 - Development Environment Setup
- Closes #10 - Monitoring & Logging

### Changes Made

#### 1. Environment Validation
- Created \`scripts/validate-env.js\` for automated environment checking
- Validates Node.js version, npm, git, .env configuration, and dependencies

#### 2. Enhanced Development Scripts
Added 20+ npm scripts for streamlined development workflow:
- Development: \`dev\`, \`build\`, \`build:watch\`, \`typecheck\`
- Environment: \`setup\`, \`validate-env\`, \`clean\`, \`reset\`
- Testing: \`test\`, \`test:watch\`, \`test:coverage\`
- Code Quality: \`lint\`, \`lint:fix\`, \`format\`, \`format:check\`
- Phase 0: \`phase0:setup\`, \`phase0:assign\`, \`phase0:project\`

#### 3. Monitoring & Logging
- **Winston Logger** (\`src/utils/logger.ts\`): Structured logging with environment-aware transports
- **Sentry Integration** (\`src/utils/sentry.ts\`): Error tracking and monitoring
- **Health Checks** (\`src/utils/health.ts\`): System status and health endpoints

#### 4. Phase 0 Automation
- \`scripts/setup-phase0-project.js\`: Create GitHub Project V2
- \`scripts/assign-agents.js\`: Intelligent agent assignment
- \`scripts/execute-parallel.js\`: Parallel execution coordination

#### 5. Documentation
- \`docs/development-setup.md\`: Comprehensive setup guide
- \`PHASE0_QUICKSTART.md\`: Quick start for Phase 0 execution

#### 6. Infrastructure
- Created \`.gitignore\` with comprehensive patterns
- Fixed TypeScript build errors (abstract async modifier, missing exports)

### Dependencies Installed
- Production: \`winston\`, \`@sentry/node\`
- Development: \`@octokit/graphql\`, \`dotenv\`

**Total**: 493 packages, **0 vulnerabilities** ✅

### Build Status
✅ TypeScript compilation successful (0 errors)

### Files Changed
- **New files**: 11
- **Modified files**: 3
- **Total changes**: 2,088 insertions

### Testing
\`\`\`bash
# Validate environment
npm run validate-env

# Build project
npm run build

# Test utilities
node -e "const logger = require('./dist/utils/logger'); logger.default.info('Test');"
\`\`\`

### Next Steps
After this PR is merged:
- ✅ DevOps Agent can start on Issues #4, #5, #11
- ✅ QA Agent can start on Issue #6

### Checklist
- [x] Code builds successfully
- [x] Dependencies installed (0 vulnerabilities)
- [x] TypeScript errors fixed
- [x] Documentation created
- [x] Scripts functional
- [x] Changes resolve stated issues
- [x] No breaking changes

### Agent
🤖 Backend Agent - Priority 1
`;

    try {
        const { data: pr } = await octokit.pulls.create({
            owner: OWNER,
            repo: REPO,
            title: '[Phase 0] Backend Agent - Development Environment & Monitoring (Issues #2, #10)',
            head: 'antigravity/issue-2-10-backend-setup',
            base: 'main',
            body: prBody,
            draft: false,
        });

        console.log(`✅ Pull Request created: ${pr.html_url}`);
        console.log(`   PR #${pr.number}: ${pr.title}`);
        console.log(`   Status: ${pr.state}`);

        return pr;
    } catch (error) {
        console.error('❌ Failed to create PR:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        process.exit(1);
    }
}

createPR();
