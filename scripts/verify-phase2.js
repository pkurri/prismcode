#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');
const fs = require('fs');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

function extractRequirements(body) {
  const acMatch = body.match(/## ✅ Acceptance Criteria([\s\S]*?)(?=##|$)/i);
  if (acMatch) {
    const criteria = acMatch[1].trim();
    const lines = criteria.split('\n').filter(l => l.trim().startsWith('- ['));
    return lines.map(l => l.replace('- [ ]', '').replace('- [x]', '').trim());
  }
  
  const descMatch = body.match(/## 📋 Description([\s\S]*?)(?=##|$)/i);
  if (descMatch) {
    const desc = descMatch[1].trim();
    const lines = desc.split('\n').filter(l => l.trim().startsWith('- ') || l.trim().startsWith('* '));
    return lines.map(l => l.replace(/^[-*]\s*/, '').trim());
  }
  
  return [];
}

// Phase 2 verification checks
function verifyPhase2(num) {
  const checks = [];
  
  // GitHub REST Client (#67)
  if (num === 67) {
    checks.push({ check: () => fs.existsSync('src/services/github-rest.ts'), desc: 'GitHub REST client' });
    checks.push({ check: () => fs.existsSync('tests/unit/services/github-rest.test.ts'), desc: 'REST client tests' });
  }
  
  // GitHub GraphQL Client (#68)
  if (num === 68) {
    checks.push({ check: () => fs.existsSync('src/services/github-graphql.ts'), desc: 'GitHub GraphQL client' });
    checks.push({ check: () => fs.existsSync('tests/unit/services/github-graphql.test.ts'), desc: 'GraphQL client tests' });
  }
  
  // Issue/PR Management (#69-#93)
  if (num >= 69 && num <= 93) {
    checks.push({ check: () => fs.existsSync('src/services/github-rest.ts'), desc: 'GitHub service exists' });
  }
  
  return checks;
}

async function verifyPhase2Issues() {
  console.log('\n📋 PHASE 2 VERIFICATION (GitHub Integration)\n');
  console.log('Checking GitHub issues #67-#108\n');
  
  let totalVerified = 0;
  let totalFailed = 0;
  const toClose = [];
  
  for (let num = 67; num <= 108; num++) {
    try {
      const { data: issue } = await octokit.issues.get({
        owner: OWNER,
        repo: REPO,
        issue_number: num,
      });
      
      console.log(`\n${'='.repeat(70)}`);
      console.log(`#${num}: ${issue.title}`);
      console.log(`State: ${issue.state.toUpperCase()}`);
      console.log('='.repeat(70));
      
      if (!issue.body) {
        console.log('⚠️  No issue body');
        continue;
      }
      
      const requirements = extractRequirements(issue.body);
      if (requirements.length > 0) {
        console.log('\nRequirements:');
        requirements.slice(0, 3).forEach((req, i) => {
          console.log(`  ${i + 1}. ${req.slice(0, 60)}${req.length > 60 ? '...' : ''}`);
        });
      }
      
      const checks = verifyPhase2(num);
      
      if (checks.length === 0) {
        console.log('ℹ️  No verification checks defined yet');
        continue;
      }
      
      console.log('\n✅ Verification:');
      let passed = 0;
      let failed = 0;
      
      for (const check of checks) {
        try {
          if (check.check()) {
            console.log(`  ✅ ${check.desc}`);
            passed++;
          } else {
            console.log(`  ❌ ${check.desc}`);
            failed++;
          }
        } catch (err) {
          console.log(`  ❌ ${check.desc} (${err.message})`);
          failed++;
        }
      }
      
      const status = failed === 0 && checks.length > 0 ? '✅ PASS' : '❌ FAIL';
      console.log(`\n${status} (${passed}/${passed + failed})`);
      
      if (failed === 0 && checks.length > 0) {
        totalVerified++;
        if (issue.state === 'open') toClose.push(num);
      } else {
        totalFailed++;
      }
      
    } catch (error) {
      console.log(`⚠️  ${error.message}`);
      totalFailed++;
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 SUMMARY');
  console.log('='.repeat(70));
  console.log(`Verified: ${totalVerified}`);
  console.log(`Failed/Pending: ${totalFailed}`);
  console.log(`\nPhase 2 requires GitHub REST and GraphQL clients to be implemented.`);
  console.log(`Most issues (#69-#108) are GitHub integration tasks.`);
}

verifyPhase2Issues().catch(console.error);
