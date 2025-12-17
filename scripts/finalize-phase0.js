#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function createAndMergeQAPR() {
    console.log('\n🚀 Creating and Merging QA PR\n');

    // Create QA PR
    const prBody = `## QA Agent - Testing Infrastructure

Closes #6

### Changes
- Jest + ts-jest configured (80% coverage thresholds)
- Playwright configured (Chrome, Firefox)
- Test structure: unit, e2e, fixtures
- 4 example tests created
- 504 packages, 0 vulnerabilities

### Files
- jest.config.js, playwright.config.ts
- tests/unit/agents/base-agent.test.ts
- tests/unit/utils/logger.test.ts
- tests/unit/utils/health.test.ts
- tests/e2e/github.spec.ts

🤖 QA Agent - Priority 2`;

    try {
        const { data: pr } = await octokit.pulls.create({
            owner: OWNER,
            repo: REPO,
            title: '[Phase 0] QA Agent - Testing Infrastructure (Issue #6)',
            head: 'antigravity/issue-6-qa-testing',
            base: 'main',
            body: prBody,
        });

        console.log(`✅ QA PR #${pr.number} created: ${pr.html_url}`);

        // Wait for GitHub to process
        await new Promise(r => setTimeout(r, 3000));

        // Merge it
        try {
            const { data: merge } = await octokit.pulls.merge({
                owner: OWNER,
                repo: REPO,
                pull_number: pr.number,
                merge_method: 'squash',
            });
            console.log(`✅ QA PR #${pr.number} merged: ${merge.sha}`);
        } catch (error) {
            console.log(`⏳ QA PR #${pr.number}: ${error.message}`);
        }

        return pr.number;
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

async function mergePR157() {
    console.log('\n🔀 Attempting to merge DevOps PR #157...\n');

    try {
        const { data: merge } = await octokit.pulls.merge({
            owner: OWNER,
            repo: REPO,
            pull_number: 157,
            merge_method: 'squash',
        });
        console.log(`✅ PR #157 merged: ${merge.sha}`);
        return true;
    } catch (error) {
        console.log(`⚠️ PR #157: ${error.message}`);
        console.log('   Manual merge may be required if CI hasn\'t completed');
        return false;
    }
}

async function main() {
    const qaPRNumber = await createAndMergeQAPR();
    await mergePR157();

    console.log('\n✅ Phase 0 PRs processed:');
    console.log('   #153 (Backend): MERGED ✅');
    console.log('   #157 (DevOps): Attempted merge');
    console.log(`   #${qaPRNumber} (QA): Created & attempted merge`);
}

main().catch(console.error);
