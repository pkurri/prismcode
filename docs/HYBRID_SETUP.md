# 🔥 Hybrid Windsurf + Antigravity Setup

## Complete Automated IDE Integration

This guide covers the **complete hybrid setup** that allows you to use both Windsurf and Antigravity seamlessly with automatic synchronization.

---

## 🎯 What You Get

### Automatic Features
- ✅ **Auto-labeling**: Issues automatically tagged for best IDE
- ✅ **Cross-sync**: Code changes sync between IDEs via PRs
- ✅ **Conflict detection**: Warns when both IDEs work on same code
- ✅ **Status tracking**: GitHub Actions track which IDE completed what
- ✅ **Smart routing**: Complex → Antigravity, Simple → Windsurf

### Manual Control
- 🎛️ Override auto-assignment anytime
- 🎛️ Use either IDE for any task
- 🎛️ Mix and match based on preference

---

## 🚀 One-Command Setup

```bash
# Set your GitHub token
export GITHUB_TOKEN=ghp_your_token_here

# Run hybrid setup
chmod +x scripts/hybrid-setup.sh
./scripts/hybrid-setup.sh
```

**Done!** Everything is configured.

---

## 📋 What Gets Created

### Files
```
.windsurf/mcp_config.json          # Windsurf MCP configuration
.antigravity/config.json           # Antigravity agent setup
.github/workflows/
  ├── ide-auto-assign.yml          # Auto-label new issues
  ├── windsurf-sync.yml            # Windsurf → Antigravity sync
  ├── antigravity-sync.yml         # Antigravity → Windsurf sync
  └── hybrid-sync.yml              # Cross-IDE status
```

### Labels
- `windsurf-ready` 🌊 - Best for Windsurf Cascade
- `antigravity-ready` 🪐 - Best for Antigravity agents
- `hybrid-ready` 🟢 - Works with both
- `windsurf-completed` ✅ - Done by Windsurf
- `antigravity-completed` ✅ - Done by Antigravity
- `windsurf-synced` 🔄 - Synced to Windsurf
- `antigravity-synced` 🔄 - Synced to Antigravity
- `sync-needed` ⚠️ - Needs sync

---

## 🎮 How It Works

### 1. Issue Gets Auto-Analyzed

When you create/edit an issue:
```
Issue #15: "Add Redis caching" [5 pts]
  ↓ GitHub Action analyzes
  ↓ Checks: Story points, keywords, complexity
  ✅ Auto-labeled: hybrid-ready, infrastructure
  💬 Comment added with IDE recommendations
```

### 2. Pick Your IDE

**Windsurf Cascade:**
```
@github show issue #15
@cascade Implement Redis caching:
- Install redis package
- Create cache service
- Add connection pooling
- Write tests
```

**Antigravity Manager:**
```
Manager View → New Task
├─ Issue: #15
├─ Agent: Backend
├─ Mode: Plan → Execute
└─ Verify: Tests pass
```

### 3. Automatic Sync

```
Windsurf creates PR #20 → Label: windsurf-completed
  ↓
GitHub Action notifies Antigravity agents
  ↓
Antigravity pulls latest code automatically
  ↓
Both IDEs stay synchronized
```

---

## 💡 Best Practices

### Use Windsurf For:
- ✅ Quick edits (1-3 story points)
- ✅ Bug fixes
- ✅ Configuration changes
- ✅ Documentation updates
- ✅ Small features

### Use Antigravity For:
- ✅ Complex features (8-13 story points)
- ✅ Multi-file changes
- ✅ Infrastructure setup
- ✅ Parallel agent work
- ✅ Architecture changes

### Use Hybrid For:
- ✅ Medium features (5-8 points)
- ✅ Either IDE works
- ✅ Personal preference
- ✅ Learning new tools

---

## 🔧 Troubleshooting

### Labels Not Auto-Applying?

```bash
# Check GitHub Actions status
gh workflow view "Auto-Assign IDE Labels"

# Manually trigger
gh workflow run ide-auto-assign.yml
```

### Sync Not Working?

```bash
# Check sync status
gh workflow view "Hybrid Cross-IDE Sync"

# Force sync
gh workflow run hybrid-sync.yml
```

### Manual Label Override

```bash
# Remove auto-label
gh issue edit 15 --remove-label "windsurf-ready"

# Add preferred IDE
gh issue edit 15 --add-label "antigravity-ready"
```

---

## 📊 Monitoring

View sync status anytime:
```bash
# IDE distribution
gh issue list --label "windsurf-ready" | wc -l
gh issue list --label "antigravity-ready" | wc -l

# Completion status  
gh issue list --label "windsurf-completed"
gh issue list --label "antigravity-completed"
```

---

## 🎯 Example Workflow

### Day 1: Setup
```bash
./scripts/hybrid-setup.sh
windsurf .  # Open in Windsurf
# Open Antigravity separately
```

### Day 2: Start Phase 0

**Morning (Windsurf):**
```
@cascade Implement issue #2 (dev setup)
Commit → PR #25 → Merge
```

**Afternoon (Antigravity):**
```
Manager View → Create Group "Infrastructure"
Assign issues #4, #5, #6 to agents
Execute in parallel → All complete in 2 hours
```

**Result**: Phase 0 infrastructure done in 1 day! 🚀

---

## 🌟 Advanced Usage

### Custom IDE Assignment

Edit `.github/workflows/ide-auto-assign.yml`:
```yaml
# Add custom rules
if echo "$ISSUE_BODY" | grep -qiE "(your-keyword)"; then
  echo "ide=windsurf" >> $GITHUB_OUTPUT
fi
```

### Change Sync Interval

Edit `.antigravity/config.json`:
```json
{
  "sync": {
    "syncInterval": "10m"  // Change from 5m to 10m
  }
}
```

---

## 🚀 Ready to Build!

Your hybrid IDE setup is complete. Pick any issue and start coding with the IDE that works best for you!

**Quick commands:**
```bash
# List issues for Windsurf
gh issue list --label "windsurf-ready"

# List issues for Antigravity  
gh issue list --label "antigravity-ready"

# Show hybrid options
gh issue list --label "hybrid-ready"
```

**Happy coding!** 🎉
