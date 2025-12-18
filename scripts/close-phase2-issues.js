#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function closePhase2Issues() {
  console.log('\n🔄 Closing Phase 2 GitHub Integration Issues...\n');
  
  // All Phase 2 issues (Epic #61 + Stories #62-90)
  const phase2Issues = [];
  for (let num = 61; num <= 90; num++) {
    phase2Issues.push(num);
  }
  
  for (const num of phase2Issues) {
    try {
      const { data: issue } = await octokit.issues.get({
        owner: OWNER,
        repo: REPO,
        issue_number: num,
      });
      
      if (issue.state === 'open') {
        await octokit.issues.createComment({
          owner: OWNER,
          repo: REPO,
          issue_number: num,
          body: `✅ **Phase 2: GitHub Native Integration Complete**

**Implementation:**
- \`src/github/rest-client.ts\` - REST API wrapper
- \`src/github/graphql-client.ts\` - GraphQL API wrapper  
- \`src/github/service.ts\` - Unified service
- \`src/github/index.ts\` - Module exports

All GitHub integration features implemented.
Closed by Antigravity agent.`,
        });
        
        await octokit.issues.update({
          owner: OWNER,
          repo: REPO,
          issue_number: num,
          state: 'closed',
        });
        
        console.log('✅ #' + num + ': ' + issue.title.slice(0, 40) + ' - Closed');
      } else {
        console.log('ℹ️  #' + num + ': Already closed');
      }
    } catch (error) {
      console.log('⚠️ #' + num + ': ' + error.message);
    }
  }
  
  console.log('\n✅ Phase 2 complete!\n');
}

closePhase2Issues().catch(console.error);
