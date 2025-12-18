/**
 * Sidebar Panel Provider
 * Issue #94: Sidebar Panel
 */

import * as vscode from 'vscode';

export class SidebarProvider implements vscode.WebviewViewProvider {
  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    webviewView.webview.html = this.getHtmlContent();

    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'selectAgent':
          vscode.commands.executeCommand('prismcode.selectAgent');
          break;
        case 'runOrchestrator':
          vscode.commands.executeCommand('prismcode.runOrchestrator');
          break;
        case 'openDashboard':
          vscode.commands.executeCommand('prismcode.showDashboard');
          break;
      }
    });
  }

  private getHtmlContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PrismCode</title>
  <style>
    body {
      padding: 10px;
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 10px;
      color: var(--vscode-sideBarSectionHeader-foreground);
    }
    .agent-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .agent-item {
      padding: 8px;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .agent-item:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .agent-icon {
      width: 16px;
      height: 16px;
    }
    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--vscode-charts-green);
    }
    .status-indicator.inactive {
      background: var(--vscode-charts-yellow);
    }
    button {
      width: 100%;
      padding: 8px 16px;
      margin-top: 8px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
  </style>
</head>
<body>
  <div class="section">
    <div class="section-title">Agents</div>
    <ul class="agent-list">
      <li class="agent-item" onclick="selectAgent('pm')">
        <span class="status-indicator"></span>
        <span>PM Agent</span>
      </li>
      <li class="agent-item" onclick="selectAgent('architect')">
        <span class="status-indicator"></span>
        <span>Architect Agent</span>
      </li>
      <li class="agent-item" onclick="selectAgent('coder')">
        <span class="status-indicator"></span>
        <span>Coder Agent</span>
      </li>
      <li class="agent-item" onclick="selectAgent('qa')">
        <span class="status-indicator inactive"></span>
        <span>QA Agent</span>
      </li>
      <li class="agent-item" onclick="selectAgent('devops')">
        <span class="status-indicator inactive"></span>
        <span>DevOps Agent</span>
      </li>
    </ul>
  </div>

  <div class="section">
    <div class="section-title">Actions</div>
    <button onclick="runOrchestrator()">Run Orchestrator</button>
    <button onclick="openDashboard()">Open Dashboard</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function selectAgent(agent) {
      vscode.postMessage({ command: 'selectAgent', agent });
    }

    function runOrchestrator() {
      vscode.postMessage({ command: 'runOrchestrator' });
    }

    function openDashboard() {
      vscode.postMessage({ command: 'openDashboard' });
    }
  </script>
</body>
</html>`;
  }
}
