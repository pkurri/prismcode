import { render, screen } from '@testing-library/react';
import TechDebtPage from '../page';

// Mock Tabs
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('TechDebtPage', () => {
  it('renders page header', () => {
    render(<TechDebtPage />);
    expect(screen.getAllByText(/Tech Debt/i)[0]).toBeInTheDocument();
  });

  it('displays debt items', () => {
    render(<TechDebtPage />);
    expect(screen.getAllByText(/Debt/i)[0]).toBeInTheDocument();
  });
});
