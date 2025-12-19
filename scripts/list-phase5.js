#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function listPhase5() {
  console.log('\n📋 Phase 5 Launch Issues...\n');
  
  const { data: issues } = await octokit.issues.listForRepo({
    owner: OWNER,
    repo: REPO,
    state: 'open',
    labels: 'phase-5,launch',
    per_page: 50,
  });
  
  // Also get issues without phase-5 label but with launch label
  const { data: launchIssues } = await octokit.issues.listForRepo({
    owner: OWNER,
    repo: REPO,
    state: 'open',
    labels: 'launch',
    per_page: 50,
  });
  
  // Merge and dedupe
  const allIssues = [...issues];
  for (const i of launchIssues) {
    if (!allIssues.find(x => x.number === i.number)) {
      allIssues.push(i);
    }
  }
  
  allIssues.sort((a, b) => a.number - b.number);
  
  console.log('Found ' + allIssues.length + ' launch issues:\n');
  for (const i of allIssues) {
    const skip = [143, 144, 145, 146, 147].includes(i.number) ? ' [SKIP]' : '';
    console.log('#' + i.number + ': ' + i.title + skip);
  }
}

listPhase5().catch(console.error);
