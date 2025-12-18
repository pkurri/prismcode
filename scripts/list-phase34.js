#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function listPhase34() {
  console.log('\n📋 Phase 3 & 4 Issues...\n');
  
  // Phase 3
  console.log('=== PHASE 3 (IDE Extension) ===\n');
  const { data: phase3 } = await octokit.issues.listForRepo({
    owner: OWNER,
    repo: REPO,
    state: 'open',
    labels: 'phase-3',
    per_page: 50,
  });
  
  phase3.forEach(i => {
    console.log('#' + i.number + ': ' + i.title);
  });
  
  // Phase 4
  console.log('\n=== PHASE 4 (Advanced Features) ===\n');
  const { data: phase4 } = await octokit.issues.listForRepo({
    owner: OWNER,
    repo: REPO,
    state: 'open',
    labels: 'phase-4',
    per_page: 50,
  });
  
  phase4.forEach(i => {
    console.log('#' + i.number + ': ' + i.title);
  });
  
  console.log('\n📊 Summary:');
  console.log('Phase 3: ' + phase3.length + ' issues');
  console.log('Phase 4: ' + phase4.length + ' issues');
}

listPhase34().catch(console.error);
