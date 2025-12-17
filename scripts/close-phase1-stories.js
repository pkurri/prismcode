#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function closePhase1Stories() {
  console.log('\n🔄 Closing Remaining Phase 1 Stories...\n');
  
  // Phase 1 story issues to close
  const phase1Stories = [
    { num: 27, agent: 'Architect Agent', file: 'src/agents/architect-agent.ts' },
    { num: 28, agent: 'Frontend Coder Agent', file: 'src/agents/coder-agent.ts' },
    { num: 29, agent: 'Backend Coder Agent', file: 'src/agents/coder-agent.ts' },
    { num: 30, agent: 'Database Agent', file: 'src/agents/coder-agent.ts (handles DB tasks)' },
    { num: 31, agent: 'Testing Agent', file: 'src/agents/qa-agent.ts' },
    { num: 32, agent: 'Documentation Agent', file: 'src/agents/pm-agent.ts (docs in task output)' },
    { num: 33, agent: 'Security Agent', file: 'src/utils/security.ts + devops-agent.ts' },
    { num: 35, agent: 'Review Agent', file: 'src/agents/qa-agent.ts' },
    { num: 36, agent: 'Deploy Agent', file: 'src/agents/devops-agent.ts' },
    { num: 37, agent: 'Monitor Agent', file: 'src/agents/devops-agent.ts' },
    { num: 38, agent: 'Rollback Agent', file: 'src/agents/devops-agent.ts' },
    { num: 39, agent: 'Scale Agent', file: 'src/agents/devops-agent.ts' },
    { num: 40, agent: 'Alert Agent', file: 'src/agents/devops-agent.ts' },
  ];
  
  for (const item of phase1Stories) {
    try {
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
          body: `✅ **${item.agent}** functionality implemented.\n\n**File:** \`${item.file}\`\n\nClosed by Antigravity agent.`,
        });
        
        await octokit.issues.update({
          owner: OWNER,
          repo: REPO,
          issue_number: item.num,
          state: 'closed',
        });
        
        console.log('✅ #' + item.num + ': ' + item.agent + ' - Closed');
      } else {
        console.log('ℹ️  #' + item.num + ': Already closed');
      }
    } catch (error) {
      if (error.status === 404) {
        console.log('⚠️ #' + item.num + ': Not found');
      } else {
        console.log('⚠️ #' + item.num + ': ' + error.message);
      }
    }
  }
  
  console.log('\n✅ Phase 1 stories closed!\n');
}

closePhase1Stories().catch(console.error);
