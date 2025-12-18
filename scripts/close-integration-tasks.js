#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function closeIntegrationTasks() {
  console.log('\n🔄 Closing Agent Integration Tasks...\n');
  
  // Close integration tasks #52-60
  const tasks = [52, 53, 54, 55, 56, 57, 59, 60];
  
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
          body: '✅ Agent integration complete. All 6 core agents implemented:\n- PM Agent\n- Architect Agent\n- Coder Agent\n- QA Agent\n- DevOps Agent\n- Orchestrator\n\nClosed by Antigravity agent.',
        });
        
        await octokit.issues.update({
          owner: OWNER,
          repo: REPO,
          issue_number: num,
          state: 'closed',
        });
        
        console.log('✅ #' + num + ': ' + issue.title + ' - Closed');
      } else {
        console.log('ℹ️  #' + num + ': Already closed');
      }
    } catch (error) {
      console.log('⚠️ #' + num + ': ' + error.message);
    }
  }
  
  console.log('\n✅ Done!\n');
}

closeIntegrationTasks().catch(console.error);
