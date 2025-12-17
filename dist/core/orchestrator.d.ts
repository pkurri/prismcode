/**
 * Orchestrator Agent - Coordinates all agents
 */
import { FeatureInput, ProjectPlan, PrismCodeConfig } from '../types';
/**
 * Orchestrator coordinates all specialized agents
 */
export declare class Orchestrator {
    private config;
    constructor(config: PrismCodeConfig);
    /**
     * Orchestrate multi-agent collaboration to generate project plan
     */
    orchestrate(input: FeatureInput): Promise<ProjectPlan>;
}
//# sourceMappingURL=orchestrator.d.ts.map