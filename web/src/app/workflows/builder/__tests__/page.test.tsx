import { render, screen } from '@testing-library/react';
import WorkflowBuilderPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('WorkflowBuilderPage', () => {
  it('renders the page', () => {
    render(<WorkflowBuilderPage />);
    // Page should render without errors
    expect(document.body).toBeInTheDocument();
  });

  it('displays workflow content', () => {
    render(<WorkflowBuilderPage />);
    expect(screen.getAllByText(/Workflow/i)[0]).toBeInTheDocument();
  });
});
