# Getting Started with PrismCode

## Installation

### Prerequisites

- Node.js 18+ 
- npm 9+ or pnpm 8+
- GitHub account with Personal Access Token
- Git installed

### Step 1: Clone Repository

```bash
git clone https://github.com/pkurri/prismcode.git
cd prismcode
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your GitHub token:

```env
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your-username
```

**Getting a GitHub Token**:
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `workflow`, `project`
4. Copy token and paste in `.env`

### Step 4: Initialize Configuration

```bash
npm run setup
```

This will prompt you for:
- Default repository
- Preferred labels
- Output preferences

## Your First Project Plan

### Interactive Mode (Recommended)

```bash
npm run plan:interactive
```

Follow the prompts:
1. Describe your feature
2. Select tech stack
3. Choose project scale
4. Specify output format

### Command Line Mode

```bash
npm run plan -- \
  --feature "Build a recipe sharing platform" \
  --tech-stack "React,Node.js,PostgreSQL" \
  --scale startup
```

## Understanding Output

PrismCode generates:

### 1. Project Plan (`output/project-plan.md`)

Complete analysis including:
- Feature breakdown
- Real-world pattern references
- Epic/Story/Task hierarchy
- Architecture design
- Security considerations

### 2. GitHub Issues (`output/github-issues.json`)

Ready-to-import JSON:
```json
[
  {
    "title": "[EPIC] User Authentication",
    "body": "...",
    "labels": ["epic", "backend"]
  }
]
```

### 3. Cursor Prompts (`output/cursor-prompts/`)

Context-rich IDE instructions for each task.

### 4. n8n Workflow (`output/n8n-workflow.json`)

Automation workflow for issue creation.

## Importing to GitHub

### Manual Import

1. Go to your repository
2. Click Issues → New Issue
3. Copy content from generated markdown

### Automated Import (n8n)

1. Import `output/n8n-workflow.json` to n8n
2. Configure GitHub credentials
3. Execute workflow

### Using GitHub CLI

```bash
gh issue create --repo owner/repo \
  --title "Title" \
  --body "Body" \
  --label "feature,backend"
```

## Next Steps

- Read [Agent System Guide](agents/README.md)
- Explore [Examples](../examples/)
- Learn [Advanced Features](advanced/)
- Join [Discussions](https://github.com/pkurri/prismcode/discussions)

## Troubleshooting

### GitHub Token Issues

**Error**: `Bad credentials`

**Solution**: Regenerate token with correct scopes.

### Missing Dependencies

**Error**: `Cannot find module`

**Solution**: Run `npm install` again.

### TypeScript Errors

**Error**: Build fails

**Solution**: Run `npm run build` to compile TypeScript.

## Support

- [GitHub Issues](https://github.com/pkurri/prismcode/issues)
- [Discussions](https://github.com/pkurri/prismcode/discussions)
- [Documentation](../docs/)