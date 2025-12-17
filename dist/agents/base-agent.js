"use strict";
/**
 * Base Agent class
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
/**
 * Base class for all agents
 */
class BaseAgent {
    name;
    constructor(name) {
        this.name = name;
    }
    /**
     * Get agent name
     */
    getName() {
        return this.name;
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=base-agent.js.map