/**
 * Dashboard WebView Panel
 * Issue #111: WebView Dashboard
 */

import * as vscode from 'vscode';

export class DashboardPanel {
  public static currentPanel: DashboardPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this.panel = panel;
    this.extensionUri = extensionUri;

    this.panel.webview.html = this.getHtmlContent();

    this.panel.onDidDispose(() => {
      DashboardPanel.currentPanel = undefined;
    });
  }

  public static createOrShow(extensionUri: vscode.Uri): void {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    if (DashboardPanel.currentPanel) {
      DashboardPanel.currentPanel.panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel('prismcode.dashboard', 'PrismCode Dashboard', column || vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true,
    });

    DashboardPanel.currentPanel = new DashboardPanel(panel, extensionUri);
  }

  private getHtmlContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PrismCode Dashboard</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      font-family: var(--vscode-font-family);
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
    }
    .header {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    .card {
      background: var(--vscode-sideBar-background);
      border: 1px solid var(--vscode-widget-border);
      border-radius: 8px;
      padding: 16px;
    }
    .card-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stat {
      font-size: 32px;
      font-weight: bold;
      color: var(--vscode-charts-blue);
    }
    .stat-label {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }
    .agent-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .agent-card {
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-widget-border);
      border-radius: 6px;
      padding: 12px;
      text-align: center;
      cursor: pointer;
    }
    .agent-card:hover {
      border-color: var(--vscode-focusBorder);
    }
    .agent-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    .agent-name {
      font-size: 12px;
      font-weight: 500;
    }
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }
    .status-active {
      background: var(--vscode-charts-green);
      color: white;
    }
    .status-idle {
      background: var(--vscode-charts-yellow);
      color: black;
    }
    .timeline {
      margin-top: 12px;
    }
    .timeline-item {
      display: flex;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid var(--vscode-widget-border);
    }
    .timeline-time {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      min-width: 60px;
    }
    .timeline-content {
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="header">
    ⚡ PrismCode Dashboard
    <span class="status-badge status-active">Active</span>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">📊 Project Stats</div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        <div>
          <div class="stat">90</div>
          <div class="stat-label">Issues Closed</div>
        </div>
        <div>
          <div class="stat">6</div>
          <div class="stat-label">Agents Active</div>
        </div>
        <div>
          <div class="stat">4</div>
          <div class="stat-label">PRs Created</div>
        </div>
        <div>
          <div class="stat">12K</div>
          <div class="stat-label">Lines Generated</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🤖 Agent Status</div>
      <div class="agent-grid">
        <div class="agent-card">
          <div class="agent-icon">📋</div>
          <div class="agent-name">PM</div>
          <span class="status-badge status-active">Active</span>
        </div>
        <div class="agent-card">
          <div class="agent-icon">🏗️</div>
          <div class="agent-name">Architect</div>
          <span class="status-badge status-active">Active</span>
        </div>
        <div class="agent-card">
          <div class="agent-icon">💻</div>
          <div class="agent-name">Coder</div>
          <span class="status-badge status-active">Active</span>
        </div>
        <div class="agent-card">
          <div class="agent-icon">🧪</div>
          <div class="agent-name">QA</div>
          <span class="status-badge status-idle">Idle</span>
        </div>
        <div class="agent-card">
          <div class="agent-icon">🚀</div>
          <div class="agent-name">DevOps</div>
          <span class="status-badge status-idle">Idle</span>
        </div>
        <div class="agent-card">
          <div class="agent-icon">🎯</div>
          <div class="agent-name">Orchestrator</div>
          <span class="status-badge status-active">Active</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📝 Recent Activity</div>
      <div class="timeline">
        <div class="timeline-item">
          <span class="timeline-time">Just now</span>
          <span class="timeline-content">Dashboard opened</span>
        </div>
        <div class="timeline-item">
          <span class="timeline-time">2m ago</span>
          <span class="timeline-content">Phase 2 completed - GitHub Integration</span>
        </div>
        <div class="timeline-item">
          <span class="timeline-time">5m ago</span>
          <span class="timeline-content">Closed 29 GitHub issues</span>
        </div>
        <div class="timeline-item">
          <span class="timeline-time">10m ago</span>
          <span class="timeline-content">PR #166 created</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🔗 GitHub Connection</div>
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
        <span class="status-badge status-active">Connected</span>
        <span>pkurri/prismcode</span>
      </div>
      <div style="font-size: 13px; color: var(--vscode-descriptionForeground);">
        Last sync: Just now<br>
        Open PRs: 3<br>
        Open Issues: 35
      </div>
    </div>
  </div>
</body>
</html>`;
  }
}
