"use strict";
/**
 * Main PrismCode class
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismCode = void 0;
const orchestrator_1 = require("./orchestrator");
/**
 * PrismCode - AI-powered multi-agent project orchestration
 */
class PrismCode {
    orchestrator;
    config;
    constructor(config) {
        this.config = config;
        this.orchestrator = new orchestrator_1.Orchestrator(config);
    }
    /**
     * Generate complete project plan from feature description
     */
    async plan(input) {
        return await this.orchestrator.orchestrate(input);
    }
    /**
     * Create GitHub issues from project plan
     */
    async createGitHubIssues(plan) {
        // TODO: Implement GitHub issue creation
        throw new Error('Not implemented yet');
    }
    /**
     * Export project plan to various formats
     */
    async export(plan, format) {
        // TODO: Implement export functionality
        throw new Error('Not implemented yet');
    }
}
exports.PrismCode = PrismCode;
//# sourceMappingURL=prismcode.js.map