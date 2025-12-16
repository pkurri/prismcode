# 🪐 Google Antigravity Quick Start

## Multi-Agent Development in 10 Minutes

### 1. Install Antigravity
Visit [antigravity.google](https://antigravity.google) and download.

### 2. Connect GitHub
1. Settings → Integrations → GitHub
2. Authorize Antigravity
3. Select `pkurri/prismcode`

### 3. Create Agent Group
```
Manager View (Cmd+Shift+M)

Group Name: "Phase 0 Foundation"

Agents:
1. Backend (Gemini 2.0 Flash)
2. DevOps (Gemini 2.0 Flash)
3. QA (Gemini 2.0 Flash)

Parallel Execution: ON
Auto-Verify: ON
```

### 4. Assign Tasks
```
Backend Agent:
- Task: "Implement issue #2 dev environment setup"
- Mode: Plan → Execute

DevOps Agent:
- Task: "Implement issue #5 CI/CD pipeline"
- Dependencies: Backend task
- Mode: Plan → Execute

QA Agent:
- Task: "Implement issue #6 testing infrastructure"
- Dependencies: Backend task
- Mode: Plan → Execute
```

### 5. Execute & Review
1. Click "Generate Plans" (each agent creates detailed plan)
2. Review all 3 plans in Artifacts panel
3. Add comments/feedback if needed
4. Click "Execute All"
5. Watch agents work in parallel!
6. Review generated code
7. Approve → Auto-commit

## Why Antigravity for PrismCode?

- **Parallel Development**: 5 agents = 5x faster
- **Manager View**: See all agents working simultaneously
- **Artifacts**: Plans before execution = no surprises
- **Auto-Verification**: Tests run automatically
- **GitHub Native**: Issues → Agents → PRs seamlessly

## Pro Tips

1. **Always use Plan mode first**: Review before execution
2. **Group related tasks**: Phase 0 together, Phase 1 together
3. **Set dependencies**: Agents wait for prerequisites
4. **Review artifacts**: Catch issues before commit
5. **Use budgets**: High for architecture, low for tests

## Example: Complete Phase 0 in 1 Hour

```
Create 4 Agent Groups:

Group 1: "Infrastructure" (15 min)
- Backend: Issue #2 (dev setup)
- DevOps: Issue #4 (TypeScript config)
- DevOps: Issue #9 (code quality)

Group 2: "CI/CD" (20 min)
- DevOps: Issue #5 (GitHub Actions)
- QA: Issue #6 (testing infra)

Group 3: "Monitoring" (10 min)
- DevOps: Issue #10 (logging)
- Backend: Issue #11 (error tracking)

Group 4: "Documentation" (15 min)
- Technical Writer: Issue #8 (docs site)
- Technical Writer: README improvements

Total: 1 hour with 4 agents working in parallel
Manual: Would take 2-3 days!
```

## Next Steps
- [Full IDE Setup Guide](./IDE_SETUP.md)
- [Create Your First Agent Group](https://codelabs.developers.google.com/getting-started-google-antigravity)
- [Watch Antigravity Demo](https://www.youtube.com/watch?v=DEMO_VIDEO)