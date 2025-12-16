#!/usr/bin/env node

/**
 * PrismCode Bulk Issue Importer
 * Imports all 140 remaining issues from prismcode-151-issues-import.json
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';
const BATCH_SIZE = 5; // Smaller batches to avoid rate limits
const DELAY_MS = 3000; // 3 seconds between batches

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable not set\n');
  console.error('Set it with:');
  console.error('  export GITHUB_TOKEN=ghp_your_token_here\n');
  console.error('Get a token: https://github.com/settings/tokens/new');
  console.error('Required scopes: repo, workflow\n');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createIssue(issue, index, total) {
  try {
    const response = await octokit.issues.create({
      owner: OWNER,
      repo: REPO,
      title: issue.title,
      body: issue.body,
      labels: issue.labels
    });
    
    console.log(`✅ [${index}/${total}] Created issue #${response.data.number}: ${issue.title}`);
    return { success: true, number: response.data.number };
  } catch (error) {
    console.error(`❌ [${index}/${total}] Failed: ${issue.title}`);
    console.error(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function importIssues() {
  console.log('\n🚀 PrismCode Issue Import Script\n');
  console.log('='.repeat(60));
  console.log(`📊 Repository: ${OWNER}/${REPO}`);
  console.log(`⏱️  Batch size: ${BATCH_SIZE}`);
  console.log(`⏳ Delay: ${DELAY_MS}ms between batches`);
  console.log('='.repeat(60));
  console.log('');

  // Load issues from JSON file
  const importFilePath = path.join(__dirname, '..', 'prismcode-151-issues-import.json');
  
  if (!fs.existsSync(importFilePath)) {
    console.error('❌ Error: prismcode-151-issues-import.json not found!');
    console.error('   Expected location:', importFilePath);
    process.exit(1);
  }

  const importData = JSON.parse(fs.readFileSync(importFilePath, 'utf-8'));
  const issues = importData.issues || [];
  
  console.log(`📋 Loaded ${issues.length} issues from import file\n`);

  // Process in batches
  const results = {
    success: 0,
    failed: 0,
    total: issues.length
  };

  for (let i = 0; i < issues.length; i += BATCH_SIZE) {
    const batch = issues.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(issues.length / BATCH_SIZE);
    
    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (Issues ${i+1}-${Math.min(i+BATCH_SIZE, issues.length)})`);
    console.log('-'.repeat(60));
    
    // Process batch sequentially to avoid rate limits
    for (let j = 0; j < batch.length; j++) {
      const issue = batch[j];
      const globalIndex = i + j + 1;
      const result = await createIssue(issue, globalIndex, issues.length);
      
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
      }
      
      // Small delay between individual issues
      if (j < batch.length - 1) {
        await sleep(500);
      }
    }
    
    // Wait before next batch
    if (i + BATCH_SIZE < issues.length) {
      console.log(`\n⏳ Waiting ${DELAY_MS}ms before next batch...`);
      await sleep(DELAY_MS);
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

importIssues().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});