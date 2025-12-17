#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function listOpenIssues() {
  console.log('\n📋 Open Issues...\n');

  const { data: issues } = await octokit.issues.listForRepo({
    owner: OWNER,
    repo: REPO,
    state: 'open',
    per_page: 50,
  });

  // Group by phase
  const phases = {};
  issues.forEach((issue) => {
    if (issue.pull_request) return; // Skip PRs

    const labels = issue.labels.map((l) => l.name);
    let phase = 'other';

    if (labels.includes('phase-1')) phase = 'Phase 1';
    else if (labels.includes('phase-2')) phase = 'Phase 2';
    else if (labels.includes('phase-3')) phase = 'Phase 3';
    else if (labels.includes('phase-0')) phase = 'Phase 0';

    if (!phases[phase]) phases[phase] = [];
    phases[phase].push(issue);
  });

  for (const [phase, list] of Object.entries(phases)) {
    console.log(phase + ' (' + list.length + '):');
    list.slice(0, 10).forEach((i) => {
      console.log('  #' + i.number + ': ' + i.title.slice(0, 60));
    });
    if (list.length > 10) console.log('  ... and ' + (list.length - 10) + ' more');
    console.log('');
  }
}

listOpenIssues().catch(console.error);
