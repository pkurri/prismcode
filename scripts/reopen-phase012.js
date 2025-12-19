#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function reopenPhase012() {
  console.log('\n🔄 Reopening Phase 0, 1, 2 issues for proper verification...\n');
  
  // Phase 0: #1-25
  // Phase 1: #26-66 (agent stories and tasks)
  // Phase 2: #61-90 (GitHub integration)
  
  const toReopen = [];
  
  // Phase 0: #1-25
  for (let i = 1; i <= 25; i++) {
    toReopen.push(i);
  }
  
  // Phase 1: #26-66
  for (let i = 26; i <= 66; i++) {
    toReopen.push(i);
  }
  
  // Phase 2: #67-90 (skip 61-66, already in Phase 1)
  for (let i = 67; i <= 90; i++) {
    toReopen.push(i);
  }
  
  console.log('Will check ' + toReopen.length + ' issues\n');
  
  let reopened = 0;
  let alreadyOpen = 0;
  let notFound = 0;
  
  for (const num of toReopen) {
    try {
      const { data: issue } = await octokit.issues.get({
        owner: OWNER,
        repo: REPO,
        issue_number: num,
      });
      
      if (issue.state === 'closed') {
        await octokit.issues.createComment({
          owner: OWNER,
          repo: REPO,
          issue_number: num,
          body: `🔄 **Reopening for Verification**

This issue was closed without full verification of acceptance criteria.

Reopening for proper review and completion.`,
        });
        
        await octokit.issues.update({
          owner: OWNER,
          repo: REPO,
          issue_number: num,
          state: 'open',
        });
        
        console.log('🔄 #' + num + ': Reopened - ' + issue.title.slice(0, 40));
        reopened++;
      } else {
        console.log('ℹ️  #' + num + ': Already open');
        alreadyOpen++;
      }
    } catch (error) {
      if (error.status === 404) {
        notFound++;
      } else {
        console.log('⚠️ #' + num + ': ' + error.message);
      }
    }
  }
  
  console.log('\n✅ Summary:');
  console.log('   Reopened: ' + reopened);
  console.log('   Already open: ' + alreadyOpen);
  console.log('   Not found: ' + notFound);
}

reopenPhase012().catch(console.error);
