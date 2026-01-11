import { productManagerAgent } from '../product-manager';

describe('Product Manager Agent', () => {
  it('has correct role', () => {
    expect(productManagerAgent.role).toBe('product-manager');
  });

  it('has required tools', () => {
    const toolNames = productManagerAgent.tools.map(t => t.name);
    expect(toolNames).toContain('gather_requirements');
    expect(toolNames).toContain('create_epic');
    expect(toolNames).toContain('create_user_story');
  });

  it('gather_requirements tool works', async () => {
    const tool = productManagerAgent.tools.find(t => t.name === 'gather_requirements');
    const result = await tool!.execute({ input: 'Build auth' });
    expect(result.success).toBe(true);
  });

  it('create_epic tool works', async () => {
    const tool = productManagerAgent.tools.find(t => t.name === 'create_epic');
    const result = await tool!.execute({ title: 'Auth Epic', description: 'Auth system' });
    expect(result.success).toBe(true);
  });
});
