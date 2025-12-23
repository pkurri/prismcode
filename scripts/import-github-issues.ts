#!/usr/bin/env npx ts-node
/**
 * GitHub Issues Bulk Import Script
 * 
 * Usage:
 *   GITHUB_TOKEN=your_token npx ts-node scripts/import-github-issues.ts [phase-4|phase-5|all]
 * 
 * Prerequisites:
 *   - GitHub Personal Access Token with 'repo' scope
 *   - Set GITHUB_TOKEN environment variable
 */

import * as fs from 'fs';
import * as path from 'path';

interface GitHubIssue {
  title: string;
  body: string;
  labels: string[];
}

interface CreateIssueResponse {
  number: number;
  html_url: string;
  title: string;
}

const REPO_OWNER = 'pkurri';
const REPO_NAME = 'prismcode';
const API_BASE = 'https://api.github.com';

// Rate limiting: GitHub allows 5000 requests/hour for authenticated users
const DELAY_MS = 1000; // 1 second between requests to be safe

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createLabel(token: string, name: string, color: string, description: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/labels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({ name, color, description })
    });

    if (response.status === 201) {
      console.log(`  ✅ Created label: ${name}`);
    } else if (response.status === 422) {
      // Label already exists
      console.log(`  ⏭️  Label exists: ${name}`);
    } else {
      console.log(`  ⚠️  Label ${name}: ${response.status}`);
    }
  } catch (error) {
    console.error(`  ❌ Failed to create label ${name}:`, error);
  }
}

async function ensureLabelsExist(token: string, issues: GitHubIssue[]): Promise<void> {
  console.log('\n📋 Ensuring labels exist...\n');
  
  // Collect all unique labels
  const labelSet = new Set<string>();
  issues.forEach(issue => issue.labels.forEach(label => labelSet.add(label)));
  
  // Define label colors
  const labelColors: Record<string, { color: string; description: string }> = {
    // Type labels
    'epic': { color: '7057ff', description: 'Large feature spanning multiple stories' },
    'story': { color: '0e8a16', description: 'User story with acceptance criteria' },
    'task': { color: 'fbca04', description: 'Small, specific task' },
    
    // Phase labels
    'phase-3': { color: '1d76db', description: 'Phase 3: IDE Extensions' },
    'phase-4': { color: '5319e7', description: 'Phase 4: Advanced Features' },
    'phase-5': { color: 'b60205', description: 'Phase 5: Enterprise & Launch' },
    
    // Priority labels
    'priority:P0': { color: 'b60205', description: 'Critical - must have' },
    'priority:P1': { color: 'd93f0b', description: 'High priority' },
    'priority:P2': { color: 'fbca04', description: 'Medium priority' },
    
    // Component labels
    'frontend': { color: '1d76db', description: 'Frontend/UI work' },
    'backend': { color: '0e8a16', description: 'Backend/API work' },
    'ide-integration': { color: 'd4c5f9', description: 'IDE extension work' },
    'deployment': { color: 'f9d0c4', description: 'Deployment infrastructure' },
    'security': { color: 'b60205', description: 'Security-related work' },
    'observability': { color: 'bfdadc', description: 'Monitoring and logging' },
    'integration': { color: 'c5def5', description: 'Third-party integrations' },
    'infrastructure': { color: 'e99695', description: 'Infrastructure work' },
    'api': { color: '0052cc', description: 'API development' },
    'ai': { color: 'ff7619', description: 'AI/ML features' },
    
    // Market labels
    'competitive-parity': { color: 'd93f0b', description: 'Matching competitor features' },
    'enterprise': { color: '006b75', description: 'Enterprise features' },
    'developer-experience': { color: '0e8a16', description: 'DX improvements' },
  };
  
  for (const label of labelSet) {
    const config = labelColors[label] || { color: 'ededed', description: '' };
    await createLabel(token, label, config.color, config.description);
    await sleep(300); // Rate limit for label creation
  }
}

async function createIssue(token: string, issue: GitHubIssue): Promise<CreateIssueResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        title: issue.title,
        body: issue.body,
        labels: issue.labels
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return await response.json() as CreateIssueResponse;
  } catch (error) {
    console.error(`  ❌ Failed to create issue "${issue.title}":`, error);
    return null;
  }
}

async function importIssues(token: string, issues: GitHubIssue[], phase: string): Promise<void> {
  console.log(`\n🚀 Importing ${issues.length} issues for ${phase}...\n`);
  
  let created = 0;
  let failed = 0;
  
  // Import EPICs first, then stories
  const epics = issues.filter(i => i.title.includes('[EPIC]'));
  const stories = issues.filter(i => i.title.includes('[STORY]'));
  const tasks = issues.filter(i => i.title.includes('[TASK]'));
  
  const orderedIssues = [...epics, ...stories, ...tasks];
  
  for (let i = 0; i < orderedIssues.length; i++) {
    const issue = orderedIssues[i];
    const progress = `[${i + 1}/${orderedIssues.length}]`;
    
    console.log(`${progress} Creating: ${issue.title.substring(0, 60)}...`);
    
    const result = await createIssue(token, issue);
    
    if (result) {
      console.log(`  ✅ Created #${result.number}: ${result.html_url}`);
      created++;
    } else {
      failed++;
    }
    
    // Rate limiting
    await sleep(DELAY_MS);
  }
  
  console.log(`\n📊 Import Summary:`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📋 Total: ${orderedIssues.length}`);
}

async function main(): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    console.error('❌ Error: GITHUB_TOKEN environment variable is required');
    console.error('   Set it with: $env:GITHUB_TOKEN="ghp_your_token_here"');
    process.exit(1);
  }
  
  const phase = process.argv[2] || 'all';
  const validPhases = ['phase-4', 'phase-5', 'all'];
  
  if (!validPhases.includes(phase)) {
    console.error(`❌ Invalid phase: ${phase}`);
    console.error(`   Valid options: ${validPhases.join(', ')}`);
    process.exit(1);
  }
  
  console.log('🔷 PrismCode GitHub Issues Import Tool');
  console.log(`   Repository: ${REPO_OWNER}/${REPO_NAME}`);
  console.log(`   Phase: ${phase}`);
  
  // Load issues based on phase
  let allIssues: GitHubIssue[] = [];
  const scriptsDir = path.dirname(__filename);
  const rootDir = path.dirname(scriptsDir);
  
  if (phase === 'phase-4' || phase === 'all') {
    const phase4Path = path.join(rootDir, 'github-issues-phase-4.json');
    if (fs.existsSync(phase4Path)) {
      const phase4Issues = JSON.parse(fs.readFileSync(phase4Path, 'utf-8')) as GitHubIssue[];
      allIssues.push(...phase4Issues);
      console.log(`   📂 Loaded ${phase4Issues.length} Phase 4 issues`);
    }
  }
  
  if (phase === 'phase-5' || phase === 'all') {
    const phase5Path = path.join(rootDir, 'github-issues-phase-5.json');
    if (fs.existsSync(phase5Path)) {
      const phase5Issues = JSON.parse(fs.readFileSync(phase5Path, 'utf-8')) as GitHubIssue[];
      allIssues.push(...phase5Issues);
      console.log(`   📂 Loaded ${phase5Issues.length} Phase 5 issues`);
    }
  }
  
  if (allIssues.length === 0) {
    console.error('❌ No issues found to import');
    process.exit(1);
  }
  
  // Confirm before proceeding
  console.log(`\n⚠️  This will create ${allIssues.length} issues in ${REPO_OWNER}/${REPO_NAME}`);
  console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  await sleep(5000);
  
  // Ensure labels exist first
  await ensureLabelsExist(token, allIssues);
  
  // Import issues
  await importIssues(token, allIssues, phase);
  
  console.log('\n✨ Done!');
}

main().catch(console.error);
