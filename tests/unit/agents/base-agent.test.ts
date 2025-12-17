import { BaseAgent } from '../../../src/agents/base-agent';
import { AgentOutput } from '../../../src/types';

describe('BaseAgent', () => {
  class TestAgent extends BaseAgent {
    async process(input: unknown): Promise<AgentOutput> {
      return {
        agentName: this.name,
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

    expect(result.agentName).toBe('TestAgent');
    expect(result.data).toEqual({ processed: { test: 'data' } });
  });
});
