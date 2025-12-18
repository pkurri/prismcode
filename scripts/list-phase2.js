#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function listPhase2() {
  console.log('\n📋 Phase 2 Issues...\n');
  
  const { data: issues } = await octokit.issues.listForRepo({
    owner: OWNER,
    repo: REPO,
    state: 'open',
    labels: 'phase-2',
    per_page: 50,
  });
  
  console.log('Found ' + issues.length + ' Phase 2 issues:\n');
  
  issues.forEach(i => {
    const labels = i.labels.map(l => l.name).filter(l => l !== 'phase-2').join(', ');
    console.log('#' + i.number + ': ' + i.title);
    if (labels) console.log('  Labels: ' + labels);
    console.log('');
  });
  
  // Also check for issues without phase label that might be Phase 2
  console.log('\n📋 All Open Issues (for reference)...\n');
  
  const { data: allIssues } = await octokit.issues.listForRepo({
    owner: OWNER,
    repo: REPO,
    state: 'open',
    per_page: 20,
  });
  
  allIssues.forEach(i => {
    if (i.pull_request) return;
    const labels = i.labels.map(l => l.name).join(', ');
    console.log('#' + i.number + ': ' + i.title.slice(0, 50));
    if (labels) console.log('  ' + labels);
  });
}

listPhase2().catch(console.error);
