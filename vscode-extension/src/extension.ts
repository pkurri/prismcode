/**
 * PrismCode VS Code Extension
 * Issue #92: VS Code Extension Scaffold
 *
 * Main extension entry point
 */

import * as vscode from 'vscode';
import { SidebarProvider } from './sidebar';
import { StatusBarManager } from './status-bar';
import { GitHubConnection } from './github-connection';
import { AgentSelector } from './agent-selector';
import { NotificationManager } from './notifications';
import { DashboardPanel } from './dashboard';

let statusBar: StatusBarManager;
let githubConnection: GitHubConnection;
let notificationManager: NotificationManager;

export function activate(context: vscode.ExtensionContext) {
  console.log('PrismCode extension activating...');

  // Initialize managers
  statusBar = new StatusBarManager();
  githubConnection = new GitHubConnection(context);
  notificationManager = new NotificationManager();

  // Register sidebar provider (#94)
  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('prismcode.agents', sidebarProvider)
  );

  // Register commands (#93)
  context.subscriptions.push(
    vscode.commands.registerCommand('prismcode.start', () => {
      notificationManager.info('PrismCode session started');
      statusBar.setStatus('active');
    }),

    vscode.commands.registerCommand('prismcode.generatePlan', async () => {
      const input = await vscode.window.showInputBox({
        prompt: 'Describe your feature or project',
        placeHolder: 'e.g., Build a user authentication system',
      });

      if (input) {
        notificationManager.info(`Generating plan for: ${input}`);
        // TODO: Call PM Agent
      }
    }),

    vscode.commands.registerCommand('prismcode.runOrchestrator', async () => {
      notificationManager.info('Running Orchestrator...');
      // TODO: Run orchestrator
    }),

    vscode.commands.registerCommand('prismcode.selectAgent', async () => {
      const agent = await AgentSelector.show();
      if (agent) {
        notificationManager.info(`Selected agent: ${agent}`);
      }
    }),

    vscode.commands.registerCommand('prismcode.showDashboard', () => {
      DashboardPanel.createOrShow(context.extensionUri);
    }),

    vscode.commands.registerCommand('prismcode.connectGitHub', async () => {
      const connected = await githubConnection.connect();
      if (connected) {
        notificationManager.info('Connected to GitHub');
        statusBar.setGitHubStatus('connected');
      }
    }),

    vscode.commands.registerCommand('prismcode.openSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', 'prismcode');
    })
  );

  // Auto-connect to GitHub if configured (#105, #106)
  const config = vscode.workspace.getConfiguration('prismcode');
  if (config.get('autoConnect')) {
    githubConnection.connect().then((connected) => {
      if (connected) {
        statusBar.setGitHubStatus('connected');
      }
    });
  }

  // Initialize status bar (#95)
  statusBar.show();

  console.log('PrismCode extension activated');
}

export function deactivate() {
  statusBar?.dispose();
  console.log('PrismCode extension deactivated');
}
