#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function checkRemainingIssues() {
    console.log('\n📊 Checking remaining Phase 0 issues...\n');

    const { data: issues } = await octokit.issues.listForRepo({
        owner: OWNER,
        repo: REPO,
        state: 'open',
        labels: 'phase-0',
        per_page: 50,
    });

    if (issues.length === 0) {
        console.log('🎉 No open Phase 0 issues remaining!');
    } else {
        console.log('Open Phase 0 issues (' + issues.length + '):');
        issues.forEach(issue => {
            console.log('  #' + issue.number + ': ' + issue.title);
        });
    }

    console.log('\n📊 Open PRs...\n');

    const { data: prs } = await octokit.pulls.list({
        owner: OWNER,
        repo: REPO,
        state: 'open',
        per_page: 20,
    });

    if (prs.length === 0) {
        console.log('No open PRs.');
    } else {
        console.log('Open PRs (' + prs.length + '):');
        prs.forEach(pr => {
            console.log('  #' + pr.number + ': ' + pr.title.slice(0, 60));
        });
    }
}

checkRemainingIssues().catch(console.error);
