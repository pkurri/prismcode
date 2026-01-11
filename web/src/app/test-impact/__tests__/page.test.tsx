import { render, screen } from '@testing-library/react';
import TestImpactPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('TestImpactPage', () => {
  it('renders page header', () => {
    render(<TestImpactPage />);
    expect(screen.getByText('Test Impact Analysis')).toBeInTheDocument();
  });

  it('shows analyze button', () => {
    render(<TestImpactPage />);
    expect(screen.getByText('🔍 Analyze Changes')).toBeInTheDocument();
  });

  it('displays savings stats', () => {
    render(<TestImpactPage />);
    expect(screen.getByText('Tests Skipped')).toBeInTheDocument();
    expect(screen.getByText('Time Saved')).toBeInTheDocument();
  });

  it('shows impacted tests tab', () => {
    render(<TestImpactPage />);
    expect(screen.getAllByText(/Impacted Tests/i)[0]).toBeInTheDocument();
  });

  it('displays changed files tab', () => {
    render(<TestImpactPage />);
    expect(screen.getAllByText(/Changed Files/i)[0]).toBeInTheDocument();
  });
});
