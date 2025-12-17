#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function checkAndClosePhase01() {
  console.log('\n📋 Checking Phase 0 and Phase 1 issues...\n');
  
  // Get all open issues
  const { data: issues } = await octokit.issues.listForRepo({
    owner: OWNER,
    repo: REPO,
    state: 'open',
    per_page: 100,
  });
  
  // Filter for Phase 0 and Phase 1
  const phase01Issues = issues.filter(issue => {
    if (issue.pull_request) return false;
    const labels = issue.labels.map(l => l.name);
    return labels.includes('phase-0') || labels.includes('phase-1');
  });
  
  console.log('Open Phase 0/1 issues (' + phase01Issues.length + '):\n');
  
  for (const issue of phase01Issues) {
    const labels = issue.labels.map(l => l.name).join(', ');
    console.log('#' + issue.number + ': ' + issue.title);
    console.log('  Labels: ' + labels);
    console.log('');
  }
  
  // Close implemented Phase 1 issues
  const phase1ToClose = [
    { num: 26, comment: 'PM Agent implemented in src/agents/pm-agent.ts' },
    { num: 34, comment: 'Architect Agent implemented in src/agents/architect-agent.ts' },
    { num: 42, comment: 'Orchestrator implemented in src/core/orchestrator.ts' },
    { num: 50, comment: 'Coder Agent implemented in src/agents/coder-agent.ts' },
    { num: 58, comment: 'QA Agent implemented in src/agents/qa-agent.ts' },
    { num: 66, comment: 'DevOps Agent implemented in src/agents/devops-agent.ts' },
  ];
  
  console.log('\n🔄 Closing Phase 1 agent issues...\n');
  
  for (const item of phase1ToClose) {
    try {
      // Check if issue exists and is open
      const { data: issue } = await octokit.issues.get({
        owner: OWNER,
        repo: REPO,
        issue_number: item.num,
      });
      
      if (issue.state === 'open') {
        await octokit.issues.createComment({
          owner: OWNER,
          repo: REPO,
          issue_number: item.num,
          body: '✅ ' + item.comment + '\n\nClosed by Antigravity agent.',
        });
        
        await octokit.issues.update({
          owner: OWNER,
          repo: REPO,
          issue_number: item.num,
          state: 'closed',
        });
        
        console.log('✅ #' + item.num + ': Closed');
      } else {
        console.log('ℹ️  #' + item.num + ': Already closed');
      }
    } catch (error) {
      console.log('⚠️ #' + item.num + ': ' + error.message);
    }
  }
  
  console.log('\n✅ Done!\n');
}

checkAndClosePhase01().catch(console.error);
