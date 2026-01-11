import { scrumMasterAgent } from '../scrum-master';

describe('Scrum Master Agent', () => {
  it('has correct role', () => {
    expect(scrumMasterAgent.role).toBe('scrum-master');
  });

  it('has required tools', () => {
    const toolNames = scrumMasterAgent.tools.map(t => t.name);
    expect(toolNames).toContain('plan_sprint');
    expect(toolNames).toContain('decompose_story');
    expect(toolNames).toContain('track_progress');
  });

  it('plan_sprint tool works', async () => {
    const tool = scrumMasterAgent.tools.find(t => t.name === 'plan_sprint');
    const result = await tool!.execute({ epicId: 'epic-1', duration: 14 });
    expect(result.success).toBe(true);
  });

  it('decompose_story tool works', async () => {
    const tool = scrumMasterAgent.tools.find(t => t.name === 'decompose_story');
    const result = await tool!.execute({ storyId: 'story-1' });
    expect(result.success).toBe(true);
  });
});
