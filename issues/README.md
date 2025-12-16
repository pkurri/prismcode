# PrismCode Development Issues

This directory contains the complete set of GitHub issues for developing PrismCode.

## Files

- `prismcode-issues.json` - Complete JSON array of 155 issues
- `n8n-issue-creator.json` - n8n workflow to auto-create issues
- `phase-0-issues.json` - Foundation phase (issues #1-25)
- `phase-1-issues.json` - Core agents phase (issues #26-60)
- `phase-2-issues.json` - GitHub integration (issues #61-90)
- `phase-3-issues.json` - IDE integrations (issues #91-115)
- `phase-4-issues.json` - Advanced features (issues #116-140)
- `phase-5-issues.json` - Production release (issues #141-155)

## Import Methods

### Method 1: GitHub CLI (Recommended)

```bash
# Install GitHub CLI if needed
brew install gh

# Login
gh auth login

# Import all issues
node scripts/import-issues.js prismcode-issues.json
```

### Method 2: n8n Workflow

1. Install n8n: `npm install -g n8n`
2. Start n8n: `n8n start`
3. Import workflow: `n8n-issue-creator.json`
4. Configure GitHub credentials
5. Execute workflow

### Method 3: Manual Import

1. Open `prismcode-issues.json`
2. Copy issue content
3. Create manually in GitHub UI

## Issue Structure

Each issue has:

```json
{
  "number": 1,
  "title": "[EPIC] Project Foundation",
  "body": "## Epic Goal\n...",
  "labels": ["epic", "phase-0", "priority:P0"],
  "milestone": 1,
  "assignees": [],
  "estimates": {
    "story_points": 40,
    "hours": 80
  }
}
```

## Label System

### Type Labels
- `epic` - Strategic initiative
- `story` - User story
- `task` - Implementation task
- `bug` - Bug report

### Phase Labels
- `phase-0` - Foundation
- `phase-1` - Core Agents
- `phase-2` - GitHub Integration
- `phase-3` - IDE Integrations
- `phase-4` - Advanced Features
- `phase-5` - Production Release

### Priority Labels
- `priority:P0` - Critical (blocking)
- `priority:P1` - High
- `priority:P2` - Medium
- `priority:P3` - Low

### Component Labels
- `infrastructure`
- `ai-agent`
- `github-integration`
- `ide-integration`
- `documentation`
- `frontend`
- `backend`
- `devops`

## Milestones

1. **Phase 0: Foundation** (2 weeks)
2. **Phase 1: Core Agents** (6 weeks)
3. **Phase 2: GitHub Integration** (4 weeks)
4. **Phase 3: IDE Integrations** (4 weeks)
5. **Phase 4: Advanced Features** (4 weeks)
6. **Phase 5: Production Release** (4 weeks)

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on:
- Picking issues
- Creating branches
- Submitting PRs
- Code review process

## Questions?

Open a [Discussion](https://github.com/pkurri/prismcode/discussions)!