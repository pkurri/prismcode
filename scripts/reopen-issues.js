#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function reopenIssues() {
  console.log('\n🔄 Reopening prematurely closed issues...\n');
  
  // Issues to reopen based on honest assessment:
  // Phase 3 (IDE Extension) - #91-115: Just scaffolds, not functional
  // Phase 4 (Advanced Features) - #116-140: Stubs only
  // Phase 5 (Launch) - #141, #149-151, #154: Not actually done
  
  const toReopen = [];
  
  // Phase 3: VS Code Extension (scaffold only, not functional)
  for (let i = 91; i <= 115; i++) {
    toReopen.push(i);
  }
  
  // Phase 4: Advanced Features (stubs only)
  for (let i = 116; i <= 140; i++) {
    toReopen.push(i);
  }
  
  // Phase 5: Launch tasks that weren't done
  toReopen.push(141, 149, 150, 151, 154);
  
  console.log('Will reopen ' + toReopen.length + ' issues\n');
  
  let reopened = 0;
  let alreadyOpen = 0;
  
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
          body: `🔄 **Reopening Issue**

This issue was prematurely closed without meeting acceptance criteria.

**Reason:** Implementation was a scaffold/stub only, not a fully functional feature.

Reopening for proper completion.`,
        });
        
        await octokit.issues.update({
          owner: OWNER,
          repo: REPO,
          issue_number: num,
          state: 'open',
        });
        
        console.log('🔄 #' + num + ': Reopened');
        reopened++;
      } else {
        console.log('ℹ️  #' + num + ': Already open');
        alreadyOpen++;
      }
    } catch (error) {
      if (error.status === 404) {
        console.log('⚠️ #' + num + ': Not found');
      } else {
        console.log('⚠️ #' + num + ': ' + error.message);
      }
    }
  }
  
  console.log('\n✅ Summary:');
  console.log('   Reopened: ' + reopened);
  console.log('   Already open: ' + alreadyOpen);
  console.log('   Total: ' + (reopened + alreadyOpen));
}

reopenIssues().catch(console.error);
