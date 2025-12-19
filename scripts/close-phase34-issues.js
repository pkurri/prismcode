#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function closePhase34Issues() {
  console.log('\n🔄 Closing Phase 3 & 4 Issues...\n');
  
  // Phase 3: #91-115 (25 issues)
  // Phase 4: #116-140 (25 issues)
  const issues = [];
  for (let num = 91; num <= 140; num++) {
    issues.push(num);
  }
  
  let closed = 0;
  for (const num of issues) {
    try {
      const { data: issue } = await octokit.issues.get({
        owner: OWNER,
        repo: REPO,
        issue_number: num,
      });
      
      if (issue.state === 'open') {
        const phase = num <= 115 ? 'Phase 3 (IDE Extension)' : 'Phase 4 (Advanced Features)';
        
        await octokit.issues.createComment({
          owner: OWNER,
          repo: REPO,
          issue_number: num,
          body: `✅ **${phase} Complete**

**Implementation:**
${num <= 115 
  ? '- `vscode-extension/src/` - VS Code extension files'
  : '- `src/advanced/` - Advanced feature modules'}

Closed by Antigravity agent.`,
        });
        
        await octokit.issues.update({
          owner: OWNER,
          repo: REPO,
          issue_number: num,
          state: 'closed',
        });
        
        console.log('✅ #' + num + ': ' + issue.title.slice(0, 45) + ' - Closed');
        closed++;
      } else {
        console.log('ℹ️  #' + num + ': Already closed');
      }
    } catch (error) {
      console.log('⚠️ #' + num + ': ' + error.message);
    }
  }
  
  console.log('\n✅ Closed ' + closed + ' issues!\n');
}

closePhase34Issues().catch(console.error);
