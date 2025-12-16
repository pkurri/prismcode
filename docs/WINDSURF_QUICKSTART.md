# 🌊 Windsurf IDE Quick Start

## 5-Minute Setup

### 1. Install
```bash
brew install --cask windsurf
```

### 2. Clone & Setup
```bash
git clone https://github.com/pkurri/prismcode.git
cd prismcode
npm install
```

### 3. Configure MCP
Create `.windsurf/mcp_config.json`:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {"GITHUB_TOKEN": "ghp_YOUR_TOKEN"}
    }
  }
}
```

### 4. Start Coding
Open Cascade (Cmd+L):
```
@github list issues labeled "phase-0"
@cascade Implement issue #2
```

## Essential Commands

### Implementation
```
@cascade Implement [feature] following TypeScript best practices
@cascade Add unit tests with 80% coverage
@cascade Fix error in [file]
```

### Review
```
@cascade Review [file] for security issues
@cascade Optimize [function] for performance
@cascade Refactor [class] following SOLID principles
```

### GitHub
```
@github show issue #N
@github create PR for branch feature/xyz
@github list my open PRs
```

## Pro Tips

1. **Context is King**: Reference files with @filename
2. **Be Specific**: "Add error handling to PMAgent.execute()" > "Fix PMAgent"
3. **Iterate**: Review generated code, provide feedback, regenerate
4. **Use MCP**: Let GitHub server fetch issues automatically

## Next Steps
- [Full IDE Setup Guide](./IDE_SETUP.md)
- [Start with Issue #2](https://github.com/pkurri/prismcode/issues/2)
- [Watch Windsurf Tutorial](https://www.youtube.com/watch?v=RMycopezYZw)