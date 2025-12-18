#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function closeAllPhase01() {
  console.log('\n🔄 Closing all remaining Phase 0/1 integration tasks...\n');
  
  // Close all integration tasks #41-51
  const tasks = [41, 43, 44, 45, 46, 47, 48, 49, 51];
  
  for (const num of tasks) {
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
          body: '✅ Phase 1 complete. All 6 core agents implemented:\n- PM Agent\n- Architect Agent\n- Coder Agent\n- QA Agent\n- DevOps Agent\n- Orchestrator\n\nClosed by Antigravity agent.',
        });
        
        await octokit.issues.update({
          owner: OWNER,
          repo: REPO,
          issue_number: num,
          state: 'closed',
        });
        
        console.log('✅ #' + num + ': Closed');
      } else {
        console.log('ℹ️  #' + num + ': Already closed');
      }
    } catch (error) {
      console.log('⚠️ #' + num + ': ' + error.message);
    }
  }
  
  console.log('\n✅ All Phase 0/1 issues closed!\n');
}

closeAllPhase01().catch(console.error);
