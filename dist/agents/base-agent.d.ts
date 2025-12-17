/**
 * Base Agent class
 */
import { AgentOutput } from '../types';
/**
 * Base class for all agents
 */
export declare abstract class BaseAgent {
    protected name: string;
    constructor(name: string);
    /**
     * Process input and return agent-specific output
     */
    abstract process(input: any): Promise<AgentOutput>;
    /**
     * Get agent name
     */
    getName(): string;
}
//# sourceMappingURL=base-agent.d.ts.map