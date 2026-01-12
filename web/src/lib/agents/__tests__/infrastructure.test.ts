import { infraAgent, provisionServerTool } from '../infrastructure';

describe('Infrastructure Agent', () => {
  it('has correct role', () => {
    expect(infraAgent.role).toBe('developer');
  });

  it('has required tools', () => {
    const toolNames = infraAgent.tools.map(t => t.name);
    expect(toolNames).toContain('provision_server');
    expect(toolNames).toContain('configure_infrastructure');
    expect(toolNames).toContain('deploy_application');
  });

  it('provision_server tool works', async () => {
    const result = await provisionServerTool.execute({
      provider: 'aws',
      size: 't3.micro',
      region: 'us-east-1'
    });
    expect(result.success).toBe(true);
    expect(result.data.status).toBe('provisioning');
  });
});
