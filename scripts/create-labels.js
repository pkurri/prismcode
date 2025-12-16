#!/usr/bin/env node

/**
 * Create Standard Labels for PrismCode
 */

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const labels = [
  // Type Labels
  { name: 'epic', color: '7C3AED', description: 'Strategic initiative spanning multiple stories' },
  { name: 'story', color: '06B6D4', description: 'User story (feature-level work)' },
  { name: 'task', color: '10B981', description: 'Implementation task' },
  { name: 'bug', color: 'D73A4A', description: 'Bug report' },
  
  // Phase Labels
  { name: 'phase-0', color: 'F59E0B', description: 'Phase 0: Foundation' },
  { name: 'phase-1', color: 'F59E0B', description: 'Phase 1: Core Agents' },
  { name: 'phase-2', color: 'F59E0B', description: 'Phase 2: GitHub Integration' },
  { name: 'phase-3', color: 'F59E0B', description: 'Phase 3: IDE Integrations' },
  { name: 'phase-4', color: 'F59E0B', description: 'Phase 4: Advanced Features' },
  { name: 'phase-5', color: 'F59E0B', description: 'Phase 5: Production Release' },
  
  // Priority Labels
  { name: 'priority:P0', color: 'D73A4A', description: 'Critical (blocking)' },
  { name: 'priority:P1', color: 'FFA500', description: 'High priority' },
  { name: 'priority:P2', color: 'FFD700', description: 'Medium priority' },
  { name: 'priority:P3', color: '90EE90', description: 'Low priority' },
  
  // Component Labels
  { name: 'infrastructure', color: '6366F1', description: 'Infrastructure work' },
  { name: 'ai-agent', color: '3B82F6', description: 'AI agent development' },
  { name: 'github-integration', color: '8B5CF6', description: 'GitHub API integration' },
  { name: 'ide-integration', color: 'A855F7', description: 'IDE plugin/extension' },
  { name: 'frontend', color: 'EC4899', description: 'Frontend work' },
  { name: 'backend', color: '8B5CF6', description: 'Backend work' },
  { name: 'database', color: '6366F1', description: 'Database work' },
  { name: 'devops', color: '6366F1', description: 'DevOps/CI-CD work' },
  { name: 'testing', color: '10B981', description: 'Testing work' },
  { name: 'documentation', color: '64748B', description: 'Documentation' },
  { name: 'advanced', color: 'A855F7', description: 'Advanced features' },
  { name: 'launch', color: 'EC4899', description: 'Launch preparation' }
];

async function createLabels() {
  console.log('🏷️  Creating GitHub Labels...\n');

  for (const label of labels) {
    try {
      await octokit.issues.createLabel({
        owner: OWNER,
        repo: REPO,
        ...label
      });
      
      console.log(`✅ Created: ${label.name}`);
    } catch (error) {
      if (error.status === 422) {
        console.log(`⏭️  Exists: ${label.name}`);
      } else {
        console.error(`❌ Failed: ${label.name} - ${error.message}`);
      }
    }
  }

  console.log('\n🎉 Labels created!');
}

createLabels();