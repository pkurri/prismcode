import { render, screen } from '@testing-library/react';
import WorkflowAutomationPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('WorkflowAutomationPage', () => {
  it('renders page header', () => {
    render(<WorkflowAutomationPage />);
    expect(screen.getByText('Workflow Automation')).toBeInTheDocument();
  });

  it('shows workflows tab', () => {
    render(<WorkflowAutomationPage />);
    expect(screen.getAllByText(/Workflows/i)[0]).toBeInTheDocument();
  });

  it('displays new workflow button', () => {
    render(<WorkflowAutomationPage />);
    expect(screen.getByText('+ New Workflow')).toBeInTheDocument();
  });
});
