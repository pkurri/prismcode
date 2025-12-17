#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function createPR() {
    console.log('\n🚀 Creating PR for new changes...\n');

    try {
        const { data: pr } = await octokit.pulls.create({
            owner: OWNER,
            repo: REPO,
            title: '[Phase 0] Final Scripts + Docker Environment',
            head: 'antigravity/phase0-final',
            base: 'main',
            body: `## Phase 0: Final Cleanup

### Added
- Docker environment (Dockerfile, docker-compose.yml)
- Package management documentation
- Issue management scripts

### Infrastructure Complete
All Phase 0 issues #1-25 have been closed.

🤖 Phase 0 COMPLETE - Ready for Phase 1!`,
        });
        console.log('✅ PR #' + pr.number + ' created: ' + pr.html_url);
    } catch (error) {
        if (error.status === 422) {
            console.log('ℹ️  PR already exists or no new commits on this branch');
        } else {
            console.log('⚠️ ' + error.message);
        }
    }
}

createPR().catch(console.error);
