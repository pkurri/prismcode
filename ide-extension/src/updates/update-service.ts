/**
 * Extension Update Service
 * Issue #113: IDE Auto-update System
 */

import * as vscode from 'vscode';

export class UpdateService {
    private static readonly EXTENSION_ID = 'prismcode.prismcode';
    private static readonly CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

    private checkTimer: NodeJS.Timeout | null = null;

    constructor() {
        this.startAutoCheck();
    }

    /**
     * Start automatic update checking
     */
    private startAutoCheck(): void {
        // Check on startup after delay
        setTimeout(() => this.checkForUpdates(), 5000);

        // Check periodically
        this.checkTimer = setInterval(
            () => this.checkForUpdates(),
            UpdateService.CHECK_INTERVAL
        );
    }

    /**
     * Check for extension updates
     */
    async checkForUpdates(): Promise<void> {
        try {
            const extension = vscode.extensions.getExtension(UpdateService.EXTENSION_ID);
            if (!extension) return;

            const currentVersion = extension.packageJSON.version;
            
            // Query marketplace for latest version
            // VSCode handles this automatically, but we can notify user
            const config = vscode.workspace.getConfiguration('prismcode');
            const autoUpdate = config.get('autoUpdate', true);
            
            if (autoUpdate) {
                // VSCode auto-updates are handled by the platform
                // We just show notification about current version
                console.log(`PrismCode v${currentVersion} - Auto-update enabled`);
            }
        } catch (error) {
            console.error('Update check failed:', error);
        }
    }

    /**
     * Show update notification
     */
    async notifyUpdate(newVersion: string): Promise<void> {
        const action = await vscode.window.showInformationMessage(
            `PrismCode v${newVersion} is available!`,
            'Update Now',
            'Later'
        );

        if (action === 'Update Now') {
            vscode.commands.executeCommand(
                'workbench.extensions.installExtension',
                UpdateService.EXTENSION_ID
            );
        }
    }

    /**
     * Get current version
     */
    getCurrentVersion(): string {
        const extension = vscode.extensions.getExtension(UpdateService.EXTENSION_ID);
        return extension?.packageJSON.version || '0.0.0';
    }

    /**
     * Dispose resources
     */
    dispose(): void {
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
            this.checkTimer = null;
        }
    }
}
