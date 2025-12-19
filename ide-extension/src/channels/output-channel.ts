/**
 * Output Channel Service
 * Issue #110: IDE Output Channel
 */

import * as vscode from 'vscode';

export class OutputChannelService {
    private channel: vscode.OutputChannel;

    constructor() {
        this.channel = vscode.window.createOutputChannel('PrismCode');
    }

    log(message: string): void {
        const timestamp = new Date().toLocaleTimeString();
        this.channel.appendLine(`[${timestamp}] ${message}`);
    }

    info(message: string): void {
        this.log(`ℹ️  INFO: ${message}`);
    }

    success(message: string): void {
        this.log(`✅ SUCCESS: ${message}`);
    }

    error(message: string, error?: Error): void {
        this.log(`❌ ERROR: ${message}`);
        if (error) {
            this.log(`   ${error.message}`);
            if (error.stack) {
                this.log(`   ${error.stack}`);
            }
        }
    }

    logAgentExecution(agentName: string, action: string, details?: string): void {
        this.log(`🤖 ${agentName}: ${action}`);
        if (details) {
            this.log(`   ${details}`);
        }
    }

    show(): void {
        this.channel.show(true);
    }

    clear(): void {
        this.channel.clear();
    }

    dispose(): void {
        this.channel.dispose();
    }
}
