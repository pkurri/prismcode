"use strict";
/**
 * Extension Update Service
 * Issue #113: IDE Auto-update System
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
exports.UpdateService = void 0;
const vscode = __importStar(require("vscode"));
class UpdateService {
    constructor() {
        this.checkTimer = null;
        this.startAutoCheck();
    }
    /**
     * Start automatic update checking
     */
    startAutoCheck() {
        // Check on startup after delay
        setTimeout(() => this.checkForUpdates(), 5000);
        // Check periodically
        this.checkTimer = setInterval(() => this.checkForUpdates(), UpdateService.CHECK_INTERVAL);
    }
    /**
     * Check for extension updates
     */
    async checkForUpdates() {
        try {
            const extension = vscode.extensions.getExtension(UpdateService.EXTENSION_ID);
            if (!extension)
                return;
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
        }
        catch (error) {
            console.error('Update check failed:', error);
        }
    }
    /**
     * Show update notification
     */
    async notifyUpdate(newVersion) {
        const action = await vscode.window.showInformationMessage(`PrismCode v${newVersion} is available!`, 'Update Now', 'Later');
        if (action === 'Update Now') {
            vscode.commands.executeCommand('workbench.extensions.installExtension', UpdateService.EXTENSION_ID);
        }
    }
    /**
     * Get current version
     */
    getCurrentVersion() {
        const extension = vscode.extensions.getExtension(UpdateService.EXTENSION_ID);
        return extension?.packageJSON.version || '0.0.0';
    }
    /**
     * Dispose resources
     */
    dispose() {
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
            this.checkTimer = null;
        }
    }
}
exports.UpdateService = UpdateService;
UpdateService.EXTENSION_ID = 'prismcode.prismcode';
UpdateService.CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
//# sourceMappingURL=update-service.js.map