#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function createPhase1PR() {
  console.log('\n🚀 Creating Phase 1 Agents PR...\n');
  
  try {
    const { data: pr } = await octokit.pulls.create({
      owner: OWNER,
      repo: REPO,
      title: '[Phase 1] QA Agent & DevOps Agent (#58, #66)',
      head: 'antigravity/phase1-agents',
      base: 'main',
      body: `## Phase 1: QA Agent & DevOps Agent

### Issues Resolved
Closes #58, #66

---

### QA Agent (#58) - 13 Story Points
\`src/agents/qa-agent.ts\`

- Test strategy definition
- Test case generation (unit, integration, e2e, performance, security)
- Test code output (Vitest format)
- Quality metrics calculation
- Risk area identification per task type

### DevOps Agent (#66) - 8 Story Points
\`src/agents/devops-agent.ts\`

- CI/CD pipeline generation (6 stages)
- Infrastructure config (AWS/GCP/Azure/Vercel/Docker)
- Docker Compose generation
- Kubernetes manifests (deployments + services)
- Monitoring configuration

---

### Build Status
✅ TypeScript: 0 errors
✅ All lint errors fixed

### Files Changed
- \`src/agents/qa-agent.ts\` (315 lines)
- \`src/agents/devops-agent.ts\` (413 lines)
- \`src/agents/index.ts\` (updated exports)

---

### Phase 1 Complete Agents
1. ✅ Orchestrator (#42) - 34 pts
2. ✅ PM Agent (#26) - 21 pts
3. ✅ Architect Agent (#34) - 21 pts
4. ✅ Coder Agent (#50) - 13 pts
5. ✅ QA Agent (#58) - 13 pts
6. ✅ DevOps Agent (#66) - 8 pts

**Total: 110 story points**

🤖 Phase 1 COMPLETE!`,
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

createPhase1PR().catch(console.error);
