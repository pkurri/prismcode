const fs = require('fs');
const { execSync } = require('child_process');

// Read the issues JSON file
const issues = JSON.parse(fs.readFileSync('github-issues-phase-6-7.json', 'utf8'));

const REPO = 'pkurri/prismcode';

// 1. Ensure Milestones exist
const milestones = new Set(issues.map((i) => i.milestone).filter(Boolean));

console.log('Ensuring milestones exist...');
milestones.forEach((title) => {
  try {
    execSync(`gh api repos/${REPO}/milestones -f title="${title}"`, { stdio: 'ignore' });
    console.log(`Created milestone: ${title}`);
  } catch (e) {
    // Milestone likely exists, ignore error
  }
});

// 2. Ensure Labels exist
const labels = new Set(issues.flatMap((i) => i.labels || []));
console.log(`Ensuring ${labels.size} labels exist...`);

// Helper to check if label exists, create if not
// We can't efficiently check one by one without slowing down, so we'll just try to create them.
// A more efficient way is to list all labels first, but "gh label create" is idempotent-ish if we handle error
labels.forEach((label) => {
  try {
    // Check if label exists first to avoid error spam
    // But listing takes time. Let's just try to create.
    // We use a random color for new labels or a default one
    execSync(`gh label create "${label}" --repo ${REPO} --color f29513 --description ""`, {
      stdio: 'ignore',
    });
    console.log(`Created label: ${label}`);
  } catch (e) {
    // Label likely exists
  }
});

console.log(`Starting import of ${issues.length} issues to ${REPO}...`);

let successCount = 0;
let failCount = 0;

for (const issue of issues) {
  try {
    console.log(`Creating: ${issue.title}`);

    // Create a temporary file for the body to avoid shell escaping issues
    const bodyFile = `/tmp/issue_body_${Date.now()}.md`;
    fs.writeFileSync(bodyFile, issue.body);

    // Ensure labels argument is properly formatted
    const labelArg = issue.labels.join(',');

    let cmd = `gh issue create --repo ${REPO} --title "${issue.title.replace(/"/g, '\\"')}" --body-file "${bodyFile}" --label "${labelArg}"`;

    if (issue.milestone) {
      cmd += ` --milestone "${issue.milestone}"`;
    }

    execSync(cmd);
    console.log('✅ Created');
    successCount++;

    // Clean up
    fs.unlinkSync(bodyFile);

    // Rate limit prevention
    execSync('sleep 1');
  } catch (error) {
    console.error(`❌ Failed to create "${issue.title}":`, error.message);
    failCount++;
  }
}

console.log(`\nImport complete! Success: ${successCount}, Failed: ${failCount}`);
