#!/usr/bin/env node

/**
 * Phase 0 Parallel Execution Script
 * 
 * This script helps coordinate parallel development by creating
 * feature branches and providing instructions for each agent
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WORKSTREAMS = [
    {
        id: 1,
        name: 'Development Environment Setup',
        agent: 'Infrastructure Agent',
        branch: 'feature/phase0-dev-environment',
        files: ['tsconfig.json', 'package.json', 'scripts/validate-env.js', 'docs/development-setup.md'],
        priority: 1,
        color: '🔵'
    },
    {
        id: 2,
        name: 'Testing Infrastructure',
        agent: 'Testing Agent',
        branch: 'feature/phase0-testing-infrastructure',
        files: ['jest.config.js', 'playwright.config.ts', 'tests/**/*', 'docs/testing-guide.md'],
        priority: 2,
        color: '🟢'
    },
    {
        id: 3,
        name: 'Code Quality Tools',
        agent: 'Code Quality Agent',
        branch: 'feature/phase0-code-quality',
        files: ['.eslintrc.json', '.prettierrc.json', '.husky/**/*', 'docs/code-style-guide.md'],
        priority: 2,
        color: '🟡'
    },
    {
        id: 4,
        name: 'CI/CD Pipeline',
        agent: 'DevOps Agent',
        branch: 'feature/phase0-cicd-pipeline',
        files: ['.github/workflows/*.yml', 'docs/ci-cd-guide.md'],
        priority: 3,
        color: '🔴'
    },
    {
        id: 5,
        name: 'Documentation Site',
        agent: 'Documentation Agent',
        branch: 'feature/phase0-docs-site',
        files: ['docs/.vitepress/**/*', 'docs/**/*.md'],
        priority: 2,
        color: '🟣'
    },
    {
        id: 6,
        name: 'Monitoring & Deployment',
        agent: 'Monitoring Agent',
        branch: 'feature/phase0-monitoring-deployment',
        files: ['Dockerfile', 'docker-compose.yml', 'src/utils/logger.ts', 'docs/deployment-guide.md'],
        priority: 2,
        color: '🟠'
    }
];

function log(message, workstream = null) {
    if (workstream) {
        console.log(`${workstream.color} [${workstream.agent}] ${message}`);
    } else {
        console.log(message);
    }
}

function createBranches() {
    console.log('\n🌿 Creating feature branches...\n');

    // Ensure we're on main and up-to-date
    try {
        execSync('git checkout main', { stdio: 'inherit' });
        execSync('git pull origin main', { stdio: 'inherit' });
    } catch (error) {
        console.error('⚠️  Warning: Could not update main branch');
    }

    for (const workstream of WORKSTREAMS) {
        try {
            // Check if branch already exists
            const branches = execSync('git branch --list', { encoding: 'utf-8' });

            if (!branches.includes(workstream.branch)) {
                execSync(`git branch ${workstream.branch}`, { stdio: 'inherit' });
                log(`✅ Created branch: ${workstream.branch}`, workstream);
            } else {
                log(`ℹ️  Branch already exists: ${workstream.branch}`, workstream);
            }
        } catch (error) {
            log(`❌ Failed to create branch: ${error.message}`, workstream);
        }
    }

    console.log('\n✅ All branches created!\n');
}

function generateWorkstreamInstructions(workstream) {
    let instructions = `# ${workstream.name}\n\n`;
    instructions += `**Agent**: ${workstream.agent}\n`;
    instructions += `**Branch**: \`${workstream.branch}\`\n`;
    instructions += `**Priority**: P${workstream.priority}\n\n`;

    instructions += '## Setup\n\n';
    instructions += '```bash\n';
    instructions += `git checkout ${workstream.branch}\n`;
    instructions += 'git pull origin main  # Ensure up-to-date\n';
    instructions += '```\n\n';

    instructions += '## Files to Create/Modify\n\n';
    for (const file of workstream.files) {
        instructions += `- \`${file}\`\n`;
    }

    instructions += '\n## Task Checklist\n\n';
    instructions += 'Refer to the implementation plan for detailed tasks.\n\n';

    instructions += '## Development Workflow\n\n';
    instructions += '1. Make your changes\n';
    instructions += '2. Test locally:\n';
    instructions += '   ```bash\n';

    if (workstream.id === 2) {
        instructions += '   npm run test\n';
    } else if (workstream.id === 3) {
        instructions += '   npm run lint\n';
        instructions += '   npm run format:check\n';
    } else if (workstream.id === 4) {
        instructions += '   # Test locally if possible\n';
        instructions += '   npm run build\n';
    } else if (workstream.id === 5) {
        instructions += '   npm run docs:build\n';
    } else if (workstream.id === 6) {
        instructions += '   docker build -t prismcode:test .\n';
    } else {
        instructions += '   npm run build\n';
    }

    instructions += '   ```\n';
    instructions += '3. Commit your changes:\n';
    instructions += '   ```bash\n';
    instructions += `   git add .\n`;
    instructions += `   git commit -m "feat(phase0): ${workstream.name.toLowerCase()}"\n`;
    instructions += '   ```\n';
    instructions += '4. Push to your branch:\n';
    instructions += '   ```bash\n';
    instructions += `   git push origin ${workstream.branch}\n`;
    instructions += '   ```\n';
    instructions += '5. Create PR to `main`\n\n';

    instructions += '## PR Template\n\n';
    instructions += '```markdown\n';
    instructions += `## ${workstream.name}\n\n`;
    instructions += '### Changes\n';
    instructions += '- [ ] List your changes here\n\n';
    instructions += '### Testing\n';
    instructions += '- [ ] Describe how you tested\n\n';
    instructions += '### Checklist\n';
    instructions += '- [ ] Code builds successfully\n';
    instructions += '- [ ] Tests pass (if applicable)\n';
    instructions += '- [ ] Linting passes (if applicable)\n';
    instructions += '- [ ] Documentation updated\n';
    instructions += '- [ ] No merge conflicts with main\n';
    instructions += '```\n\n';

    instructions += '## Need Help?\n\n';
    instructions += `Check the [Implementation Plan](../implementation_plan.md) for detailed guidance.\n`;

    return instructions;
}

function createWorkstreamGuides() {
    console.log('\n📝 Creating workstream guides...\n');

    const guidesDir = path.join(__dirname, '..', 'workstreams');

    if (!fs.existsSync(guidesDir)) {
        fs.mkdirSync(guidesDir, { recursive: true });
    }

    for (const workstream of WORKSTREAMS) {
        const instructions = generateWorkstreamInstructions(workstream);
        const filename = `workstream-${workstream.id}-${workstream.branch.split('/')[1]}.md`;
        const filepath = path.join(guidesDir, filename);

        fs.writeFileSync(filepath, instructions);
        log(`✅ Created guide: ${filename}`, workstream);
    }

    // Create index file
    let indexContent = '# Phase 0 Workstreams\n\n';
    indexContent += 'Select your workstream to get started:\n\n';

    for (const workstream of WORKSTREAMS) {
        const filename = `workstream-${workstream.id}-${workstream.branch.split('/')[1]}.md`;
        indexContent += `${workstream.color} [${workstream.name}](./${filename}) - ${workstream.agent}\n`;
    }

    fs.writeFileSync(path.join(guidesDir, 'README.md'), indexContent);

    console.log('\n✅ All guides created in ./workstreams/\n');
}

function generateExecutionMatrix() {
    console.log('\n📊 Execution Matrix\n');
    console.log('='.repeat(80));
    console.log('| Priority | Workstream                    | Agent                  | Branch');
    console.log('|----------|-------------------------------|------------------------|------------------------');

    const sorted = [...WORKSTREAMS].sort((a, b) => a.priority - b.priority);

    for (const ws of sorted) {
        const priority = `P${ws.priority}`;
        const name = ws.name.padEnd(30);
        const agent = ws.agent.padEnd(24);
        console.log(`| ${priority}       | ${name}| ${agent}| ${ws.branch}`);
    }

    console.log('='.repeat(80) + '\n');
}

function printNextSteps() {
    console.log('\n📌 Next Steps for Each Agent:\n');

    for (const workstream of WORKSTREAMS) {
        console.log(`${workstream.color} **${workstream.agent}**:`);
        console.log(`   1. Read: ./workstreams/workstream-${workstream.id}-${workstream.branch.split('/')[1]}.md`);
        console.log(`   2. Checkout branch: git checkout ${workstream.branch}`);
        console.log(`   3. Start development!`);
        console.log('');
    }

    console.log('💡 **Coordination Tips**:');
    console.log('   - Review implementation_plan.md for full details');
    console.log('   - Communicate via PR comments');
    console.log('   - Keep branches updated with main');
    console.log('   - Test locally before pushing\n');
}

async function main() {
    console.log('\n🚀 Phase 0 Parallel Execution Setup');
    console.log('='.repeat(80));

    const options = process.argv.slice(2);

    if (options.includes('--help') || options.includes('-h')) {
        console.log('\nUsage: node scripts/execute-parallel.js [options]\n');
        console.log('Options:');
        console.log('  --create-branches    Create all feature branches');
        console.log('  --create-guides      Generate workstream guides');
        console.log('  --matrix             Show execution matrix');
        console.log('  --all                Do everything (default)\n');
        return;
    }

    const createBranchesFlag = options.includes('--create-branches') || options.includes('--all') || options.length === 0;
    const createGuidesFlag = options.includes('--create-guides') || options.includes('--all') || options.length === 0;
    const matrixFlag = options.includes('--matrix') || options.includes('--all') || options.length === 0;

    if (createBranchesFlag) {
        createBranches();
    }

    if (createGuidesFlag) {
        createWorkstreamGuides();
    }

    if (matrixFlag) {
        generateExecutionMatrix();
    }

    printNextSteps();

    console.log('='.repeat(80));
    console.log('✅ Setup complete! Time to build! 🚀\n');
}

main().catch(error => {
    console.error('\n💥 Error:', error.message);
    process.exit(1);
});
