/**
 * Agent Selector
 * Issue #107: Agent Selection UI
 */

import * as vscode from 'vscode';

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const AGENTS: AgentInfo[] = [
  {
    id: 'pm',
    name: 'PM Agent',
    description: 'Project planning, requirements analysis, task breakdown',
    icon: '$(notebook)',
  },
  {
    id: 'architect',
    name: 'Architect Agent',
    description: 'System design, tech stack selection, diagrams',
    icon: '$(symbol-structure)',
  },
  {
    id: 'coder',
    name: 'Coder Agent',
    description: 'Code generation, implementation, refactoring',
    icon: '$(code)',
  },
  {
    id: 'qa',
    name: 'QA Agent',
    description: 'Test generation, quality assurance, coverage',
    icon: '$(beaker)',
  },
  {
    id: 'devops',
    name: 'DevOps Agent',
    description: 'CI/CD, infrastructure, deployment',
    icon: '$(server)',
  },
  {
    id: 'orchestrator',
    name: 'Orchestrator',
    description: 'Coordinate all agents, run workflows',
    icon: '$(rocket)',
  },
];

export class AgentSelector {
  static async show(): Promise<string | undefined> {
    const items = AGENTS.map((agent) => ({
      label: `${agent.icon} ${agent.name}`,
      description: agent.description,
      agent: agent.id,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Select an agent to run',
      matchOnDescription: true,
    });

    return selected?.agent;
  }

  static getAgent(id: string): AgentInfo | undefined {
    return AGENTS.find((a) => a.id === id);
  }

  static getAllAgents(): AgentInfo[] {
    return AGENTS;
  }
}
