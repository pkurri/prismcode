"use strict";
/**
 * Command Registry
 * Issue #115: Keyboard Shortcuts
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCommands = registerCommands;
const vscode = __importStar(require("vscode"));
// Import from main project
const orchestrator_1 = require("../../../src/core/orchestrator");
function registerCommands(context, services) {
    const { outputChannel, notifications, config } = services;
    // Command: Generate Project Plan
    const generatePlanCmd = vscode.commands.registerCommand('prismcode.generatePlan', async () => {
        try {
            // Validate configuration
            if (!config.validateGitHubConfig()) {
                const setup = await vscode.window.showWarningMessage('GitHub not configured. Set up now?', 'Yes', 'No');
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
            if (!feature)
                return;
            // Generate plan with orchestrator
            await notifications.showProgress('Generating Project Plan', async (progress) => {
                progress.report({ message: 'Initializing agents...' });
                outputChannel.clear();
                outputChannel.show();
                outputChannel.info('Starting project plan generation');
                const orchestrator = new orchestrator_1.Orchestrator(config.getConfig());
                progress.report({ message: 'PM Agent analyzing...' });
                outputChannel.logAgentExecution('PM Agent', 'Analyzing feature requirements');
                const plan = await orchestrator.orchestrate({ feature });
                progress.report({ message: 'Plan generated!' });
                outputChannel.success(`Generated ${plan.epics.length} epics, ${plan.stories.length} stories, ${plan.tasks.length} tasks`);
                notifications.showSuccess(`Plan generated: ${plan.epics.length} epics, ${plan.stories.length} stories`);
                return plan;
            });
        }
        catch (error) {
            const err = error;
            outputChannel.error('Failed to generate plan', err);
            notifications.showError(err.message);
        }
    });
    // Command: Create GitHub Issues
    const createIssuesCmd = vscode.commands.registerCommand('prismcode.createIssues', async () => {
        try {
            if (!config.validateGitHubConfig()) {
                notifications.showError('GitHub not configured');
                return;
            }
            notifications.showInfo('This feature creates issues from generated plans (coming soon!)');
        }
        catch (error) {
            const err = error;
            outputChannel.error('Failed to create issues', err);
            notifications.showError(err.message);
        }
    });
    // Command: Open Dashboard
    const openDashboardCmd = vscode.commands.registerCommand('prismcode.openDashboard', () => {
        vscode.commands.executeCommand('workbench.view.extension.prismcode-sidebar');
    });
    // Register all commands
    context.subscriptions.push(generatePlanCmd, createIssuesCmd, openDashboardCmd);
}
//# sourceMappingURL=command-registry.js.map