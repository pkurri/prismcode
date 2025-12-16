#!/usr/bin/env node

/**
 * Create GitHub Milestones for Each Phase
 */

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const milestones = [
  {
    title: 'Phase 0: Foundation',
    description: 'Project infrastructure, CI/CD, testing, and documentation setup',
    due_on: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks
  },
  {
    title: 'Phase 1: Core Agents',
    description: 'Multi-agent orchestration system with 7 specialized agents',
    due_on: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toISOString() // 8 weeks
  },
  {
    title: 'Phase 2: GitHub Integration',
    description: 'Complete GitHub API integration, webhooks, and automation',
    due_on: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000).toISOString() // 12 weeks
  },
  {
    title: 'Phase 3: IDE Integrations',
    description: 'VS Code, Cursor, Windsurf, JetBrains, and Neovim extensions',
    due_on: new Date(Date.now() + 112 * 24 * 60 * 60 * 1000).toISOString() // 16 weeks
  },
  {
    title: 'Phase 4: Advanced Features',
    description: 'n8n workflows, analytics dashboard, multi-repo management',
    due_on: new Date(Date.now() + 140 * 24 * 60 * 60 * 1000).toISOString() // 20 weeks
  },
  {
    title: 'Phase 5: Production Release',
    description: 'Documentation, examples, marketing, and public launch',
    due_on: new Date(Date.now() + 168 * 24 * 60 * 60 * 1000).toISOString() // 24 weeks
  }
];

async function createMilestones() {
  console.log('🎯 Creating GitHub Milestones...\n');

  for (const milestone of milestones) {
    try {
      const response = await octokit.issues.createMilestone({
        owner: OWNER,
        repo: REPO,
        ...milestone
      });
      
      console.log(`✅ Created: ${milestone.title}`);
      console.log(`   Due: ${milestone.due_on}`);
      console.log(`   URL: ${response.data.html_url}\n`);
    } catch (error) {
      console.error(`❌ Failed: ${milestone.title}`);
      console.error(`   Error: ${error.message}\n`);
    }
  }

  console.log('🎉 Milestones created!');
}

createMilestones();