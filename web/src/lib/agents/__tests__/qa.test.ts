import { qaAgent } from '../qa';

describe('QA Agent', () => {
  it('has correct role', () => {
    expect(qaAgent.role).toBe('qa');
  });

  it('has required tools', () => {
    const toolNames = qaAgent.tools.map(t => t.name);
    expect(toolNames).toContain('generate_tests');
    expect(toolNames).toContain('run_tests');
    expect(toolNames).toContain('analyze_coverage');
    expect(toolNames).toContain('report_bug');
  });

  it('generate_tests tool works', async () => {
    const tool = qaAgent.tools.find(t => t.name === 'generate_tests');
    const result = await tool!.execute({ componentPath: 'src/Button.tsx' });
    expect(result.success).toBe(true);
  });

  it('run_tests tool works', async () => {
    const tool = qaAgent.tools.find(t => t.name === 'run_tests');
    const result = await tool!.execute({ pattern: '**/*.test.ts' });
    expect(result.success).toBe(true);
  });

  it('analyze_coverage tool works', async () => {
    const tool = qaAgent.tools.find(t => t.name === 'analyze_coverage');
    const result = await tool!.execute({});
    expect(result.success).toBe(true);
  });
});
