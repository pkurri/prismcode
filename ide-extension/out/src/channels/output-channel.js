"use strict";
/**
 * Output Channel Service
 * Issue #110: IDE Output Channel
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
exports.OutputChannelService = void 0;
const vscode = __importStar(require("vscode"));
class OutputChannelService {
    constructor() {
        this.channel = vscode.window.createOutputChannel('PrismCode');
    }
    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.channel.appendLine(`[${timestamp}] ${message}`);
    }
    info(message) {
        this.log(`ℹ️  INFO: ${message}`);
    }
    success(message) {
        this.log(`✅ SUCCESS: ${message}`);
    }
    error(message, error) {
        this.log(`❌ ERROR: ${message}`);
        if (error) {
            this.log(`   ${error.message}`);
            if (error.stack) {
                this.log(`   ${error.stack}`);
            }
        }
    }
    logAgentExecution(agentName, action, details) {
        this.log(`🤖 ${agentName}: ${action}`);
        if (details) {
            this.log(`   ${details}`);
        }
    }
    show() {
        this.channel.show(true);
    }
    clear() {
        this.channel.clear();
    }
    dispose() {
        this.channel.dispose();
    }
}
exports.OutputChannelService = OutputChannelService;
//# sourceMappingURL=output-channel.js.map