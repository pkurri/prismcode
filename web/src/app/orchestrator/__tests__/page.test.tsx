import { render, screen } from '@testing-library/react';
import OrchestratorPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('OrchestratorPage', () => {
  it('renders page header', () => {
    render(<OrchestratorPage />);
    expect(screen.getByText('Agent Orchestrator')).toBeInTheDocument();
  });

  it('shows agent tabs', () => {
    render(<OrchestratorPage />);
    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(screen.getByText('Recent Runs')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });

  it('displays agent cards', () => {
    render(<OrchestratorPage />);
    expect(screen.getByText('Product Manager Agent')).toBeInTheDocument();
    expect(screen.getByText('Developer Agent')).toBeInTheDocument();
    expect(screen.getByText('QA Agent')).toBeInTheDocument();
  });

  it('shows new project button', () => {
    render(<OrchestratorPage />);
    expect(screen.getByText('+ New Project')).toBeInTheDocument();
  });
});
