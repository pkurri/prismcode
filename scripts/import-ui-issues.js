#!/usr/bin/env node

/**
 * PrismCode UI Issues Importer
 * Imports UI-focused issues from ui-issues-complete.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OWNER = 'pkurri';
const REPO = 'prismcode';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Labels that commonly exist in GitHub repos
const ALLOWED_LABELS = ['story', 'frontend', 'backend', 'bug', 'enhancement', 'documentation'];

async function createIssueWithCLI(issue, index, total) {
  try {
    // Create a temp file for the body to handle special characters
    const tempBodyFile = path.join(__dirname, '.temp-issue-body.md');
    fs.writeFileSync(tempBodyFile, issue.body, 'utf-8');

    // Filter labels to only include common ones that likely exist
    const filteredLabels = issue.labels
      ? issue.labels.filter((label) => ALLOWED_LABELS.includes(label))
      : [];

    // Build labels argument - only if we have valid labels
    const labelsArg = filteredLabels.length > 0 ? `--label "${filteredLabels.join(',')}"` : '';

    // Create the issue using GitHub CLI
    const cmd = `gh issue create --repo ${OWNER}/${REPO} --title "${issue.title.replace(/"/g, '\\"')}" --body-file "${tempBodyFile}" ${labelsArg}`;

    const result = execSync(cmd, { encoding: 'utf-8' });
    const issueUrl = result.trim();
    const issueNumber = issueUrl.split('/').pop();

    // Clean up temp file
    fs.unlinkSync(tempBodyFile);

    console.log(`✅ [${index}/${total}] Created issue #${issueNumber}: ${issue.title}`);
    return { success: true, number: issueNumber, url: issueUrl };
  } catch (error) {
    console.error(`❌ [${index}/${total}] Failed: ${issue.title}`);
    console.error(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function importIssues() {
  console.log('\n🚀 PrismCode UI Issues Import Script\n');
  console.log('='.repeat(60));
  console.log(`📊 Repository: ${OWNER}/${REPO}`);
  console.log('='.repeat(60));
  console.log('');

  // Check GitHub CLI auth
  try {
    execSync('gh auth status', { encoding: 'utf-8', stdio: 'pipe' });
    console.log('✅ GitHub CLI authenticated\n');
  } catch (error) {
    console.error('❌ Error: GitHub CLI not authenticated');
    console.error('Run: gh auth login');
    process.exit(1);
  }

  // Load issues from JSON file
  const importFilePath = path.join(__dirname, '..', 'issues', 'ui-issues-complete.json');

  if (!fs.existsSync(importFilePath)) {
    console.error('❌ Error: ui-issues-complete.json not found!');
    console.error('   Expected location:', importFilePath);
    process.exit(1);
  }

  const issues = JSON.parse(fs.readFileSync(importFilePath, 'utf-8'));

  console.log(`📋 Loaded ${issues.length} issues from import file\n`);

  // Process issues
  const results = {
    success: 0,
    failed: 0,
    total: issues.length,
    created: [],
  };

  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    const result = await createIssueWithCLI(issue, i + 1, issues.length);

    if (result.success) {
      results.success++;
      results.created.push(result);
    } else {
      results.failed++;
    }

    // Wait 1 second between issues to avoid rate limits
    if (i < issues.length - 1) {
      await sleep(1000);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully created: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📝 Total processed: ${results.total}`);
  console.log(`📈 Success rate: ${((results.success / results.total) * 100).toFixed(1)}%`);
  console.log('\n🎉 Import complete!');
  console.log(`\n🔗 View issues: https://github.com/${OWNER}/${REPO}/issues`);
}

importIssues().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
