# PrismCode IDE Extension

Multi-IDE extension for PrismCode that works across:

- ✅ VSCode
- ✅ Cursor
- ✅ Windsurf
- ✅ Antigravity

## Features

- 🤖 **Multi-Agent System** - PM, Architect, Coder, QA, DevOps agents
- 📊 **Dashboard** - WebView UI for project plans
- 🔔 **Notifications** - Real-time agent progress
- 📝 **Output Channel** - Detailed execution logs
- ⚙️ **Configuration** - Easy GitHub setup
- ⌨️ **Keyboard Shortcuts** - Quick access commands

## Installation

### From Source

```bash
cd ide-extension
npm install
npm run compile
```

Then press F5 to run in debug mode.

### From Marketplace

Coming soon!

## Usage

1. **Configure GitHub** (first time):
   - Press `Cmd/Ctrl+Shift+P`
   - Search for "PrismCode: Generate Plan"
   - Follow prompts to enter GitHub token/owner/repo

2. **Generate Project Plan**:
   - Run command: `PrismCode: Generate Project Plan`
   - Enter feature description
   - View results in Output panel

3. **Open Dashboard**:
   - Run command: `PrismCode: Open Dashboard`
   - View project stats and quick actions

## Commands

- `prismcode.generatePlan` - Generate multi-agent project plan
- `prismcode.createIssues` - Create GitHub issues from plan
- `prismcode.openDashboard` - Open WebView dashboard

## Requirements

- VSCode 1.80.0 or higher
- Node.js 18+ (for development)
- GitHub account (for issue creation)

## Development

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Watch mode
npm run watch

# Run tests
npm test
```

## License

MIT
