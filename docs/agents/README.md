# PrismCode Multi-Agent Architecture

## Overview

PrismCode uses a multi-agent orchestration system where specialized AI agents collaborate to deliver end-to-end software development automation.

## Agent Roles

### 1. Product Manager Agent
- **Role**: `product-manager`
- **Responsibilities**: Requirements analysis, epic creation, user story writing
- **MCP Tools**: `gather_requirements`, `create_epic`, `create_user_story`

### 2. Scrum Master Agent
- **Role**: `scrum-master`
- **Responsibilities**: Sprint planning, story decomposition, progress tracking
- **MCP Tools**: `plan_sprint`, `decompose_story`, `track_progress`

### 3. Developer Agent
- **Role**: `developer`
- **Responsibilities**: Code generation, file operations, refactoring
- **MCP Tools**: `read_file`, `write_file`, `generate_code`, `refactor_code`

### 4. QA Agent
- **Role**: `qa`
- **Responsibilities**: Test generation, test execution, coverage analysis
- **MCP Tools**: `generate_tests`, `run_tests`, `analyze_coverage`, `report_bug`

## MCP Architecture

```
┌─────────────────────────────────────────────┐
│           Orchestrator Core                  │
│  ┌─────────────────────────────────────┐    │
│  │         Agent Registry               │    │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │    │
│  │  │ PM  │ │ SM  │ │ Dev │ │ QA  │    │    │
│  │  └─────┘ └─────┘ └─────┘ └─────┘    │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │         MCP Tool Layer               │    │
│  │  • Filesystem Tools                  │    │
│  │  • GitHub Tools                      │    │
│  │  • Language Tools                    │    │
│  │  • Test Runner Tools                 │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

## Usage

1. Access the Orchestrator UI at `/orchestrator`
2. Select an agent for your task
3. Describe the task in natural language
4. Monitor execution and tool calls
5. Review generated artifacts

## Configuration

See `.agent/mcp-config.json` for MCP tool definitions.