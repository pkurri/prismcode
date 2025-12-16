#!/usr/bin/env node

/**
 * Create IDE-specific labels for Windsurf and Antigravity
 */

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN not set');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

const ideLabels = [
  {
    name: 'windsurf-ready',
    color: '0EA5E9',
    description: '🌊 Best implemented with Windsurf Cascade'
  },
  {
    name: 'antigravity-ready',
    color: 'A855F7',
    description: '🪐 Best implemented with Antigravity multi-agent'
  },
  {
    name: 'hybrid-ready',
    color: '10B981',
    description: '🟢 Works well with either IDE'
  },
  {
    name: 'windsurf-completed',
    color: '06B6D4',
    description: '✅ Completed by Windsurf'
  },
  {
    name: 'antigravity-completed',
    color: '8B5CF6',
    description: '✅ Completed by Antigravity'
  },
  {
    name: 'windsurf-synced',
    color: 'DBEAFE',
    description: '🔄 Synced to Windsurf'
  },
  {
    name: 'antigravity-synced',
    color: 'EDE9FE',
    description: '🔄 Synced to Antigravity'
  },
  {
    name: 'sync-needed',
    color: 'FCD34D',
    description: '⚠️ Needs cross-IDE synchronization'
  },
  {
    name: 'ui-heavy',
    color: 'EC4899',
    description: '🎨 Heavy UI/frontend work'
  }
];

async function createLabels() {
  console.log('🏷️  Creating IDE-specific labels...\n');

  for (const label of ideLabels) {
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

  console.log('\n🎉 IDE labels created!');
  console.log('\n📊 Label Summary:');
  console.log('  🌊 Windsurf: 3 labels');
  console.log('  🪐 Antigravity: 3 labels');
  console.log('  🔄 Sync: 2 labels');
  console.log('  🎨 Specialty: 1 label');
}

createLabels().catch(console.error);
