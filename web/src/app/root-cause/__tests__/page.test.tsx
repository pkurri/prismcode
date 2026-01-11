import { render, screen } from '@testing-library/react';
import RootCauseAnalysisPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('RootCauseAnalysisPage', () => {
  it('renders page header', () => {
    render(<RootCauseAnalysisPage />);
    expect(screen.getByText('Root Cause Analysis')).toBeInTheDocument();
  });

  it('shows recent errors tab', () => {
    render(<RootCauseAnalysisPage />);
    expect(screen.getAllByText(/Recent Errors/i)[0]).toBeInTheDocument();
  });

  it('displays analysis tab', () => {
    render(<RootCauseAnalysisPage />);
    expect(screen.getAllByText(/Analysis/i)[0]).toBeInTheDocument();
  });

  it('shows paste stack trace tab', () => {
    render(<RootCauseAnalysisPage />);
    expect(screen.getAllByText(/Paste Stack Trace/i)[0]).toBeInTheDocument();
  });

  it('displays error content', () => {
    render(<RootCauseAnalysisPage />);
    expect(screen.getAllByText(/Cannot read property/i)[0]).toBeInTheDocument();
  });
});
