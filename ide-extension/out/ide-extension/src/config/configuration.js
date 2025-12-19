"use strict";
/**
 * Configuration Service
 * Issue #114: Extension Configuration
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
exports.ConfigurationService = void 0;
const vscode = __importStar(require("vscode"));
class ConfigurationService {
    constructor() {
        this.configSection = 'prismcode';
    }
    /**
     * Get configuration
     */
    getConfig() {
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
    async updateConfig(key, value) {
        const config = vscode.workspace.getConfiguration(this.configSection);
        await config.update(key, value, vscode.ConfigurationTarget.Global);
    }
    /**
     * Validate GitHub credentials
     */
    validateGitHubConfig() {
        const config = this.getConfig();
        return !!(config.github.token && config.github.owner && config.github.repo);
    }
    /**
     * Prompt for GitHub configuration
     */
    async promptForGitHubConfig() {
        const token = await vscode.window.showInputBox({
            prompt: 'Enter your GitHub Personal Access Token',
            password: true,
            placeHolder: 'ghp_...'
        });
        if (!token)
            return;
        const owner = await vscode.window.showInputBox({
            prompt: 'Enter GitHub repository owner',
            placeHolder: 'username or organization'
        });
        if (!owner)
            return;
        const repo = await vscode.window.showInputBox({
            prompt: 'Enter GitHub repository name',
            placeHolder: 'my-repo'
        });
        if (!repo)
            return;
        await this.updateConfig('github.token', token);
        await this.updateConfig('github.owner', owner);
        await this.updateConfig('github.repo', repo);
        vscode.window.showInformationMessage('GitHub configuration saved!');
    }
}
exports.ConfigurationService = ConfigurationService;
//# sourceMappingURL=configuration.js.map