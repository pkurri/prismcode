import { BaseAgent } from '../../src/agents/base-agent';
import { AgentOutput } from '../../src/types';

describe('BaseAgent', () => {
    class TestAgent extends BaseAgent {
        async process(input: any): Promise<AgentOutput> {
            return {
                success: true,
                data: { processed: input },
            };
        }
    }

    it('should create an agent with a name', () => {
        const agent = new TestAgent('TestAgent');
        expect(agent.getName()).toBe('TestAgent');
    });

    it('should process input successfully', async () => {
        const agent = new TestAgent('TestAgent');
        const result = await agent.process({ test: 'data' });

        expect(result.success).toBe(true);
        expect(result.data).toEqual({ processed: { test: 'data' } });
    });
});
