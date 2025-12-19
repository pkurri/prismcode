/**
 * Command Registry
 * Issue #115: Keyboard Shortcuts
 */

import * as vscode from 'vscode';
import { OutputChannelService } from '../channels/output-channel';
import { NotificationService } from '../notifications/notification-service';
import { ConfigurationService } from '../config/configuration';
import { DashboardProvider } from '../views/dashboard-provider';

// Import from main project
import { Orchestrator } from '../../../src/core/orchestrator';
import { GitHubRestService } from '../../../src/services/github-rest';

interface Services {
    outputChannel: OutputChannelService;
    notifications: NotificationService;
    config: ConfigurationService;
    dashboardProvider: DashboardProvider;
}

export function registerCommands(
    context: vscode.ExtensionContext,
    services: Services
): void {
    const { outputChannel, notifications, config } = services;

    // Command: Generate Project Plan
    const generatePlanCmd = vscode.commands.registerCommand(
        'prismcode.generatePlan',
        async () => {
            try {
                // Validate configuration
                if (!config.validateGitHubConfig()) {
                    const setup = await vscode.window.showWarningMessage(
                        'GitHub not configured. Set up now?',
                        'Yes', 'No'
                    );
                    if (setup === 'Yes') {
                        await config.promptForGitHubConfig();
                    }
                    return;
                }

                // Get feature description
                const feature = await vscode.window.showInputBox({
                    prompt: 'Describe the feature you want to build',
                    placeHolder: 'E-commerce platform with shopping cart'
                });

                if (!feature) return;

                // Generate plan with orchestrator
                await notifications.showProgress('Generating Project Plan', async (progress) => {
                    progress.report({ message: 'Initializing agents...' });
                    outputChannel.clear();
                    outputChannel.show();
                    outputChannel.info('Starting project plan generation');

                    const orchestrator = new Orchestrator(config.getConfig());
                    
                    progress.report({ message: 'PM Agent analyzing...' });
                    outputChannel.logAgentExecution('PM Agent', 'Analyzing feature requirements');

                    const plan = await orchestrator.orchestrate({ feature });

                    progress.report({ message: 'Plan generated!' });
                    outputChannel.success(`Generated ${plan.epics.length} epics, ${plan.stories.length} stories, ${plan.tasks.length} tasks`);

                    notifications.showSuccess(`Plan generated: ${plan.epics.length} epics, ${plan.stories.length} stories`);
                    
                    return plan;
                });

            } catch (error) {
                const err = error as Error;
                outputChannel.error('Failed to generate plan', err);
                notifications.showError(err.message);
            }
        }
    );

    // Command: Create GitHub Issues
    const createIssuesCmd = vscode.commands.registerCommand(
        'prismcode.createIssues',
        async () => {
            try {
                if (!config.validateGitHubConfig()) {
                    notifications.showError('GitHub not configured');
                    return;
                }

                notifications.showInfo('This feature creates issues from generated plans (coming soon!)');
                
            } catch (error) {
                const err = error as Error;
                outputChannel.error('Failed to create issues', err);
                notifications.showError(err.message);
            }
        }
    );

    // Command: Open Dashboard
    const openDashboardCmd = vscode.commands.registerCommand(
        'prismcode.openDashboard',
        () => {
            vscode.commands.executeCommand('workbench.view.extension.prismcode-sidebar');
        }
    );

    // Register all commands
    context.subscriptions.push(
        generatePlanCmd,
        createIssuesCmd,
        openDashboardCmd
    );
}
