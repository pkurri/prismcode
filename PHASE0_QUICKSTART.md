# Phase 0 Quick Start Guide

> **Goal**: Kickstart Phase 0 development with 6 parallel agents in under 10 minutes

## Prerequisites

- [x] Repository cloned: `c:\Users\Prasad\ag-workspace\prismcode`
- [x] Node.js installed (v22.14.0 ✅)
- [ ] GitHub Personal Access Token set in environment
- [ ] Git configured

---

## Setup (5 minutes)

### 1. Set GitHub Token

```powershell
# PowerShell (Windows)
$env:GITHUB_TOKEN="ghp_your_token_here"

# Or add to your profile for persistence
```

### 2. Install Dependencies

```bash
cd c:\Users\Prasad\ag-workspace\prismcode
npm install
```

### 3. Verify Setup

```bash
# Check Node version
node --version  # Should be 18+ (you have 22.14.0 ✅)

# Check npm
npm --version

# Verify repo
git status
```

---

## Execute Phase 0 (Parallel Mode)

### Option A: Full Automation (Recommended)

```bash
# This will:
# 1. Create all 6 feature branches
# 2. Generate workstream guides for each agent
# 3. Show execution matrix

node scripts/execute-parallel.js
```

### Option B: Manual Step-by-Step

#### Step 1: Create Branches

```bash
git checkout main
git pull origin main

# Create all feature branches
git branch feature/phase0-dev-environment
git branch feature/phase0-testing-infrastructure
git branch feature/phase0-code-quality
git branch feature/phase0-cicd-pipeline
git branch feature/phase0-docs-site
git branch feature/phase0-monitoring-deployment
```

#### Step 2: Assign Workstreams

Review the implementation plan and assign each workstream to an agent (or yourself if working solo):

| Workstream | Agent | Branch |
|------------|-------|--------|
| 1. Dev Environment | Infrastructure Agent | `feature/phase0-dev-environment` |
| 2. Testing | Testing Agent | `feature/phase0-testing-infrastructure` |
| 3. Code Quality | Code Quality Agent | `feature/phase0-code-quality` |
| 4. CI/CD | DevOps Agent | `feature/phase0-cicd-pipeline` |
| 5. Documentation | Documentation Agent | `feature/phase0-docs-site` |
| 6. Monitoring | Monitoring Agent | `feature/phase0-monitoring-deployment` |

---

## Execution Order

### For Solo Development (Sequential)

If you're working alone, follow this order for minimal conflicts:

1. **Day 1**: Workstream 1 (Dev Environment) ← Foundation
2. **Day 1**: Workstream 3 (Code Quality) ← Enables linting
3. **Day 1**: Workstream 2 (Testing) ← Enables testing
4. **Day 2**: Workstream 4 (CI/CD) ← Depends on 2 & 3
5. **Day 2**: Workstream 5 (Documentation) ← Independent
6. **Day 3**: Workstream 6 (Monitoring) ← Independent

### For Multi-Agent (Parallel)

All workstreams can start **simultaneously**! 🚀

- Each agent works on their own branch
- Minimal file overlap = minimal conflicts
- PRs reviewed and merged as completed

---

## Detailed Workstream Instructions

After running `node scripts/execute-parallel.js`, check:

```
workstreams/
├── README.md                                           # Overview
├── workstream-1-phase0-dev-environment.md              # Infrastructure Agent
├── workstream-2-phase0-testing-infrastructure.md       # Testing Agent
├── workstream-3-phase0-code-quality.md                 # Code Quality Agent
├── workstream-4-phase0-cicd-pipeline.md                # DevOps Agent
├── workstream-5-phase0-docs-site.md                   # Documentation Agent
└── workstream-6-phase0-monitoring-deployment.md       # Monitoring Agent
```

Each file contains:
- Setup instructions
- Files to create/modify
- Task checklist
- Development workflow
- PR template

---

## Example: Starting Workstream 1 (Dev Environment)

```bash
# 1. Checkout branch
git checkout feature/phase0-dev-environment

# 2. Read the guide
cat workstreams/workstream-1-phase0-dev-environment.md

# 3. Start developing
# - Enhance tsconfig.json
# - Create scripts/validate-env.js
# - Update package.json
# - Document in docs/development-setup.md

# 4. Test your changes
npm run build

# 5. Commit
git add .
git commit -m "feat(phase0): development environment setup"

# 6. Push
git push origin feature/phase0-dev-environment

# 7. Create PR via GitHub UI
# Title: "[Phase 0] Development Environment Setup"
# Link to issue (if exists)
```

---

## Monitoring Progress

### Using GitHub Project (Optional)

If you created a GitHub Project V2:

```bash
# Setup project (if not already done)
node scripts/setup-phase0-project.js
```

Then:
1. Go to your GitHub repository
2. Click "Projects" tab
3. View "Phase 0: Foundation" project
4. Group by: Agent
5. Watch progress in real-time!

### Command Line

```bash
# Check branch status
git branch -a

# See what's changed
git diff main

# Check remote status
git fetch --all
git branch -vv
```

---

## Completing a Workstream

### Pre-PR Checklist

- [ ] Code builds: `npm run build`
- [ ] Tests pass (if applicable): `npm test`
- [ ] Linting passes (if applicable): `npm run lint`
- [ ] Documentation updated
- [ ] Committed and pushed
- [ ] No merge conflicts with main

### Creating the PR

1. Go to: https://github.com/pkurri/prismcode/pulls
2. Click "New Pull Request"
3. Base: `main` ← Compare: `feature/phase0-<workstream>`
4. Fill in PR template (auto-generated or use workstream guide)
5. Request review from other agents/developers
6. Link to relevant issue numbers

### PR Review Process

- Wait for at least 1 approval
- Address any requested changes
- Ensure CI checks pass (once CI is set up)
- Merge when ready!

---

## Troubleshooting

### "npm install" fails

```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Merge conflicts

```bash
# Update your branch with latest main
git checkout your-branch
git fetch origin main
git merge origin/main

# Resolve conflicts manually
# Then:
git add .
git commit -m "fix: resolve merge conflicts"
git push
```

### GitHub token issues

```powershell
# Verify token is set
echo $env:GITHUB_TOKEN

# If not set, set it again
$env:GITHUB_TOKEN="ghp_your_token_here"
```

---

## Success Metrics

### Per Workstream

- [ ] Feature branch created
- [ ] All tasks from implementation plan completed
- [ ] PR created and reviewed
- [ ] PR merged to main
- [ ] No blocking issues

### Overall Phase 0

- [ ] All 6 PRs merged
- [ ] Main branch builds successfully
- [ ] All tests passing
- [ ] Documentation site deployed
- [ ] Docker image builds
- [ ] Fresh clone setup < 5 minutes

---

## Resources

### Documentation
- [Implementation Plan](../implementation_plan.md) - Full details
- [Development Roadmap](../DEVELOPMENT_ROADMAP.md) - Overall project
- [Contributing Guide](../CONTRIBUTING.md) - Standards

### Scripts
- `scripts/execute-parallel.js` - Parallel execution setup
- `scripts/assign-agents.js` - Agent assignment
- `scripts/setup-phase0-project.js` - GitHub Project setup

### External
- [GitHub Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [Git Branching](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging)
- [Pull Requests](https://docs.github.com/en/pull-requests)

---

## Questions?

1. Check the [Implementation Plan](../implementation_plan.md)
2. Review workstream-specific guide
3. Open a GitHub Discussion
4. Ask in PR comments

---

**Ready to build bulletproof infrastructure? Let's go! 🚀**
