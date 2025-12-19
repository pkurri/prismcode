#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function getPhase0Criteria() {
  console.log('\n📋 Phase 0 Issues with Acceptance Criteria...\n');
  
  // Phase 0 issues: #1-25
  for (let num = 1; num <= 25; num++) {
    try {
      const { data: issue } = await octokit.issues.get({
        owner: OWNER,
        repo: REPO,
        issue_number: num,
      });
      
      console.log('='.repeat(60));
      console.log('#' + num + ': ' + issue.title);
      console.log('Labels: ' + issue.labels.map(l => l.name).join(', '));
      console.log('-'.repeat(60));
      
      // Extract acceptance criteria from body
      if (issue.body) {
        const acMatch = issue.body.match(/## ✅ Acceptance Criteria[\s\S]*?(?=##|$)/i);
        if (acMatch) {
          console.log(acMatch[0].trim());
        } else {
          console.log('Body preview: ' + issue.body.slice(0, 200) + '...');
        }
      } else {
        console.log('No body');
      }
      console.log('');
    } catch (error) {
      console.log('#' + num + ': ' + error.message);
    }
  }
}

getPhase0Criteria().catch(console.error);
