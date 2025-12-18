/**
 * Status Bar Manager
 * Issue #95: Status Bar Indicators
 */

import * as vscode from 'vscode';

export class StatusBarManager {
  private statusItem: vscode.StatusBarItem;
  private githubItem: vscode.StatusBarItem;

  constructor() {
    this.statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.statusItem.command = 'prismcode.start';
    this.statusItem.text = '$(zap) PrismCode';
    this.statusItem.tooltip = 'Click to start PrismCode session';

    this.githubItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
    this.githubItem.command = 'prismcode.connectGitHub';
    this.setGitHubStatus('disconnected');
  }

  show(): void {
    this.statusItem.show();
    this.githubItem.show();
  }

  dispose(): void {
    this.statusItem.dispose();
    this.githubItem.dispose();
  }

  setStatus(status: 'idle' | 'active' | 'running' | 'error'): void {
    switch (status) {
      case 'idle':
        this.statusItem.text = '$(zap) PrismCode';
        this.statusItem.backgroundColor = undefined;
        break;
      case 'active':
        this.statusItem.text = '$(zap) PrismCode: Active';
        this.statusItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        break;
      case 'running':
        this.statusItem.text = '$(sync~spin) PrismCode: Running...';
        this.statusItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        break;
      case 'error':
        this.statusItem.text = '$(error) PrismCode: Error';
        this.statusItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        break;
    }
  }

  setGitHubStatus(status: 'connected' | 'disconnected' | 'error'): void {
    switch (status) {
      case 'connected':
        this.githubItem.text = '$(github) Connected';
        this.githubItem.tooltip = 'GitHub connected';
        this.githubItem.backgroundColor = undefined;
        break;
      case 'disconnected':
        this.githubItem.text = '$(github) Disconnected';
        this.githubItem.tooltip = 'Click to connect to GitHub';
        this.githubItem.backgroundColor = undefined;
        break;
      case 'error':
        this.githubItem.text = '$(github) Error';
        this.githubItem.tooltip = 'GitHub connection error';
        this.githubItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        break;
    }
  }
}
