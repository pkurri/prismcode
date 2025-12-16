#!/usr/bin/env node

/**
 * Bulk Import Script for PrismCode Issues
 * Imports all 142 remaining issues to GitHub
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';
const BATCH_SIZE = 10;
const DELAY_MS = 2000; // 2 seconds between batches

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable not set');
  console.error('\nSet it with:');
  console.error('  export GITHUB_TOKEN=ghp_your_token_here');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createIssue(issue) {
  try {
    const response = await octokit.issues.create({
      owner: OWNER,
      repo: REPO,
      title: issue.title,
      body: issue.body,
      labels: issue.labels
    });
    
    console.log(`✅ Created issue #${response.data.number}: ${issue.title}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to create: ${issue.title}`);
    console.error(`   Error: ${error.message}`);
    return null;
  }
}

async function importIssues() {
  console.log('🚀 PrismCode Issue Import Script\n');
  console.log(`📊 Repository: ${OWNER}/${REPO}`);
  console.log(`⏱️  Batch size: ${BATCH_SIZE}`);
  console.log(`⌛ Delay: ${DELAY_MS}ms between batches\n`);

  // Load issues
  const roadmapPath = path.join(__dirname, '..', 'COMPLETE_PRISMCODE_ROADMAP.json');
  const roadmap = JSON.parse(fs.readFileSync(roadmapPath, 'utf-8'));
  
  const issues = roadmap.issues;
  console.log(`📋 Total issues to import: ${issues.length}\n`);

  // Process in batches
  const results = {
    success: 0,
    failed: 0,
    skipped: 0
  };

  for (let i = 0; i < issues.length; i += BATCH_SIZE) {
    const batch = issues.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(issues.length / BATCH_SIZE);
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (Issues ${i+1}-${Math.min(i+BATCH_SIZE, issues.length)})`);
    
    // Process batch in parallel
    const promises = batch.map(issue => createIssue(issue));
    const batchResults = await Promise.all(promises);
    
    // Count results
    batchResults.forEach(result => {
      if (result) results.success++;
      else results.failed++;
    });
    
    // Wait before next batch (respect rate limits)
    if (i + BATCH_SIZE < issues.length) {
      console.log(`⏳ Waiting ${DELAY_MS}ms before next batch...`);
      await sleep(DELAY_MS);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully created: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📝 Total: ${results.success + results.failed}`);
  console.log('\n🎉 Import complete!');
  console.log(`\n🔗 View issues: https://github.com/${OWNER}/${REPO}/issues`);
}

importIssues().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});