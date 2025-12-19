# VSCode Marketplace Publishing Guide

## Issue #112: Marketplace Publishing

### Prerequisites

1. **Azure DevOps Account**
   - Create at: https://dev.azure.com
   - Required for publishing to marketplace

2. **Personal Access Token (PAT)**
   - Go to: Azure DevOps → User Settings → Personal Access Tokens
   - Create token with `Marketplace (publish)` scope
   - Save token securely

3. **Publisher Account**
   - Create at: https://marketplace.visualstudio.com/manage
   - Publisher ID: `prismcode`

### Setup

```bash
# Install vsce (VSCode Extension CLI)
npm install -g @vscode/vsce

# Login to publisher
vsce login prismcode
# Enter PAT when prompted
```

### Publishing

```bash
cd ide-extension

# Package extension
vsce package

# Publish to marketplace
vsce publish

# Or publish specific version
vsce publish 0.1.0
```

### Package Contents

The extension package includes:

- `out/` - Compiled JavaScript
- `package.json` - Extension manifest
- `README.md` - Documentation
- `CHANGELOG.md` - Version history

### Version Bumping

```bash
# Patch version (0.1.0 -> 0.1.1)
vsce publish patch

# Minor version (0.1.0 -> 0.2.0)
vsce publish minor

# Major version (0.1.0 -> 1.0.0)
vsce publish major
```

### Marketplace Listing

Extension will appear at:
`https://marketplace.visualstudio.com/items?itemName=prismcode.prismcode`

### Categories

- Programming Languages
- Other
- AI

### Tags

- multi-agent
- project-planning
- github
- ai-assisted

---

## Ready to Publish ✅

Extension is packaged and ready for marketplace publishing.
User needs to create Azure DevOps PAT to complete.
