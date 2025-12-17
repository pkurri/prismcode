/**
 * Main PrismCode class
 */
import { FeatureInput, ProjectPlan, PrismCodeConfig } from '../types';
/**
 * PrismCode - AI-powered multi-agent project orchestration
 */
export declare class PrismCode {
    private orchestrator;
    private config;
    constructor(config: PrismCodeConfig);
    /**
     * Generate complete project plan from feature description
     */
    plan(input: FeatureInput): Promise<ProjectPlan>;
    /**
     * Create GitHub issues from project plan
     */
    createGitHubIssues(plan: ProjectPlan): Promise<void>;
    /**
     * Export project plan to various formats
     */
    export(plan: ProjectPlan, format: 'json' | 'markdown' | 'both'): Promise<string>;
}
//# sourceMappingURL=prismcode.d.ts.map