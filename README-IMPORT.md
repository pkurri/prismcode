# 📥 How to Import All 150 Issues

## Quick Start (2 minutes)

### Option 1: Automatic Script (Recommended)

```bash
# 1. Set your GitHub token
export GITHUB_TOKEN=ghp_your_token_here

# 2. Run the quick import script
chmod +x scripts/quick-import.sh
./scripts/quick-import.sh
```

**That's it!** The script will:
- ✅ Check dependencies
- ✅ Install required packages
- ✅ Import all 140 remaining issues
- ✅ Show progress in real-time
- ✅ Complete in ~12-15 minutes

### Option 2: Manual Steps

```bash
# 1. Get GitHub token
# Visit: https://github.com/settings/tokens/new
# Scopes: repo, workflow

# 2. Set token
export GITHUB_TOKEN=ghp_your_token_here

# 3. Install dependencies
npm install @octokit/rest chalk ora

# 4. Run import
node scripts/import-all-issues.js
```

---

## What Gets Imported

### 📊 Total: 150 Issues
- **Already created**: 10 issues (manually)
- **New imports**: 140 issues (automated)

### 📁 By Phase
- **Phase 0 - Foundation**: 15 issues
- **Phase 1 - Core Agents**: 34 issues
- **Phase 2 - GitHub Integration**: 30 issues
- **Phase 3 - IDE Integrations**: 25 issues
- **Phase 4 - Advanced Features**: 25 issues
- **Phase 5 - Production Release**: 11 issues

### 🏷️ Labels Applied
- **Type**: epic, story, task
- **Phase**: phase-0 through phase-5
- **Priority**: priority:P0, priority:P1, priority:P2
- **Component**: infrastructure, ai-agent, github-integration, ide-integration, etc.

---

## Troubleshooting

### Rate Limit Errors

The script automatically handles rate limits with delays. If issues persist:

```bash
# Check your rate limit
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/rate_limit
```

Wait until `reset` time, then re-run the script.

### Authentication Errors

```bash
# Verify token is set
echo $GITHUB_TOKEN

# Test token
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user
```

### Missing Dependencies

```bash
# Reinstall
rm -rf node_modules
npm install @octokit/rest
```

---

## After Import

### Verify Issues

```bash
# Count issues (should be ~150)
gh issue list --repo pkurri/prismcode --limit 200 | wc -l

# View by phase
gh issue list --repo pkurri/prismcode --label "phase-0"
gh issue list --repo pkurri/prismcode --label "phase-1"
```

### Next Steps

1. ✅ **Review roadmap**: https://github.com/pkurri/prismcode/issues
2. ✅ **Set up IDE**: Follow [IDE_SETUP.md](docs/IDE_SETUP.md)
3. ✅ **Start Phase 0**: Pick issue from [Phase 0](https://github.com/pkurri/prismcode/issues?q=is%3Aissue+is%3Aopen+label%3Aphase-0)
4. ✅ **Begin coding**: Use Windsurf or Antigravity!

---

## Support

**Issues?** Open a discussion:
https://github.com/pkurri/prismcode/discussions

**Questions?** Check docs:
- [Windsurf Quick Start](docs/WINDSURF_QUICKSTART.md)
- [Antigravity Quick Start](docs/ANTIGRAVITY_QUICKSTART.md)
- [Complete IDE Setup](docs/IDE_SETUP.md)
