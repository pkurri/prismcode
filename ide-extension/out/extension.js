"use strict";
/**
 * PrismCode VSCode Extension
 * Works across VSCode, Cursor, Windsurf, and Antigravity
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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const notification_service_1 = require("./src/notifications/notification-service");
const output_channel_1 = require("./src/channels/output-channel");
const configuration_1 = require("./src/config/configuration");
const dashboard_provider_1 = require("./src/views/dashboard-provider");
const command_registry_1 = require("./src/commands/command-registry");
let outputChannel;
let notifications;
let dashboardProvider;
function activate(context) {
    console.log('PrismCode extension is now active!');
    // Initialize services
    outputChannel = new output_channel_1.OutputChannelService();
    notifications = new notification_service_1.NotificationService();
    const config = new configuration_1.ConfigurationService();
    dashboardProvider = new dashboard_provider_1.DashboardProvider(context.extensionUri);
    // Register WebView provider
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('prismcode.dashboard', dashboardProvider));
    // Register commands
    (0, command_registry_1.registerCommands)(context, {
        outputChannel,
        notifications,
        config,
        dashboardProvider
    });
    // Show welcome notification
    notifications.showInfo('PrismCode extension activated! Use Cmd+Shift+P and search for "PrismCode"');
    outputChannel.log('PrismCode extension initialized');
}
function deactivate() {
    if (outputChannel) {
        outputChannel.dispose();
    }
    console.log('PrismCode extension deactivated');
}
//# sourceMappingURL=extension.js.map