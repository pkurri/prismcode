"use strict";
/**
 * Notification Service
 * Issue #109: IDE Notification System
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
exports.NotificationService = void 0;
const vscode = __importStar(require("vscode"));
class NotificationService {
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.text = '$(rocket) PrismCode';
        this.statusBarItem.show();
    }
    /**
     * Show info notification
     */
    showInfo(message) {
        vscode.window.showInformationMessage(`PrismCode: ${message}`);
    }
    /**
     * Show success notification
     */
    showSuccess(message) {
        vscode.window.showInformationMessage(`✅ PrismCode: ${message}`);
    }
    /**
     * Show error notification
     */
    showError(message) {
        vscode.window.showErrorMessage(`❌ PrismCode: ${message}`);
    }
    /**
     * Show progress notification
     */
    async showProgress(title, task) {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `PrismCode: ${title}`,
            cancellable: false
        }, task);
    }
    /**
     * Update status bar
     */
    updateStatus(text, tooltip) {
        this.statusBarItem.text = `$(rocket) ${text}`;
        if (tooltip) {
            this.statusBarItem.tooltip = tooltip;
        }
    }
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification-service.js.map