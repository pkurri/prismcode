#!/usr/bin/env node

/**
 * PrismCode Phase 0 Project Setup
 * 
 * This script:
 * 1. Creates a GitHub Project V2 for "Phase 0: Foundation"
 * 2. Sets up custom fields for agent assignment
 * 3. Groups issues by agent for parallel execution
 * 4. Configures workflow automation
 */

const { graphql } = require('@octokit/graphql');
const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

if (!GITHUB_TOKEN) {
  console.error('❌ Error: GITHUB_TOKEN environment variable not set\n');
  console.error('Set it with:');
  console.error('  $env:GITHUB_TOKEN="ghp_your_token_here"  # PowerShell');
  console.error('  export GITHUB_TOKEN=ghp_your_token_here  # Bash\n');
  console.error('Get a token: https://github.com/settings/tokens/new');
  console.error('Required scopes: repo, project, workflow\n');
  process.exit(1);
}

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${GITHUB_TOKEN}`,
  },
});

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function getRepositoryNodeId() {
  const { repository } = await graphqlWithAuth(`
    query {
      repository(owner: "${OWNER}", name: "${REPO}") {
        id
      }
    }
  `);
  return repository.id;
}

async function getUserNodeId() {
  const { viewer } = await graphqlWithAuth(`
    query {
      viewer {
        id
        login
      }
    }
  `);
  console.log(`👤 Authenticated as: ${viewer.login}`);
  return viewer.id;
}

async function createProject(ownerId) {
  console.log('\n📋 Creating GitHub Project V2: "Phase 0: Foundation"...');
  
  const { createProjectV2 } = await graphqlWithAuth(`
    mutation {
      createProjectV2(input: {
        ownerId: "${ownerId}",
        title: "Phase 0: Foundation",
        repositoryId: null
      }) {
        projectV2 {
          id
          number
          url
        }
      }
    }
  `);
  
  const project = createProjectV2.projectV2;
  console.log(`✅ Project created: ${project.url}`);
  return project;
}

async function createCustomFields(projectId) {
  console.log('\n🔧 Creating custom fields...');
  
  // Create "Agent" single select field
  const { createProjectV2Field: agentField } = await graphqlWithAuth(`
    mutation {
      createProjectV2Field(input: {
        projectId: "${projectId}",
        dataType: SINGLE_SELECT,
        name: "Agent"
      }) {
        projectV2Field {
          ... on ProjectV2SingleSelectField {
            id
            name
          }
        }
      }
    }
  `);
  
  console.log('✅ Created "Agent" field');
  
  // Add agent options
  const agents = [
    'DevOps Agent',
    'Infrastructure Agent',
    'Testing Agent',
    'Documentation Agent',
    'Code Quality Agent',
    'Monitoring Agent'
  ];
  
  for (const agent of agents) {
    await graphqlWithAuth(`
      mutation {
        updateProjectV2Field(input: {
          fieldId: "${agentField.projectV2Field.id}",
          name: "Agent",
          singleSelectOptions: [{
            name: "${agent}",
            color: "BLUE"
          }]
        }) {
          projectV2Field {
            ... on ProjectV2SingleSelectField {
              id
            }
          }
        }
      }
    `);
  }
  
  console.log(`✅ Added ${agents.length} agent options`);
  
  // Create "Story Points" number field
  const { createProjectV2Field: pointsField } = await graphqlWithAuth(`
    mutation {
      createProjectV2Field(input: {
        projectId: "${projectId}",
        dataType: NUMBER,
        name: "Story Points"
      }) {
        projectV2Field {
          ... on ProjectV2Field {
            id
            name
          }
        }
      }
    }
  `);
  
  console.log('✅ Created "Story Points" field');
  
  return {
    agentFieldId: agentField.projectV2Field.id,
    pointsFieldId: pointsField.projectV2Field.id
  };
}

async function getPhase0Issues() {
  console.log('\n🔍 Fetching Phase 0 issues...');
  
  const { data: issues } = await octokit.issues.listForRepo({
    owner: OWNER,
    repo: REPO,
    labels: 'phase-0',
    state: 'all',
    per_page: 100
  });
  
  console.log(`✅ Found ${issues.length} Phase 0 issues`);
  return issues;
}

async function addIssuesToProject(projectId, issues) {
  console.log('\n📌 Adding issues to project...');
  
  const addedItems = [];
  
  for (const issue of issues) {
    try {
      const { addProjectV2ItemById } = await graphqlWithAuth(`
        mutation {
          addProjectV2ItemById(input: {
            projectId: "${projectId}",
            contentId: "${issue.node_id}"
          }) {
            item {
              id
            }
          }
        }
      `);
      
      addedItems.push({
        itemId: addedItems.item.id,
        issueNumber: issue.number,
        issueTitle: issue.title
      });
      
      console.log(`✅ Added #${issue.number}: ${issue.title}`);
    } catch (error) {
      console.error(`❌ Failed to add #${issue.number}: ${error.message}`);
    }
  }
  
  return addedItems;
}

async function setupProjectViews(projectId) {
  console.log('\n👁️  Setting up project views...');
  
  // The default view will be "Board" grouped by "Agent"
  // This is typically done through the UI, but we'll note it here
  console.log('ℹ️  Manual step required:');
  console.log('   1. Go to the project');
  console.log('   2. Click "View" dropdown');
  console.log('   3. Group by → Agent');
  console.log('   4. This will create swim lanes for each agent');
}

async function generateAgentManifest(issues) {
  console.log('\n📝 Generating agent assignment manifest...');
  
  // Define agent assignment strategy
  const agentAssignments = {
    'DevOps Agent': [],
    'Infrastructure Agent': [],
    'Testing Agent': [],
    'Documentation Agent': [],
    'Code Quality Agent': [],
    'Monitoring Agent': []
  };
  
  // Smart assignment based on issue labels and content
  for (const issue of issues) {
    const labels = issue.labels.map(l => l.name);
    const title = issue.title.toLowerCase();
    
    if (labels.includes('infrastructure') || title.includes('setup') || title.includes('environment')) {
      agentAssignments['Infrastructure Agent'].push(issue);
    } else if (labels.includes('devops') || title.includes('ci/cd') || title.includes('deployment')) {
      agentAssignments['DevOps Agent'].push(issue);
    } else if (labels.includes('testing') || title.includes('test')) {
      agentAssignments['Testing Agent'].push(issue);
    } else if (labels.includes('documentation') || title.includes('docs')) {
      agentAssignments['Documentation Agent'].push(issue);
    } else if (title.includes('lint') || title.includes('prettier') || title.includes('eslint')) {
      agentAssignments['Code Quality Agent'].push(issue);
    } else if (title.includes('monitoring') || title.includes('logging') || title.includes('sentry')) {
      agentAssignments['Monitoring Agent'].push(issue);
    } else {
      // Default to Infrastructure Agent for unmatched
      agentAssignments['Infrastructure Agent'].push(issue);
    }
  }
  
  console.log('\n📊 Agent Assignment Summary:');
  for (const [agent, assignedIssues] of Object.entries(agentAssignments)) {
    console.log(`   ${agent}: ${assignedIssues.length} issues`);
  }
  
  return agentAssignments;
}

async function main() {
  console.log('\n🚀 Phase 0 Project Setup');
  console.log('='.repeat(60));
  console.log(`📦 Repository: ${OWNER}/${REPO}`);
  console.log('='.repeat(60));
  
  try {
    // Step 1: Get repository and user IDs
    const repoId = await getRepositoryNodeId();
    const userId = await getUserNodeId();
    
    // Step 2: Create the project
    const project = await createProject(userId);
    
    // Step 3: Create custom fields
    const fields = await createCustomFields(project.id);
    
    // Step 4: Get Phase 0 issues
    const issues = await getPhase0Issues();
    
    if (issues.length === 0) {
      console.log('\n⚠️  Warning: No Phase 0 issues found!');
      console.log('   Please import issues first using:');
      console.log('   node scripts/import-all-issues.js');
      return;
    }
    
    // Step 5: Add issues to project
    const projectItems = await addIssuesToProject(project.id, issues);
    
    // Step 6: Generate agent assignments
    const agentAssignments = await generateAgentManifest(issues);
    
    // Step 7: Save agent assignment manifest
    const fs = require('fs');
    const path = require('path');
    const manifestPath = path.join(__dirname, '..', 'phase0-agent-assignments.json');
    
    fs.writeFileSync(manifestPath, JSON.stringify({
      projectId: project.id,
      projectUrl: project.url,
      projectNumber: project.number,
      createdAt: new Date().toISOString(),
      agentAssignments,
      fields,
      summary: {
        totalIssues: issues.length,
        agentCount: Object.keys(agentAssignments).length
      }
    }, null, 2));
    
    console.log(`\n✅ Agent manifest saved to: ${manifestPath}`);
    
    // Step 8: Setup views
    await setupProjectViews(project.id);
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📋 Project URL: ${project.url}`);
    console.log(`📊 Total Issues: ${issues.length}`);
    console.log(`🤖 Agents: ${Object.keys(agentAssignments).length}`);
    console.log(`📁 Manifest: phase0-agent-assignments.json`);
    console.log('\n📌 Next Steps:');
    console.log('   1. Open the project in GitHub');
    console.log('   2. Group by "Agent" field');
    console.log('   3. Run: node scripts/assign-agents.js');
    console.log('   4. Run: node scripts/execute-parallel.js');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n💥 Error:', error.message);
    if (error.errors) {
      console.error('Details:', JSON.stringify(error.errors, null, 2));
    }
    process.exit(1);
  }
}

main();
