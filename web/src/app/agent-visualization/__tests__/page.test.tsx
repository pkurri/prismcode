import { render, screen, fireEvent } from '@testing-library/react';
import AgentVisualizationPage from '../page';

describe('AgentVisualizationPage', () => {
  it('renders title and default timeline tab', () => {
    render(<AgentVisualizationPage />);
    expect(screen.getByText('Agent Run Visualization')).toBeInTheDocument();
    expect(screen.getByText('Execution Timeline')).toBeInTheDocument();
  });

  it('renders timeline items', () => {
    render(<AgentVisualizationPage />);
    const pmAgents = screen.getAllByText('PM Agent');
    expect(pmAgents.length).toBeGreaterThan(0);
    expect(screen.getAllByText('gather_requirements').length).toBeGreaterThan(0);
  });

  it.skip('switches to Tool Calls tab', async () => {
    render(<AgentVisualizationPage />);
    const toolCallsTab = screen.getByText('Tool Calls');
    fireEvent.click(toolCallsTab);
    expect(await screen.findByText('MCP Tool Calls')).toBeInTheDocument();
  });

  it.skip('switches to Agent Runs tab', () => {
    // ...
  });
});
