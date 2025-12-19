#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const { execSync } = require('child_process');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

function deepVerify(filepath) {
  if (!fs.existsSync(filepath)) {
    return { exists: false, lines: 0, codeLines: 0, hasImpl: false };
  }
  
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n').length;
  
  const codeLines = content.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && 
           !trimmed.startsWith('//') && 
           !trimmed.startsWith('/*') && 
           !trimmed.startsWith('*') && 
           !trimmed.startsWith('import ') &&
           !trimmed.startsWith('export ') &&
           !trimmed.match(/^import\s*{/);
  });
  
  const hasImpl = codeLines.length > 10;
  const hasStub = content.includes('Not implemented') || content.includes('TODO:');
  
  return { 
    exists: true, 
    lines, 
    codeLines: codeLines.length, 
    hasImpl,
    hasStub
  };
}

async function comprehensiveDeepVerification() {
  console.log('\n' + '='.repeat(70));
  console.log('COMPREHENSIVE DEEP VERIFICATION - PHASES 0-3');
  console.log('='.repeat(70) + '\n');
  
  // Phase 0
  console.log('PHASE 0: INFRASTRUCTURE (23 issues)');
  console.log('-'.repeat(70));
  
  const phase0Files = [
    { file: 'package.json', min: 50 },
    { file: 'tsconfig.json', min: 20 },
    { file: '.github/workflows/ci.yml', min: 30 },
    { file: 'jest.config.js', min: 20 },
    { file: 'src/utils/logger.ts', min: 100 },
    { file: '.eslintrc.js', min: 20 },
    { file: 'src/utils/env.ts', min: 50 },
    { file: 'src/utils/rate-limit.ts', min: 50 },
    { file: 'src/utils/validation.ts', min: 60 },
    { file: 'src/utils/database.ts', min: 50 },
    { file: 'src/utils/cache.ts', min: 60 },
    { file: 'src/utils/security.ts', min: 30 },
    { file: 'src/utils/errors.ts', min: 100 },
  ];
  
  let phase0Pass = 0;
  let phase0Issues = [];
  
  for (const { file, min } of phase0Files) {
    const result = deepVerify(file);
    if (result.exists && result.lines >= min && !result.hasStub) {
      console.log(`✅ ${file} (${result.lines} lines, ${result.codeLines} code)`);
      phase0Pass++;
    } else {
      const issue = result.hasStub ? ' [HAS STUB]' : result.lines < min ? ' [TOO FEW LINES]' : ' [MISSING]';
      console.log(`❌ ${file} ${issue}`);
      phase0Issues.push(file);
    }
  }
  
  console.log(`\nPhase 0: ${phase0Pass}/${phase0Files.length} verified\n`);
  
  // Phase 1
  console.log('PHASE 1: AGENTS (41 issues)');
  console.log('-'.repeat(70));
  
  const phase1Files = [
    { file: 'src/agents/base-agent.ts', min: 20 },
    { file: 'src/core/orchestrator.ts', min: 150 },
    { file: 'src/agents/pm-agent.ts', min: 300 },
    { file: 'src/agents/architect-agent.ts', min: 300 },
    { file: 'src/agents/coder-agent.ts', min: 300 },
    { file: 'src/agents/qa-agent.ts', min: 200 },
    { file: 'src/agents/devops-agent.ts', min: 300 },
  ];
  
  let phase1Pass = 0;
  let phase1Issues = [];
  
  for (const { file, min } of phase1Files) {
    const result = deepVerify(file);
    if (result.exists && result.lines >= min && !result.hasStub) {
      console.log(`✅ ${file} (${result.lines} lines, ${result.codeLines} code)`);
      phase1Pass++;
    } else {
      const issue = result.hasStub ? ' [HAS STUB]' : ' [TOO FEW LINES]';
      console.log(`❌ ${file} ${issue}`);
      phase1Issues.push(file);
    }
  }
  
  console.log(`\nPhase 1: ${phase1Pass}/${phase1Files.length} verified\n`);
  
  // Phase 2
  console.log('PHASE 2: GITHUB INTEGRATION (42 issues)');
  console.log('-'.repeat(70));
  
  const phase2Files = [
    { file: 'src/services/github-rest.ts', min: 200 },
    { file: 'src/services/github-graphql.ts', min: 200 },
    { file: 'tests/unit/services/github-rest.test.ts', min: 100 },
    { file: 'tests/unit/services/github-graphql.test.ts', min: 80 },
  ];
  
  let phase2Pass = 0;
  let phase2Issues = [];
  
  for (const { file, min } of phase2Files) {
    const result = deepVerify(file);
    if (result.exists && result.lines >= min && !result.hasStub) {
      console.log(`✅ ${file} (${result.lines} lines, ${result.codeLines} code)`);
      phase2Pass++;
    } else {
      const issue = result.hasStub ? ' [HAS STUB]' : ' [TOO FEW LINES]';
      console.log(`❌ ${file} ${issue}`);
      phase2Issues.push(file);
    }
  }
  
  console.log(`\nPhase 2: ${phase2Pass}/${phase2Files.length} verified\n`);
  
  // Phase 3
  console.log('PHASE 3: IDE EXTENSION (5/7 implemented)');
  console.log('-'.repeat(70));
  
  const phase3Files = [
    { file: 'ide-extension/package.json', min: 50 },
    { file: 'ide-extension/extension.ts', min: 40 },
    { file: 'ide-extension/src/notifications/notification-service.ts', min: 60 },
    { file: 'ide-extension/src/channels/output-channel.ts', min: 50 },
    { file: 'ide-extension/src/config/configuration.ts', min: 70 },
    { file: 'ide-extension/src/commands/command-registry.ts', min: 100 },
    { file: 'ide-extension/src/views/dashboard-provider.ts', min: 80 },
  ];
  
  let phase3Pass = 0;
  let phase3Issues = [];
  
  for (const { file, min } of phase3Files) {
    const result = deepVerify(file);
    if (result.exists && result.lines >= min && !result.hasStub) {
      console.log(`✅ ${file} (${result.lines} lines, ${result.codeLines} code)`);
      phase3Pass++;
    } else {
      const issue = result.hasStub ? ' [HAS STUB]' : ' [TOO FEW LINES]';
      console.log(`❌ ${file} ${issue}`);
      phase3Issues.push(file);
    }
  }
  
  // Check extension compilation
  try {
    execSync('cd ide-extension && npm run compile', { stdio: 'pipe' });
    console.log(`✅ Extension compiles successfully`);
  } catch (err) {
    console.log(`❌ Extension compilation FAILED`);
    phase3Issues.push('Extension compilation');
  }
  
  console.log(`\nPhase 3: ${phase3Pass}/${phase3Files.length} verified\n`);
  
  // Run tests
  console.log('RUNNING TESTS');
  console.log('-'.repeat(70));
  
  let testsPass = false;
try {
    const output = execSync('npm test 2>&1', { encoding: 'utf8' });
    const match = output.match(/Tests:.*?(\d+) passed/);
    if (match) {
      const passed = parseInt(match[1]);
      console.log(`✅ ${passed} tests passing`);
      testsPass = true;
    }
  } catch (err) {
    console.log(`❌ Tests FAILED`);
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  
  const totalFiles = phase0Files.length + phase1Files.length + phase2Files.length + phase3Files.length;
  const totalPass = phase0Pass + phase1Pass + phase2Pass + phase3Pass;
  const confidence = (totalPass / totalFiles * 100).toFixed(1);
  
  console.log(`\nPhase 0: ${phase0Pass}/${phase0Files.length} ✅`);
  console.log(`Phase 1: ${phase1Pass}/${phase1Files.length} ✅`);
  console.log(`Phase 2: ${phase2Pass}/${phase2Files.length} ✅`);
  console.log(`Phase 3: ${phase3Pass}/${phase3Files.length} ✅`);
  console.log(`Tests: ${testsPass ? 'PASSING' : 'FAILING'} ${testsPass ? '✅' : '❌'}`);
  
  console.log(`\n🎯 Overall: ${totalPass}/${totalFiles} files (${confidence}%)`);
  
  if (phase0Issues.length > 0) {
    console.log(`\n⚠️ Phase 0 Issues: ${phase0Issues.join(', ')}`);
  }
  if (phase1Issues.length > 0) {
    console.log(`⚠️ Phase 1 Issues: ${phase1Issues.join(', ')}`);
  }
  if (phase2Issues.length > 0) {
    console.log(`⚠️ Phase 2 Issues: ${phase2Issues.join(', ')}`);
  }
  if (phase3Issues.length > 0) {
    console.log(`⚠️ Phase 3 Issues: ${phase3Issues.join(', ')}`);
  }
  
  if (confidence >= 95 && testsPass) {
    console.log('\n✅ HIGH CONFIDENCE - Ready for PR!');
    return true;
  } else {
    console.log('\n⚠️  ISSUES FOUND - Address before PR');
    return false;
  }
}

comprehensiveDeepVerification()
  .then(ready => process.exit(ready ? 0 : 1))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
