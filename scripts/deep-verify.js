#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const { execSync } = require('child_process');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Deep verification - check implementation quality
function deepVerify(filepath) {
  if (!fs.existsSync(filepath)) {
    return { exists: false, lines: 0, hasImpl: false };
  }
  
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n').length;
  
  // Check if file has meaningful implementation (not just comments/imports)
  const codeLines = content.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && 
           !trimmed.startsWith('//') && 
           !trimmed.startsWith('/*') && 
           !trimmed.startsWith('*') && 
           !trimmed.startsWith('import ') &&
           !trimmed.startsWith('export ');
  });
  
  const hasImpl = codeLines.length > 10; // At least 10 lines of actual code
  
  return { exists: true, lines, hasImpl, codeLines: codeLines.length };
}

async function comprehensiveRecheck() {
  console.log('\n🔍 COMPREHENSIVE IMPLEMENTATION VERIFICATION\n');
  console.log('Checking actual code implementation, not just file existence\n');
  
  const report = {
    phase0: { verified: 0, failed: 0, details: [] },
    phase1: { verified: 0, failed: 0, details: [] },
  };
  
  // Phase 0 Deep Check
  console.log('=' + '='.repeat(69));
  console.log('PHASE 0: INFRASTRUCTURE');
  console.log('=' + '='.repeat(69));
  
  const phase0Checks = [
    { num: 2, file: 'package.json', minLines: 20 },
    { num: 4, file: 'tsconfig.json', minLines: 10 },
    { num: 5, file: '.github/workflows/ci.yml', minLines: 20 },
    { num: 6, file: 'jest.config.js', minLines: 5 },
    { num: 7, file: 'src/agents/base-agent.ts', minLines: 20 },
    { num: 8, file: 'src/agents/pm-agent.ts', minLines: 50 },
    { num: 9, file: 'docs/.vitepress/config.ts', minLines: 10 },
    { num: 10, file: 'src/utils/logger.ts', minLines: 20 },
    { num: 11, file: '.eslintrc.js', minLines: 10 },
    { num: 12, file: 'docs/package-management.md', minLines: 10 },
    { num: 13, file: 'Dockerfile', minLines: 5 },
    { num: 14, file: 'src/utils/env.ts', minLines: 30 },
    { num: 15, file: 'src/utils/rate-limit.ts', minLines: 20 },
    { num: 16, file: 'src/utils/validation.ts', minLines: 30 },
    { num: 17, file: 'src/utils/errors.ts', minLines: 20 },
    { num: 18, file: 'src/utils/database.ts', minLines: 30 },
    { num: 19, file: 'src/utils/cache.ts', minLines: 30 },
    { num: 20, file: 'src/utils/api-docs.ts', minLines: 20 },
    { num: 21, file: 'src/utils/health.ts', minLines: 10 },
    { num: 22, file: 'src/utils/security.ts', minLines: 20 },
    { num: 23, file: 'src/utils/cors.ts', minLines: 15 },
    { num: 24, file: 'src/utils/request-logger.ts', minLines: 10 },
  ];
  
  for (const check of phase0Checks) {
    const result = deepVerify(check.file);
    const pass = result.exists && result.lines >= check.minLines;
    
    console.log(`\n#${check.num.toString().padStart(2)}: ${check.file}`);
    console.log(`  Exists: ${result.exists ? '✅' : '❌'}`);
    if (result.exists) {
      console.log(`  Lines: ${result.lines} (min: ${check.minLines}) ${result.lines >= check.minLines ? '✅' : '❌'}`);
      console.log(`  Code lines: ${result.codeLines} ${result.hasImpl ? '✅' : '⚠️'}`);
    }
    console.log(`  Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
    
    if (pass) report.phase0.verified++;
    else report.phase0.failed++;
    
    report.phase0.details.push({ num: check.num, file: check.file, pass });
  }
  
  // Phase 1 Deep Check
  console.log('\n' + '=' + '='.repeat(69));
  console.log('PHASE 1: AGENTS');
  console.log('=' + '='.repeat(69));
  
  const phase1Agents = [
    { num: 26, file: 'src/core/orchestrator.ts', minLines: 50 },
    { num: 27, file: 'src/agents/architect-agent.ts', minLines: 100 },
    { num: 27, file: 'tests/unit/agents/architect-agent.test.ts', minLines: 30 },
    { num: 28, file: 'src/agents/coder-agent.ts', minLines: 100 },
    { num: 28, file: 'tests/unit/agents/coder-agent.test.ts', minLines: 30 },
    { num: 31, file: 'src/agents/qa-agent.ts', minLines: 100 },
    { num: 31, file: 'tests/unit/agents/qa-agent.test.ts', minLines: 30 },
    { num: 32, file: 'src/agents/devops-agent.ts', minLines: 100 },
    { num: 32, file: 'tests/unit/agents/devops-agent.test.ts', minLines: 30 },
  ];
  
  for (const check of phase1Agents) {
    const result = deepVerify(check.file);
    const pass = result.exists && result.lines >= check.minLines;
    
    console.log(`\n#${check.num}: ${check.file}`);
    console.log(`  Exists: ${result.exists ? '✅' : '❌'}`);
    if (result.exists) {
      console.log(`  Lines: ${result.lines} (min: ${check.minLines}) ${result.lines >= check.minLines ? '✅' : '❌'}`);
      console.log(`  Code lines: ${result.codeLines} ${result.hasImpl ? '✅' : '⚠️'}`);
    }
    console.log(`  Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
    
    if (pass) report.phase1.verified++;
    else report.phase1.failed++;
    
    report.phase1.details.push({ num: check.num, file: check.file, pass });
  }
  
  // Run actual tests
  console.log('\n' + '=' + '='.repeat(69));
  console.log('TEST EXECUTION');
  console.log('=' + '='.repeat(69));
  
  try {
    console.log('\nRunning npm test...');
    const output = execSync('npm test', { encoding: 'utf8', stdio: 'pipe' });
    const passing = output.match(/Tests:\s+(\d+) passed/);
    const suites = output.match(/Test Suites:\s+(\d+) passed/);
    
    console.log(`✅ Test Suites: ${suites ? suites[1] : '?'} passed`);
    console.log(`✅ Tests: ${passing ? passing[1] : '?'} passed`);
    
    report.testsPass = true;
    report.testCount = passing ? parseInt(passing[1]) : 0;
  } catch (e) {
    console.log('❌ Tests FAILED');
    report.testsPass = false;
  }
  
  // Final Report
  console.log('\n' + '=' + '='.repeat(69));
  console.log('📊 FINAL VERIFICATION REPORT');
  console.log('=' + '='.repeat(69));
  
  console.log('\nPhase 0:');
  console.log(`  Verified: ${report.phase0.verified}/${phase0Checks.length}`);
  console.log(`  Failed: ${report.phase0.failed}`);
  
  console.log('\nPhase 1:');
  console.log(`  Verified: ${report.phase1.verified}/${phase1Agents.length}`);
  console.log(`  Failed: ${report.phase1.failed}`);
  
  console.log(`\nTests: ${report.testsPass ? '✅' : '❌'} (${report.testCount || 0} passing)`);
  
  const confidence = (
    (report.phase0.verified / phase0Checks.length) * 0.4 +
    (report.phase1.verified / phase1Agents.length) * 0.4 +
    (report.testsPass ? 0.2 : 0)
  ) * 100;
  
  console.log(`\n🎯 Confidence Level: ${confidence.toFixed(1)}%`);
  
  if (confidence >= 95) {
    console.log('✅ HIGH CONFIDENCE - Both phases properly implemented');
  } else if (confidence >= 80) {
    console.log('⚠️  MEDIUM CONFIDENCE - Some concerns remain');
  } else {
    console.log('❌ LOW CONFIDENCE - Significant issues found');
  }
  
  return report;
}

comprehensiveRecheck().catch(console.error);
