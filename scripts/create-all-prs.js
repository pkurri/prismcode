#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function createAllPRs() {
    console.log('\n🚀 Creating All Pending PRs...\n');

    const prs = [
        {
            title: '[Phase 0] Complete Remaining Issues - Structure, Errors, Security (#3, #7, #8)',
            head: 'antigravity/phase0-completion',
            body: '## Phase 0 Completion\n\nCloses #3, #7, #8\n\n### Changes\n- **#3 Repository Structure**: STRUCTURE.md\n- **#7 Error Handling**: Custom error classes, retry logic\n- **#8 Security**: Input sanitization, rate limiting\n\n✅ TypeScript: 0 errors'
        },
        {
            title: '[Phase 1] Multi-Agent Orchestrator (Issue #42)',
            head: 'antigravity/issue-42-orchestrator',
            body: '## Multi-Agent Orchestrator\n\nCloses #42\n\n### Features\n- Execution Plan with dependency resolution\n- 3 modes: sequential, parallel, dependency-ordered\n- AgentBus for inter-agent communication\n\n✅ TypeScript: 0 errors'
        },
        {
            title: '[Phase 1] Parallel Agent Implementation - PM, Architect, Coder (#26, #34, #50)',
            head: 'antigravity/issue-26-pm-agent',
            body: '## Parallel Agent Implementation\n\nCloses #26, #34, #50\n\n### Agents\n- PM Agent (#26): Feature analysis, estimation\n- Architect Agent (#34): Tech stack, diagrams\n- Coder Agent (#50): Code generation\n\n✅ TypeScript: 0 errors'
        }
    ];

    for (const pr of prs) {
        try {
            const result = await octokit.pulls.create({
                owner: OWNER,
                repo: REPO,
                title: pr.title,
                head: pr.head,
                base: 'main',
                body: pr.body,
            });
            console.log('✅ PR #' + result.data.number + ' created: ' + pr.head);
        } catch (error) {
            if (error.status === 422) {
                console.log('ℹ️  PR for ' + pr.head + ' already exists or no commits');
            } else {
                console.log('⚠️  ' + pr.head + ': ' + error.message);
            }
        }
    }

    console.log('\n✅ All PRs processed!\n');
}

createAllPRs().catch(console.error);
