/**
 * Configuration Service
 * Issue #114: Extension Configuration
 */

import * as vscode from 'vscode';

export interface PrismCodeConfig {
    github: {
        token: string;
        owner: string;
        repo: string;
    };
}

export class ConfigurationService {
    private readonly configSection = 'prismcode';

    /**
     * Get configuration
     */
    getConfig(): PrismCodeConfig {
        const config = vscode.workspace.getConfiguration(this.configSection);
        
        return {
            github: {
                token: config.get('github.token', ''),
                owner: config.get('github.owner', ''),
                repo: config.get('github.repo', '')
            }
        };
    }

    /**
     * Update configuration
     */
    async updateConfig(key: string, value: any): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.configSection);
        await config.update(key, value, vscode.ConfigurationTarget.Global);
    }

    /**
     * Validate GitHub credentials
     */
    validateGitHubConfig(): boolean {
        const config = this.getConfig();
        return !!(config.github.token && config.github.owner && config.github.repo);
    }

    /**
     * Prompt for GitHub configuration
     */
    async promptForGitHubConfig(): Promise<void> {
        const token = await vscode.window.showInputBox({
            prompt: 'Enter your GitHub Personal Access Token',
            password: true,
            placeHolder: 'ghp_...'
        });

        if (!token) return;

        const owner = await vscode.window.showInputBox({
            prompt: 'Enter GitHub repository owner',
            placeHolder: 'username or organization'
        });

        if (!owner) return;

        const repo = await vscode.window.showInputBox({
            prompt: 'Enter GitHub repository name',
            placeHolder: 'my-repo'
        });

        if (!repo) return;

        await this.updateConfig('github.token', token);
        await this.updateConfig('github.owner', owner);
        await this.updateConfig('github.repo', repo);

        vscode.window.showInformationMessage('GitHub configuration saved!');
    }
}
