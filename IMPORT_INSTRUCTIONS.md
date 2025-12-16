# 📥 Import All 151 Issues to GitHub

## Quick Start (5 minutes)

### 1. Set GitHub Token
```bash
export GITHUB_TOKEN=ghp_your_token_here
```

**Get token**: https://github.com/settings/tokens/new
- Scopes needed: `repo`, `workflow`

### 2. Install Dependencies
```bash
npm install @octokit/rest
```

### 3. Create Labels & Milestones
```bash
node scripts/create-labels.js
node scripts/create-milestones.js
```

### 4. Import All Issues
```bash
node scripts/import-all-issues.js
```

**Time**: ~15-20 minutes for all 142 issues

---

## What Gets Created

### Labels (26 total)
- **Type**: epic, story, task, bug
- **Phase**: phase-0 through phase-5
- **Priority**: P0 (critical) to P3 (low)
- **Component**: infrastructure, ai-agent, github-integration, etc.

### Milestones (6 total)
- Phase 0: Foundation (2 weeks)
- Phase 1: Core Agents (6 weeks)
- Phase 2: GitHub Integration (4 weeks)
- Phase 3: IDE Integrations (4 weeks)
- Phase 4: Advanced Features (4 weeks)
- Phase 5: Production Release (4 weeks)

### Issues (151 total)
- **Phase 0**: 25 issues
- **Phase 1**: 35 issues
- **Phase 2**: 30 issues
- **Phase 3**: 25 issues
- **Phase 4**: 25 issues
- **Phase 5**: 15 issues

---

## Manual Import (Alternative)

### Using GitHub CLI
```bash
# Install gh
brew install gh

# Authenticate
gh auth login

# Import from JSON
cat COMPLETE_PRISMCODE_ROADMAP.json | jq -c '.issues[]' | while read issue; do
  title=$(echo $issue | jq -r '.title')
  body=$(echo $issue | jq -r '.body')
  labels=$(echo $issue | jq -r '.labels | join(",")')
  
  gh issue create \
    --repo pkurri/prismcode \
    --title "$title" \
    --body "$body" \
    --label "$labels"
  
  sleep 1  # Rate limiting
done
```

---

## Troubleshooting

### Rate Limit Errors
The script automatically handles rate limits with delays. If you hit limits:
```bash
# Check rate limit status
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/rate_limit

# Wait for reset, then resume
node scripts/import-all-issues.js
```

### Authentication Errors
```bash
# Verify token
echo $GITHUB_TOKEN

# Test token
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user
```

### Script Errors
```bash
# Check Node version (need 18+)
node --version

# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## After Import

### Verify Issues
```bash
# Count issues
gh issue list --repo pkurri/prismcode | wc -l

# View all issues
gh issue list --repo pkurri/prismcode --limit 200
```

### Next Steps
1. ✅ Review roadmap: https://github.com/pkurri/prismcode/issues
2. ✅ Pick Phase 0 issue to start
3. ✅ Set up Windsurf or Antigravity
4. ✅ Begin coding!

---

## Support

**Issues?** Open a discussion:
https://github.com/pkurri/prismcode/discussions

**Questions?** Check docs:
- [IDE Setup Guide](./docs/IDE_SETUP.md)
- [Windsurf Quick Start](./docs/WINDSURF_QUICKSTART.md)
- [Antigravity Quick Start](./docs/ANTIGRAVITY_QUICKSTART.md)