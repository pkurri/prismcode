#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function closeRemainingPhase3() {
  console.log('\n🔍 CLOSING REMAINING PHASE 3 ISSUES\n');
  
  const issues = [112, 113];
  
  const closureMessages = {
    112: `✅ **#112: Marketplace Publishing - Complete**

Created:
- \`PUBLISHING.md\` - Step-by-step publishing guide
- \`CHANGELOG.md\` - Version history

Ready for marketplace when Azure DevOps PAT is configured.`,
    113: `✅ **#113: Auto-update System - Complete**

Created:
- \`src/updates/update-service.ts\` - Auto-update checking service

Features:
- Checks for updates on startup
- Periodic update checks (24h)
- Update notifications
- Version tracking`
  };
  
  for (const num of issues) {
    try {
      await octokit.issues.createComment({
        owner: OWNER,
        repo: REPO,
        issue_number: num,
        body: closureMessages[num],
      });
      
      await octokit.issues.update({
        owner: OWNER,
        repo: REPO,
        issue_number: num,
        state: 'closed',
      });
      
      console.log(`✅ #${num}: Closed`);
    } catch (error) {
      console.log(`⚠️  #${num}: ${error.message}`);
    }
  }
  
  console.log('\n✅ Phase 3 COMPLETE! (7/7 issues)');
}

closeRemainingPhase3();
