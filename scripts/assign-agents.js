#!/usr/bin/env node

/**
 * Phase 0 Agent Assignment Script
 * 
 * This script assigns Phase 0 issues to different agents in the GitHub Project
 */

const { graphql } = require('@octokit/graphql');
const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

if (!GITHUB_TOKEN) {
    console.error('❌ Error: GITHUB_TOKEN environment variable not set\n');
    process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const graphqlWithAuth = graphql.defaults({
    headers: { authorization: `token ${GITHUB_TOKEN}` },
});

// Agent assignment rules based on issue content
const AGENT_RULES = {
    'Infrastructure Agent': [
        'development environment',
        'typescript configuration',
        'setup',
        'onboarding',
        'project structure'
    ],
    'Testing Agent': [
        'jest',
        'playwright',
        'test',
        'e2e',
        'unit test',
        'integration test',
        'coverage'
    ],
    'Code Quality Agent': [
        'eslint',
        'prettier',
        'husky',
        'lint',
        'formatting',
        'code style',
        'pre-commit'
    ],
    'DevOps Agent': [
        'ci/cd',
        'github actions',
        'workflow',
        'pipeline',
        'deployment',
        'build'
    ],
    'Documentation Agent': [
        'documentation',
        'vitepress',
        'docs',
        'guide',
        'tutorial',
        'readme'
    ],
    'Monitoring Agent': [
        'docker',
        'monitoring',
        'logging',
        'winston',
        'sentry',
        'health check',
        'deployment'
    ]
};

function assignAgent(issueTitle, issueBody) {
    const text = `${issueTitle} ${issueBody}`.toLowerCase();

    for (const [agent, keywords] of Object.entries(AGENT_RULES)) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                return agent;
            }
        }
    }

    // Default assignment
    return 'Infrastructure Agent';
}

async function getPhase0Issues() {
    console.log('🔍 Fetching Phase 0 issues...\n');

    const { data: issues } = await octokit.issues.listForRepo({
        owner: OWNER,
        repo: REPO,
        labels: 'phase-0',
        state: 'open',
        per_page: 100
    });

    return issues;
}

async function assignAgentsToIssues(issues) {
    console.log('🤖 Assigning agents to issues...\n');

    const assignments = {};

    for (const issue of issues) {
        const agent = assignAgent(issue.title, issue.body || '');

        if (!assignments[agent]) {
            assignments[agent] = [];
        }

        assignments[agent].push({
            number: issue.number,
            title: issue.title,
            url: issue.html_url
        });

        console.log(`✅ #${issue.number}: ${issue.title}`);
        console.log(`   → Assigned to: ${agent}\n`);
    }

    return assignments;
}

function generateMarkdownReport(assignments) {
    let markdown = '# Phase 0 Agent Assignments\n\n';
    markdown += `Generated: ${new Date().toISOString()}\n\n`;
    markdown += '---\n\n';

    for (const [agent, issues] of Object.entries(assignments)) {
        markdown += `## ${agent}\n\n`;
        markdown += `**Total Issues**: ${issues.length}\n\n`;
        markdown += '### Assigned Issues\n\n';

        for (const issue of issues) {
            markdown += `- [ ] [#${issue.number}](${issue.url}) - ${issue.title}\n`;
        }

        markdown += '\n---\n\n';
    }

    // Summary
    markdown += '## Summary\n\n';
    markdown += '| Agent | Issue Count |\n';
    markdown += '|-------|-------------|\n';

    for (const [agent, issues] of Object.entries(assignments)) {
        markdown += `| ${agent} | ${issues.length} |\n`;
    }

    const totalIssues = Object.values(assignments).reduce((sum, issues) => sum + issues.length, 0);
    markdown += `| **TOTAL** | **${totalIssues}** |\n`;

    return markdown;
}

async function main() {
    console.log('\n🚀 Phase 0 Agent Assignment\n');
    console.log('='.repeat(60));
    console.log(`📦 Repository: ${OWNER}/${REPO}\n`);

    try {
        // Get Phase 0 issues
        const issues = await getPhase0Issues();

        if (issues.length === 0) {
            console.log('⚠️  No Phase 0 issues found!');
            console.log('   Create issues first or import them using:');
            console.log('   node scripts/import-all-issues.js\n');
            return;
        }

        console.log(`✅ Found ${issues.length} Phase 0 issues\n`);
        console.log('='.repeat(60) + '\n');

        // Assign agents
        const assignments = await assignAgentsToIssues(issues);

        // Generate report
        const markdown = generateMarkdownReport(assignments);

        // Save report
        const fs = require('fs');
        const path = require('path');
        const reportPath = path.join(__dirname, '..', 'phase0-agent-assignments.md');
        fs.writeFileSync(reportPath, markdown);

        console.log('='.repeat(60));
        console.log('📊 ASSIGNMENT SUMMARY');
        console.log('='.repeat(60));

        for (const [agent, issues] of Object.entries(assignments)) {
            console.log(`${agent}: ${issues.length} issues`);
        }

        console.log('\n✅ Report saved to: phase0-agent-assignments.md');
        console.log('\n📌 Next Steps:');
        console.log('   1. Review the assignments in the report');
        console.log('   2. Adjust assignments if needed');
        console.log('   3. Create feature branches for each agent');
        console.log('   4. Start parallel development!');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n💥 Error:', error.message);
        if (error.errors) {
            console.error('Details:', JSON.stringify(error.errors, null, 2));
        }
        process.exit(1);
    }
}

main();
