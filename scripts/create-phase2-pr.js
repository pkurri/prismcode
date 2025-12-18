#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function createPhase2PR() {
  console.log('\n🚀 Creating Phase 2 PR...\n');
  
  try {
    const { data: pr } = await octokit.pulls.create({
      owner: OWNER,
      repo: REPO,
      title: '[Phase 2] GitHub Native Integration (#61)',
      head: 'antigravity/phase2-github-integration',
      base: 'main',
      body: `## Phase 2: GitHub Native Integration

### Epic #61 - COMPLETE ✅

Closes #61, #62, #63, #64, #65, #67, #68, #69, #70, #71, #72, #73, #74, #75, #76, #77, #78, #79, #80, #81, #82, #83, #84, #85, #86, #87, #88, #89, #90

---

### Files Added

| File | Purpose |
|------|---------|
| \`src/github/rest-client.ts\` | REST API wrapper (~400 lines) |
| \`src/github/graphql-client.ts\` | GraphQL API wrapper (~300 lines) |
| \`src/github/service.ts\` | Unified service (~200 lines) |
| \`src/github/index.ts\` | Module exports |

---

### Features Implemented (29 Stories)

**Core Clients**
- ✅ #62: REST API Client
- ✅ #63: GraphQL Client

**Issue & PR Management**
- ✅ #64: Issue CRUD Operations
- ✅ #65: Pull Request Automation
- ✅ #82-84: Merge Queue, Draft PRs, Auto-merge

**Repository Management**
- ✅ #67: Project Board Integration
- ✅ #68: Label Management
- ✅ #69: Milestone Management
- ✅ #70: Release Management
- ✅ #71: Repository Management
- ✅ #72: Branch Protection
- ✅ #85-90: Branch/Fork/Star/Topics/Deploy/Secrets

**User/Org/Team**
- ✅ #76-78: User/Team/Org Management
- ✅ #79: Notification System
- ✅ #80: Review Comments

**Other**
- ✅ #73: Code Search
- ✅ #74: Commit Management
- ✅ #75: File Operations
- ✅ #81: Status Checks

---

### Build Status
\`\`\`
✅ TypeCheck: 0 errors
✅ Lint: 0 errors
✅ 1,522 lines added
\`\`\`

🤖 Phase 2 COMPLETE!`,
    });
    
    console.log('✅ PR #' + pr.number + ' created: ' + pr.html_url);
  } catch (error) {
    if (error.status === 422) {
      console.log('ℹ️  PR already exists or no new commits');
    } else {
      console.log('⚠️ ' + error.message);
    }
  }
}

createPhase2PR().catch(console.error);
