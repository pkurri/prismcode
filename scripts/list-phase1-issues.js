#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function listPhase1Issues() {
  console.log('\n📋 Open Phase 1 Issues (#27-40)...\n');
  
  for (let num = 27; num <= 40; num++) {
    try {
      const { data: issue } = await octokit.issues.get({
        owner: OWNER,
        repo: REPO,
        issue_number: num,
      });
      
      console.log('#' + num + ' (' + issue.state + '): ' + issue.title);
      if (issue.body) {
        console.log('  Body: ' + issue.body.slice(0, 100) + '...');
      }
    } catch (error) {
      console.log('#' + num + ': Not found');
    }
  }
}

listPhase1Issues().catch(console.error);
