/**
 * PrismCode VSCode Extension
 * Works across VSCode, Cursor, Windsurf, and Antigravity
 */

import * as vscode from 'vscode';
import { NotificationService } from './src/notifications/notification-service';
import { OutputChannelService } from './src/channels/output-channel';
import { ConfigurationService } from './src/config/configuration';
import { DashboardProvider } from './src/views/dashboard-provider';
import { registerCommands } from './src/commands/command-registry';

let outputChannel: OutputChannelService;
let notifications: NotificationService;
let dashboardProvider: DashboardProvider;

export function activate(context: vscode.ExtensionContext) {
    console.log('PrismCode extension is now active!');

    // Initialize services
    outputChannel = new OutputChannelService();
    notifications = new NotificationService();
    const config = new ConfigurationService();
    dashboardProvider = new DashboardProvider(context.extensionUri);

    // Register WebView provider
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'prismcode.dashboard',
            dashboardProvider
        )
    );

    // Register commands
    registerCommands(context, {
        outputChannel,
        notifications,
        config,
        dashboardProvider
    });

    // Show welcome notification
    notifications.showInfo('PrismCode extension activated! Use Cmd+Shift+P and search for "PrismCode"');
    outputChannel.log('PrismCode extension initialized');
}

export function deactivate() {
    if (outputChannel) {
        outputChannel.dispose();
    }
    console.log('PrismCode extension deactivated');
}
