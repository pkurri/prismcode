import { developerAgent } from '../developer';

describe('Developer Agent', () => {
  it('has correct role', () => {
    expect(developerAgent.role).toBe('developer');
  });

  it('has required tools', () => {
    const toolNames = developerAgent.tools.map(t => t.name);
    expect(toolNames).toContain('read_file');
    expect(toolNames).toContain('write_file');
    expect(toolNames).toContain('generate_code');
    expect(toolNames).toContain('refactor_code');
  });

  it('read_file tool works', async () => {
    const tool = developerAgent.tools.find(t => t.name === 'read_file');
    const result = await tool!.execute({ path: 'src/test.ts' });
    expect(result.success).toBe(true);
  });

  it('generate_code tool works', async () => {
    const tool = developerAgent.tools.find(t => t.name === 'generate_code');
    const result = await tool!.execute({ language: 'typescript', spec: 'Create button component' });
    expect(result.success).toBe(true);
  });
});
