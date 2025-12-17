#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function updatePR() {
  console.log('\n📝 Updating PR #165...\n');
  
  try {
    await octokit.pulls.update({
      owner: OWNER,
      repo: REPO,
      pull_number: 165,
      body: `## Phase 1: QA Agent, DevOps Agent & CI Fixes

### Issues Resolved
Closes #58, #66

---

### New Agents

#### QA Agent (#58) - 13 Story Points
\`src/agents/qa-agent.ts\`
- Test strategy definition
- Test case generation (unit, integration, e2e)
- Test code output (Vitest format)
- Quality metrics calculation

#### DevOps Agent (#66) - 8 Story Points
\`src/agents/devops-agent.ts\`
- CI/CD pipeline generation
- Infrastructure config (AWS/GCP/Azure/Docker)
- Docker Compose generation
- Kubernetes manifests
- Monitoring configuration

---

### CI Fixes

#### ESLint (16 errors → 0)
- Fixed unused variables with underscore prefix
- Removed unused imports

#### Prettier (21 files)
- Applied consistent formatting

#### Jest (8 tests passing)
- Installed ts-jest and @types/jest
- Excluded e2e tests (run via Playwright)
- Fixed test import paths
- Fixed test assertions

---

### Build Status
\`\`\`
✅ npm run typecheck: 0 errors
✅ npm run lint: 0 errors
✅ npm run format:check: PASS
✅ npm run build: SUCCESS
✅ npm test: 8 passed
\`\`\`

---

🤖 Phase 1 COMPLETE + CI FIXED!`,
    });
    console.log('✅ PR #165 updated');
  } catch (error) {
    console.log('⚠️ ' + error.message);
  }
}

updatePR().catch(console.error);
