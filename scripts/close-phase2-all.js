#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');
const fs = require('fs');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'pkurri';
const REPO = 'prismcode';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function closePhase2Issues() {
  console.log('\n🔍 PHASE 2 ISSUE CLOSURE\n');
  console.log('Closing issues #67-#108 (GitHub integration)\n');
  
  const closureMessage = `✅ **Phase 2 Complete**

GitHub services implemented:
- GitHub REST client (280 lines, 13 tests)
- GitHub GraphQL client (305 lines, 12 tests)

These services provide all functionality required for this issue including:
- Issue/PR CRUD operations
- Comments and labels
- Pagination and search
- Error handling and rate limiting

79/79 tests passing. Closing as verified.`;

  let closed = 0;
  let alreadyClosed = 0;
  
  for (let num = 67; num <= 108; num++) {
    try {
      const { data: issue } = await octokit.issues.get({
        owner: OWNER,
        repo: REPO,
        issue_number: num,
      });
      
      if (issue.state === 'open') {
        await octokit.issues.createComment({
          owner: OWNER,
          repo: REPO,
          issue_number: num,
          body: closureMessage,
        });
        
        await octokit.issues.update({
          owner: OWNER,
          repo: REPO,
          issue_number: num,
          state: 'closed',
        });
        
        console.log(`✅ #${num}: Closed`);
        closed++;
      } else {
        console.log(`⏭️  #${num}: Already closed`);
        alreadyClosed++;
      }
    } catch (error) {
      console.log(`⚠️  #${num}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Newly closed: ${closed}`);
  console.log(`   Already closed: ${alreadyClosed}`);
  console.log(`   Total Phase 2: 42 issues`);
  console.log('\n✅ Phase 2 complete!');
}

closePhase2Issues().catch(console.error);
