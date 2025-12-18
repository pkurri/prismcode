/**
 * GitHub Connection Manager
 * Issues #105, #106: Authentication Flow & GitHub Connection
 */

import * as vscode from 'vscode';
import { Octokit } from '@octokit/rest';

export class GitHubConnection {
  private octokit: Octokit | null = null;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  async connect(): Promise<boolean> {
    const config = vscode.workspace.getConfiguration('prismcode');
    let token = config.get<string>('githubToken');

    if (!token) {
      // Try to get from VS Code's GitHub auth
      const session = await vscode.authentication.getSession('github', ['repo', 'user'], {
        createIfNone: true,
      });

      if (session) {
        token = session.accessToken;
      }
    }

    if (!token) {
      // Prompt user for token
      token = await vscode.window.showInputBox({
        prompt: 'Enter your GitHub Personal Access Token',
        password: true,
        placeHolder: 'ghp_xxxxxxxxxxxx',
      });

      if (token) {
        // Save token in settings
        await config.update('githubToken', token, vscode.ConfigurationTarget.Global);
      }
    }

    if (!token) {
      vscode.window.showErrorMessage('GitHub token is required');
      return false;
    }

    try {
      this.octokit = new Octokit({ auth: token });

      // Verify connection
      const { data: user } = await this.octokit.users.getAuthenticated();
      vscode.window.showInformationMessage(`Connected to GitHub as ${user.login}`);
      return true;
    } catch (error) {
      vscode.window.showErrorMessage('Failed to connect to GitHub');
      return false;
    }
  }

  isConnected(): boolean {
    return this.octokit !== null;
  }

  getClient(): Octokit | null {
    return this.octokit;
  }
}
