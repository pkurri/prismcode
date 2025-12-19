/**
 * Notification Service
 * Issue #109: IDE Notification System
 */

import * as vscode from 'vscode';

export class NotificationService {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );
        this.statusBarItem.text = '$(rocket) PrismCode';
        this.statusBarItem.show();
    }

    /**
     * Show info notification
     */
    showInfo(message: string): void {
        vscode.window.showInformationMessage(`PrismCode: ${message}`);
    }

    /**
     * Show success notification
     */
    showSuccess(message: string): void {
        vscode.window.showInformationMessage(`✅ PrismCode: ${message}`);
    }

    /**
     * Show error notification
     */
    showError(message: string): void {
        vscode.window.showErrorMessage(`❌ PrismCode: ${message}`);
    }

    /**
     * Show progress notification
     */
    async showProgress<T>(
        title: string,
        task: (progress: vscode.Progress<{ message?: string; increment?: number }>) => Promise<T>
    ): Promise<T> {
        return vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `PrismCode: ${title}`,
                cancellable: false
            },
            task
        );
    }

    /**
     * Update status bar
     */
    updateStatus(text: string, tooltip?: string): void {
        this.statusBarItem.text = `$(rocket) ${text}`;
        if (tooltip) {
            this.statusBarItem.tooltip = tooltip;
        }
    }

    dispose(): void {
        this.statusBarItem.dispose();
    }
}
