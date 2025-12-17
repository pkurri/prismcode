#!/usr/bin/env node

/**
 * Label Phase 0 Issues for IDE Assignment
 * 
 * Analyzes complexity and assigns appropriate IDE labels:
 * - windsurf-ready: Low complexity (1-3 points)
 * - hybrid-ready: Medium complexity (4-8 points)  
 * - antigravity-ready: High complexity (9+ points)
 */

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN required');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Phase 0 issue assignments based on what Antigravity completed
const assignments = {
  // Completed by Antigravity
  completed: [2, 4, 5, 6, 9, 10, 11],
  
  // Remaining Phase 0 issues for Windsurf
  windsurf: [
    3,  // Repository Structure  (2 pts - simple)
    7,  // Error Handling (3 pts - simple)
    8,  // Security (3 pts - simple)
  ],
  
  // Complex issues for Antigravity if needed
  antigravity: [
    // Add any complex remaining issues here
  ],
  
  // Medium complexity - either IDE
  hybrid: [
    // Add medium complexity issues here
  ]
};

async function labelIssues() {
  console.log('\n🏷️  Labeling Phase 0 Issues for IDE Assignment\n');
  
  // Label Windsurf issues
  for (const issueNum of assignments.windsurf) {
    try {
      await octokit.issues.addLabels({
        owner: OWNER,
        repo: REPO,
        issue_number: issueNum,
        labels: ['windsurf-ready', 'phase-0']
      });
      console.log(`✅ Issue #${issueNum}: Added windsurf-ready`);
    } catch (error) {
      console.log(`⚠️  Issue #${issueNum}: ${error.message}`);
    }
  }
  
  // Label Antigravity issues  
  for (const issueNum of assignments.antigravity) {
    try {
      await octokit.issues.addLabels({
        owner: OWNER,
        repo: REPO,
        issue_number: issueNum,
        labels: ['antigravity-ready', 'phase-0']
      });
      console.log(`✅ Issue #${issueNum}: Added antigravity-ready`);
    } catch (error) {
      console.log(`⚠️  Issue #${issueNum}: ${error.message}`);
    }
  }
  
  // Label Hybrid issues
  for (const issueNum of assignments.hybrid) {
    try {
      await octokit.issues.addLabels({
        owner: OWNER,
        repo: REPO,
        issue_number: issueNum,
        labels: ['hybrid-ready', 'phase-0']
      });
      console.log(`✅ Issue #${issueNum}: Added hybrid-ready`);
    } catch (error) {
      console.log(`⚠️  Issue #${issueNum}: ${error.message}`);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Antigravity completed: ${assignments.completed.length} issues`);
  console.log(`   Windsurf ready: ${assignments.windsurf.length} issues`);
  console.log(`   Antigravity ready: ${assignments.antigravity.length} issues`);
  console.log(`   Hybrid ready: ${assignments.hybrid.length} issues`);
  console.log('\n✅ Windsurf can now pick up labeled issues!\n');
}

labelIssues().catch(console.error);
