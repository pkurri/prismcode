/**
 * Notification Manager
 * Issue #109: Notification System
 */

import * as vscode from 'vscode';

export class NotificationManager {
  private outputChannel: vscode.OutputChannel;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('PrismCode');
  }

  info(message: string): void {
    const config = vscode.workspace.getConfiguration('prismcode');
    if (config.get('showNotifications')) {
      vscode.window.showInformationMessage(`PrismCode: ${message}`);
    }
    this.log('INFO', message);
  }

  warning(message: string): void {
    vscode.window.showWarningMessage(`PrismCode: ${message}`);
    this.log('WARN', message);
  }

  error(message: string): void {
    vscode.window.showErrorMessage(`PrismCode: ${message}`);
    this.log('ERROR', message);
  }

  progress<T>(title: string, task: () => Promise<T>): Thenable<T> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `PrismCode: ${title}`,
        cancellable: false,
      },
      async () => {
        return task();
      }
    );
  }

  private log(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] [${level}] ${message}`);
  }

  showOutput(): void {
    this.outputChannel.show();
  }

  dispose(): void {
    this.outputChannel.dispose();
  }
}
