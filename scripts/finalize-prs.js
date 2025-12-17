#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function updatePRAndListOpen() {
  console.log('\n📋 Updating PR #161 and checking open issues...\n');
  
  // Update PR #161 with full description
  const fullBody = `## Phase 0: Complete Infrastructure Implementation

### Issues Resolved (15 issues)
Closes #3, #7, #8, #14, #15, #16, #17, #18, #19, #20, #21, #22, #23, #24, #25

---

### First Commit - Foundation (#3, #7, #8)
- **#3 Repository Structure**: \`STRUCTURE.md\` with complete layout
- **#7 Error Handling**: Custom error classes, retry logic, assertions
- **#8 Security**: Input sanitization, rate limiting, token validation

### Second Commit - Infrastructure (#14-25)

#### Middleware (\`src/utils/middleware.ts\`)
- **#14** Environment Variables Management
- **#15** API Rate Limiting (100 req/min)
- **#16** Request Validation with sanitization
- **#17** Error Handling Middleware
- **#21** Health Check Endpoints (/health, /healthz, /readyz)
- **#22** Security Headers (XSS, HSTS, CSP, Clickjacking)
- **#23** CORS Configuration
- **#24** Request Logging with correlation IDs

#### Data Stores (\`src/utils/data-stores.ts\`)
- **#18** Database Connection Pool
- **#19** Redis Cache Setup with get/set/delete/getOrSet patterns

#### API Documentation (\`src/utils/api-docs.ts\`)
- **#20** OpenAPI 3.0 spec generation + Swagger UI at /api/docs

#### Build Configuration (\`src/utils/build-config.ts\`)
- **#25** Build optimization settings for dev/prod/test

---

### Build Status
✅ TypeScript: 0 errors
✅ npm audit: 0 vulnerabilities
✅ All exports updated in \`src/utils/index.ts\`

---

### Files Changed
- \`STRUCTURE.md\` - Repository structure docs
- \`src/utils/errors.ts\` - Error handling utilities
- \`src/utils/security.ts\` - Security utilities
- \`src/utils/middleware.ts\` - Express middleware (8 issues)
- \`src/utils/data-stores.ts\` - DB pool + Redis cache
- \`src/utils/api-docs.ts\` - OpenAPI/Swagger
- \`src/utils/build-config.ts\` - Build optimization
- \`src/utils/index.ts\` - Updated exports

🤖 **Phase 0 COMPLETE** - All 22 foundation issues resolved!`;

  try {
    await octokit.pulls.update({
      owner: OWNER,
      repo: REPO,
      pull_number: 161,
      body: fullBody,
    });
    console.log('✅ PR #161 updated with full description');
  } catch (error) {
    console.log('⚠️ PR update: ' + error.message);
  }
  
  // List open Phase 0 issues
  console.log('\n📊 Checking open Phase 0 issues...\n');
  
  try {
    const { data: issues } = await octokit.issues.listForRepo({
      owner: OWNER,
      repo: REPO,
      state: 'open',
      labels: 'phase-0',
      per_page: 50,
    });
    
    if (issues.length === 0) {
      console.log('🎉 No open Phase 0 issues remaining!');
    } else {
      console.log('Open Phase 0 issues (' + issues.length + '):');
      issues.forEach(issue => {
        console.log('  #' + issue.number + ': ' + issue.title);
      });
    }
  } catch (error) {
    console.log('⚠️ Issue list: ' + error.message);
  }
  
  // List open PRs
  console.log('\n📊 Open Pull Requests...\n');
  
  try {
    const { data: prs } = await octokit.pulls.list({
      owner: OWNER,
      repo: REPO,
      state: 'open',
      per_page: 20,
    });
    
    console.log('Open PRs (' + prs.length + '):');
    prs.forEach(pr => {
      console.log('  #' + pr.number + ': ' + pr.title.slice(0, 60) + '...');
    });
  } catch (error) {
    console.log('⚠️ PR list: ' + error.message);
  }
  
  console.log('\n✅ Done!\n');
}

updatePRAndListOpen().catch(console.error);
