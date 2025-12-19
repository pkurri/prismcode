#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function verifyAndReopen() {
  console.log('\n🔍 Verifying closed issues...\n');
  
  // Issues that should be reopened (not actually complete)
  const toReopen = [
    { num: 142, reason: 'No example projects created yet' },
    { num: 148, reason: 'Developer guide needs more work' },
  ];
  
  for (const item of toReopen) {
    try {
      await octokit.issues.createComment({
        owner: OWNER,
        repo: REPO,
        issue_number: item.num,
        body: `🔄 **Reopening Issue**

${item.reason}

This was prematurely closed. Reopening for proper completion.`,
      });
      
      await octokit.issues.update({
        owner: OWNER,
        repo: REPO,
        issue_number: item.num,
        state: 'open',
      });
      
      console.log('🔄 #' + item.num + ': Reopened - ' + item.reason);
    } catch (error) {
      console.log('⚠️ #' + item.num + ': ' + error.message);
    }
  }
  
  console.log('\n✅ Verification complete\n');
}

verifyAndReopen().catch(console.error);
