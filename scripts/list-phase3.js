#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function fetchPhase3Issues() {
  console.log('\n🔍 PHASE 3: IDE EXTENSION ISSUES\n');
  
  try {
    const { data: issues } = await octokit.issues.listForRepo({
      owner: OWNER,
      repo: REPO,
      state: 'open',
      labels: 'phase-3',
      per_page: 50,
    });
    
    console.log(`Found ${issues.length} Phase 3 issues\n`);
    console.log('=' + '='.repeat(69));
    
    issues.forEach(issue => {
      console.log(`\n#${issue.number}: ${issue.title}`);
      console.log(`  State: ${issue.state}`);
      console.log(`  Labels: ${issue.labels.map(l => l.name).join(', ')}`);
    });
    
    console.log('\n' + '=' + '='.repeat(69));
    console.log(`\n📊 Total Phase 3 Issues: ${issues.length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

fetchPhase3Issues();
