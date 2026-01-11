import { render, screen } from '@testing-library/react';
import AgentVisualizationPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('AgentVisualizationPage', () => {
  it('renders page header', () => {
    render(<AgentVisualizationPage />);
    expect(screen.getByText('Agent Run Visualization')).toBeInTheDocument();
  });

  it('shows timeline tab', () => {
    render(<AgentVisualizationPage />);
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  it('displays tool calls tab', () => {
    render(<AgentVisualizationPage />);
    expect(screen.getByText('Tool Calls')).toBeInTheDocument();
  });
});
